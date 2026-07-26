# MiniApp Tests

This directory contains contract tests for the MiniApp prototype.

Run everything:

```powershell
pnpm test
```

## Test Groups

```powershell
pnpm test:capabilities
```

Verifies host-owned capability behavior:

- `db.setMany`
- `db.getMany`
- `db.list`
- `db.deleteMany`
- blob put/get/list
- workspace/install/MiniApp namespace isolation

```powershell
pnpm test:integration
```

Runs the local host with both example MiniApps and verifies:

- one host process and one port
- static UI requests start zero workers
- manifest-based tool discovery starts zero workers
- calling one tool starts only its owning worker
- invalid tool input is rejected before handler execution
- storage remains isolated between MiniApps
- the React MiniApp contributes its own tool manifest entry
- task count uses a filtered capability
- blob data survives worker eviction and restart
- cookie `Domain` attributes are stripped
- long requests prevent idle eviction
- worker crashes fail fast and trip the breaker
- reload clears unhealthy state

```powershell
pnpm test:remote-node
```

Starts the Node preset build and verifies that the remote MiniApp calls a mock
CodeBolt Cloud capability API with the execution token.

```powershell
pnpm test:remote-cloudflare
```

Starts the Cloudflare Worker build through Wrangler/workerd and verifies the
same remote capability contract. This test catches Cloudflare runtime rules such
as the ban on string-based code generation.

## Build Dependencies

Remote target tests expect their matching build output to already exist:

```powershell
pnpm build:remote-node
pnpm build:remote-cloudflare
```

The root `pnpm test` command builds each target before running its test.
