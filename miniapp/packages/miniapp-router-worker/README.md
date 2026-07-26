# @codebolt/miniapp-router-worker

Cloudflare Worker that routes `*.codebolt.app` install subdomains to deployed
MiniApps.

The router owns browser auth for the app domain, reads install records from KV,
mints short-lived execution tokens through sample-cloud, and proxies requests to
the MiniApp provider deployment.

For the full end-to-end structure, auth handoff, proxy flow, deployment state,
and review checklist, see `../../MINIAPP_ROUTER_ARCHITECTURE.md`. For a
standalone reviewer artifact, open `../../codebolt-app-miniapp-router-review.html`.

## Routes

```txt
GET  https://codebolt.app/health
GET  https://codebolt.app/apps
GET  https://codebolt.app/apps/<appId>
POST https://codebolt.app/apps/<appId>/install
GET  https://codebolt.app/auth/start
GET  https://codebolt.app/auth/callback
GET  https://codebolt.app/auth/logout
ANY  https://<installId>.codebolt.app/*
```

Subdomains are reserved for MiniApp installs. The temporary app catalog and auth
handoff use apex paths so the catalog can later move to the portal without
changing install URLs.

## App Records

Published app records are stored in the same KV namespace as `app:<appId>`:

```json
{
  "id": "lead-react",
  "title": "Lead React",
  "description": "Simple lead tracker.",
  "version": "0.1.0",
  "developerUserId": "developer-user-id",
  "developerName": "CodeBolt",
  "installPolicy": "anyone",
  "defaultAccess": "private",
  "upstreamUrl": "https://lead-react.netlify.app",
  "capabilityUrl": "https://codebolt-miniapp-sample-cloud.<account>.workers.dev",
  "enabled": true
}
```

`installPolicy` controls who can create an install:

- `developer_only`: only `developerUserId` can install.
- `anyone`: any signed-in CodeBolt user can install.
- `unlisted`: any signed-in user with the detail URL can install; it is hidden
  from `/apps`.

`defaultAccess` becomes the install-level access mode for newly created installs.
Use `private` as the normal default.

## Install Records

Install records are stored in `MINIAPP_INSTALLS` as `install:<installId>`:

```json
{
  "id": "installid",
  "appId": "lead-react",
  "upstreamUrl": "https://lead-react.netlify.app",
  "capabilityUrl": "https://codebolt-miniapp-sample-cloud.<account>.workers.dev",
  "workspaceId": "personal:user-id",
  "ownerUserId": "user-id",
  "access": "private",
  "enabled": true
}
```

Private installs require a valid `cb_app_session` cookie for `.codebolt.app`.
Public installs proxy as an anonymous principal.

The router also stores `user-install:<userId>:<appId>` pointers so repeated
installs by the same user open the existing install instead of creating
duplicates.

## Secrets

```powershell
pnpm --dir packages/miniapp-router-worker exec wrangler secret put CODEBOLT_APP_COOKIE_SECRET
pnpm --dir packages/miniapp-router-worker exec wrangler secret put CODEBOLT_APP_AUTH_REDEEM_SECRET
```

The redeem secret must match the service secret used by the edge API endpoint
that redeems MiniApp login codes.

## Deploy

Create the two KV namespaces, paste their IDs into `wrangler.jsonc`, and make
sure the `codebolt.app` zone has proxied DNS records for `codebolt.app` and
`*.codebolt.app`. A proxied `AAAA` record to `100::` is enough when the Worker
is acting as the originless router.

Then run:

```powershell
pnpm --dir packages/miniapp-router-worker deploy
```
