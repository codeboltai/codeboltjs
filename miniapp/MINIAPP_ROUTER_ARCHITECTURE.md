# CodeBolt MiniApp Router Architecture

This document describes the current `codebolt.app` MiniApp routing structure,
the authentication handoff, deployed test capability cloud, and how the pieces
fit together.

## Current Components

### `@codebolt/miniapp`

Location: `packages/miniapp`

This package is still the MiniApp authoring/runtime package. It provides:

- `defineTool()`
- `defineCollection()`
- `useMiniApp(event?)`
- Nitro integration through `@codebolt/miniapp/nitro`

For remote deployments, `useMiniApp(event)` now reads the execution token from:

- `x-codebolt-execution-token`
- `Authorization: Bearer <token>`

It reads the capability cloud URL from:

- `x-codebolt-cloud-url`
- `x-codebolt-capability-url`
- `CODEBOLT_CLOUD_URL`
- Worker global `__env__.CODEBOLT_CLOUD_URL`

The header path is important because one provider deployment can serve many
installs. Each install can point at a different capability cloud without
redeploying the MiniApp provider app.

### MiniApp Router Worker

Location: `packages/miniapp-router-worker`

Deployed Worker: `codebolt-miniapp-router`

Routes:

```txt
codebolt.app/*
*.codebolt.app/*
```

The router is the public entrypoint for installed MiniApps. It:

- Parses install ids from first-level subdomains.
- Reads install records from `MINIAPP_INSTALLS` KV.
- Redirects unauthenticated users through the CodeBolt login handoff.
- Stores app-domain sessions in a signed `cb_app_session` cookie.
- Calls the configured capability cloud `/token` endpoint.
- Proxies to the MiniApp provider deployment.
- Injects server-only execution headers into the upstream request.

Auth routes live on the apex domain:

```txt
GET /health
GET /auth/start
GET /auth/callback
GET /auth/logout
```

App install routes live on subdomains:

```txt
ANY https://<installId>.codebolt.app/*
```

Subdomains are intentionally reserved for apps. Auth uses apex paths so
`auth.codebolt.app` remains available for a future dedicated auth service if
needed.

### Sample Cloud

Location: `packages/sample-cloud`

Deployed Worker:

```txt
https://codebolt-miniapp-sample-cloud.arrowai.workers.dev
```

The sample cloud is a test-only capability server. It implements the HTTP
contract used by remote MiniApps:

```txt
POST /token
POST /capabilities/db.get
POST /capabilities/db.getMany
POST /capabilities/db.set
POST /capabilities/db.setMany
POST /capabilities/db.delete
POST /capabilities/db.deleteMany
POST /capabilities/db.list
POST /capabilities/blob.get
POST /capabilities/blob.put
POST /capabilities/blob.delete
POST /capabilities/blob.list
POST /capabilities/tasks.create
POST /capabilities/tasks.list
POST /capabilities/tasks.count
```

The package has three layers:

- `src/core.mjs`: runtime-neutral request handling and capability storage.
- `src/index.mjs`: Node HTTP server for local testing.
- `src/worker.mjs`: Cloudflare Worker entrypoint.

The deployed Worker uses `SAMPLE_CLOUD_STORE` KV for persistence. The local
server uses in-memory storage.

Important: sample-cloud mints unsigned development tokens. It is not a
production CodeBolt Cloud implementation.

### CodeBolt Edge API

Repo: `D:\Codeboltapps\codebolt-edge-api`

Added MiniApp login-code endpoints:

```txt
POST /api/auth/miniapp-login-codes
POST /api/auth/miniapp-login-codes/redeem
```

`POST /api/auth/miniapp-login-codes`:

- Protected by existing `jwtDecoded` middleware.
- Receives `{ state, installId }`.
- Uses the current CodeBolt bearer token to determine `userId`.
- Creates a short-lived one-time code.
- Stores only the SHA-256 hash of the code in D1.
- Returns the one-time code to the portal.

`POST /api/auth/miniapp-login-codes/redeem`:

- Protected by `x-codebolt-service-secret`.
- Called only by the MiniApp router Worker.
- Receives `{ code, state, installId }`.
- Hashes and validates the code.
- Marks it consumed.
- Returns user identity data for cookie creation.

D1 migration:

```txt
src/db/migrations/006_miniapp_login_codes.sql
```

Table:

```sql
cb_miniapp_login_codes (
  code_hash TEXT PRIMARY KEY,
  state TEXT NOT NULL,
  install_id TEXT NOT NULL,
  user_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT
)
```

### Portal

Repo: `D:\Codeboltapps\codeboltportalcloudflare`

Added route:

```txt
/miniapp-auth
```

The route is protected by the normal portal auth wrapper. If the user is not
signed in, the portal redirects to sign-up/sign-in and preserves the original
query string.

After sign-in, `/miniapp-auth`:

1. Reads `state` and `installId`.
2. Calls edge-api `POST /auth/miniapp-login-codes`.
3. Receives a one-time code.
4. Redirects the browser back to:

```txt
https://codebolt.app/auth/callback?code=<code>&state=<state>
```

The router then redeems the code server-to-server and sets the app-domain
cookie.

## DNS and Routing

Cloudflare Custom Domains do not support wildcard hostnames. The router uses
Worker Routes instead:

```txt
codebolt.app/*
*.codebolt.app/*
```

The Cloudflare zone must also have proxied DNS records:

```txt
AAAA  @  100::  Proxied
AAAA  *  100::  Proxied
```

The `100::` value is just an originless placeholder. The proxied DNS record
allows the Worker route to receive requests.

## Install Records

Install records are stored in `MINIAPP_INSTALLS` KV under:

```txt
install:<installId>
```

Record shape:

```json
{
  "id": "leadreact",
  "appId": "lead-react",
  "upstreamUrl": "https://lead-react.netlify.app",
  "capabilityUrl": "https://codebolt-miniapp-sample-cloud.arrowai.workers.dev",
  "workspaceId": "public-leadreact",
  "ownerUserId": "user-id",
  "allowedUserIds": ["user-id-2"],
  "access": "authenticated",
  "enabled": true
}
```

Fields:

- `id`: install id and subdomain prefix.
- `appId`: MiniApp id used as token audience and runtime context.
- `upstreamUrl`: provider deployment URL for static/UI/API requests.
- `capabilityUrl`: CodeBolt capability cloud URL used for `/token` and capability calls.
- `workspaceId`: workspace scope placed into execution token claims.
- `ownerUserId`: user allowed for private installs.
- `allowedUserIds`: optional additional users for private installs.
- `access`: `public`, `authenticated`, or private by default.
- `enabled`: disabled installs return `404`.

Current seeded record:

```json
{
  "enabled": true,
  "access": "authenticated",
  "workspaceId": "public-leadreact",
  "id": "leadreact",
  "capabilityUrl": "https://codebolt-miniapp-sample-cloud.arrowai.workers.dev",
  "upstreamUrl": "https://lead-react.netlify.app",
  "appId": "lead-react"
}
```

## Access Modes

### `public`

No login is required. The router mints an anonymous execution token:

```txt
userId: anonymous:<installId>
roles: ["anonymous"]
```

This is useful for public shared apps.

### `authenticated`

Any valid CodeBolt app-domain session can access the install. If no
`cb_app_session` cookie is present, the router redirects to `/auth/start`.

This is useful for testing the login flow without binding access to one owner.

### Private

Any value other than `public` or `authenticated` is treated as private. Access
is allowed when:

- `session.userId === install.ownerUserId`
- or `session.userId` is in `install.allowedUserIds`

Otherwise the router redirects to auth.

## Auth Flow

Unauthenticated private/authenticated install request:

```txt
GET https://leadreact.codebolt.app/
```

Router:

1. Parses `leadreact`.
2. Reads `install:leadreact`.
3. Sees `access: authenticated`.
4. Does not find a valid `cb_app_session`.
5. Redirects to:

```txt
https://codebolt.app/auth/start?installId=leadreact&returnTo=https%3A%2F%2Fleadreact.codebolt.app%2F
```

`/auth/start`:

1. Creates random `state`.
2. Stores state in `MINIAPP_AUTH_STATE` KV for 10 minutes.
3. Redirects to:

```txt
https://portal.codebolt.ai/miniapp-auth?state=<state>&installId=leadreact
```

Portal:

1. Ensures the user is signed in.
2. Calls edge-api with the user's CodeBolt bearer token.
3. Receives a one-time code.
4. Redirects to:

```txt
https://codebolt.app/auth/callback?code=<code>&state=<state>
```

Router callback:

1. Reads and deletes the state record.
2. Calls edge-api redeem endpoint with service secret.
3. Receives user identity.
4. Sets:

```txt
Set-Cookie: cb_app_session=<signed>; Domain=.codebolt.app; Path=/; HttpOnly; Secure; SameSite=Lax
```

5. Redirects back to the original `returnTo`.

## Proxy Flow

Once access is allowed, the router:

1. Calls sample-cloud:

```txt
POST <capabilityUrl>/token
```

Body:

```json
{
  "miniAppId": "lead-react",
  "installId": "leadreact",
  "workspaceId": "public-leadreact",
  "userId": "<session user or anonymous>",
  "roles": ["user"]
}
```

2. Builds an upstream request to `upstreamUrl + path + query`.
3. Removes browser-controlled sensitive headers:

```txt
cookie
authorization
x-codebolt-execution-token
x-codebolt-cloud-url
x-codebolt-capability-url
```

4. Injects server-controlled headers:

```txt
authorization: Bearer <execution-token>
x-codebolt-execution-token: <execution-token>
x-codebolt-cloud-url: <capabilityUrl>
```

5. Calls the provider deployment, for example:

```txt
https://lead-react.netlify.app/api/leads
```

The browser never receives the execution token. It only communicates with
`leadreact.codebolt.app`.

## MiniApp Backend Flow

Inside the deployed Nitro route:

```ts
const miniapp = useMiniApp(event);
const leads = await miniapp.db.list("leads");
```

`useMiniApp(event)`:

1. Reads execution token from the router-injected headers.
2. Reads capability URL from `x-codebolt-cloud-url`.
3. Decodes token claims for context.
4. Implements `db`, `blob`, and `tasks` by POSTing to:

```txt
<capabilityUrl>/capabilities/<capability>
```

Example:

```txt
POST https://codebolt-miniapp-sample-cloud.arrowai.workers.dev/capabilities/db.list
Authorization: Bearer <execution-token>
```

## Deployment State

Deployed services:

- Router Worker: `codebolt-miniapp-router`
- Router routes: `codebolt.app/*`, `*.codebolt.app/*`
- Sample cloud Worker: `https://codebolt-miniapp-sample-cloud.arrowai.workers.dev`
- Lead React upstream: `https://lead-react.netlify.app`
- Edge API: deployed with MiniApp login-code endpoints
- Portal: deployed with `/miniapp-auth`

Secrets:

- Router `CODEBOLT_APP_COOKIE_SECRET`
- Router `CODEBOLT_APP_AUTH_REDEEM_SECRET`
- Edge API `CODEBOLT_APP_AUTH_REDEEM_SECRET`

The router and edge API redeem secret values must match. The value is not stored
in the repo.

## Validation

Focused tests:

```powershell
node --test tests\sample-cloud.test.mjs
node --test tests\router-worker.test.mjs
```

Live checks performed:

- `https://codebolt.app/health` returns `{ "ok": true }`.
- `https://codebolt-miniapp-sample-cloud.arrowai.workers.dev/health` returns ok.
- sample-cloud `/token` plus `/capabilities/db.list` works.
- edge-api redeem endpoint exists and rejects missing service secret with `401`.
- portal `/miniapp-auth?state=test&installId=leadreact` serves.
- routed `leadreact.codebolt.app/api/leads` returned `200` after the SDK/header fix.
- after switching `leadreact` to `authenticated`, unauthenticated calls redirect to `codebolt.app/auth/start`.

Known validation caveat:

- Full repo TypeScript checks in `codebolt-edge-api` and `codeboltportalcloudflare`
  still report unrelated pre-existing errors. The changed services built and
  deployed through their normal deploy commands.

## Known Limitations

- sample-cloud is test-only and uses unsigned development tokens.
- Production install records should move from KV into the real API.
- Public sharing needs a richer principal model if shared apps should have
  scoped anonymous identity beyond `anonymous:<installId>`.
- The React example should still handle failed API responses defensively even
  though the backend 500 path has been fixed.
- The auth cookie is app-domain specific and intentionally separate from portal
  cookies/localStorage.

## Reviewer Checklist

- Open `https://leadreact.codebolt.app/` in an incognito browser and confirm it
  redirects through login instead of opening directly.
- Complete login and confirm the browser returns to `leadreact.codebolt.app`.
- Confirm `/api/leads` returns `documents` after auth.
- Confirm browser-visible requests do not expose `x-codebolt-execution-token`.
- Review install access mode behavior for `public`, `authenticated`, and private
  owner/allow-list records.
- Review sample-cloud replacement path before treating this as production
  CodeBolt Cloud capability storage.
