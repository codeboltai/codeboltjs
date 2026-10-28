# MiniApp Troubleshooting

## Build Does Not Emit A Manifest

Check:

- `codeboltMiniApp(...)` is in `modules`
- `serverDir` points to the directory containing `tools` and `collections`
- definition files default-export `defineTool(...)` or `defineCollection(...)`
- the build uses the intended `nitro.config.*`
- duplicate tool names are not failing discovery

Expected local path:

```text
.output/codebolt/miniapp.manifest.json
```

## `useMiniApp` Says Runtime Context Is Unavailable

Confirm the route calls `useMiniApp(event)`, not `useMiniApp()`.

Then identify the runtime:

- local host must inject its runtime bridge
- dedicated cloud runtime must receive execution-token and capability headers
- bundle runtime must receive `CODEBOLT_MINIAPP_RUNTIME` from the MiniApp Server

Do not add fallback credentials or hardcoded cloud URLs inside the app.

## Tool Missing From Catalog

Check the source file is under `server/tools`, has a supported JS/TS extension,
default-exports a tool, and has a unique `name`. Rebuild and inspect the emitted
manifest before investigating Edge or Portal.

## Tool Returns `INVALID_TOOL_INPUT`

Compare the actual JSON body with `inputSchema`. With
`additionalProperties: false`, undeclared fields also fail. The Edge tool
execution API accepts `{ "params": <tool-input> }`; the MiniApp's internal tool
route receives the unwrapped input.

## Cloudflare Rejects Dynamic Code Generation

Remove request-time Ajv/schema compilation and libraries that call `eval` or
`new Function`. Keep schemas in `defineTool`; the Nitro module compiles
standalone validators during build.

## Bundle Builder Cannot Be Resolved

Confirm the MiniApp project installs `@codebolt/miniapp@0.1.2` or newer and the
package exposes `@codebolt/miniapp/bundle-cli`. Run package installation from
the MiniApp root, then retry.

## Bundle Upload Succeeds But Installation Fails

Check boundaries in order:

1. Edge deployment metadata has `type: miniappbundle`, `packageId`, and
   `miniappServerUrl`.
2. Edge, router, and MiniApp Server have the same internal token.
3. The MiniApp Server can read the package from R2.
4. The package manifest has `runtime.protocol: codebolt.fetch.v1` and a valid
   `mainModule`.
5. Install policy allows the current user.

Do not register a bundle as `platformworker` or infer type from its URL.

## Router Returns 401 Or 403

This can be correct:

- `private` allows only the owning user/workspace
- `authenticated` requires a signed-in CodeBolt user
- `public` permits anonymous runtime requests

Verify the install access separately from catalog `installPolicy`. Do not make a
private production install public merely for a smoke test without authorization.

## UI Loads But API Uses The Wrong Host

Search the built frontend for `localhost`, `workers.dev`, `codebolt.app`, or the
MiniApp Server URL. Use relative `/api/...` requests so local, dedicated, and
bundle routing all share the same app code.

## Data Appears Missing

Confirm the request uses the expected `installId` and `workspaceId`. Bundle
instances are isolated per installation and storage is centrally namespaced.
Do not add client-selected scope prefixes to compensate.
