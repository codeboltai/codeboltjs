# CodeBolt MiniApp Runtime Prototype

This workspace prototypes a CodeBolt MiniApp runtime built on Nitro v3.

It demonstrates how MiniApps can be authored as small Nitro applications, built
to multiple targets, discovered through a generated manifest, and hosted by one
local CodeBolt process. Static UI files are served directly by the host. API
routes and CodeBolt tool calls lazily start one Worker Thread per MiniApp.

The prototype is intentionally self-contained under `miniapp/` and does not
modify the parent `codeboltjs` workspace.

## What This Proves

- One CodeBolt host can serve multiple MiniApps on one local port.
- Static assets and cached tool metadata can be read without starting app workers.
- Each MiniApp can run in its own Worker Thread for runtime isolation.
- MiniApps can expose CodeBolt tools, collections, views, and API routes from a
  simple file structure.
- The same MiniApp source can build for local CodeBolt hosting, a Node server,
  and Cloudflare Workers.
- Remote Node and Cloudflare builds can call back into a CodeBolt capability
  endpoint through `useMiniApp()`.

Worker Threads isolate runtime state and crashes, but they are not a security
sandbox for hostile code.

## Workspace Layout

```text
miniapp/
  packages/
    miniapp/              # @codebolt/miniapp SDK and Nitro adapter
    host/                 # Local host process and worker runtime
  examples/
    leads/                # Lead depository MiniApp
    onboarding/           # Employee onboarding MiniApp
  gates/                  # Focused compatibility checks
  scripts/                # Build helpers for target-specific output
  tests/                  # Runtime, capability, and remote-target tests
```

## Packages

### `@codebolt/miniapp`

The root export is the app-author/runtime API:

```ts
import {
  defineTool,
  defineCollection,
  defineView,
  useMiniApp,
} from "@codebolt/miniapp";
```

It provides:

- `defineTool()` for declaring tool metadata and handlers
- `defineCollection()` for declaring persisted collection schemas
- `defineView()` for declaring visible MiniApp views
- `useMiniApp()` for accessing runtime capabilities such as `db`, `blob`, and
  `codebolt.tasks`

These helpers do not scan files or register routes by themselves. They create
plain CodeBolt MiniApp definition objects and provide the runtime capability
bridge.

### `@codebolt/miniapp/nitro`

The Nitro subpath export is the build adapter:

```ts
import { codeboltMiniApp, resolveTarget } from "@codebolt/miniapp/nitro";
```

It provides:

- `resolveTarget()` for selecting the local, Node, or Cloudflare Nitro output
- `codeboltMiniApp()` for scanning MiniApp definitions during `nitro build`

`codeboltMiniApp()` scans the configured `serverDir` for:

```text
server/tools
server/collections
server/views
```

It then:

- loads the default-exported definitions
- generates virtual tool registry modules
- precompiles tool input validators
- registers `POST /__codebolt/tools/:name`
- emits `.output/codebolt/miniapp.manifest.json`

Without `codeboltMiniApp()`, Nitro can still import `defineTool()` as normal
JavaScript, but it will not discover tool files, create the CodeBolt tool route,
or emit the MiniApp manifest.

### `@codebolt/miniapp-host`

The host package runs the local prototype server. It:

- reads built MiniApp manifests from `examples/<id>/.output/codebolt/`
- serves static files from each MiniApp's built `public` directory
- exposes `/__codebolt/tools` and `/__codebolt/status`
- routes tool calls to the correct MiniApp worker
- starts one Worker Thread per MiniApp only when backend work is needed
- provides local implementations of `db`, `blob`, and `tasks` capabilities

## MiniApp Authoring

A MiniApp is a Nitro app with a CodeBolt module in `nitro.config.ts`:

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
    }),
  ],
});
```

Example tool:

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

Example API route:

```ts
import { defineHandler } from "nitro/h3";
import { useMiniApp } from "@codebolt/miniapp";

export default defineHandler((event) => useMiniApp(event).db.list("leads"));
```

## Build Targets

`resolveTarget()` selects the Nitro output target from `MINIAPP_TARGET`.

| Target | Command | Nitro preset | Output |
| --- | --- | --- | --- |
| Local CodeBolt host | `pnpm build:leads` | `standard` | `examples/leads/.output` |
| Node server | `pnpm build:remote-node` | `node-server` | `examples/leads/.output-node` |
| Cloudflare Worker | `pnpm build:remote-cloudflare` | `cloudflare-module` | `examples/leads/.output-cloudflare` |

The local target uses Nitro's built-in `standard` preset with `serveStatic:
false`, because the CodeBolt host serves static assets itself.

## Manifest

During `nitro build`, `codeboltMiniApp()` emits:

```text
.output/codebolt/miniapp.manifest.json
```

The manifest is the contract between the build step and the host runtime. It
contains:

- MiniApp identity: `id`, `title`, `version`
- runtime entrypoint: `runtime.handler`
- static asset directory: `runtime.publicDir`
- tool catalog with qualified names and JSON schemas
- collection metadata
- view metadata
- static asset list and sizes

The local host reads this manifest before starting workers, so tool discovery and
static file serving do not wake the MiniApp runtime.

## Local Development

Install dependencies:

```powershell
pnpm install
```

Build the example MiniApps:

```powershell
pnpm build:examples
```

Start the local host:

```powershell
pnpm start
```

The local applications are available at:

- `http://leads.localhost:4310`
- `http://onboarding.localhost:4310`

Host endpoints:

- `GET http://127.0.0.1:4310/__codebolt/tools`
- `GET http://127.0.0.1:4310/__codebolt/status`
- `POST http://127.0.0.1:4310/__codebolt/tools/<qualified-tool-name>`

Example qualified tool names:

- `leads.add-lead`
- `leads.create-task-for-lead`
- `onboarding.add-employee`
- `onboarding.complete-step`

## Tests And Gates

Run the full validation suite:

```powershell
pnpm test
```

Focused commands:

```powershell
pnpm gates
pnpm test:capabilities
pnpm test:integration
pnpm build:remote-node
pnpm test:remote-node
pnpm build:remote-cloudflare
pnpm test:remote-cloudflare
```

The `gates/` directory is validation code, not product runtime code:

- `gates/mountable-output` proves Nitro can emit an importable fetch handler
  without starting a listening server.
- `gates/worker-transport` proves `WorkerFetchClient` can proxy streamed
  Request/Response bodies and cancellation through a Worker Thread.

## Nitro Compatibility

This prototype pins:

```text
nitro@3.0.260610-beta
```

See `NITRO_COMPATIBILITY.md` for the Nitro surfaces this prototype relies on and
how they are verified.

## Current Limitations

- This is a prototype, not a hardened production runtime.
- Worker Threads are crash/runtime isolation, not a hostile-code sandbox.
- The local host currently mounts the two example app ids explicitly:
  `leads` and `onboarding`.
- Local capabilities are backed by filesystem storage for testing and demo use.
- The Cloudflare and Node remote tests use a mock CodeBolt Cloud capability
  endpoint.
