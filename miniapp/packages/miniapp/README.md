# @codebolt/miniapp

`@codebolt/miniapp` is the authoring SDK and Nitro build adapter for CodeBolt
MiniApps.

The package has two public entry points:

```text
@codebolt/miniapp        # MiniApp author/runtime API
@codebolt/miniapp/nitro  # Nitro build adapter
```

Use the root export from MiniApp code. Use the `./nitro` export only from
`nitro.config.ts`.

## Root Export

```ts
import {
  defineTool,
  defineCollection,
  useMiniApp,
} from "@codebolt/miniapp";
```

The root export contains the MiniApp definition helpers and runtime context API.

### `defineTool()`

Declares a CodeBolt tool. It adds `kind: "tool"` to the object and preserves the
metadata, JSON schemas, and handler.

```ts
import { defineTool } from "@codebolt/miniapp";

export default defineTool({
  name: "add-lead",
  description: "Store a discovered lead.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["id", "name", "company"],
    properties: {
      id: { type: "string", minLength: 1 },
      name: { type: "string", minLength: 1 },
      company: { type: "string", minLength: 1 },
      email: { type: "string" },
    },
  },
  async handler(context, input) {
    return context.db.set("leads", input.id, input);
  },
});
```

`defineTool()` does not register routes or scan files by itself. Tool discovery is
done by `codeboltMiniApp()` from `@codebolt/miniapp/nitro`.

### `defineCollection()`

Declares a collection schema for manifest/catalog metadata.

```ts
import { defineCollection } from "@codebolt/miniapp";

export default defineCollection({
  name: "leads",
  schema: {
    type: "object",
    required: ["id", "name", "company"],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      company: { type: "string" },
      email: { type: "string" },
    },
  },
});
```

### `useMiniApp()`

Returns the runtime context for API routes and tool handlers.

```ts
import { defineHandler } from "nitro/h3";
import { useMiniApp } from "@codebolt/miniapp";

export default defineHandler((event) => {
  return useMiniApp(event).db.list("leads");
});
```

The context currently exposes:

```ts
context.miniAppId;
context.installId;
context.workspaceId;
context.principal;
context.db;
context.blob;
context.codebolt.tasks;
```

For local CodeBolt hosting, `useMiniApp()` reads the worker-injected runtime
bridge. For remote Node or Cloudflare output, it reads the execution token from
the request and calls the configured CodeBolt Cloud capability endpoint.

Pass the Nitro `event` in server routes:

```ts
export default defineHandler((event) => useMiniApp(event).db.list("leads"));
```

Remote serverless requests need the event because the execution token lives in
the current request headers. Local host mode can work without an event because
the host injects a runtime bridge into the MiniApp worker. Tool handlers usually
do not call `useMiniApp()` directly because the CodeBolt tool route creates the
context and passes it to the tool handler.

## Nitro Export

```ts
import { codeboltMiniApp, resolveTarget } from "@codebolt/miniapp/nitro";
```

The Nitro export contains build-time integration code. Keep it out of ordinary
tool and route files.

### `resolveTarget()`

Returns the Nitro output config for the selected MiniApp target.

```ts
resolveTarget();          // uses process.env.MINIAPP_TARGET
resolveTarget("local");   // standard preset, .output
resolveTarget("node");    // node-server preset, .output-node
resolveTarget("cloudflare"); // cloudflare-module preset, .output-cloudflare
```

The local target uses Nitro's `standard` preset with `serveStatic: false`,
because the CodeBolt host serves static assets itself.

### `codeboltMiniApp()`

Registers the CodeBolt MiniApp build behavior as a Nitro module.

```ts
import { defineConfig } from "nitro";
import { codeboltMiniApp, resolveTarget } from "@codebolt/miniapp/nitro";

export default defineConfig({
  ...resolveTarget(),
  compatibilityDate: "2026-07-24",
  serverDir: "server",
  modules: [
    codeboltMiniApp({
      id: "leads",
      title: "Lead Depository",
      version: "0.1.0",
      route: "/",
    }),
  ],
});
```

During `nitro build`, `codeboltMiniApp()`:

- scans `server/tools` and `server/collections`
- loads default-exported MiniApp definitions
- creates virtual modules for tool lookup and validation
- registers `POST /__codebolt/tools/:name`
- emits `.output/codebolt/miniapp.manifest.json`

Input validators are compiled during the build and emitted as standalone
functions. Do not move Ajv compilation back into the request path; Cloudflare
Workers reject runtime string-based code generation.

Without `codeboltMiniApp()`, Nitro can still bundle imports from
`@codebolt/miniapp`, but CodeBolt tool files will not be discovered, tool routes
will not be registered, and no MiniApp manifest will be generated.

## Expected File Layout

```text
server/
  api/
    leads.get.ts
  tools/
    add-lead.ts
  collections/
    leads.ts
public/
  index.html
nitro.config.ts
package.json
```

Nitro owns normal API route handling under `server/api`. CodeBolt-specific
definition scanning is limited to `server/tools`, `server/collections`, and
the single UI entry declared in `codeboltMiniApp({ title, route })`.

## Package Boundary

This package intentionally keeps two concepts separate:

- Root export: stable MiniApp authoring/runtime API.
- `./nitro` export: Nitro-specific build-time adapter.

That allows app code to stay framework-neutral while keeping the current Nitro
integration explicit and easy to customize in `nitro.config.ts`.

## Related Docs

- `../../packages/host/README.md`: local host and worker runtime.
- `../../MINIAPP_PUBLISHING_AND_USAGE.md`: local usage, cloud publishing,
  portal install flow, and agent tool exposure.
- `../../examples/leads/README.md`: lead depository example.
- `../../examples/onboarding/README.md`: onboarding example.
- `../../skills/create-miniapp/SKILL.md`: agent instructions for authoring new
  MiniApps.
