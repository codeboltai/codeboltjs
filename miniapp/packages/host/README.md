# @codebolt/miniapp-host

Local host runtime for built CodeBolt MiniApps.

This package is the local CodeBolt-side process. It is not used by remote Node
or Cloudflare deployments. Remote deployments run as ordinary Nitro output and
call CodeBolt Cloud capabilities over HTTP.

## Responsibilities

- Load built MiniApp manifests from `<miniappDir>/<id>/.output/codebolt/miniapp.manifest.json`.
- Serve static assets from each MiniApp's built `public` directory without
  starting a worker.
- Expose host-level discovery endpoints:
  - `GET /__codebolt/tools`
  - `GET /__codebolt/status`
  - `POST /__codebolt/reload/:id`
- Route global tool calls like `leads.add-lead` to the owning MiniApp.
- Lazily start one Node Worker Thread per active MiniApp backend.
- Inject signed execution identity into each worker request.
- Provide host-owned `db`, `blob`, and `codebolt.tasks` capabilities.
- Strip `Domain` attributes from MiniApp `Set-Cookie` responses.
- Track worker crash health and idle eviction.

Worker Threads give crash isolation, memory separation, and independent module
caches. They are not a security sandbox for hostile MiniApp code.

## Local Routing Model

The host uses one local port and per-MiniApp hostnames:

```text
http://leads.localhost:4310
http://lead-react.localhost:4310
http://onboarding.localhost:4310
```

Static UI requests are served directly by the host. Backend requests are routed
to the MiniApp worker when the path starts with:

```text
/api/
/__codebolt/
```

Tool discovery does not start workers. A tool execution starts only the worker
for the owning MiniApp.

## Public API

```js
import { createMiniAppHost } from "@codebolt/miniapp-host";

const host = await createMiniAppHost({
  miniappDir: new URL("./examples", import.meta.url),
  port: 4310,
  idleMs: 300_000,
});

const urls = await host.listen();
await host.close();
```

`listen()` returns:

```js
{
  port: 4310,
  appUrls: {
    "lead-react": "http://lead-react.localhost:4310"
  }
}
```

Options:

- `miniappDir`: parent directory containing built MiniApp folders
- `appRoots`: explicit built MiniApp root directories
- `dataDir`: filesystem directory for local capability persistence
- `port`: host port, defaults to `4310`
- `idleMs`: idle worker shutdown delay, defaults to five minutes
- `logger`: object with `warn` and `error`

Pass either `miniappDir` or `appRoots`, not both.

## CLI

Run every built MiniApp under a parent directory:

```powershell
codebolt-miniapp-host --dir examples
```

Run selected MiniApps by root path:

```powershell
codebolt-miniapp-host examples/leads examples/lead-react
```

Useful options:

```text
--port <port>
--data-dir <dir>
--idle-ms <ms>
```

## Capability Ownership

MiniApp code never controls namespace identity. The host derives storage and
task namespaces from verified execution claims:

```text
workspaceId
installId
miniAppId
principal.userId
```

Local capability data is backed by `unstorage` using a filesystem driver. This
is prototype persistence for development and tests.

## Worker Lifecycle

- Static assets do not start a worker.
- First backend/tool request starts the worker.
- Idle eviction starts only after active requests and streams finish.
- In-flight requests fail with `503 MINIAPP_WORKER_EXITED` if a worker dies.
- Three crashes within sixty seconds mark the MiniApp unhealthy.
- `POST /__codebolt/reload/:id` clears unhealthy state and restarts on demand.

## Manual Run

From the workspace root:

```powershell
pnpm build:examples
pnpm start
```

The workspace `start` script calls the host with `--dir examples`.

Then open:

```text
http://leads.localhost:4310
http://lead-react.localhost:4310
http://onboarding.localhost:4310
```

## Tests

The local host is primarily exercised by:

```powershell
pnpm test:integration
```

That test verifies static serving without workers, cached manifest discovery,
lazy tool routing, storage isolation, React static UI serving, cookie rewriting,
idle eviction, worker crashes, breaker behavior, reload, and blob persistence.
