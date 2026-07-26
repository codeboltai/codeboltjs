import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { cp, lstat, readdir, readFile, realpath, rm, stat } from "node:fs/promises";
import { basename, relative, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const providerPresets = {
  vercel: "vercel",
  netlify: "netlify",
  deno: "deno-deploy",
};

function posixPath(path) {
  return path.replaceAll("\\", "/");
}

const crcTable = new Uint32Array(256).map((_, index) => {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = (value & 1) ? (0xedb88320 ^ (value >>> 1)) : (value >>> 1);
  }
  return value >>> 0;
});

function crc32(buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function uint16(value) {
  const buffer = Buffer.allocUnsafe(2);
  buffer.writeUInt16LE(value);
  return buffer;
}

function uint32(value) {
  const buffer = Buffer.allocUnsafe(4);
  buffer.writeUInt32LE(value >>> 0);
  return buffer;
}

function dosDateTime(date = new Date()) {
  const year = Math.max(1980, date.getFullYear());
  return {
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2),
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
  };
}

function fromEnv(env, names) {
  for (const name of names) {
    if (env[name]) return env[name];
  }
  return undefined;
}

function redact(value) {
  if (!value) return undefined;
  if (value.length <= 8) return "********";
  return `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function required(name, value, hint) {
  if (!value) {
    throw new Error(`${name} is required. Pass ${hint.flag} or set ${hint.env}.`);
  }
  return value;
}

function requireDenoV2Token(token) {
  const value = required("Deno token", token, {
    flag: "--token or --deno-token",
    env: "DENO_DEPLOY_TOKEN",
  });
  if (!value.startsWith("ddo_")) {
    throw new Error("Deno Subhosting v2 requires an organization token with the ddo_ prefix. Create one in Deno Deploy organization settings and set DENO_DEPLOY_TOKEN.");
  }
  return value;
}

export function supportedTargets() {
  return Object.keys(providerPresets);
}

function parseEnv(content) {
  const values = {};
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(trimmed);
    if (!match) continue;

    let value = match[2].trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    } else {
      const commentIndex = value.indexOf(" #");
      if (commentIndex !== -1) value = value.slice(0, commentIndex).trim();
    }
    values[match[1]] = value;
  }
  return values;
}

export async function loadEnvFile(envFile = resolve(process.cwd(), ".env")) {
  if (!(await exists(envFile))) return {};
  return parseEnv(await readFile(envFile, "utf8"));
}

export function resolveCredentials(target, options = {}, env = process.env) {
  if (target === "vercel") {
    const token = options.vercelToken || options.token || fromEnv(env, ["VERCEL_TOKEN"]);
    return {
      token,
      teamId: options.teamId || fromEnv(env, ["VERCEL_TEAM_ID", "VERCEL_ORG_ID"]),
      project: options.project || fromEnv(env, ["VERCEL_PROJECT", "VERCEL_PROJECT_ID"]),
    };
  }

  if (target === "netlify") {
    const token = options.netlifyToken || options.token || fromEnv(env, [
      "NETLIFY_AUTH_TOKEN",
      "NETLIFY_TOKEN",
    ]);
    return {
      token,
      siteId: options.siteId || fromEnv(env, ["NETLIFY_SITE_ID"]),
      siteName: options.siteName || fromEnv(env, ["NETLIFY_SITE_NAME"]),
      accountSlug: options.accountSlug || fromEnv(env, ["NETLIFY_ACCOUNT_SLUG"]),
    };
  }

  if (target === "deno") {
    const token = options.denoToken || options.token || fromEnv(env, [
      "DENO_DEPLOY_TOKEN",
      "DENO_TOKEN",
    ]);
    return {
      token,
      app: options.app || fromEnv(env, ["DENO_APP", "DENO_APP_ID", "DENO_APP_SLUG"]),
    };
  }

  throw new Error(`Unsupported target: ${target}`);
}

export function redactCredentials(credentials) {
  return Object.fromEntries(
    Object.entries(credentials).map(([key, value]) => [
      key,
      key.toLowerCase().includes("token") ? redact(value) : value,
    ]),
  );
}

async function walkFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const path = resolve(directory, entry.name);
      const info = await stat(path);
      if (info.isDirectory()) return walkFiles(path);
      if (info.isFile()) return [path];
      return [];
    }),
  );
  return files.flat().sort();
}

async function fileRecords(directory) {
  const root = resolve(directory);
  const files = await walkFiles(root);
  return Promise.all(
    files.map(async (path) => {
      const content = await readFile(path);
      return {
        path,
        relativePath: posixPath(relative(root, path)),
        size: content.byteLength,
        sha1: createHash("sha1").update(content).digest("hex"),
        content,
      };
    }),
  );
}

function fileRecord(relativePath, content) {
  const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content);
  return {
    path: undefined,
    relativePath,
    size: buffer.byteLength,
    sha1: createHash("sha1").update(buffer).digest("hex"),
    content: buffer,
  };
}

async function materializeLinkedDirectories(directory) {
  if (!(await exists(directory))) return;
  const entries = await readdir(directory, { withFileTypes: true });
  await Promise.all(entries.map(async (entry) => {
    const path = resolve(directory, entry.name);
    const info = await lstat(path);

    if (info.isSymbolicLink()) {
      const target = await realpath(path);
      const targetInfo = await stat(target);
      if (!targetInfo.isDirectory()) return;
      await rm(path, { recursive: true, force: true });
      await cp(target, path, { recursive: true });
      return;
    }

    if (info.isDirectory()) {
      await materializeLinkedDirectories(path);
    }
  }));
}

async function materializeVercelFunctionLinks(outputDir) {
  await materializeLinkedDirectories(resolve(outputDir, "functions"));
}

function withNetlifyFunctionRedirect(files, functionName) {
  const redirectPath = "_redirects";
  const fallback = `/* /.netlify/functions/${functionName} 200`;
  const existing = files.find((file) => file.relativePath === redirectPath);
  if (!existing) {
    return [...files, fileRecord(redirectPath, `${fallback}\n`)];
  }
  const current = existing.content.toString("utf8");
  if (current.includes(`/.netlify/functions/${functionName}`)) return files;
  const next = `${current.trimEnd()}\n${fallback}\n`;
  return files.map((file) => file.relativePath === redirectPath
    ? fileRecord(redirectPath, next)
    : file);
}

function zipFiles(files) {
  const localParts = [];
  const centralParts = [];
  let offset = 0;
  const { time, date } = dosDateTime();

  for (const file of files) {
    const name = Buffer.from(file.relativePath, "utf8");
    const checksum = crc32(file.content);
    const localHeader = Buffer.concat([
      uint32(0x04034b50),
      uint16(20),
      uint16(0x0800),
      uint16(0),
      uint16(time),
      uint16(date),
      uint32(checksum),
      uint32(file.size),
      uint32(file.size),
      uint16(name.length),
      uint16(0),
      name,
    ]);
    localParts.push(localHeader, file.content);

    centralParts.push(Buffer.concat([
      uint32(0x02014b50),
      uint16(20),
      uint16(20),
      uint16(0x0800),
      uint16(0),
      uint16(time),
      uint16(date),
      uint32(checksum),
      uint32(file.size),
      uint32(file.size),
      uint16(name.length),
      uint16(0),
      uint16(0),
      uint16(0),
      uint16(0),
      uint32(0),
      uint32(offset),
      name,
    ]));

    offset += localHeader.length + file.content.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  const end = Buffer.concat([
    uint32(0x06054b50),
    uint16(0),
    uint16(0),
    uint16(files.length),
    uint16(files.length),
    uint32(centralDirectory.length),
    uint32(offset),
    uint16(0),
  ]);

  return Buffer.concat([...localParts, centralDirectory, end]);
}

async function readJson(path) {
  return JSON.parse(await readFile(path, "utf8"));
}

async function readMiniAppManifest(appRoot, outputDir) {
  const candidates = [
    resolve(outputDir, "codebolt/miniapp.manifest.json"),
    resolve(appRoot, ".output/codebolt/miniapp.manifest.json"),
    resolve(appRoot, ".vercel/output/codebolt/miniapp.manifest.json"),
    resolve(appRoot, ".netlify/functions-internal/codebolt/miniapp.manifest.json"),
  ];
  for (const candidate of candidates) {
    if (await exists(candidate)) {
      const manifest = await readJson(candidate);
      return {
        id: manifest.id,
        title: manifest.title,
        version: manifest.version,
      };
    }
  }
  return undefined;
}

async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function buildWithNitro(appRoot, target) {
  const preset = providerPresets[target];
  const npmExecPath = process.env.npm_execpath;
  const command = npmExecPath ? process.execPath : "npx";
  const args = npmExecPath
    ? [npmExecPath, "exec", "nitro", "build", appRoot, "--preset", preset]
    : ["nitro", "build", appRoot, "--preset", preset];

  await new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      cwd: appRoot,
      stdio: "inherit",
      env: {
        ...process.env,
        MINIAPP_TARGET: target,
        NITRO_PRESET: preset,
      },
      shell: process.platform === "win32" && !npmExecPath,
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`Nitro build stopped by ${signal}.`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`Nitro build failed with exit code ${code}.`));
        return;
      }
      resolvePromise();
    });
  });
}

function withQuery(url, query) {
  const value = new URL(url);
  for (const [key, entry] of Object.entries(query)) {
    if (entry !== undefined && entry !== "") value.searchParams.set(key, entry);
  }
  return value;
}

function encodePath(path) {
  return path.split("/").map((segment) => encodeURIComponent(segment)).join("/");
}

async function apiFetch(url, { token, method = "GET", headers = {}, body } = {}) {
  const response = await fetch(url, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const message = data?.error?.message || data?.message || response.statusText;
    throw new Error(`${method} ${url} failed: ${response.status} ${message}`);
  }
  return data;
}

async function apiFetchMaybe(url, { token, method = "GET", headers = {}, body } = {}) {
  const response = await fetch(url, {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    data,
  };
}

async function vercelPlan(appRoot, options) {
  const outputDir = resolve(options.outputDir || appRoot, options.outputDir ? "." : ".vercel/output");
  await materializeVercelFunctionLinks(outputDir);
  const files = await fileRecords(outputDir);
  const miniApp = await readMiniAppManifest(appRoot, outputDir);
  return {
    target: "vercel",
    outputDir,
    miniApp,
    fileCount: files.length,
    byteCount: files.reduce((total, file) => total + file.size, 0),
    files: files.map(({ relativePath, sha1, size }) => ({
      file: relativePath,
      sha: sha1,
      size,
    })),
    _files: files,
  };
}

async function deployVercel(plan, credentials, options) {
  required("Vercel token", credentials.token, {
    flag: "--token or --vercel-token",
    env: "VERCEL_TOKEN",
  });

  const args = ["vercel", "deploy", "--prebuilt", "--yes"];
  if (options.production) args.push("--prod");
  if (credentials.teamId) args.push("--scope", credentials.teamId);
  const npmExecPath = process.env.npm_execpath;
  const command = npmExecPath ? process.execPath : "npx";
  const commandArgs = npmExecPath
    ? [npmExecPath, "exec", ...args]
    : args;

  const output = await runCommand(command, commandArgs, {
    cwd: options.appRoot,
    env: {
      ...process.env,
      VERCEL_TOKEN: credentials.token,
      ...(credentials.project ? { VERCEL_PROJECT_ID: credentials.project } : {}),
    },
    shell: process.platform === "win32" && !npmExecPath,
  });
  const parsedOutput = parseJsonMaybe(output);
  const url = parsedOutput?.deployment?.url || output
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => /^https?:\/\/[^\s]+\.vercel\.app/.test(line));
  return {
    url,
    deploymentId: parsedOutput?.deployment?.id,
    readyState: parsedOutput?.deployment?.readyState,
    target: parsedOutput?.deployment?.target,
    inspectorUrl: parsedOutput?.deployment?.inspectorUrl,
    output,
  };
}

function parseJsonMaybe(value) {
  try {
    return JSON.parse(value);
  } catch {
    return undefined;
  }
}

async function runCommand(command, args, options) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(command, args, {
      ...options,
      stdio: ["ignore", "pipe", "pipe"],
      shell: options.shell ?? false,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.on("error", reject);
    child.on("exit", (code, signal) => {
      if (signal) {
        reject(new Error(`${command} stopped by ${signal}.`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`${command} failed with exit code ${code}.\n${stderr || stdout}`));
        return;
      }
      resolvePromise(stdout.trim());
    });
  });
}

function toVercelProjectName(value) {
  const name = value
    ?.toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/---+/g, "--")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
  if (!name) {
    throw new Error("Vercel project name could not be derived. Ensure codeboltMiniApp({ id }) emits a manifest id.");
  }
  return name;
}

function vercelProjectName(appRoot, miniApp) {
  return toVercelProjectName(miniApp?.id || basename(appRoot));
}

function vercelProjectPlan(credentials, appRoot, miniApp) {
  return {
    action: credentials.project ? "deploy-existing" : "create-or-reuse",
    name: vercelProjectName(appRoot, miniApp),
    source: miniApp?.id ? "miniapp-manifest" : "app-root",
    ...(credentials.project ? { project: credentials.project } : {}),
    ...(credentials.teamId ? { teamId: credentials.teamId } : {}),
  };
}

async function netlifyPlan(appRoot, options) {
  const publicDir = options.outputDir
    ? resolve(options.outputDir)
    : (await exists(resolve(appRoot, "dist")))
      ? resolve(appRoot, "dist")
      : resolve(appRoot, ".output/public");
  const functionsDir = resolve(appRoot, ".netlify/functions-internal");
  const hasFunctions = await exists(functionsDir);
  const functions = hasFunctions ? await netlifyFunctions(functionsDir) : [];
  const files = functions.length
    ? withNetlifyFunctionRedirect(await fileRecords(publicDir), functions[0].name)
    : await fileRecords(publicDir);
  const miniApp = await readMiniAppManifest(appRoot, publicDir);
  return {
    target: "netlify",
    outputDir: publicDir,
    miniApp,
    functionsDir: hasFunctions ? functionsDir : undefined,
    functionCount: functions.length,
    fileCount: files.length,
    byteCount: files.reduce((total, file) => total + file.size, 0),
    files: Object.fromEntries(files.map((file) => [file.relativePath, file.sha1])),
    functions: Object.fromEntries(functions.map((fn) => [fn.name, fn.sha256])),
    _files: files,
    _functions: functions,
  };
}

async function deployNetlify(plan, credentials, options) {
  required("Netlify token", credentials.token, {
    flag: "--token or --netlify-token",
    env: "NETLIFY_AUTH_TOKEN",
  });

  const siteId = credentials.siteId || (await createNetlifySite(credentials, options)).id;
  const deploy = await apiFetch(
    withQuery(`https://api.netlify.com/api/v1/sites/${siteId}/deploys`, {
      production: options.production ? "true" : undefined,
      title: options.title,
    }),
    {
      token: credentials.token,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        files: plan.files,
        functions: plan.functions,
        async: false,
      }),
    },
  );

  const requiredFiles = deploy.required || [];
  for (const requiredFile of requiredFiles) {
    const file = plan._files.find(
      (entry) => entry.relativePath === requiredFile || entry.sha1 === requiredFile,
    );
    if (!file) throw new Error(`Netlify requested unknown file: ${requiredFile}`);
    await apiFetch(
      withQuery(
        `https://api.netlify.com/api/v1/deploys/${deploy.id}/files/${encodePath(file.relativePath)}`,
        { size: String(file.size) },
      ),
      {
        token: credentials.token,
        method: "PUT",
        headers: { "Content-Type": "application/octet-stream" },
        body: file.content,
      },
    );
  }

  const requiredFunctions = deploy.required_functions || [];
  for (const requiredFunction of requiredFunctions) {
    const fn = plan._functions.find(
      (entry) => entry.name === requiredFunction || entry.sha256 === requiredFunction,
    );
    if (!fn) throw new Error(`Netlify requested unknown function: ${requiredFunction}`);
    await apiFetch(
      withQuery(
        `https://api.netlify.com/api/v1/deploys/${deploy.id}/functions/${encodeURIComponent(fn.name)}`,
        { runtime: "js" },
      ),
      {
        token: credentials.token,
        method: "PUT",
        headers: { "Content-Type": "application/zip" },
        body: fn.zip,
      },
    );
  }

  return pollNetlifyDeploy(deploy.id, credentials.token);
}

async function netlifyFunctions(functionsDir) {
  const entries = await readdir(functionsDir, { withFileTypes: true });
  const functions = [];
  for (const entry of entries) {
    const path = resolve(functionsDir, entry.name);
    if (!entry.isDirectory() || !(await exists(resolve(path, "server.mjs")))) continue;
    const files = await netlifyFunctionFiles(path, entry.name);
    const zip = zipFiles(files);
    functions.push({
      name: entry.name,
      fileCount: files.length,
      size: zip.byteLength,
      sha256: createHash("sha256").update(zip).digest("hex"),
      zip,
    });
  }
  return functions.sort((a, b) => a.name.localeCompare(b.name));
}

async function netlifyFunctionFiles(functionDir, functionName) {
  const files = await fileRecords(functionDir);
  if (files.some((file) => file.relativePath === `${functionName}.js`)) return files;
  return [
    ...files,
    fileRecord(`${functionName}.js`, netlifyLambdaBridge()),
  ].sort((a, b) => a.relativePath.localeCompare(b.relativePath));
}

function netlifyLambdaBridge() {
  return `exports.handler = async (event, context) => {
  const mod = await import("./server.mjs");
  const headers = new Headers();
  const inputHeaders = event.headers || {};
  for (const [name, value] of Object.entries(inputHeaders)) {
    if (value !== undefined && value !== null) headers.set(name, String(value));
  }

  const host = headers.get("host") || "localhost";
  const proto = headers.get("x-forwarded-proto") || "https";
  const query = event.rawQuery ? \`?\${event.rawQuery}\` : "";
  const path = event.path || "/";
  const url = event.rawUrl || \`\${proto}://\${host}\${path}\${query}\`;
  const method = event.httpMethod || "GET";
  const init = { method, headers };
  if (!["GET", "HEAD"].includes(method) && event.body !== undefined && event.body !== null) {
    init.body = event.isBase64Encoded
      ? Buffer.from(event.body, "base64")
      : event.body;
  }

  const request = new Request(url, init);
  request.context = context;
  const response = await mod.default(request, context);
  const responseHeaders = {};
  const cookies = [];
  for (const [name, value] of response.headers.entries()) {
    if (name.toLowerCase() === "set-cookie") cookies.push(value);
    else responseHeaders[name] = value;
  }

  return {
    statusCode: response.status,
    headers: responseHeaders,
    multiValueHeaders: cookies.length ? { "set-cookie": cookies } : undefined,
    body: Buffer.from(await response.arrayBuffer()).toString("base64"),
    isBase64Encoded: true,
  };
};
`;
}

async function pollNetlifyDeploy(deployId, token) {
  let latest;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    latest = await apiFetch(`https://api.netlify.com/api/v1/deploys/${deployId}`, { token });
    if (["ready", "error"].includes(latest.state)) return latest;
    await new Promise((resolvePromise) => setTimeout(resolvePromise, 1000));
  }
  return latest;
}

async function createNetlifySite(credentials, options) {
  const siteName = toNetlifySiteName(
    credentials.siteName || options.siteName || options.miniApp?.id || basename(options.appRoot),
  );
  const path = credentials.accountSlug
    ? `https://api.netlify.com/api/v1/${encodeURIComponent(credentials.accountSlug)}/sites`
    : "https://api.netlify.com/api/v1/sites";

  return apiFetch(path, {
    token: credentials.token,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: siteName }),
  });
}

function toNetlifySiteName(value) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
}

function netlifySitePlan(credentials, appRoot, miniApp) {
  if (credentials.siteId) {
    return {
      action: "deploy-existing",
      siteId: credentials.siteId,
    };
  }
  return {
    action: "create",
    siteName: toNetlifySiteName(credentials.siteName || miniApp?.id || basename(appRoot)),
    accountSlug: credentials.accountSlug,
  };
}

function toDenoAppSlug(value) {
  const slug = value
    ?.toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 63);
  if (!slug) {
    throw new Error("Deno app slug could not be derived. Pass --app or ensure codeboltMiniApp({ id }) emits a manifest id.");
  }
  return slug;
}

function resolveDenoApp(credentials, miniApp) {
  if (credentials.app) {
    return {
      app: credentials.app,
      source: "credentials",
    };
  }
  return {
    app: toDenoAppSlug(miniApp?.id),
    source: "miniapp-manifest",
  };
}

function denoAppPlan(denoApp) {
  return {
    action: "create-or-reuse",
    app: denoApp.app,
    source: denoApp.source,
  };
}

function denoAsset(file) {
  const contentType = file.relativePath.endsWith(".ts") ||
    file.relativePath.endsWith(".js") ||
    file.relativePath.endsWith(".mjs") ||
    file.relativePath.endsWith(".json") ||
    file.relativePath.endsWith(".html") ||
    file.relativePath.endsWith(".css")
    ? "utf8"
    : "base64";
  return {
    kind: "file",
    content: contentType === "utf8"
      ? file.content.toString("utf8")
      : file.content.toString("base64"),
    encoding: contentType === "utf8" ? "utf-8" : "base64",
  };
}

async function denoPlan(appRoot, options) {
  const outputDir = resolve(options.outputDir || appRoot, options.outputDir ? "." : ".output");
  const files = await fileRecords(outputDir);
  const nitroJsonPath = resolve(outputDir, "nitro.json");
  const nitroJson = (await exists(nitroJsonPath)) ? await readJson(nitroJsonPath) : {};
  const entrypoint = nitroJson.serverEntry || "server/index.ts";
  const miniApp = await readMiniAppManifest(appRoot, outputDir);
  return {
    target: "deno",
    outputDir,
    miniApp,
    entrypoint,
    fileCount: files.length,
    byteCount: files.reduce((total, file) => total + file.size, 0),
    assets: Object.fromEntries(files.map((file) => [file.relativePath, denoAsset(file)])),
  };
}

async function deployDeno(plan, credentials) {
  requireDenoV2Token(credentials.token);

  const app = required("Deno app", credentials.app, {
    flag: "--app or a MiniApp manifest id",
    env: "DENO_APP",
  });
  const existing = await apiFetchMaybe(
    `https://api.deno.com/v2/apps/${encodeURIComponent(app)}`,
    { token: credentials.token },
  );
  if (!existing.ok && existing.status !== 404) {
    const message = existing.data?.error?.message || existing.data?.message || existing.statusText;
    throw new Error(`GET https://api.deno.com/v2/apps/${app} failed: ${existing.status} ${message}`);
  }
  const appResult = existing.ok
    ? { action: "reuse", app: existing.data }
    : {
        action: "create",
        app: await apiFetch("https://api.deno.com/v2/apps", {
          token: credentials.token,
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            slug: app,
            labels: {
              "custom.codebolt.miniapp": "true",
              ...(plan.miniApp?.id ? { "custom.codebolt.miniapp.id": plan.miniApp.id } : {}),
            },
            config: {
              runtime: {
                type: "dynamic",
                entrypoint: plan.entrypoint,
              },
            },
          }),
        }),
      };

  const deployment = await apiFetch(
    `https://api.deno.com/v2/apps/${encodeURIComponent(app)}/deploy`,
    {
      token: credentials.token,
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        assets: plan.assets,
        config: {
          runtime: {
            type: "dynamic",
            entrypoint: plan.entrypoint,
          },
        },
      }),
    },
  );
  return {
    app: appResult,
    deployment,
  };
}

async function createPlan(target, appRoot, options) {
  if (target === "vercel") return vercelPlan(appRoot, options);
  if (target === "netlify") return netlifyPlan(appRoot, options);
  if (target === "deno") return denoPlan(appRoot, options);
  throw new Error(`Unsupported target: ${target}`);
}

export async function deployMiniApp(options) {
  const target = options.target;
  if (!providerPresets[target]) {
    throw new Error(`--target must be one of: ${supportedTargets().join(", ")}`);
  }

  const appRoot = resolve(options.appRoot || ".");
  if (!options.skipBuild) {
    await buildWithNitro(appRoot, target);
  }

  const env = {
    ...(await loadEnvFile(options.envFile)),
    ...process.env,
  };
  const plan = await createPlan(target, appRoot, options);
  const credentials = resolveCredentials(target, options, env);
  const denoApp = target === "deno" ? resolveDenoApp(credentials, plan.miniApp) : undefined;
  if (target === "deno") {
    credentials.app = denoApp.app;
  }
  const provider = target === "vercel"
    ? { project: vercelProjectPlan(credentials, appRoot, plan.miniApp) }
    : target === "netlify"
      ? { site: netlifySitePlan(credentials, appRoot, plan.miniApp) }
      : target === "deno"
        ? { app: denoAppPlan(denoApp) }
        : undefined;
  const result = {
    target,
    appRoot,
    dryRun: Boolean(options.dryRun),
    credentials: redactCredentials(credentials),
    provider,
    plan: {
      ...plan,
      _files: undefined,
      _functions: undefined,
      assets: plan.assets ? Object.keys(plan.assets) : undefined,
    },
  };

  if (options.dryRun) {
    return result;
  }

  const response = target === "vercel"
    ? await deployVercel(plan, credentials, { ...options, appRoot, miniApp: plan.miniApp })
    : target === "netlify"
      ? await deployNetlify(plan, credentials, { ...options, appRoot, miniApp: plan.miniApp })
      : await deployDeno(plan, credentials);

  return {
    ...result,
    response,
  };
}

export function managerUrl(path) {
  return pathToFileURL(path).href;
}
