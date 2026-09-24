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

Read `references/local-cloud-publish.md` when the task involves:

- running MiniApps in the local host or CodeBolt app
- publishing MiniApps through CodeBolt Cloud
- portal catalog/install behavior
- exposing local or cloud MiniApp tools to agents
- explaining install policy versus per-install access

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

## Runtime Portability

MiniApp server code runs in restricted runtimes. Besides the Cloudflare rules
below, the local CodeBolt host runs handlers inside a sandboxed worker thread
where some Node/Web globals may be missing.

- Do not assume the bare `crypto` global (for example `crypto.randomUUID()`)
  exists. Guard feature detection and keep a fallback:

```ts
function generateId(): string {
  const webCrypto =
    typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
      ? crypto
      : undefined;
  if (webCrypto) return webCrypto.randomUUID();
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
```

- Prefer inputs that carry their own ids when practical, and generate ids only
  in one shared helper.
- Do not import `node:crypto` in code that may target Cloudflare.

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

- Browser code should resolve API paths document-relative (see Build The
  Frontend) so calls stay inside the `/miniapps/<id>/` mount.
- Use `useMiniApp(event)` so local and remote runtimes share the same code.
- Do not create a separate Express/Fastify server for a MiniApp.
- Keep platform access behind MiniApp capabilities.
- Avoid N+1 capability calls in list screens.

## Build The Frontend

For simple MiniApps, static files in `public/` are enough.

For richer MiniApps, follow the project's existing frontend framework.

Resolve API paths against the page URL, never against the host root. The same
build must work in three contexts:

- CodeBolt host mount: `/miniapps/<miniAppId>/`
- standalone preview: `/`
- cloud origin: `/`

A leading-slash path such as `/api/customers` is host-absolute. Under the
CodeBolt host it escapes the app mount, hits the host HTML fallback, and the
UI fails parsing HTML as JSON.

Good (document-relative resolution):

```js
const apiBase = location.pathname.endsWith("/")
  ? location.pathname
  : `${location.pathname}/`;
const apiUrl = (path) => `${apiBase}${path}`;

await fetch(apiUrl("api/customers"));
```

Avoid:

```js
await fetch("/api/customers"); // host-absolute; escapes /miniapps/<id>/ mount
await fetch("http://localhost:4310/api/customers"); // hardcoded origin
```

Frontend async hygiene:

- Capture `event.currentTarget` into a variable before the first `await`; it
  becomes null after event dispatch completes.
- Catch fetch failures and surface them in the UI instead of throwing inside
  the handler.

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

For exact local host routes, CodeBolt app routes, and local tool id shapes, read
`references/local-cloud-publish.md`.

## Remote Runtime Expectations

In remote deployment:

- each MiniApp can deploy independently
- Node output runs as a normal Nitro Node server
- Cloudflare output runs as a Cloudflare Worker
- storage/blob/tasks calls go to CodeBolt Cloud capability APIs
- the execution token carries user/workspace/install/MiniApp identity

Remote code should not care whether it is running in Node or Cloudflare. The SDK
should hide environment and capability transport differences.

For cloud publishing, portal install flow, provider platforms, and cloud tool id
shapes, read `references/local-cloud-publish.md`.

## Debugging The Local Host

When a MiniApp misbehaves under the CodeBolt host, check state before guessing:

- `GET /api/miniapps/:id` reports runtime status including `unhealthy` and
  `recentCrashes`.
- A 503 `MINIAPP_UNHEALTHY` means the crash circuit breaker is open: the
  worker exited unintentionally 3+ times within 60 seconds. The host keeps
  returning 503 until reload.
- Reset with `POST /api/miniapps/:id/reload`, then hit the failing route again
  to observe the real failure.
- If the worker crashes instantly on every request, suspect handler code or
  the runtime environment (missing globals, unusable imports), not the host.
- Capability-backed routes cannot run meaningfully outside the host; the
  standalone `nitro preview` lacks the execution-token bridge, so API routes
  fail there by design. Test those routes through the host.

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

For a new MiniApp, verify through the CodeBolt host mount, not only standalone
preview:

- static UI loads at `/miniapps/<id>/`
- UI-driven flows work end to end (submit forms, then confirm the list
  updates and the form resets) with the exact payloads the UI sends
- tool discovery includes the new tools
- invalid tool input is rejected
- API routes can use `useMiniApp(event)`
- storage and blob operations are namespaced
- remote output can call CodeBolt Cloud capabilities

## Production Checklist

Before calling a MiniApp production-ready, confirm:

- `nitro.config.ts` uses the MiniApp Nitro module.
- the build emits `.output/codebolt/miniapp.manifest.json`.
- every tool has JSON Schema input.
- validators are build-time compatible with Cloudflare.
- collections are declared when needed.
- the MiniApp UI entry route is declared in config when it is not `/`.
- UI resolves API paths document-relative (works under `/miniapps/<id>/`).
- UI async handlers capture `event.currentTarget` before awaiting.
- server code does not assume bare `crypto` or other runtime-specific globals.
- no Node-only APIs are used in Cloudflare-bound routes.
- storage, blob, and tasks go through `useMiniApp()`.
- list screens use batch/filter APIs rather than N+1 loops.
- remote output uses execution-token identity.
- local static asset discovery does not require backend startup.
- UI-driven flows were exercised through the host mount, not preview alone.
- publish/install documentation reflects the current `appId` versus `installId`
  model.

## When To Change Platform Runtime

Creating a MiniApp should usually not require platform runtime changes.

Platform changes are only expected when:

- the local host has an explicit MiniApp allowlist
- tests hardcode available MiniApps
- the shell catalog needs a new registration path
- deployment automation needs a new target
- the MiniApp requires a new platform capability

Keep ordinary MiniApp feature code separate from platform runtime changes.
