# Nitro Basics For MiniApps

This is a compact Nitro reference for agents creating CodeBolt MiniApps.

Official references:

- Nitro docs: https://nitro.build/
- Nitro source docs: https://github.com/nitrojs/nitro/tree/main/docs
- Routing: https://nitro.build/guide/routing
- Configuration: https://nitro.build/guide/configuration
- Deployment: https://nitro.build/deploy

## Division Of Responsibility

Nitro owns:

- `nitro.config.ts`
- file-based HTTP routes
- request handlers
- public asset build output
- deployment presets

CodeBolt MiniApp integration owns:

- tool discovery
- collection discovery
- view discovery
- manifest generation
- tool input validation
- platform capability bridge

## Minimal Config

```ts
import { defineConfig } from "nitro";
import { codeboltMiniApp, resolveTarget } from "@codebolt/miniapp/nitro";

export default defineConfig({
  ...resolveTarget(),
  compatibilityDate: "2026-07-24",
  serverDir: "server",
  modules: [
    codeboltMiniApp({
      id: "example",
      title: "Example",
      version: "0.1.0",
      route: "/",
    }),
  ],
});
```

## File-Based Routes

Common MiniApp layout:

```text
server/
  api/
    customers.get.ts      -> GET /api/customers
    customers.post.ts     -> POST /api/customers
  routes/
    health.get.ts         -> GET /health
```

Use `server/api` for UI/backend calls. Use `server/tools` for CodeBolt tool
definitions; those files are discovered by the MiniApp Nitro module, not by
Nitro's normal route scanner.

## Handlers

Basic handler:

```ts
import { defineHandler } from "nitro/h3";

export default defineHandler(() => {
  return { ok: true };
});
```

Handler with body:

```ts
import { defineHandler, readBody } from "nitro/h3";

export default defineHandler(async (event) => {
  const body = await readBody(event);
  return { received: body };
});
```

MiniApp API route with platform capabilities:

```ts
import { defineHandler } from "nitro/h3";
import { useMiniApp } from "@codebolt/miniapp";

export default defineHandler((event) => {
  return useMiniApp(event).db.list("customers");
});
```

## Public Assets

Put simple UI assets under:

```text
public/
  index.html
```

Nitro includes public assets in output. In local CodeBolt hosting, the CodeBolt
host should serve those files directly so loading the UI does not start a
MiniApp backend worker.

## Useful Presets

MiniApps normally care about:

```text
standard           local mountable fetch output
node-server        standalone Node server
cloudflare-module  Cloudflare Worker module output
```

Prefer the project's MiniApp target helper, such as `resolveTarget()`, when it
exists. That keeps target output paths and preset details consistent.

## Build Commands

Project scripts should usually wrap Nitro. Raw Nitro commands are:

```powershell
nitro build
nitro preview
```

Use the project package scripts when they exist.

## Cloudflare Compatibility

Cloudflare Workers are not Node servers. Avoid:

- runtime `eval`
- runtime `new Function`
- request-time Ajv compilation
- direct filesystem access
- direct process access
- Node-only libraries in routes intended for Cloudflare

For MiniApps, compile tool validators at build time and use the SDK capability
bridge for storage, blobs, tasks, and platform calls.

## Route Ownership Reminder

The MiniApp UI entry is not a Nitro route declaration. It is platform metadata
from `codeboltMiniApp({ title, route })`.

Nitro routes come from:

```text
server/api
server/routes
```

CodeBolt metadata comes from:

```text
server/tools
server/collections
codeboltMiniApp({ title, route })
```
