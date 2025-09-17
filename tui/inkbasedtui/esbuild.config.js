import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  format: 'esm',
  outfile: 'dist/index.mjs',
  external: [
    // Only Node.js built-ins, bundle everything else
    'assert', 'buffer', 'child_process', 'cluster', 'crypto', 'dns', 'events', 
    'fs', 'http', 'https', 'net', 'os', 'path', 'querystring', 'readline', 
    'stream', 'string_decoder', 'tls', 'tty', 'url', 'util', 'v8', 'vm', 
    'worker_threads', 'zlib', 'constants', 'module', 'perf_hooks', 'process',
    // Node.js built-ins with node: prefix
    'node:assert', 'node:buffer', 'node:child_process', 'node:cluster', 'node:crypto',
    'node:dns', 'node:events', 'node:fs', 'node:http', 'node:https', 'node:net',
    'node:os', 'node:path', 'node:querystring', 'node:readline', 'node:stream',
    'node:string_decoder', 'node:tls', 'node:tty', 'node:url', 'node:util',
    'node:v8', 'node:vm', 'node:worker_threads', 'node:zlib', 'node:constants',
    'node:module', 'node:perf_hooks', 'node:process'
  ],
  banner: {
    js: `import { createRequire } from 'module';
const require = createRequire(import.meta.url);`
  },
  minify: true,
  keepNames: false,
  treeShaking: true,
  target: 'node20',
  sourcemap: false,
  // Advanced obfuscation options
  mangleProps: /^_/,
  reserveProps: /^__/,
  drop: ['console', 'debugger'],
  dropLabels: ['DEV'],
  legalComments: 'none',
  charset: 'utf8'
}).catch(() => process.exit(1));