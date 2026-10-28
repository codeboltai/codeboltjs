# MiniApp Project Discovery

Use this reference before scaffolding or migrating a MiniApp.

## Discovery Sequence

1. List files with `rg --files`.
2. Read repository instructions such as `AGENTS.md` and the nearest package
   manifest.
3. Detect the package manager:
   - `pnpm-lock.yaml` or `packageManager: pnpm` -> pnpm
   - `package-lock.json` -> npm
   - `yarn.lock` -> Yarn
   - `bun.lock` or `bun.lockb` -> Bun
4. Search for `@codebolt/miniapp`, `codeboltMiniApp`, `resolveTarget`,
   `defineTool`, `defineCollection`, and `useMiniApp`.
5. Inspect existing build, test, typecheck, lint, preview, and deploy scripts.
6. Inspect the current working tree and preserve unrelated changes.

## Directory Selection

Apply this priority:

1. Use the explicit path given by the user.
2. Extend an existing MiniApp in place.
3. Follow an established repository MiniApp/examples convention.
4. In a CodeBolt project with `.codebolt/`, use
   `.codebolt/miniapps/<app-id>`.
5. Otherwise use a top-level `<app-id>/` directory.

Do not hardcode a prototype checkout or copy its workspace dependency syntax
into an unrelated repository.

## Existing Web Application Migration

Keep the existing frontend framework when it can emit browser assets. Add Nitro
as the server boundary and move backend calls into `server/api`.

Before migrating, inventory:

- absolute API URLs and environment-specific hostnames
- filesystem/database calls that must become `context.db` or `context.blob`
- background or long-running work that may need a platform capability
- server middleware and Node libraries incompatible with Workers
- user-controlled identity fields that must be removed
- routes that conflict with `/api/*` or `/__codebolt/*`

Do not rewrite a working UI merely to match the static starter.

## Identity And Compatibility

Treat the MiniApp id as durable. It participates in:

- catalog identity
- qualified tool names
- install records
- router hostnames
- storage isolation

Preserve the id during upgrades unless the user explicitly wants a new app.
Increment `version` when deployed behavior, tools, schemas, or manifest metadata
changes.

## Dependency Selection

For an external project, use the published package:

```json
{
  "dependencies": {
    "@codebolt/miniapp": "^0.1.2",
    "nitro": "3.0.260610-beta"
  }
}
```

For a monorepo that owns the SDK, follow its workspace convention such as
`workspace:*`. Do not silently replace published dependencies with filesystem
paths.
