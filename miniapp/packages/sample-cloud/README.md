# @codebolt/miniapp-sample-cloud

Deprecated: this package is a local capability-server POC. Production MiniApp
registry, installs, tool metadata, and cloud execution now belong in Edge API,
with `packages/miniapp-router-worker` acting as the routing/proxy layer.

Test-only CodeBolt Cloud capability server for remote MiniApp deployments.

For the full MiniApp routing architecture and how this package fits into the
`codebolt.app` flow, see `../../MINIAPP_ROUTER_ARCHITECTURE.md`.

It implements the HTTP contract used by `useMiniApp(event)`:

```txt
POST /capabilities/db.get
POST /capabilities/db.set
POST /capabilities/db.list
POST /capabilities/blob.*
POST /capabilities/tasks.*
```

It also mints unsigned development tokens:

```powershell
pnpm sample-cloud

$token = Invoke-RestMethod -Method POST http://127.0.0.1:4590/token `
  -ContentType "application/json" `
  -Body '{"miniAppId":"lead-react"}'
```

Use the server URL as the remote MiniApp environment:

```txt
CODEBOLT_CLOUD_URL=http://127.0.0.1:4590
```

Then call a remote MiniApp route with:

```txt
Authorization: Bearer <token>
```

This package is for local and deployed integration testing. It does not verify signatures and is not a production CodeBolt Cloud implementation.

## Cloudflare Worker

The same capability contract can run as a Worker. It uses the
`SAMPLE_CLOUD_STORE` KV binding for deployed persistence.

```powershell
pnpm --dir packages/sample-cloud exec wrangler kv namespace create SAMPLE_CLOUD_STORE
pnpm --dir packages/sample-cloud deploy
```

Paste the generated KV namespace ID into `wrangler.jsonc` before deploying.
