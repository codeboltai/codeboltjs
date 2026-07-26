const defaultRootDomain = "codebolt.app";
const sessionCookieName = "cb_app_session";

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
  return /^[a-z0-9][a-z0-9-]{0,62}$/.test(prefix) ? prefix : null;
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

async function getInstall(env, installId) {
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

async function handleAuthStart(request, env) {
  const url = new URL(request.url);
  const installId = url.searchParams.get("installId");
  const returnTo = url.searchParams.get("returnTo") || "/";
  if (!installId) return json(400, { error: "installId is required" });

  const install = await getInstall(env, installId);
  if (!install) return json(404, { error: "install not found" });

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
  const redeemed = await readJson(redeem, "Redeem login code");

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
  headers.delete("cookie");
  headers.delete("authorization");
  headers.delete("x-codebolt-execution-token");
  headers.delete("x-codebolt-cloud-url");
  headers.delete("x-codebolt-capability-url");
  headers.set("authorization", `Bearer ${token}`);
  headers.set("x-codebolt-execution-token", token);
  headers.set("x-codebolt-cloud-url", normalizeBaseUrl(install.capabilityUrl, "install.capabilityUrl"));
  return headers;
}

async function proxyInstallRequest(request, install, session) {
  const token = await createExecutionToken(install, session);
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

  return proxyInstallRequest(request, install, session);
}

export async function handleRouterRequest(request, env) {
  const url = new URL(request.url);
  const rootDomain = getEnv(env, "ROOT_DOMAIN", defaultRootDomain);
  const installId = installIdFromHost(url.host, rootDomain);

  if (!installId) {
    if (url.pathname === "/health") return json(200, { ok: true });
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
