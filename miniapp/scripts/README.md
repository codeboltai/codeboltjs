# Scripts

Small workspace helper scripts for the MiniApp prototype.

## `build-target.mjs`

Runs a Nitro build for a remote target while setting `MINIAPP_TARGET` in a
Windows-safe way.

Usage:

```powershell
node scripts/build-target.mjs node
node scripts/build-target.mjs cloudflare
```

The root package exposes these as:

```powershell
pnpm build:remote-node
pnpm build:remote-cloudflare
```

The script launches PNPM through `process.execPath` and `npm_execpath`, which
avoids common Windows `spawn EINVAL` failures when invoking `.cmd` shims from
Node.
