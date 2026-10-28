---
name: create-miniapp
description: Create, scaffold, extend, debug, validate, package, and publish production CodeBolt MiniApps using @codebolt/miniapp and Nitro. Use for MiniApp UI and API development, CodeBolt tools and collections, db/blob/task capabilities, local CodeBolt hosting, dedicated cloud deployment, Cloudflare-native .miniapp bundles, catalog installation, or migration of an existing web app into a MiniApp.
---

# Create CodeBolt MiniApps

Build a MiniApp as a portable full-stack application. Keep app logic inside the
bundle and platform lifecycle, identity, isolation, routing, and storage inside
CodeBolt.

## Start With Discovery

Inspect the target project before editing. Do not assume this prototype's paths,
package manager, framework, or scripts.

```powershell
rg --files
```

Identify:

- the requested app directory and existing project conventions
- the package manager from lockfiles and `packageManager`
- the installed `@codebolt/miniapp` and `nitro` versions
- existing `nitro.config.*`, `server/`, `public/`, and frontend directories
- local build, test, lint, typecheck, and host commands
- whether the user wants local-only, dedicated cloud, or shared bundle runtime
- whether an existing MiniApp id or stored data must remain compatible

Read [project-discovery.md](references/project-discovery.md) when adopting an
existing project, choosing a directory, or resolving package-manager/build
conventions.

## Choose The Deployment Shape Early

Use one source tree for all targets through `resolveTarget()`.

| Need | Target | Command |
|---|---|---|
| CodeBolt local host | local Nitro `standard` output | project build |
| Separate provider deployment | `platformworker` | `codebolt action miniapp deploy` |
| Shared Cloudflare-native runtime | `miniappbundle` | `codebolt action miniapp bundle deploy` |

Prefer `miniappbundle` when the app should run in CodeBolt's shared Cloudflare
architecture without deploying a separate Worker. Use a dedicated deployment
only when separate provider ownership or provider-specific behavior is required.

Read [local-cloud-publish.md](references/local-cloud-publish.md) before running
or changing any cloud command.

## Scaffold Or Reuse The App

For a new app, copy `assets/starter-miniapp/` into the selected directory, then
rename all `starter-miniapp` identity values. Do not blindly replace an existing
project with the starter.

The conventional shape is:

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

Use a stable lowercase hostname-safe id matching `[a-z0-9-]+`. Treat it as a
persistent platform identifier, not a display name. Changing it creates a new
catalog/storage identity.

Install current packages using the detected package manager:

```powershell
npm install @codebolt/miniapp nitro
```

## Configure Nitro

Use the Nitro adapter only from `nitro.config.ts`:

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
      description: "Collect and manage customer intake records.",
      route: "/",
      installPolicy: "developer_only",
      defaultAccess: "private",
    }),
  ],
});
```

Keep `defineConfig`, `serverDir`, and `modules` visible so applications can add
their own Nitro modules and settings. Do not duplicate target-selection policy;
compose `resolveTarget()`.

Read [nitro-basics.md](references/nitro-basics.md) for routing, handlers, assets,
presets, and Cloudflare restrictions.

## Implement The Runtime Contract

Import runtime helpers from the root package:

```ts
import { defineCollection, defineTool, useMiniApp } from "@codebolt/miniapp";
```

Use the request-scoped context for all platform-owned state:

```text
context.miniAppId
context.installId
context.workspaceId
context.principal
context.db
context.blob
context.codebolt.tasks
```

Pass the Nitro event to `useMiniApp(event)` in API routes. Tool handlers receive
the context directly.

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

Read [authoring-contract.md](references/authoring-contract.md) before adding
tools, collections, API routes, blobs, tasks, pagination, or a frontend.

## Keep Browser And Tool Surfaces Separate

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

Use `server/tools` for agent-callable operations. Do not make UI code call
`/__codebolt/tools/*`; that is a platform/control-plane surface.

Use relative URLs. Never bake localhost, a deployment hostname, the MiniApp
Server management URL, or a router hostname into app code.

## Build In Small Verified Slices
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

Implement in this order:

1. Configure identity, policies, and the `/` UI entry.
2. Define collection schemas.
3. Add API routes using `useMiniApp(event)`.
4. Add agent tools using the same storage operations.
5. Build the UI against relative APIs.
6. Build and inspect the emitted manifest.
7. Exercise valid and invalid API/tool inputs.
8. Validate the Cloudflare target when bundle deployment is intended.

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
node <skill-dir>/scripts/validate-miniapp.mjs <miniapp-root>
node <skill-dir>/scripts/validate-miniapp.mjs <miniapp-root> --require-build
```

Read [build-and-validation.md](references/build-and-validation.md) for the
target matrix, manifest checks, realistic smoke tests, and completion criteria.

## Cloudflare Safety Rules

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

## Diagnose By Boundary

Determine which boundary failed before changing code:

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

Read [troubleshooting.md](references/troubleshooting.md) for symptom-driven
checks. Do not replace a failed layer with duplicated responsibilities in the
MiniApp.

## Agent Completion Contract

Before reporting completion:

- preserve unrelated user changes
- list the app id, target directory, and chosen runtime type
- report exact build/test/validation commands and results
- state whether cloud deployment was only prepared or actually executed
- when deployed, report package id, app/version/deployment ids, and runtime URL
- distinguish source validation, bundle validation, installation, and live tool
  execution; do not call a manifest-only change end-to-end
- call out any remaining release, authentication, pricing, or platform blocker

Do not publish, install, change production access, or deploy unless the user has
authorized that external action.
