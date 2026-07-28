const defaultRootDomain = "codebolt.app";
const sessionCookieName = "cb_app_session";
const catalogLoginInstallId = "__catalog__";

function text(status, body, headers = {}) {
  return new Response(body, { status, headers });
}

function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...headers },
  });
}

function normalizeBaseUrl(value, label) {
  if (!value) throw new Error(`${label} is required.`);
  return String(value).replace(/\/+$/, "");
}

function bytes(value) {
  return new TextEncoder().encode(value);
}

function encodeBase64url(input) {
  const base64 = btoa(String.fromCharCode(...new Uint8Array(input)));
  return base64.replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeBase64url(value) {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
}

async function hmac(secret, value) {
  const key = await crypto.subtle.importKey(
    "raw",
    bytes(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", key, bytes(value));
}

function timingSafeEqual(left, right) {
  const leftBytes = decodeBase64url(left);
  const rightBytes = decodeBase64url(right);
  if (leftBytes.byteLength !== rightBytes.byteLength) return false;
  let diff = 0;
  for (let index = 0; index < leftBytes.byteLength; index += 1) {
    diff |= leftBytes[index] ^ rightBytes[index];
  }
  return diff === 0;
}

export async function signSession(session, secret) {
  const payload = encodeBase64url(bytes(JSON.stringify(session)));
  const signature = encodeBase64url(await hmac(secret, payload));
  return `${payload}.${signature}`;
}

export async function verifySession(value, secret) {
  if (!value) return null;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return null;
  const expected = encodeBase64url(await hmac(secret, payload));
  if (!timingSafeEqual(signature, expected)) return null;
  const session = JSON.parse(new TextDecoder().decode(decodeBase64url(payload)));
  if (session.expiresAt && Date.parse(session.expiresAt) < Date.now()) return null;
  return session;
}

function parseCookies(header = "") {
  const cookies = {};
  for (const part of header.split(";")) {
    const [name, ...valueParts] = part.trim().split("=");
    if (!name) continue;
    cookies[name] = decodeURIComponent(valueParts.join("="));
  }
  return cookies;
}

function cookieHeader(name, value, options = {}) {
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "Secure",
    "SameSite=Lax",
  ];
  if (options.domain) parts.push(`Domain=${options.domain}`);
  if (options.maxAge !== undefined) parts.push(`Max-Age=${options.maxAge}`);
  return parts.join("; ");
}

export function installIdFromHost(host, rootDomain = defaultRootDomain) {
  const hostname = host.split(":")[0].toLowerCase();
  const root = rootDomain.toLowerCase();
  if (hostname === root) return null;
  if (!hostname.endsWith(`.${root}`)) return null;
  const prefix = hostname.slice(0, -root.length - 1);
  if (!prefix || prefix.includes(".")) return null;
  return /^[a-z0-9][a-z0-9_-]{0,127}$/.test(prefix) ? prefix : null;
}

function getEnv(env, name, fallback) {
  return env[name] ?? fallback;
}

async function readJson(response, label) {
  const textValue = await response.text();
  const data = textValue ? JSON.parse(textValue) : {};
  if (!response.ok) {
    throw new Error(`${label} failed: ${response.status} ${data.error ?? data.message ?? response.statusText}`);
  }
  return data;
}

function edgeApiBase(env) {
  return String(env.CODEBOLT_API_URL || "").replace(/\/+$/, "");
}

function edgeServiceSecret(env) {
  return env.CODEBOLT_MINIAPP_ROUTER_SECRET || env.MINIAPP_ROUTER_SECRET || env.CODEBOLT_APP_AUTH_REDEEM_SECRET;
}

async function fetchEdgeJson(env, path, init = {}) {
  const base = edgeApiBase(env);
  if (!base) throw new Error("CODEBOLT_API_URL is not configured.");
  const headers = new Headers(init.headers || {});
  headers.set("accept", "application/json");
  const secret = edgeServiceSecret(env);
  if (secret) headers.set("x-codebolt-service-secret", secret);
  const response = await fetch(`${base}${path}`, { ...init, headers });
  return readJson(response, `Edge API ${path}`);
}

async function getInstall(env, installId) {
  if (edgeApiBase(env) && edgeServiceSecret(env)) {
    try {
      const data = await fetchEdgeJson(env, `/miniapps/router/installs/${encodeURIComponent(installId)}`);
      const install = data.install;
      if (install && install.enabled !== false) return { ...install, id: install.id ?? installId };
    } catch {
      // Fall through to KV so existing POC installs keep working during migration.
    }
  }
  const install = await env.MINIAPP_INSTALLS.get(`install:${installId}`, "json");
  if (!install || install.enabled === false) return null;
  return { ...install, id: install.id ?? installId };
}

function redirect(location, headers = {}) {
  return text(302, "", { location, ...headers });
}

function stateKey(state) {
  return `state:${state}`;
}

function html(status, body, headers = {}) {
  return new Response(body, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", ...headers },
  });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function appPage(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} - CodeBolt Apps</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f7f8fb;
      --panel: #ffffff;
      --ink: #172033;
      --muted: #657085;
      --line: #d8deea;
      --accent: #0f766e;
      --accent-ink: #ffffff;
      --soft: #e7f6f4;
      --warn: #8a5a00;
      --warn-bg: #fff5d6;
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      background: var(--bg);
      color: var(--ink);
      font: 15px/1.55 system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    main {
      max-width: 980px;
      margin: 0 auto;
      padding: 28px 18px 48px;
    }
    header {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: center;
      padding-bottom: 18px;
      border-bottom: 1px solid var(--line);
      margin-bottom: 22px;
    }
    a { color: var(--accent); text-decoration: none; }
    a:hover { text-decoration: underline; }
    h1 { margin: 0; font-size: clamp(28px, 5vw, 42px); line-height: 1.05; letter-spacing: 0; }
    h2 { margin: 0 0 8px; font-size: 20px; letter-spacing: 0; }
    p { margin: 0 0 12px; color: var(--muted); }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 14px;
    }
    .card, .panel {
      background: var(--panel);
      border: 1px solid var(--line);
      border-radius: 8px;
      padding: 16px;
    }
    .meta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin: 12px 0;
    }
    .pill {
      display: inline-flex;
      align-items: center;
      min-height: 26px;
      padding: 3px 9px;
      border-radius: 999px;
      background: var(--soft);
      color: #075e56;
      font-size: 13px;
      white-space: nowrap;
    }
    .notice {
      background: var(--warn-bg);
      border: 1px solid #f1d079;
      border-radius: 8px;
      color: var(--warn);
      padding: 12px 14px;
      margin-bottom: 14px;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      margin-top: 18px;
    }
    button, .button {
      appearance: none;
      border: 1px solid var(--accent);
      border-radius: 6px;
      background: var(--accent);
      color: var(--accent-ink);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 38px;
      padding: 7px 13px;
      font: inherit;
      text-decoration: none;
    }
    button:hover, .button:hover { text-decoration: none; filter: brightness(0.96); }
    .button.secondary {
      background: var(--panel);
      color: var(--accent);
    }
    dl {
      display: grid;
      grid-template-columns: 160px 1fr;
      gap: 8px 14px;
      margin: 14px 0 0;
    }
    dt { color: var(--muted); }
    dd { margin: 0; word-break: break-word; }
    @media (max-width: 640px) {
      header { display: block; }
      dl { grid-template-columns: 1fr; gap: 2px; }
    }
  </style>
</head>
<body>
  <main>
    <header>
      <div>
        <h1>${escapeHtml(title)}</h1>
        <p>CodeBolt MiniApp catalog and install surface.</p>
      </div>
      <a href="/apps">Apps</a>
    </header>
    ${body}
  </main>
</body>
</html>`;
}

function slugPart(value, fallback = "app") {
  const slug = String(value ?? "")
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
  return slug || fallback;
}

function installUrl(env, installId) {
  return `https://${installId}.${getEnv(env, "ROOT_DOMAIN", defaultRootDomain)}`;
}

function appKey(appId) {
  return `app:${appId}`;
}

function userInstallKey(userId, appId) {
  return `user-install:${userId}:${appId}`;
}

function normalizeApp(app, appId) {
  return {
    ...app,
    id: app.id ?? appId,
    title: app.title ?? app.name ?? app.id ?? appId,
    installPolicy: app.installPolicy ?? "developer_only",
    defaultAccess: app.defaultAccess ?? "private",
  };
}

async function getApp(env, appId) {
  if (edgeApiBase(env)) {
    try {
      const data = await fetchEdgeJson(env, `/miniapps/registry/${encodeURIComponent(appId)}`);
      if (data.app) return normalizeApp(data.app, appId);
    } catch {
      // Fall through to KV so existing POC app records keep working during migration.
    }
  }
  const app = await env.MINIAPP_INSTALLS.get(appKey(appId), "json");
  if (!app || app.enabled === false) return null;
  return normalizeApp(app, appId);
}

async function listApps(env, { includeUnlisted = false } = {}) {
  if (edgeApiBase(env)) {
    try {
      const suffix = includeUnlisted ? "?includeUnlisted=true" : "";
      const data = await fetchEdgeJson(env, `/miniapps/registry${suffix}`);
      if (Array.isArray(data.apps)) {
        return data.apps
          .map((app) => normalizeApp(app, app.id))
          .filter((app) => includeUnlisted || app.installPolicy !== "unlisted")
          .sort((left, right) => left.title.localeCompare(right.title));
      }
    } catch {
      // Fall through to KV so existing POC app records keep working during migration.
    }
  }
  if (typeof env.MINIAPP_INSTALLS.list !== "function") return [];
  const listed = await env.MINIAPP_INSTALLS.list({ prefix: "app:" });
  const apps = [];
  for (const key of listed.keys ?? []) {
    const appId = key.name.slice("app:".length);
    const app = await getApp(env, appId);
    if (!app) continue;
    if (!includeUnlisted && app.installPolicy === "unlisted") continue;
    apps.push(app);
  }
  return apps.sort((left, right) => left.title.localeCompare(right.title));
}

function canInstallApp(app, session) {
  if (app.installPolicy === "developer_only") {
    return Boolean(session?.userId && session.userId === app.developerUserId);
  }
  if (app.installPolicy === "anyone" || app.installPolicy === "unlisted") {
    return Boolean(session?.userId);
  }
  return false;
}

function installPolicyLabel(policy) {
  if (policy === "anyone") return "Anyone can install";
  if (policy === "unlisted") return "Install by link";
  return "Developer only";
}

async function currentSession(request, env) {
  return verifySession(
    parseCookies(request.headers.get("cookie") ?? "")[sessionCookieName],
    env.CODEBOLT_APP_COOKIE_SECRET,
  );
}

async function handleAppsList(request, env) {
  const session = await currentSession(request, env);
  const apps = await listApps(env);
  const cards = apps.map((app) => `
    <article class="card">
      <h2><a href="/apps/${encodeURIComponent(app.id)}">${escapeHtml(app.title)}</a></h2>
      <p>${escapeHtml(app.description || "No description provided.")}</p>
      <div class="meta">
        <span class="pill">${escapeHtml(installPolicyLabel(app.installPolicy))}</span>
        <span class="pill">Default install: ${escapeHtml(app.defaultAccess)}</span>
        ${app.version ? `<span class="pill">v${escapeHtml(app.version)}</span>` : ""}
      </div>
      <a class="button secondary" href="/apps/${encodeURIComponent(app.id)}">View details</a>
    </article>
  `).join("");

  const body = `
    ${session?.userId ? `<p>Signed in as ${escapeHtml(session.email || session.userName || session.userId)}.</p>` : `<div class="notice">Sign in is required before installing an app.</div>`}
    ${cards ? `<section class="grid">${cards}</section>` : `<section class="panel"><p>No MiniApps are published in this router yet.</p></section>`}
  `;
  return html(200, appPage("MiniApps", body));
}

async function existingUserInstall(env, session, app) {
  const installId = await env.MINIAPP_INSTALLS.get(userInstallKey(session.userId, app.id));
  if (!installId) return null;
  return getInstall(env, installId);
}

async function handleAppDetail(request, env, appId) {
  const app = await getApp(env, appId);
  if (!app) return html(404, appPage("App Not Found", `<section class="panel"><p>MiniApp not found.</p></section>`));

  const session = await currentSession(request, env);
  const existing = session?.userId ? await existingUserInstall(env, session, app) : null;
  const canInstall = canInstallApp(app, session);
  const needsLogin = !session?.userId;
  const denied = session?.userId && !canInstall && !existing;
  const installAction = existing
    ? `<a class="button" href="${escapeHtml(installUrl(env, existing.id))}">Open installed app</a>`
    : canInstall
      ? `<form method="post" action="/apps/${encodeURIComponent(app.id)}/install"><button type="submit">Install</button></form>`
      : needsLogin
        ? `<a class="button" href="/auth/start?installId=${encodeURIComponent(catalogLoginInstallId)}&returnTo=${encodeURIComponent(`/apps/${app.id}`)}">Sign in to install</a>`
        : "";

  const body = `
    ${denied ? `<div class="notice">This app can only be installed by its developer.</div>` : ""}
    <section class="panel">
      <h2>${escapeHtml(app.title)}</h2>
      <p>${escapeHtml(app.description || "No description provided.")}</p>
      <div class="meta">
        <span class="pill">${escapeHtml(installPolicyLabel(app.installPolicy))}</span>
        <span class="pill">Default install access: ${escapeHtml(app.defaultAccess)}</span>
        ${app.version ? `<span class="pill">v${escapeHtml(app.version)}</span>` : ""}
      </div>
      <dl>
        <dt>App ID</dt><dd>${escapeHtml(app.id)}</dd>
        <dt>Developer</dt><dd>${escapeHtml(app.developerName || app.developerUserId || "Unknown")}</dd>
        <dt>Upstream</dt><dd>${escapeHtml(app.upstreamUrl || "Not configured")}</dd>
        <dt>Capabilities</dt><dd>${escapeHtml(app.capabilityUrl || "Not configured")}</dd>
        ${existing ? `<dt>Your install</dt><dd><a href="${escapeHtml(installUrl(env, existing.id))}">${escapeHtml(installUrl(env, existing.id))}</a></dd>` : ""}
      </dl>
      <div class="actions">
        ${installAction}
        <a class="button secondary" href="/apps">Back to apps</a>
      </div>
    </section>
  `;
  return html(200, appPage(app.title, body));
}

async function uniqueInstallId(env, appId) {
  const base = slugPart(appId, "miniapp").slice(0, 42);
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const suffix = crypto.randomUUID().replaceAll("-", "").slice(0, 8);
    const installId = `${base}-${suffix}`.slice(0, 63).replace(/-+$/g, "");
    if (!(await env.MINIAPP_INSTALLS.get(`install:${installId}`, "json"))) return installId;
  }
  throw new Error("Unable to allocate install id.");
}

async function handleAppInstall(request, env, appId) {
  if (request.method !== "POST") return json(405, { error: "method not allowed" }, { allow: "POST" });

  const app = await getApp(env, appId);
  if (!app) return html(404, appPage("App Not Found", `<section class="panel"><p>MiniApp not found.</p></section>`));

  const session = await currentSession(request, env);
  if (!session?.userId) {
    const returnTo = `/apps/${encodeURIComponent(app.id)}`;
    const start = new URL(`https://${getEnv(env, "ROOT_DOMAIN", defaultRootDomain)}/auth/start`);
    start.searchParams.set("installId", catalogLoginInstallId);
    start.searchParams.set("returnTo", returnTo);
    return redirect(start.toString());
  }

  const existing = await existingUserInstall(env, session, app);
  if (existing) return redirect(installUrl(env, existing.id));

  if (!canInstallApp(app, session)) return html(403, appPage("Install Not Allowed", `
    <section class="panel">
      <p>This app can only be installed by its developer.</p>
      <a class="button secondary" href="/apps/${encodeURIComponent(app.id)}">Back to app</a>
    </section>
  `));

  const installId = await uniqueInstallId(env, app.id);
  if (edgeApiBase(env) && edgeServiceSecret(env)) {
    try {
      const data = await fetchEdgeJson(env, `/miniapps/router/apps/${encodeURIComponent(app.id)}/install`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          installId,
          userId: session.userId,
          workspaceId: app.defaultWorkspaceId ?? `personal-${slugPart(session.userId, "user")}`,
          access: app.defaultAccess ?? "private",
        }),
      });
      return redirect(installUrl(env, data.installId || installId));
    } catch {
      // Fall through to KV install creation during migration.
    }
  }
  const install = {
    id: installId,
    appId: app.id,
    appTitle: app.title,
    upstreamUrl: app.deployment?.upstreamUrl || app.upstreamUrl || app.deployment?.runtimeUrl,
    capabilityUrl: app.deployment?.capabilityUrl || app.capabilityUrl,
    workspaceId: app.defaultWorkspaceId ?? `personal-${slugPart(session.userId, "user")}`,
    ownerUserId: session.userId,
    access: app.defaultAccess ?? "private",
    enabled: true,
    createdAt: new Date().toISOString(),
  };
  await env.MINIAPP_INSTALLS.put(`install:${installId}`, JSON.stringify(install));
  await env.MINIAPP_INSTALLS.put(userInstallKey(session.userId, app.id), installId);
  return redirect(installUrl(env, installId));
}

async function handleAppsRoute(request, env) {
  const url = new URL(request.url);
  if (url.pathname === "/apps" || url.pathname === "/apps/") return handleAppsList(request, env);

  const match = url.pathname.match(/^\/apps\/([^/]+)(?:\/(install))?\/?$/);
  if (!match) return text(404, "Not Found");
  const appId = decodeURIComponent(match[1]);
  if (match[2] === "install") return handleAppInstall(request, env, appId);
  if (request.method !== "GET" && request.method !== "HEAD") return json(405, { error: "method not allowed" }, { allow: "GET" });
  return handleAppDetail(request, env, appId);
}

async function handleAuthStart(request, env) {
  const url = new URL(request.url);
  const installId = url.searchParams.get("installId");
  const returnTo = url.searchParams.get("returnTo") || "/";
  if (!installId) return json(400, { error: "installId is required" });

  if (installId !== catalogLoginInstallId) {
    const install = await getInstall(env, installId);
    if (!install) return json(404, { error: "install not found" });
  }

  const state = crypto.randomUUID();
  await env.MINIAPP_AUTH_STATE.put(
    stateKey(state),
    JSON.stringify({ installId, returnTo, createdAt: new Date().toISOString() }),
    { expirationTtl: 600 },
  );

  const portalUrl = new URL(`${normalizeBaseUrl(env.CODEBOLT_PORTAL_URL, "CODEBOLT_PORTAL_URL")}/miniapp-auth`);
  portalUrl.searchParams.set("state", state);
  portalUrl.searchParams.set("installId", installId);
  return redirect(portalUrl.toString());
}

async function handleAuthCallback(request, env) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state) return json(400, { error: "code and state are required" });

  const stateRecord = await env.MINIAPP_AUTH_STATE.get(stateKey(state), "json");
  if (!stateRecord) return json(400, { error: "invalid or expired state" });
  await env.MINIAPP_AUTH_STATE.delete(stateKey(state));

  const apiUrl = `${normalizeBaseUrl(env.CODEBOLT_API_URL, "CODEBOLT_API_URL")}/auth/miniapp-login-codes/redeem`;
  const redeem = await fetch(apiUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-codebolt-service-secret": env.CODEBOLT_APP_AUTH_REDEEM_SECRET,
    },
    body: JSON.stringify({ code, state, installId: stateRecord.installId }),
  });
  let redeemed;
  try {
    redeemed = await readJson(redeem, "Redeem login code");
  } catch (error) {
    return json(redeem.status || 400, {
      error: error?.message || "Unable to authorize MiniApp session.",
    });
  }

  const ttlSeconds = Number(getEnv(env, "SESSION_TTL_SECONDS", 86400));
  const session = {
    userId: redeemed.userId,
    userName: redeemed.userName,
    email: redeemed.email,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + ttlSeconds * 1000).toISOString(),
  };
  const signed = await signSession(session, env.CODEBOLT_APP_COOKIE_SECRET);
  return redirect(stateRecord.returnTo, {
    "set-cookie": cookieHeader(sessionCookieName, signed, {
      domain: `.${getEnv(env, "ROOT_DOMAIN", defaultRootDomain)}`,
      maxAge: ttlSeconds,
    }),
  });
}

function handleLogout(env) {
  return redirect("/", {
    "set-cookie": cookieHeader(sessionCookieName, "", {
      domain: `.${getEnv(env, "ROOT_DOMAIN", defaultRootDomain)}`,
      maxAge: 0,
    }),
  });
}

function hasInstallAccess(install, session) {
  if (install.access === "public") return true;
  if (install.access === "authenticated") return Boolean(session?.userId);
  if (!session?.userId) return false;
  if (install.ownerUserId === session.userId) return true;
  if (Array.isArray(install.allowedUserIds) && install.allowedUserIds.includes(session.userId)) return true;
  return false;
}

async function createExecutionToken(install, session) {
  const capabilityUrl = normalizeBaseUrl(install.capabilityUrl, "install.capabilityUrl");
  const response = await fetch(`${capabilityUrl}/token`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      miniAppId: install.appId,
      installId: install.id,
      workspaceId: install.workspaceId,
      userId: session?.userId ?? `anonymous:${install.id}`,
      roles: session?.userId ? ["user"] : ["anonymous"],
    }),
  });
  const data = await readJson(response, "Create execution token");
  return data.token;
}

function proxyHeaders(request, token, install) {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("cookie");
  headers.delete("authorization");
  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("x-codebolt-execution-token");
  headers.delete("x-codebolt-cloud-url");
  headers.delete("x-codebolt-capability-url");
  headers.set("x-codebolt-miniapp-id", install.appId);
  headers.set("x-codebolt-install-id", install.id);
  headers.set("x-codebolt-workspace-id", install.workspaceId);
  if (token) {
    headers.set("authorization", `Bearer ${token}`);
    headers.set("x-codebolt-execution-token", token);
  }
  if (install.capabilityUrl) {
    headers.set("x-codebolt-cloud-url", normalizeBaseUrl(install.capabilityUrl, "install.capabilityUrl"));
  }
  return headers;
}

async function proxyInstallRequest(request, install, session) {
  const token = install.capabilityUrl ? await createExecutionToken(install, session) : null;
  const inputUrl = new URL(request.url);
  const upstream = new URL(inputUrl.pathname + inputUrl.search, normalizeBaseUrl(install.upstreamUrl, "install.upstreamUrl"));
  return fetch(upstream, {
    method: request.method,
    headers: proxyHeaders(request, token, install),
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "manual",
  });
}

async function handleInstallRequest(request, env, installId) {
  const install = await getInstall(env, installId);
  if (!install) return json(404, { error: "install not found" });

  const session = await verifySession(
    parseCookies(request.headers.get("cookie") ?? "")[sessionCookieName],
    env.CODEBOLT_APP_COOKIE_SECRET,
  );

  if (!hasInstallAccess(install, session)) {
    const currentUrl = new URL(request.url);
    const start = new URL(`https://${getEnv(env, "ROOT_DOMAIN", defaultRootDomain)}/auth/start`);
    start.searchParams.set("installId", install.id);
    start.searchParams.set("returnTo", currentUrl.toString());
    return redirect(start.toString());
  }

  try {
    return await proxyInstallRequest(request, install, session);
  } catch (error) {
    return json(502, {
      error: "Unable to proxy MiniApp request.",
      detail: error?.message || String(error),
    });
  }
}

export async function handleRouterRequest(request, env) {
  const url = new URL(request.url);
  const rootDomain = getEnv(env, "ROOT_DOMAIN", defaultRootDomain);
  const installId = installIdFromHost(url.host, rootDomain);

  if (!installId) {
    if (url.pathname === "/health") return json(200, { ok: true });
    if (url.pathname === "/apps" || url.pathname.startsWith("/apps/")) return handleAppsRoute(request, env);
    if (url.pathname === "/auth/start") return handleAuthStart(request, env);
    if (url.pathname === "/auth/callback") return handleAuthCallback(request, env);
    if (url.pathname === "/auth/logout") return handleLogout(env);
    return text(404, "Not Found");
  }

  return handleInstallRequest(request, env, installId);
}

export default {
  fetch(request, env) {
    return handleRouterRequest(request, env);
  },
};
