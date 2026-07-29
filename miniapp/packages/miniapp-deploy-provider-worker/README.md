# @codebolt/miniapp-deploy-provider-worker

Provider-worker implementation for CodeBolt MiniApp cloud deployment.

This worker is registered in CodeBolt Admin as a MiniApp deploy provider. Edge API
calls it with a built MiniApp bundle, and this worker deploys that bundle to the
selected platform using secrets stored on the worker.

## Routes

```txt
GET  /manifest
POST /deploy
GET  /health
```

If `PROVIDER_WORKER_SECRET`, `MINIAPP_DEPLOY_PROVIDER_SECRET`, or
`CODEBOLT_PROVIDER_SECRET` is set, requests must include either:

```txt
Authorization: Bearer <secret>
x-codebolt-provider-secret: <secret>
```

## Manifest

`GET /manifest` returns one provider with three platforms:

```json
{
  "provider": {
    "id": "codebolt-miniapp-deploy-provider",
    "name": "CodeBolt MiniApp Deploy Provider"
  },
  "defaultPlatform": "deno-subhosting",
  "platforms": [
    { "id": "deno-subhosting", "label": "Deno Subhosting" },
    { "id": "vercel-platform", "label": "Vercel Platform" },
    { "id": "netlify", "label": "Netlify" }
  ],
  "capabilities": ["miniapp.deploy"]
}
```

## Deploy Request

Edge API sends:

```json
{
  "type": "miniapp.deploy",
  "deploymentId": "mad_...",
  "versionId": "mav_...",
  "appId": "lead-react",
  "platform": "deno-subhosting",
  "manifest": {},
  "tools": [],
  "bundle": {
    "format": "files",
    "root": ".output",
    "files": [
      {
        "path": "server/index.mjs",
        "size": 123,
        "sha256": "...",
        "contentBase64": "..."
      }
    ]
  }
}
```

## Secrets

Set secrets on this provider worker, not in the CLI and not in Edge API.

```powershell
pnpm exec wrangler secret put PROVIDER_WORKER_SECRET -c packages/miniapp-deploy-provider-worker/wrangler.jsonc
pnpm exec wrangler secret put DENO_DEPLOY_TOKEN -c packages/miniapp-deploy-provider-worker/wrangler.jsonc
pnpm exec wrangler secret put VERCEL_TOKEN -c packages/miniapp-deploy-provider-worker/wrangler.jsonc
pnpm exec wrangler secret put NETLIFY_AUTH_TOKEN -c packages/miniapp-deploy-provider-worker/wrangler.jsonc
```

Optional platform settings:

```txt
DENO_APP
DENO_APP_PREFIX
DENO_ENTRYPOINT
VERCEL_TEAM_ID
VERCEL_TEAM_SLUG
VERCEL_PROJECT
VERCEL_PROJECT_PREFIX
VERCEL_TARGET
NETLIFY_SITE_ID
NETLIFY_SITE_NAME
NETLIFY_SITE_PREFIX
NETLIFY_ACCOUNT_SLUG
NETLIFY_PRODUCTION
DEFAULT_PLATFORM
```

## Bundle Notes

Deno Subhosting can deploy the standard MiniApp `.output` bundle and reads the
entrypoint from `nitro.json`.

Vercel and Netlify receive the uploaded file bundle directly. For full API/tool
runtime support, upload a bundle shaped for that platform, such as
`.vercel/output` for Vercel or a Netlify output with functions. Static-only
bundles will deploy UI assets but cannot execute MiniApp server tools.
