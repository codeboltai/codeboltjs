# CodeBolt MiniApp Publishing And Usage

This document describes the current MiniApp flow across local CodeBolt,
CodeBolt Cloud, the portal, and agent tool execution.

## Mental Model

A MiniApp has two different lifecycle records:

```text
Published MiniApp
  appId: lead-react
  owner: developer/user who published it
  installPolicy: developer_only | anyone | unlisted
  latest version, manifest, tools, deployment

Installed MiniApp
  installId: mai_...
  appId: lead-react
  owner/workspace: user or workspace that installed it
  access: private | authenticated | public
  runtime URL and executable tool surface
```

The published app is catalog metadata. The installed app is what a user or
workspace actually runs and what agents execute tools through.

## Authoring Contract

A MiniApp is a Nitro app using `@codebolt/miniapp`.

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

The Nitro config owns the MiniApp identity:

```ts
import { defineConfig } from "nitro";
import { codeboltMiniApp, resolveTarget } from "@codebolt/miniapp/nitro";

export default defineConfig({
  ...resolveTarget(),
  compatibilityDate: "2026-07-24",
  serverDir: "server",
  modules: [
    codeboltMiniApp({
      id: "lead-react",
      title: "Lead React",
      version: "0.1.0",
      route: "/",
    }),
  ],
});
```

`codeboltMiniApp()` scans `server/tools` and `server/collections`, generates the
tool registry and validators, registers the internal tool route, and emits:

```text
.output/codebolt/miniapp.manifest.json
```

The manifest is the contract used by local hosting, cloud publishing, portal
catalog views, and tool exposure.

## Local Development

Build the MiniApp:

```powershell
pnpm --dir examples/lead-react build
```

Or build all examples:

```powershell
pnpm build:examples
```

Run the local host:

```powershell
pnpm start
```

The repo `start` script runs:

```powershell
node packages/host/src/cli.mjs --dir examples
```

The host discovers built MiniApps from:

```text
<miniappDir>/<id>/.output/codebolt/miniapp.manifest.json
```

Example local URLs:

```text
http://leads.localhost:4310
http://lead-react.localhost:4310
http://onboarding.localhost:4310
```

Local host endpoints:

```text
GET  /__codebolt/status
GET  /__codebolt/tools
POST /__codebolt/tools/<qualified-tool-name>
POST /__codebolt/apps/<id>/reload
```

Example local tool execution:

```powershell
$body = @{
  input = @{
    id = "lead-1"
    name = "Ada Lovelace"
    company = "Analytical Engines"
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod `
  -Method Post `
  -Uri http://127.0.0.1:4310/__codebolt/tools/lead-react.add-lead `
  -ContentType application/json `
  -Body $body
```

Static UI requests do not start a MiniApp worker. API routes and tool calls
lazily start only the owning MiniApp worker.

## Using MiniApps In The CodeBolt Application

CodeBolt server discovers built local MiniApps from the configured/project
MiniApp directories and exposes them through:

```text
GET  /api/miniapps
GET  /api/miniapps/:id
POST /api/miniapps/:id/reload
GET  /miniapps/:id
GET  /miniapps/:id/*
ALL  /miniapps/:id/api/*
ALL  /miniapps/:id/__codebolt/*
```

Agent-facing server operations use `miniapp.*` messages through
`packages/server/src/cliLib/miniappService.cli.ts`:

```text
miniapp.list
miniapp.openUi
miniapp.reload
miniapp.howToCreate
miniapp.createStarter
```

The local MiniApp tool provider registers local tools as server tools with ids
like:

```text
miniapp.<appId>.<toolName>
```

Example:

```text
miniapp.lead-react.add-lead
```

These tools are listed and executed through the same server tool registry used
for MCP, plugin, project-local, and cloud connector tools.

## Cloud Publishing

Cloud publishing is routed through CodeBolt Cloud. The user CLI does not need
provider credentials for Deno, Vercel, or Netlify. Those secrets live on the
admin-managed provider worker.

The current publish path is:

```text
CodeBolt CLI
  -> POST https://api.codebolt.ai/api/miniapps/deployments
     -> Edge API selects a deploy provider
        -> provider worker deploys the uploaded bundle
           -> Edge API stores app, version, deployment, and tools in D1
              -> Portal shows catalog entries
```

Publish with the CodeBolt CLI:

```powershell
codebolt miniapp deploy <miniapp-root> `
  --token $env:CODEBOLT_AUTH_TOKEN `
  --platform deno-subhosting `
  --install-policy anyone `
  --default-access private
```

Useful options:

```text
--cloud-url <url>         default: https://api.codebolt.ai
--token <token>           or CODEBOLT_AUTH_TOKEN / CODEBOLT_CLOUD_AUTH_TOKEN
--no-build                skip npm run build
--provider <providerId>   deploy provider id
--platform <platformId>   deno-subhosting | vercel-platform | netlify
--output-dir <dir>        built output directory, default .output
--install-policy <policy> developer_only | anyone | unlisted
--default-access <access> private | authenticated | public
--json                    print raw deployment JSON
```

Cloud API endpoints:

```text
GET  /api/miniapps/registry
GET  /api/miniapps/my
GET  /api/miniapps/registry/:appId
POST /api/miniapps/deployments
GET  /api/miniapps/installs
POST /api/miniapps/apps/:appId/install
POST /api/miniapps/installs/:installId/tools/:toolName/execute
```

`/api/miniapps/my`, `/deployments`, `/installs`, `/install`, and cloud tool
execution require a CodeBolt auth token.

## Provider Worker

The registered default deploy provider is:

```text
codebolt-miniapp-deploy-provider
```

It exposes:

```text
GET  /manifest
POST /deploy
GET  /health
```

Supported platforms:

```text
deno-subhosting
vercel-platform
netlify
```

Provider secrets are set on the provider worker:

```powershell
pnpm exec wrangler secret put DENO_DEPLOY_TOKEN -c packages/miniapp-deploy-provider-worker/wrangler.jsonc
pnpm exec wrangler secret put VERCEL_TOKEN -c packages/miniapp-deploy-provider-worker/wrangler.jsonc
pnpm exec wrangler secret put NETLIFY_AUTH_TOKEN -c packages/miniapp-deploy-provider-worker/wrangler.jsonc
```

The admin can register or change deploy providers through CodeBolt Admin. The
portal is for user-facing catalog/install management, not provider secret
management.

## Portal Usage

The portal MiniApp menus are split by lifecycle:

```text
Registry tab
  MiniApps
    All MiniApps   -> published catalog
    My MiniApps    -> MiniApps published by the signed-in user

Agents tab
  Installed MiniApps -> MiniApps installed into the user's workspace
```

Typical user flow:

1. Publish a MiniApp with `codebolt miniapp deploy`.
2. Open Portal -> Registry -> MiniApps -> All MiniApps.
3. Install the MiniApp.
4. Open Portal -> Agents -> Installed MiniApps.
5. Open the installed runtime UI or let agents use its exposed tools.

## Cloud Tool Usage

Installed cloud MiniApp tools are exposed to CodeBolt agents through the cloud
MiniApp server tool provider.

The provider:

- calls `GET /api/miniapps/installs` using the user's cloud token
- turns installed MiniApp tools into server tool descriptors
- executes tools through
  `POST /api/miniapps/installs/:installId/tools/:toolName/execute`

Cloud tool ids are shaped like:

```text
miniapp.cloud.<installId>.<toolName>
```

The cloud execution endpoint creates a short-lived execution token for the
installed MiniApp and forwards the call to the deployed runtime/capability URL.
The MiniApp receives verified identity:

```text
miniAppId
installId
workspaceId
principal.userId
```

Tool handlers should trust `context` identity, not user input fields.

## Access Controls

Publishing policy controls who can install a published app:

```text
developer_only  only the publisher can install
anyone          visible/installable through catalog
unlisted        installable if directly addressed and permitted
```

Install access controls who can use an installed runtime:

```text
private          owner/workspace only
authenticated    signed-in CodeBolt users
public           public runtime access
```

These are separate concepts. Do not use install access to decide catalog
visibility, and do not use install policy to authorize runtime tool execution.

## Production Checklist

Before publishing:

- `nitro.config.ts` uses `codeboltMiniApp()` and `resolveTarget()`.
- `.output/codebolt/miniapp.manifest.json` exists after build.
- UI calls relative API paths such as `/api/leads`.
- Tools have JSON Schema input with `additionalProperties: false` where practical.
- Tool handlers use `context.db`, `context.blob`, and `context.codebolt.tasks`.
- No tool trusts user-supplied workspace, install, app, or user identity.
- Cloudflare-bound code avoids filesystem, process APIs, `eval`, `new Function`,
  and request-time Ajv compilation.
- `pnpm test` or the project-specific build/test commands pass.

