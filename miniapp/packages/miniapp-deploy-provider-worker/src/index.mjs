const providerId = "codebolt-miniapp-deploy-provider";

function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

function cleanSlug(value, fallback = "miniapp") {
  const slug = String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-")
    .slice(0, 63);
  return slug || fallback;
}

function cleanDenoSlug(value, fallback = "miniapp") {
  const slug = cleanSlug(value, fallback).slice(0, 32).replace(/-+$/, "");
  return slug || fallback;
}

function getSecret(env) {
  return env.PROVIDER_WORKER_SECRET || env.MINIAPP_DEPLOY_PROVIDER_SECRET || env.CODEBOLT_PROVIDER_SECRET;
}

function isAuthorized(request, env) {
  const secret = getSecret(env);
  if (!secret) return true;
  const auth = request.headers.get("authorization") || "";
  return auth === `Bearer ${secret}` || request.headers.get("x-codebolt-provider-secret") === secret;
}

function assertAuthorized(request, env) {
  if (!isAuthorized(request, env)) {
    throw Object.assign(new Error("Access denied."), { status: 401 });
  }
}

function requireEnv(env, name) {
  const value = env[name];
  if (!value) throw new Error(`${name} is required.`);
  return value;
}

function withQuery(url, query = {}) {
  const value = new URL(url);
  for (const [key, entry] of Object.entries(query)) {
    if (entry !== undefined && entry !== null && entry !== "") value.searchParams.set(key, entry);
  }
  return value.toString();
}

function bytesFromBase64(value) {
  const binary = atob(value || "");
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function textFromBytes(bytes) {
  return new TextDecoder().decode(bytes);
}

function bytesToHex(bytes) {
  return Array.from(bytes).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function digestHex(algorithm, bytes) {
  return bytesToHex(new Uint8Array(await crypto.subtle.digest(algorithm, bytes)));
}

async function apiFetch(url, { token, method = "GET", headers = {}, body } = {}) {
  const response = await fetch(url, {
    method,
    headers: {
      accept: "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body,
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};
  if (!response.ok) {
    const message = data?.error?.message || data?.error || data?.message || response.statusText;
    throw new Error(`${method} ${url} failed: ${response.status} ${message}`);
  }
  return data;
}

async function apiFetchMaybe(url, options) {
  const response = await fetch(url, {
    method: options?.method || "GET",
    headers: {
      accept: "application/json",
      ...(options?.token ? { authorization: `Bearer ${options.token}` } : {}),
      ...(options?.headers || {}),
    },
    body: options?.body,
  });
  const text = await response.text();
  return {
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    data: text ? JSON.parse(text) : {},
  };
}

function asArrayPayload(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.apps)) return data.apps;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.results)) return data.results;
  return [];
}

async function findDenoApp(token, slug) {
  const listed = await apiFetchMaybe(
    withQuery("https://api.deno.com/v2/apps", {
      limit: "100",
      "labels[custom.codebolt.miniapp]": "true",
      "labels[custom.codebolt.miniapp.slug]": slug,
    }),
    { token },
  );
  if (!listed.ok) return null;
  return asArrayPayload(listed.data).find((app) => app?.slug === slug || app?.name === slug) || null;
}

async function normalizeBundle(bundle) {
  if (!bundle || !Array.isArray(bundle.files) || !bundle.files.length) {
    throw new Error("bundle.files is required.");
  }
  return Promise.all(bundle.files.map(async (file) => {
    if (!file.path || !file.contentBase64) throw new Error("Each bundle file requires path and contentBase64.");
    const content = bytesFromBase64(file.contentBase64);
    return {
      path: String(file.path).replaceAll("\\", "/").replace(/^\/+/, ""),
      size: Number(file.size ?? content.byteLength),
      content,
      contentBase64: file.contentBase64,
      text: undefined,
      sha1: file.sha1 || await digestHex("SHA-1", content),
      sha256: file.sha256 || await digestHex("SHA-256", content),
    };
  }));
}

function findFile(files, path) {
  return files.find((file) => file.path === path);
}

function readJsonFile(files, path, fallback = {}) {
  const file = findFile(files, path);
  if (!file) return fallback;
  return JSON.parse(textFromBytes(file.content));
}

function deploymentUrl(value) {
  if (!value) return undefined;
  return String(value).startsWith("http") ? String(value) : `https://${value}`;
}

function firstUrl(...values) {
  for (const value of values) {
    if (!value) continue;
    if (Array.isArray(value)) {
      const nested = firstUrl(...value);
      if (nested) return nested;
      continue;
    }
    if (typeof value === "object") {
      const nested = firstUrl(value.url, value.domain, value.name, value.hostname);
      if (nested) return nested;
      continue;
    }
    return deploymentUrl(value);
  }
  return undefined;
}

function prefixedPath(root, path) {
  const cleanRoot = String(root || "")
    .replaceAll("\\", "/")
    .replace(/^\/+|\/+$/g, "");
  const cleanPath = String(path || "")
    .replaceAll("\\", "/")
    .replace(/^\/+/, "");
  if (!cleanRoot || cleanRoot === ".") return cleanPath;
  if (cleanPath === cleanRoot || cleanPath.startsWith(`${cleanRoot}/`)) return cleanPath;
  return `${cleanRoot}/${cleanPath}`;
}

function vercelRuntimeUrl(name, target, deployment) {
  if ((target || "production") === "production") {
    return `https://${name}.vercel.app`;
  }
  return firstUrl(deployment.alias, deployment.aliases, deployment.url);
}

function denoAsset(file) {
  const textLike = /\.(mjs|js|ts|json|html|css|txt|svg|xml|map)$/i.test(file.path);
  return {
    kind: "file",
    content: textLike ? textFromBytes(file.content) : file.contentBase64,
    encoding: textLike ? "utf-8" : "base64",
  };
}

async function deployDeno(payload, env) {
  const token = requireEnv(env, "DENO_DEPLOY_TOKEN");
  if (!token.startsWith("ddo_")) {
    throw new Error("DENO_DEPLOY_TOKEN must be a Deno Deploy organization token with the ddo_ prefix.");
  }
  const files = await normalizeBundle(payload.bundle);
  const nitro = readJsonFile(files, "nitro.json", {});
  const app = cleanDenoSlug(env.DENO_APP || `${env.DENO_APP_PREFIX || "codebolt-miniapp"}-${payload.appId}`);
  const entrypoint = env.DENO_ENTRYPOINT || nitro.serverEntry || "server/index.mjs";
  const assets = Object.fromEntries(files.map((file) => [file.path, denoAsset(file)]));

  const existing = await findDenoApp(token, app);
  const appResult = existing
    || await apiFetch("https://api.deno.com/v2/apps", {
        token,
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slug: app,
          labels: {
            "custom.codebolt.miniapp": "true",
            "custom.codebolt.miniapp.id": payload.appId,
            "custom.codebolt.miniapp.slug": app,
          },
          config: {
            runtime: { type: "dynamic", entrypoint },
          },
        }),
      });

  const appTarget = appResult.id || appResult.uuid || app;
  const deployment = await apiFetch(`https://api.deno.com/v2/apps/${encodeURIComponent(appTarget)}/deploy`, {
    token,
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      assets,
      config: {
        install: env.DENO_INSTALL_COMMAND || undefined,
        runtime: { type: "dynamic", entrypoint },
      },
    }),
  });

  const runtimeUrl = firstUrl(
    deployment.url,
    deployment.domain,
    deployment.domains,
    deployment.app?.domains,
    appResult.url,
    appResult.domain,
    appResult.domains,
    env.DENO_DEFAULT_DOMAIN || (env.DENO_ORG_SLUG ? `${app}.${env.DENO_ORG_SLUG}.deno.net` : undefined),
    `${app}.deno.net`,
  );
  return {
    status: deployment.status || deployment.state || "provisioning",
    runtimeUrl,
    upstreamUrl: runtimeUrl,
    providerDeploymentId: deployment.id || deployment.revision_id,
    providerResponse: { app: appResult, deployment },
  };
}

async function deployVercel(payload, env) {
  const token = requireEnv(env, "VERCEL_TOKEN");
  const files = await normalizeBundle(payload.bundle);
  const teamId = env.VERCEL_TEAM_ID || env.VERCEL_ORG_ID;
  const teamSlug = env.VERCEL_TEAM_SLUG;
  const query = { teamId, slug: teamSlug };
  const deploymentQuery = { ...query, prebuilt: "1" };
  const outputRoot = payload.bundle?.root || ".vercel/output";

  await Promise.all(files.map((file) =>
    apiFetch(withQuery("https://api.vercel.com/v2/now/files", query), {
      token,
      method: "POST",
      headers: {
        "content-type": "application/octet-stream",
        "x-vercel-digest": file.sha1,
        "x-now-digest": file.sha1,
        "x-now-size": String(file.size),
      },
      body: file.content,
    }),
  ));

  const name = cleanSlug(env.VERCEL_PROJECT || `${env.VERCEL_PROJECT_PREFIX || "codebolt-miniapp"}-${payload.appId}`);
  const target = env.VERCEL_TARGET || "production";
  const deployment = await apiFetch(withQuery("https://api.vercel.com/v13/deployments", deploymentQuery), {
    token,
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      version: 2,
      name,
      target,
      files: files.map((file) => ({
        file: prefixedPath(outputRoot, file.path),
        sha: file.sha1,
        size: file.size,
      })),
      projectSettings: { framework: null },
    }),
  });

  const runtimeUrl = vercelRuntimeUrl(name, target, deployment);
  return {
    status: deployment.readyState || deployment.status || "provisioning",
    runtimeUrl,
    upstreamUrl: runtimeUrl,
    providerDeploymentId: deployment.id || deployment.uid,
    providerResponse: deployment,
  };
}

function netlifyPath(file) {
  const value = file.path.startsWith("public/")
    ? file.path.slice("public/".length) || "index.html"
    : file.path.startsWith(".output/public/")
      ? file.path.slice(".output/public/".length) || "index.html"
      : file.path;
  return value.startsWith("/") ? value : `/${value}`;
}

function netlifyUploadPath(file) {
  return netlifyPath(file)
    .replace(/^\/+/, "")
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function createNetlifySite(env, payload) {
  const token = requireEnv(env, "NETLIFY_AUTH_TOKEN");
  const siteName = cleanSlug(env.NETLIFY_SITE_NAME || `${env.NETLIFY_SITE_PREFIX || "codebolt-miniapp"}-${payload.appId}`);
  const accountSlug = env.NETLIFY_ACCOUNT_SLUG;
  const endpoint = accountSlug
    ? `https://api.netlify.com/api/v1/${encodeURIComponent(accountSlug)}/sites`
    : "https://api.netlify.com/api/v1/sites";
  return apiFetch(endpoint, {
    token,
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ name: siteName }),
  });
}

async function deployNetlify(payload, env) {
  const token = requireEnv(env, "NETLIFY_AUTH_TOKEN");
  const files = (await normalizeBundle(payload.bundle))
    .filter((file) => !file.path.startsWith("server/") && !file.path.startsWith("codebolt/") && file.path !== "nitro.json");
  const siteId = env.NETLIFY_SITE_ID || (await createNetlifySite(env, payload)).id;
  if (!siteId) throw new Error("Netlify site id is required or site creation failed.");

  const fileMap = Object.fromEntries(files.map((file) => [netlifyPath(file), file.sha1]));
  const deploy = await apiFetch(
    withQuery(`https://api.netlify.com/api/v1/sites/${encodeURIComponent(siteId)}/deploys`, {
      production: env.NETLIFY_PRODUCTION === "false" ? undefined : "true",
      title: payload.manifest?.title || payload.appId,
    }),
    {
      token,
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        files: fileMap,
        async: false,
      }),
    },
  );

  const required = deploy.required || [];
  for (const requiredHash of required) {
    const file = files.find((entry) => entry.sha1 === requiredHash);
    if (!file) throw new Error(`Netlify requested unknown file hash: ${requiredHash}`);
    await apiFetch(
      withQuery(`https://api.netlify.com/api/v1/deploys/${encodeURIComponent(deploy.id)}/files/${netlifyUploadPath(file)}`, {
        size: String(file.size),
      }),
      {
        token,
        method: "PUT",
        headers: { "content-type": "application/octet-stream" },
        body: file.content,
      },
    );
  }

  const latest = await apiFetch(`https://api.netlify.com/api/v1/deploys/${encodeURIComponent(deploy.id)}`, { token });
  const runtimeUrl = firstUrl(latest.ssl_url, latest.deploy_ssl_url, latest.url, deploy.ssl_url, deploy.url);
  return {
    status: latest.state || deploy.state || "provisioning",
    runtimeUrl,
    upstreamUrl: runtimeUrl,
    providerDeploymentId: latest.id || deploy.id,
    providerResponse: latest,
  };
}

function manifest(env) {
  return {
    provider: {
      id: providerId,
      name: env.PROVIDER_NAME || "CodeBolt MiniApp Deploy Provider",
      description: "Deploys MiniApp bundles to Deno Subhosting, Vercel Platform, or Netlify using provider-worker secrets.",
    },
    defaultPlatform: env.DEFAULT_PLATFORM || "deno-subhosting",
    platforms: [
      {
        id: "deno-subhosting",
        label: "Deno Subhosting",
        requiredSecrets: ["DENO_DEPLOY_TOKEN"],
        bundleFormats: ["files"],
      },
      {
        id: "vercel-platform",
        label: "Vercel Platform",
        requiredSecrets: ["VERCEL_TOKEN"],
        bundleFormats: ["files"],
      },
      {
        id: "netlify",
        label: "Netlify",
        requiredSecrets: ["NETLIFY_AUTH_TOKEN"],
        bundleFormats: ["files"],
      },
    ],
    capabilities: ["miniapp.deploy"],
  };
}

async function handleDeploy(request, env) {
  assertAuthorized(request, env);
  const payload = await request.json();
  const platform = payload.platform || env.DEFAULT_PLATFORM || "deno-subhosting";
  const startedAt = new Date().toISOString();
  const result = platform === "deno-subhosting"
    ? await deployDeno(payload, env)
    : platform === "vercel-platform"
      ? await deployVercel(payload, env)
      : platform === "netlify"
        ? await deployNetlify(payload, env)
        : undefined;
  if (!result) throw new Error(`Unsupported MiniApp deploy platform: ${platform}`);
  return json(200, {
    success: true,
    providerId,
    platform,
    deployment: {
      ...result,
      status: result.status || "ready",
      startedAt,
      completedAt: new Date().toISOString(),
    },
  });
}

export async function handleRequest(request, env) {
  const url = new URL(request.url);
  if (url.pathname === "/health") return json(200, { ok: true });
  if (url.pathname === "/manifest") {
    assertAuthorized(request, env);
    return json(200, manifest(env));
  }
  if (url.pathname === "/deploy" && request.method === "POST") {
    return handleDeploy(request, env);
  }
  return json(404, { success: false, error: "Not Found" });
}

export default {
  async fetch(request, env) {
    try {
      return await handleRequest(request, env);
    } catch (error) {
      return json(error.status || 500, {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },
};
