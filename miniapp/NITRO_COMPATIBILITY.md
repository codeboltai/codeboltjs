# Nitro v3 Compatibility Ledger

Pinned version: `nitro@3.0.260610-beta`

| Surface | Status | Usage | Verification |
| --- | --- | --- | --- |
| `defineConfig` from `nitro` | Documented | Example and gate configuration | Both example builds |
| `standard` preset | Built in and recommended | Fetch-compatible local output without `listen()` | Gate 1 |
| `NitroModule` and `modules` | Documented | CodeBolt scanning and manifest module | Example builds |
| `nitro.options.virtual` | Documented configuration | Generated tool registry | Tool invocation test |
| `nitro.options.handlers` | Documented configuration | Internal generated tool route | Tool invocation test |
| `compiled` hook | Public typed hook | Emit `miniapp.manifest.json` | Manifest discovery test |
| `serverDir` | Documented | Scan `tools`, `collections`, and `views` | Example manifests |
| `nitro/h3` handlers | Documented | Example APIs and generated tool handler | Integration tests |

External Nitro preset registration is intentionally not used. Nitro v3 recommends
built-in presets, and `standard` already emits the required fetch contract. The
CodeBolt local preset package is a configuration adapter around that built-in preset.
