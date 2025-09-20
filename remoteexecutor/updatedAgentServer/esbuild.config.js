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
}).catch(() => process.exit(1));
