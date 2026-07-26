import assert from "node:assert/strict";
import test from "node:test";
import {
  handleRouterRequest,
  signSession,
} from "../packages/miniapp-router-worker/src/index.mjs";

function createKv(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    values,
    async get(key, type) {
      const value = values.get(key);
      if (value === undefined) return null;
      return type === "json" ? JSON.parse(value) : value;
    },
    async put(key, value) {
      values.set(key, value);
    },
    async delete(key) {
      values.delete(key);
    },
  };
}

function createEnv(overrides = {}) {
  return {
    ROOT_DOMAIN: "codebolt.app",
    CODEBOLT_PORTAL_URL: "https://portal.codebolt.ai",
    CODEBOLT_API_URL: "https://api.codebolt.ai/api",
    CODEBOLT_APP_COOKIE_SECRET: "test-cookie-secret",
    CODEBOLT_APP_AUTH_REDEEM_SECRET: "test-redeem-secret",
    MINIAPP_INSTALLS: createKv({
      "install:leadreact": JSON.stringify({
        id: "leadreact",
        appId: "lead-react",
        upstreamUrl: "https://lead-react.netlify.app",
        capabilityUrl: "https://sample-cloud.test",
        workspaceId: "personal:user-1",
        ownerUserId: "user-1",
        access: "private",
        enabled: true,
      }),
      "install:publicapp": JSON.stringify({
        id: "publicapp",
        appId: "lead-react",
        upstreamUrl: "https://lead-react.netlify.app",
        capabilityUrl: "https://sample-cloud.test",
        workspaceId: "public-workspace",
        access: "public",
        enabled: true,
      }),
    }),
    MINIAPP_AUTH_STATE: createKv(),
    ...overrides,
  };
}

function withMockFetch(handler) {
  const originalFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (input, init = {}) => {
    const request = input instanceof Request ? input : new Request(input, init);
    calls.push(request);
    const url = new URL(request.url);
    if (url.hostname === "sample-cloud.test" && url.pathname === "/token") {
      const body = await request.json();
      return Response.json({ token: `token-for-${body.installId}-${body.userId}` });
    }
    if (url.hostname === "api.codebolt.ai" && url.pathname === "/api/auth/miniapp-login-codes/redeem") {
      return Response.json({ userId: "user-1", userName: "Test User", email: "test@example.com" });
    }
    if (url.hostname === "lead-react.netlify.app") {
      return Response.json({
        ok: true,
        authorization: request.headers.get("authorization"),
        executionToken: request.headers.get("x-codebolt-execution-token"),
        cloudUrl: request.headers.get("x-codebolt-cloud-url"),
        cookie: request.headers.get("cookie"),
        path: url.pathname,
      });
    }
    return Response.json({ error: "unexpected fetch" }, { status: 500 });
  };
  return Promise.resolve()
    .then(() => handler(calls))
    .finally(() => {
      globalThis.fetch = originalFetch;
    });
}

test("private install without session redirects to auth start", async () => {
  const response = await handleRouterRequest(
    new Request("https://leadreact.codebolt.app/api/leads"),
    createEnv(),
  );

  assert.equal(response.status, 302);
  const location = new URL(response.headers.get("location"));
  assert.equal(location.href.startsWith("https://codebolt.app/auth/start?"), true);
  assert.equal(location.searchParams.get("installId"), "leadreact");
  assert.equal(location.searchParams.get("returnTo"), "https://leadreact.codebolt.app/api/leads");
});

test("auth start records state and redirects to portal", async () => {
  const env = createEnv();
  const response = await handleRouterRequest(
    new Request("https://codebolt.app/auth/start?installId=leadreact&returnTo=https%3A%2F%2Fleadreact.codebolt.app%2F"),
    env,
  );

  assert.equal(response.status, 302);
  const location = new URL(response.headers.get("location"));
  assert.equal(location.origin, "https://portal.codebolt.ai");
  assert.equal(location.pathname, "/miniapp-auth");
  assert.equal(location.searchParams.get("installId"), "leadreact");
  const state = location.searchParams.get("state");
  assert.ok(await env.MINIAPP_AUTH_STATE.get(`state:${state}`, "json"));
});

test("auth callback redeems code and sets app-domain cookie", async () => {
  await withMockFetch(async () => {
    const env = createEnv();
    await env.MINIAPP_AUTH_STATE.put(
      "state:state-1",
      JSON.stringify({ installId: "leadreact", returnTo: "https://leadreact.codebolt.app/" }),
    );

    const response = await handleRouterRequest(
      new Request("https://codebolt.app/auth/callback?code=code-1&state=state-1"),
      env,
    );

    assert.equal(response.status, 302);
    assert.equal(response.headers.get("location"), "https://leadreact.codebolt.app/");
    assert.match(response.headers.get("set-cookie"), /cb_app_session=/);
    assert.match(response.headers.get("set-cookie"), /Domain=\.codebolt\.app/);
    assert.equal(await env.MINIAPP_AUTH_STATE.get("state:state-1", "json"), null);
  });
});

test("private install with valid session proxies and injects execution token", async () => {
  await withMockFetch(async () => {
    const env = createEnv();
    const session = await signSession({
      userId: "user-1",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    }, env.CODEBOLT_APP_COOKIE_SECRET);

    const response = await handleRouterRequest(
      new Request("https://leadreact.codebolt.app/api/leads?source=test", {
        headers: {
          cookie: `cb_app_session=${encodeURIComponent(session)}`,
          authorization: "Bearer browser-token",
        },
      }),
      env,
    );

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.path, "/api/leads");
    assert.equal(body.authorization, "Bearer token-for-leadreact-user-1");
    assert.equal(body.executionToken, "token-for-leadreact-user-1");
    assert.equal(body.cloudUrl, "https://sample-cloud.test");
    assert.equal(body.cookie, null);
  });
});

test("authenticated install redirects without session and allows any signed-in user", async () => {
  await withMockFetch(async () => {
    const env = createEnv({
      MINIAPP_INSTALLS: createKv({
        "install:authapp": JSON.stringify({
          id: "authapp",
          appId: "lead-react",
          upstreamUrl: "https://lead-react.netlify.app",
          capabilityUrl: "https://sample-cloud.test",
          workspaceId: "auth-workspace",
          access: "authenticated",
          enabled: true,
        }),
      }),
    });

    const unauthenticated = await handleRouterRequest(
      new Request("https://authapp.codebolt.app/api/leads"),
      env,
    );
    assert.equal(unauthenticated.status, 302);

    const session = await signSession({
      userId: "any-user",
      expiresAt: new Date(Date.now() + 60_000).toISOString(),
    }, env.CODEBOLT_APP_COOKIE_SECRET);
    const authenticated = await handleRouterRequest(
      new Request("https://authapp.codebolt.app/api/leads", {
        headers: { cookie: `cb_app_session=${encodeURIComponent(session)}` },
      }),
      env,
    );
    assert.equal(authenticated.status, 200);
  });
});

test("public install proxies without session as anonymous", async () => {
  await withMockFetch(async () => {
    const response = await handleRouterRequest(
      new Request("https://publicapp.codebolt.app/"),
      createEnv(),
    );

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.authorization, "Bearer token-for-publicapp-anonymous:publicapp");
  });
});
