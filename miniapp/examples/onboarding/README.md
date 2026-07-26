# Onboarding MiniApp

Example MiniApp that models an employee onboarding checklist.

It exists alongside the Leads MiniApp to prove that multiple MiniApps can share
one local host while keeping workers, manifests, cookies, tools, and storage
namespaces separate.

## What It Contains

```text
examples/onboarding/
  public/index.html
  nitro.config.ts
  server/
    api/
    tools/
    collections/
```

Important files:

- `server/tools/add-employee.ts`: stores an employee onboarding record.
- `server/tools/complete-step.ts`: marks an onboarding step complete.
- `server/api/employees.get.ts`: lists employees.
- `server/api/employees.post.ts`: creates employees from the UI/API.
- `server/api/complete.post.ts`: completes a step from the UI/API.
- `server/collections/employees.ts`: declares employee collection metadata.

## Nitro Config

```ts
import { defineConfig } from "nitro";
import { codeboltMiniApp, resolveTarget } from "@codebolt/miniapp/nitro";

export default defineConfig({
  ...resolveTarget(),
  compatibilityDate: "2026-07-24",
  serverDir: "server",
  modules: [
    codeboltMiniApp({
      id: "onboarding",
      title: "Employee Onboarding",
      version: "0.1.0",
    }),
  ],
});
```

## Local Build

From the workspace root:

```powershell
pnpm build:onboarding
pnpm start
```

Open:

```text
http://onboarding.localhost:4310
```

## Tools

Global tool names in the host manifest:

```text
onboarding.add-employee
onboarding.complete-step
```

Tool input is JSON Schema validated before the handler runs. Validators are
generated at build time so the same source can run in Cloudflare Workers without
runtime code generation.

## Isolation Purpose

This example is intentionally separate from Leads. The integration tests use the
two apps together to verify:

- cached discovery does not start workers
- calling one app's tool starts only that app's worker
- data in one MiniApp is not visible to another MiniApp
- cookies are host-only and are not shared across sibling MiniApp origins
