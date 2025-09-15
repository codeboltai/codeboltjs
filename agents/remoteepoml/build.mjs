
import esbuild from 'esbuild';

esbuild.build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outfile: 'dist/index.js',
  format: 'cjs',
  external: [
    'bufferutil', 
    'utf-8-validate',
    '@swc/wasm'
  ],
}).catch(() => process.exit(1));
