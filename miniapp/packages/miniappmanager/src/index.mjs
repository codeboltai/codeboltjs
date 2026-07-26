import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { readdir, readFile, stat } from "node:fs/promises";
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

async function vercelPlan(appRoot, options) {
  const outputDir = resolve(options.outputDir || appRoot, options.outputDir ? "." : ".vercel/output");
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

  const teamQuery = credentials.teamId ? { teamId: credentials.teamId } : {};
  for (const file of plan._files) {
    const url = withQuery("https://api.vercel.com/v2/now/files", teamQuery);
    await apiFetch(url, {
      token: credentials.token,
      method: "POST",
      headers: {
        "Content-Type": "application/octet-stream",
        "x-vercel-digest": file.sha1,
      },
      body: file.content,
    });
  }

  const url = withQuery("https://api.vercel.com/v13/deployments", teamQuery);
  return apiFetch(url, {
    token: credentials.token,
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      name: credentials.project || options.name || options.miniApp?.id || basename(options.appRoot),
      target: options.production ? "production" : "preview",
      files: plan.files,
      projectSettings: { framework: null },
    }),
  });
}

async function netlifyPlan(appRoot, options) {
  const publicDir = options.outputDir
    ? resolve(options.outputDir)
    : (await exists(resolve(appRoot, "dist")))
      ? resolve(appRoot, "dist")
      : resolve(appRoot, ".output/public");
  const files = await fileRecords(publicDir);
  const functionsDir = resolve(appRoot, ".netlify/functions-internal");
  const hasFunctions = await exists(functionsDir);
  const miniApp = await readMiniAppManifest(appRoot, publicDir);
  return {
    target: "netlify",
    outputDir: publicDir,
    miniApp,
    functionsDir: hasFunctions ? functionsDir : undefined,
    functionUploadsSupported: false,
    fileCount: files.length,
    byteCount: files.reduce((total, file) => total + file.size, 0),
    files: Object.fromEntries(files.map((file) => [file.relativePath, file.sha1])),
    _files: files,
  };
}

async function deployNetlify(plan, credentials, options) {
  required("Netlify token", credentials.token, {
    flag: "--token or --netlify-token",
    env: "NETLIFY_AUTH_TOKEN",
  });
  if (plan.functionsDir) {
    throw new Error(
      `Netlify Nitro server functions were detected at ${plan.functionsDir}. Static file deploy is wired; server function bundle upload still needs a Netlify function packager.`,
    );
  }

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
      body: JSON.stringify({ files: plan.files, async: false }),
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

  return deploy;
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
  required("Deno token", credentials.token, {
    flag: "--token or --deno-token",
    env: "DENO_DEPLOY_TOKEN",
  });
  required("Deno app", credentials.app, {
    flag: "--app",
    env: "DENO_APP",
  });

  return apiFetch(
    `https://api.deno.com/v2/apps/${encodeURIComponent(credentials.app)}/deploy`,
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
  const provider = target === "netlify"
    ? { site: netlifySitePlan(credentials, appRoot, plan.miniApp) }
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
