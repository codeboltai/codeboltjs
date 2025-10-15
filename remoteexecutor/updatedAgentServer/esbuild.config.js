import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/server.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'dist/server.mjs',
  banner: {
    js: `#!/usr/bin/env node\nimport { createRequire } from 'module';\nconst require = createRequire(import.meta.url);`
  },
  // Obfuscation and Minification Options
  minify: true,
  treeShaking: true,
  keepNames: false,
  sourcemap: false, // Disable sourcemaps for production
  // drop: ['console', 'debugger'],
  legalComments: 'none',
  charset: 'utf8',
  external: ['node:events', 'node:stream', 'node:net', 'node:fs', 'node:path', 'node:child_process', 'node:os', 'node:util', 'node:url', 'node:buffer', 'node:crypto', 'node:http', 'node:https', 'node:zlib', 'node:readline', 'node:assert', 'node:tls', 'node:dns', 'node:querystring', 'node:vm', 'node:worker_threads', 'node:perf_hooks', 'node:async_hooks', 'node:process', 'node:console', 'node:module', 'node:v8', 'node:inspector', 'node:diagnostics_channel', 'node:trace_events', 'node:string_decoder', 'node:constants', 'node:domain', 'node:events', 'node:fs/promises', 'node:readline/promises']
}).catch(() => process.exit(1));