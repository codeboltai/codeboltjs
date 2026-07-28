# Local And Cloud MiniApp Usage

Use this reference when publishing, installing, or explaining how MiniApps run
locally and in CodeBolt Cloud.

## Local Development

Build the MiniApp first. The required output contract is:

```text
<miniappRoot>/.output/codebolt/miniapp.manifest.json
```

Typical commands:

```powershell
npm install
npm run build
```

In the prototype repo:

```powershell
pnpm --dir examples/lead-react build
pnpm start
```

The local host discovers built apps from a parent directory:

```powershell
node packages/host/src/cli.mjs --dir examples
```

or from explicit app roots:

```powershell
node packages/host/src/cli.mjs examples/leads examples/lead-react
```

Local routes:

```text
http://<appId>.localhost:4310
GET  /__codebolt/tools
GET  /__codebolt/status
POST /__codebolt/tools/<appId>.<toolName>
POST /__codebolt/apps/<appId>/reload
```

Use relative API paths in UI code:

```js
await fetch("/api/leads");
```

Do not hardcode a local host URL inside the MiniApp.

## CodeBolt App Local Runtime

CodeBolt discovers built MiniApps from its configured/project MiniApp
directories, then exposes:

```text
GET  /api/miniapps
GET  /api/miniapps/:id
POST /api/miniapps/:id/reload
GET  /miniapps/:id
ALL  /miniapps/:id/api/*
ALL  /miniapps/:id/__codebolt/*
```

Agent-side MiniApp operations are `miniapp.*` messages:

```text
miniapp.list
miniapp.openUi
miniapp.reload
miniapp.howToCreate
miniapp.createStarter
```

Local MiniApp tools are exposed through the server tool registry with ids:

```text
miniapp.<appId>.<toolName>
```

Treat MiniApp tools like MCP/plugin/project tools after registration; do not
special-case tool execution in agents.

## Cloud Publishing

Publish through CodeBolt Cloud, not through provider-specific user secrets. The
provider credentials live on the admin-managed deploy provider worker.

Use the CodeBolt CLI:

```powershell
codebolt miniapp deploy <miniapp-root> `
  --token $env:CODEBOLT_AUTH_TOKEN `
  --platform deno-subhosting `
  --install-policy anyone `
  --default-access private
```

Options to know:

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

The CLI posts to:

```text
POST https://api.codebolt.ai/api/miniapps/deployments
```

Edge API selects a deploy provider, stores the app/version/deployment in D1, and
returns the registered app and deployment ids.

## Portal Flow

Portal menus are lifecycle-based:

```text
Registry -> MiniApps -> All MiniApps
Registry -> MiniApps -> My MiniApps
Agents   -> Installed MiniApps
```

Use `All MiniApps` for catalog/install discovery. Use `My MiniApps` for apps
published by the signed-in user. Use `Installed MiniApps` for apps installed
into the user's workspace and ready for runtime/tool use.

## Cloud Tool Use

Cloud installed MiniApp tools are exposed through the CodeBolt server tool
registry by fetching:

```text
GET /api/miniapps/installs
```

Tool execution goes through:

```text
POST /api/miniapps/installs/:installId/tools/:toolName/execute
```

Cloud tool ids are shaped like:

```text
miniapp.cloud.<installId>.<toolName>
```

The runtime receives verified execution context:

```text
miniAppId
installId
workspaceId
principal.userId
```

Never let MiniApp input override those identity fields.

## Access Model

Published app install policy:

```text
developer_only
anyone
unlisted
```

Per-install access:

```text
private
authenticated
public
```

Keep these separate. Install policy decides who can install a catalog app.
Access decides who can use an installed runtime/tool surface.
