# Build And Validate MiniApps

## Target Matrix

`resolveTarget()` selects output using `MINIAPP_TARGET`:

| Value | Nitro preset | Typical output |
|---|---|---|
| unset | `standard` | `.output` |
| `node` | `node-server` | `.output-node` |
| `cloudflare` | `cloudflare-module` | `.output-cloudflare` |
| `deno` | `deno-deploy` | provider-specific |
| `vercel` | `vercel` | `.vercel/output` |
| `netlify` | `netlify` | `.netlify` |

Use project scripts when present. For a generic npm project:

```powershell
npm run build
$env:MINIAPP_TARGET='cloudflare'; npm run build
Remove-Item Env:MINIAPP_TARGET
```

## Source Validation

Run the skill validator before building:

```powershell
node <skill-dir>/scripts/validate-miniapp.mjs <miniapp-root>
```

It checks package/config presence, SDK imports, stable identity, common
Cloudflare hazards, browser URL mistakes, definitions, and any existing build
manifest.

## Manifest Validation

After a local build, require the manifest:

```powershell
node <skill-dir>/scripts/validate-miniapp.mjs <miniapp-root> --require-build
```

Confirm `.output/codebolt/miniapp.manifest.json` contains:

- the expected id, title, version, description, and policies
- one UI entry and correct route
- every tool exactly once with input schema
- every collection exactly once
- runtime handler and public directory
- expected static asset inventory

The manifest proves discovery/build integration. It does not prove runtime
capabilities, storage, routing, or cloud installation.

## Bundle Validation

Build and verify a Cloudflare-native archive:

```powershell
codebolt action miniapp bundle build <miniapp-root>
codebolt-miniapp-bundle inspect <archive.miniapp>
codebolt-miniapp-bundle verify <archive.miniapp>
```

The bundle must preserve the full Nitro server module graph, public assets,
manifest, generated adapter, and checksums. It must not contain a Durable Object
class or MiniApp Server management logic.

## Behavioral Checks

Exercise at least:

1. UI root loads.
2. A read API returns the expected envelope.
3. A write API persists and a later read returns the record.
4. A tool accepts valid input.
5. The same tool rejects missing/extra invalid input.
6. Blob round-trip works when used.
7. Task create/list/count works when used.
8. Data from one install/workspace is not selected by client-provided identity.

For bundle deployment, distinguish these gates:

```text
archive upload succeeded
catalog deployment is type miniappbundle
installation provisioned an instance
router hostname enforces access
API/tool request reached dynamic Worker
storage persisted through the runtime bridge
```

## Static Cloudflare Checks

Search Worker-bound source for hazards:

```powershell
rg -n "eval\(|new Function|node:fs|from ['\"]fs['\"]|createServer\(|process\.env" server
```

Some build-time code can use Node APIs. Runtime handlers and their dependency
graph must be Worker-compatible.

## Completion Evidence

Report exact commands, exit status, and relevant identifiers. Use this ladder:

- source complete
- local build complete
- local behavior tested
- Cloudflare output complete
- archive verified
- uploaded and registered
- installed and routed
- live API/tool/storage tested

Never collapse these into one unsupported “deployed successfully” claim.
