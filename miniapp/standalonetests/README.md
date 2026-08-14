# Standalone MiniApp Prototype

This directory proves the framework-neutral MiniApp architecture independently of CodeBolt. It contains both a plain JavaScript MiniApp and a Nitro MiniApp; both compile to the same `.miniapp` runtime contract and run through the same one-time-deployed MiniApp Server.

Node.js 22 or newer is required by the pinned Wrangler runtime. On the current Windows machine,
`nvm use 25.7.0` selects a compatible installed version.

## Components

- `apps/hello-miniapp`: a plain JavaScript application implementing `fetch(request, runtime)`.
- `apps/nitro-miniapp`: a Nitro application with API routes and static assets.
- `packages/miniapp-format`: deterministic `.miniapp` archive reader, writer, validator, and hashing.
- `packages/miniapp-cli`: pack, inspect, verify, and upload commands.
- `packages/nitro-adapter`: Nitro metadata module, runtime helper, and `cloudflare-module` output packer.
- `apps/miniapp-server`: the one-time Cloudflare deployment. It owns R2 packages, supervisor and storage Durable Objects, Worker Loader composition, facets, routing, and lifecycle.

The server, not the MiniApp or Nitro, injects the `MiniAppFacet` Durable Object wrapper. Nitro is a build adapter only: its generated entry is wrapped behind `codebolt.fetch.v1`, and the Server injects `db`, `blob`, `assets`, instance identity, and `waitUntil` at runtime.

## Local package validation

```powershell
pnpm install
pnpm pack:hello
pnpm inspect:hello
pnpm verify:hello
pnpm build:nitro
pnpm pack:nitro
pnpm test
pnpm test:wrangler
```

`pnpm test:wrangler` starts an isolated local Wrangler runtime, uploads both bundles, and verifies facets, lifecycle, instance isolation, static assets, Nitro API execution, document storage, and blob storage.

## Nitro to MiniApp

The Nitro application uses the normal `cloudflare-module` preset and the standalone metadata module:

```ts
import { defineConfig } from "nitro";
import { standaloneMiniApp } from "@codebolt/standalone-miniapp-nitro/nitro";

export default defineConfig({
  preset: "cloudflare-module",
  serverDir: "server",
  output: { dir: "{{ rootDir }}/.output-miniapp" },
  modules: [standaloneMiniApp({ id: "my-app", title: "My App" })],
});
```

Build and package it:

```powershell
nitro build apps/my-app
nitro-miniapp pack apps/my-app/.output-miniapp --output dist/my-app.miniapp
```

Inside a Nitro handler, `useMiniApp(event)` reads the request-scoped runtime injected by the generated adapter:

```ts
import { defineHandler } from "nitro/h3";
import { useMiniApp } from "@codebolt/standalone-miniapp-nitro/runtime";

export default defineHandler((event) =>
  useMiniApp(event).db.list("items")
);
```

The packer preserves the complete Nitro ESM module graph under `modules/nitro/`, copies public output under `public/`, and generates only one framework bridge: `modules/__nitro_adapter.mjs`. The `.miniapp` manifest still declares `runtime.protocol: codebolt.fetch.v1`; the MiniApp Server has no Nitro-specific branch.

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
