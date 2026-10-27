# Local And Cloud MiniApp Usage

## Contents

- [Runtime Types](#runtime-types)
- [Local Development](#local-development)
- [Dedicated Cloud Deployment](#dedicated-cloud-deployment)
- [Cloudflare Bundle Deployment](#cloudflare-bundle-deployment)
- [Catalog And Installation](#catalog-and-installation)
- [Tool Execution](#tool-execution)
- [Access Model](#access-model)

## Runtime Types

CodeBolt uses an explicit deployment discriminator:

```text
platformworker  separately deployed provider Worker/application
miniappbundle   package loaded by the shared Cloudflare MiniApp Server
```

Do not infer runtime type from URL shape. Missing legacy type defaults to
`platformworker` only for backward compatibility.

## Local Development

Build the app with its detected package manager. The local output contract is:

```text
<miniapp-root>/.output/codebolt/miniapp.manifest.json
```

The CodeBolt local MiniApp host owns one port, serves static assets directly,
and lazily starts the app worker for API/tool requests. It should discover apps
from configured directories or caller-provided roots; do not encode a known
example path into reusable scripts.

Typical host routes are:

```text
http://<app-id>.localhost:<host-port>/
GET  /__codebolt/status
GET  /__codebolt/tools
POST /__codebolt/tools/<app-id>.<tool-name>
POST /__codebolt/apps/<app-id>/reload
```

CodeBolt application routes commonly include:

```text
GET  /api/miniapps
GET  /api/miniapps/:id
POST /api/miniapps/:id/reload
GET  /miniapps/:id
ALL  /miniapps/:id/api/*
ALL  /miniapps/:id/__codebolt/*
```

Use relative UI requests such as `fetch("/api/items")`.

## Dedicated Cloud Deployment

Keep the existing dedicated path for applications that need a separately
deployed provider Worker/application:

```powershell
codebolt action miniapp deploy <miniapp-root> `
  --install-policy anyone `
  --default-access private
```

Important options:

```text
--cloud-url <url>         default: https://api.codebolt.ai
--token <token>           or configured CodeBolt login/environment token
--no-build                upload existing target output
--provider <provider-id>  external deployment provider
--platform <platform-id>  deno-subhosting | vercel-platform | netlify
--output-dir <dir>        override built output directory
--install-policy <mode>   developer_only | anyone | unlisted
--default-access <mode>   private | authenticated | public
--json                    emit machine-readable result
```

The CLI posts the provider deployment to:

```text
POST /api/miniapps/deployments
```

Provider credentials belong to the admin-managed provider Worker, not the
MiniApp or user project.

## Cloudflare Bundle Deployment

Use the shared bundle runtime when the MiniApp should not become a separately
deployed Worker.

Build only:

```powershell
codebolt action miniapp bundle build <miniapp-root>
```

This builds Nitro's `cloudflare-module` output and creates a deterministic
`.miniapp` archive. Use `--no-build` to package an existing
`.output-cloudflare` directory and `--output <file>` to choose the archive.

Verify independently:

```powershell
codebolt-miniapp-bundle inspect <archive.miniapp>
codebolt-miniapp-bundle verify <archive.miniapp>
```

Build, upload, and register:

```powershell
codebolt action miniapp bundle deploy <miniapp-root> `
  --install-policy anyone `
  --default-access private
```

Bundle deployment posts raw `application/vnd.codebolt.miniapp` bytes to:

```text
POST /api/miniapps/bundle-deployments
```

The Edge API uploads the package to the shared MiniApp Server, persists app,
version, tools, and `miniappbundle` deployment metadata, then returns the
package and deployment identifiers.

The archive contains app code, the complete Nitro module graph, assets,
manifest, checksums, and the fetch adapter. It does not contain a Durable Object
class or server management API.

## Catalog And Installation

Publishing creates catalog metadata. Installation creates the isolated runtime
identity:

```text
Published app: appId + versionId + deploymentId + packageId
Installed app: installId + workspaceId + access + runtime URL
```

For a bundle install, Edge provisions or updates the matching shared-server
instance before returning success. Use one isolated instance per install/thread
scope. Uninstall removes the bundle instance and disables the install record.

The MiniApp Router remains the browser-facing boundary. Never give the browser
the MiniApp Server management URL.

Portal lifecycle surfaces:

```text
Registry -> MiniApps -> All MiniApps
Registry -> MiniApps -> My MiniApps
Agents   -> Installed MiniApps
```

## Tool Execution

Local registered tool ids commonly look like:

```text
miniapp.<app-id>.<tool-name>
```

Cloud installed tool ids commonly look like:

```text
miniapp.cloud.<install-id>.<tool-name>
```

Cloud execution goes through:

```text
POST /api/miniapps/installs/:installId/tools/:toolName/execute
```

For `platformworker`, Edge issues a short-lived execution token and calls the
dedicated runtime. For `miniappbundle`, Edge calls the installed shared-server
instance through its authenticated internal route. Both inject the same
MiniApp context.

## Access Model

Catalog installation policy:

```text
developer_only  only the publisher can install
anyone          catalog users can install
unlisted        installation requires direct discovery/permission
```

Per-install runtime access:

```text
private          owning user/workspace only
authenticated    any signed-in CodeBolt user
public           anonymous runtime access
```

Keep these concepts separate. Never temporarily expose private production data
as `public` merely to make a smoke test easier.
