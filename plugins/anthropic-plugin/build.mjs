import { build } from 'esbuild';

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: 'dist/index.js',
  external: [],
  minify: false,
  sourcemap: true,
});

console.log('Build complete — dist/index.js is self-contained');
