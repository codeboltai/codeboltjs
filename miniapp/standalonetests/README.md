# Standalone MiniApp Prototype

This directory proves the framework-neutral MiniApp architecture without Nitro or CodeBolt.

Node.js 22 or newer is required by the pinned Wrangler runtime. On the current Windows machine,
`nvm use 25.7.0` selects a compatible installed version.

## Components

- `apps/hello-miniapp`: a plain JavaScript application implementing `fetch(request, runtime)`.
- `packages/miniapp-format`: deterministic `.miniapp` archive reader, writer, validator, and hashing.
- `packages/miniapp-cli`: pack, inspect, verify, and upload commands.
- `apps/miniapp-server`: the one-time Cloudflare deployment. It owns R2 packages, supervisor and storage Durable Objects, Worker Loader composition, facets, routing, and lifecycle.

The server, not the MiniApp, injects the `MiniAppFacet` Durable Object wrapper.

## Local package validation

```powershell
pnpm install
pnpm pack:hello
pnpm inspect:hello
pnpm verify:hello
pnpm test
```

## Run the server locally

Create the local R2 bucket if required by your Wrangler setup, then:

```powershell
pnpm dev:server
```

In another terminal:

```powershell
pnpm miniapp upload dist/hello-miniapp.miniapp --server http://127.0.0.1:8787
```

Create an instance using the returned package id:

```powershell
    $body = @{ packageId = '<package-id>'; instanceId = 'hello-one' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8787/api/scopes/test-thread/instances -ContentType application/json -Body $body
Invoke-RestMethod -Method Post -Uri http://127.0.0.1:8787/run/test-thread/hello-one/api/counter/increment
```

Open `http://127.0.0.1:8787/run/test-thread/hello-one/` for the packaged UI.

## Lifecycle API

```text
POST   /api/packages
GET    /api/packages/:packageId
POST   /api/scopes/:scopeId/instances
GET    /api/scopes/:scopeId/instances
GET    /api/scopes/:scopeId/instances/:instanceId
PATCH  /api/scopes/:scopeId/instances/:instanceId
POST   /api/scopes/:scopeId/instances/:instanceId/stop
DELETE /api/scopes/:scopeId/instances/:instanceId
ANY    /run/:scopeId/:instanceId/*
```

`stop` aborts the facet but preserves centralized instance storage. The next run resumes the MiniApp. `PATCH` switches package revision and aborts the old facet. `DELETE` deletes the facet and instance storage.
