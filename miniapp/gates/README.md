# MiniApp Gates

The `gates/` directory contains feasibility checks for the runtime architecture.
These are not product runtime modules.

The gates answer the highest-risk questions before the larger host and SDK
contracts depend on them.

## Gate 1: Mountable Nitro Output

Path:

```text
gates/mountable-output
```

Purpose:

- Build a trivial Nitro v3 application with the local target.
- Import the built ESM output from a host script.
- Call the exported fetch-compatible handler directly.
- Verify method, headers, query, and body survive invocation.
- Verify static asset metadata can be read separately.
- Verify no socket is opened and no `listen()` call is required.

Commands:

```powershell
pnpm gate:build
pnpm gate:mount
```

## Gate 2: Worker Transport

Path:

```text
gates/worker-transport
```

Purpose:

- Mount the trivial Nitro handler inside a Node Worker Thread.
- Send a request through a dedicated `MessagePort`.
- Use a streaming-compatible protocol:

```text
request:start  -> request:chunk*  -> request:end
response:start -> response:chunk* -> response:end
request:cancel
response:error
```

- Transfer body chunks as `ArrayBuffer`.
- Wait for per-chunk acknowledgements.
- Verify cancellation propagates.

Command:

```powershell
pnpm gate:worker
```

## All Gates

```powershell
pnpm gates
```

If a gate fails, treat it as an architecture contract failure. Fix or redesign
the underlying assumption before expanding the MiniApp runtime.
