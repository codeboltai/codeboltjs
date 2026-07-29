---
name: create-miniapp
description: Create production-ready CodeBolt MiniApps with frontend UI, Nitro backend routes, CodeBolt tools, collections, host-owned capabilities, and local or remote deployment targets. Use when an agent must scaffold, extend, debug, or validate a MiniApp using @codebolt/miniapp, Nitro, Node deployment, or Cloudflare Workers.
---

# Create CodeBolt MiniApps

Use this skill to create or extend a CodeBolt MiniApp in any project that
contains, depends on, or wants to adopt the MiniApp SDK.

A MiniApp is a small full-stack app that can:

- serve a frontend UI
- expose Nitro API routes
- declare CodeBolt tools
- declare storage collections
- declare one platform-visible UI entry
- use host-owned capabilities such as `db`, `blob`, and `codebolt.tasks`
- run locally inside the CodeBolt host or remotely as Node/Cloudflare output

## Discover The Project

Do not assume a fixed repository layout. Inspect the current project first.

Use fast file discovery:

```powershell
rg --files
```

Identify:

- the package manager and root package file
- whether `@codebolt/miniapp` is already installed or workspace-local
- where MiniApps or examples live
- whether the project has a `.codebolt/` directory
- where Nitro config files live
- whether the project uses TypeScript, plain JavaScript, React, Vue, or static UI
- which build and validation commands already exist

Prefer existing project conventions over the examples in this skill.

## Choose The MiniApp Directory

When creating a new MiniApp, first decide its target directory:

- If the user gives an explicit path, use that path.
- If extending an existing MiniApp, keep its current directory.
- If the project root contains a `.codebolt/` directory, treat it as a CodeBolt
  project and create the MiniApp under `.codebolt/miniapps/<miniappName>`.
- Create `.codebolt/miniapps/` when needed.
- Otherwise, follow the project's existing MiniApp convention or create a
  top-level `<miniappName>/` directory.

Use the same stable, hostname-safe MiniApp id for `<miniappName>` unless the
project clearly separates package directory names from platform ids.

## MiniApp Shape

A conventional MiniApp layout is:

```text
<miniapp>/
  package.json
  nitro.config.ts
  public/
    index.html
  server/
    api/
    tools/
    collections/
```

This layout is a convention, not a requirement. If the project has a different
MiniApp convention, follow it.

Use stable MiniApp ids that are lowercase and hostname-safe:

```text
customer-intake
issue-board
employee-onboarding
```

Avoid spaces, uppercase letters, and punctuation outside `[a-z0-9-]`.

## Nitro Reference

Read `references/nitro-basics.md` when creating or debugging:

- `nitro.config.ts`
- `server/api` routes
- `server/routes` routes
- public assets
- Node output
- Cloudflare Worker output

Keep Nitro responsible for HTTP routing and deployment output. Keep CodeBolt
responsible for MiniApp discovery, tools, manifests, and platform capabilities.

## Configure Nitro

Use `@codebolt/miniapp/nitro` only from `nitro.config.ts`:

```ts
import { defineConfig } from "nitro";
import { codeboltMiniApp, resolveTarget } from "@codebolt/miniapp/nitro";

export default defineConfig({
  ...resolveTarget(),
  compatibilityDate: "2026-07-24",
  serverDir: "server",
  modules: [
    codeboltMiniApp({
      id: "customer-intake",
      title: "Customer Intake",
      version: "0.1.0",
      route: "/",
    }),
  ],
});
```

Guidelines:

- `id` is the stable platform id.
- `title` is the user-visible name.
- `version` should change when behavior or manifest semantics change.
- `route` is the UI entry route, defaulting to `/` when omitted.
- `resolveTarget()` lets the same source build for local, Node, and Cloudflare.
- Do not import `@codebolt/miniapp/nitro` from runtime code.

## Use The SDK

Use the root SDK export from tools, collections, and API routes:

```ts
import {
  defineTool,
  defineCollection,
  useMiniApp,
} from "@codebolt/miniapp";
```

Runtime context exposes:

```ts
context.miniAppId
context.installId
context.workspaceId
context.principal
context.db
context.blob
context.codebolt.tasks
```

Never let MiniApp input override workspace, install, MiniApp, or user identity.
Those values come from the verified platform execution context.

## Define Tools

Place tool files under the project's MiniApp tool directory, usually
`server/tools`.

```ts
import { defineTool } from "@codebolt/miniapp";

export default defineTool({
  name: "add-customer",
  description: "Add a customer intake record.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["id", "name"],
    properties: {
      id: { type: "string", minLength: 1 },
      name: { type: "string", minLength: 1 },
      email: { type: "string" },
    },
  },
  async handler(context, input) {
    return context.db.set("customers", input.id, input);
  },
});
```

Tool rules:

- Use JSON Schema for input.
- Keep tool names unique within one MiniApp.
- Expect global tool names to be `<miniAppId>.<toolName>`.
- Invalid input must fail before handler logic runs.
- Prefer coarse operations over chatty loops.
- Use `db.getMany`, `db.setMany`, filtered `db.list`, and task `count` APIs.
- Do not call direct platform APIs from tools; use `context.db`,
  `context.blob`, and `context.codebolt.tasks`.

Cloudflare rule: do not compile JSON Schema at request time. Cloudflare Workers
reject string-based code generation, including runtime Ajv compilation.

## Define Collections

Declare collection metadata under the MiniApp collection directory, usually
`server/collections`.

```ts
import { defineCollection } from "@codebolt/miniapp";

export default defineCollection({
  name: "customers",
  schema: {
    type: "object",
    required: ["id", "name"],
    properties: {
      id: { type: "string" },
      name: { type: "string" },
      email: { type: "string" },
    },
  },
});
```

Collections describe manifest metadata and expected document shape. Storage
implementation and namespace enforcement belong to the platform.

## Add API Routes

Use Nitro API routes for frontend/backend calls.

```ts
import { defineHandler } from "nitro/h3";
import { useMiniApp } from "@codebolt/miniapp";

export default defineHandler((event) => {
  return useMiniApp(event).db.list("customers", { limit: 50 });
});
```

API rules:

- Browser code should call relative paths such as `/api/customers`.
- Use `useMiniApp(event)` so local and remote runtimes share the same code.
- Do not create a separate Express/Fastify server for a MiniApp.
- Keep platform access behind MiniApp capabilities.
- Avoid N+1 capability calls in list screens.

## Build The Frontend

For simple MiniApps, static files in `public/` are enough.

For richer MiniApps, follow the project's existing frontend framework. The key
contract is that frontend code calls relative MiniApp APIs, not hardcoded local
ports or hostnames.

Good:

```js
await fetch("/api/customers");
```

Avoid:

```js
await fetch("http://localhost:4310/api/customers");
```

## Local Runtime Expectations

In local CodeBolt hosting:

- one host process owns the port
- static assets should not start workers
- tool and UI discovery should use cached manifests
- backend/tool requests lazily start the owning MiniApp worker
- worker crashes should not kill sibling MiniApps
- host-owned capabilities enforce namespace isolation

Do not add per-MiniApp hidden dev servers unless the user explicitly asks for
that separate development mode.

## Remote Runtime Expectations

In remote deployment:

- each MiniApp can deploy independently
- Node output runs as a normal Nitro Node server
- Cloudflare output runs as a Cloudflare Worker
- storage/blob/tasks calls go to CodeBolt Cloud capability APIs
- the execution token carries user/workspace/install/MiniApp identity

Remote code should not care whether it is running in Node or Cloudflare. The SDK
should hide environment and capability transport differences.

## Validation

Use the current project's scripts. Prefer existing commands over inventing new
ones.

Typical checks:

```powershell
pnpm build
pnpm test
```

When the project has MiniApp-specific target scripts, validate:

- local build
- local host behavior
- remote Node output
- Cloudflare Worker output through Wrangler/workerd

For a new MiniApp, verify:

- static UI loads
- tool discovery includes the new tools
- invalid tool input is rejected
- API routes can use `useMiniApp(event)`
- storage and blob operations are namespaced
- remote output can call CodeBolt Cloud capabilities

## Production Checklist

Before calling a MiniApp production-ready, confirm:

- `nitro.config.ts` uses the MiniApp Nitro module.
- every tool has JSON Schema input.
- validators are build-time compatible with Cloudflare.
- collections are declared when needed.
- the MiniApp UI entry route is declared in config when it is not `/`.
- UI calls relative API paths.
- no Node-only APIs are used in Cloudflare-bound routes.
- storage, blob, and tasks go through `useMiniApp()`.
- list screens use batch/filter APIs rather than N+1 loops.
- remote output uses execution-token identity.
- local static asset discovery does not require backend startup.

## When To Change Platform Runtime

Creating a MiniApp should usually not require platform runtime changes.

Platform changes are only expected when:

- the local host has an explicit MiniApp allowlist
- tests hardcode available MiniApps
- the shell catalog needs a new registration path
- deployment automation needs a new target
- the MiniApp requires a new platform capability

Keep ordinary MiniApp feature code separate from platform runtime changes.
