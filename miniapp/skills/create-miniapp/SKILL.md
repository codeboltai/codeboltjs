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

Never accept `miniAppId`, `installId`, `workspaceId`, or `principal.userId` from
request or tool input. The platform verifies and injects identity.

Read [authoring-contract.md](references/authoring-contract.md) before adding
tools, collections, API routes, blobs, tasks, pagination, or a frontend.

## Keep Browser And Tool Surfaces Separate

Use MiniApp-owned API routes for browser interactions:

```js
await fetch("/api/customers");
```

Use `server/tools` for agent-callable operations. Do not make UI code call
`/__codebolt/tools/*`; that is a platform/control-plane surface.

Use relative URLs. Never bake localhost, a deployment hostname, the MiniApp
Server management URL, or a router hostname into app code.

## Build In Small Verified Slices

Implement in this order:

1. Configure identity, policies, and the `/` UI entry.
2. Define collection schemas.
3. Add API routes using `useMiniApp(event)`.
4. Add agent tools using the same storage operations.
5. Build the UI against relative APIs.
6. Build and inspect the emitted manifest.
7. Exercise valid and invalid API/tool inputs.
8. Validate the Cloudflare target when bundle deployment is intended.

Use `scripts/validate-miniapp.mjs` after source changes:

```powershell
node <skill-dir>/scripts/validate-miniapp.mjs <miniapp-root>
node <skill-dir>/scripts/validate-miniapp.mjs <miniapp-root> --require-build
```

Read [build-and-validation.md](references/build-and-validation.md) for the
target matrix, manifest checks, realistic smoke tests, and completion criteria.

## Cloudflare Safety Rules

For Cloudflare-bound routes and tools:

- avoid filesystem and process dependencies at request time
- avoid Node-only networking/server libraries
- never use `eval`, `new Function`, or request-time schema compilation
- let the MiniApp Nitro module generate standalone validators during build
- preserve the complete Nitro ESM graph in the `.miniapp` archive
- keep Durable Objects, dynamic Worker loading, and management endpoints out of
  MiniApp source; those belong to the shared MiniApp Server

## Diagnose By Boundary

Determine which boundary failed before changing code:

```text
authoring -> Nitro build -> manifest -> .miniapp archive
  -> Edge catalog -> install provisioning -> router -> dynamic runtime
  -> request-scoped capability bridge -> centralized storage
```

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
