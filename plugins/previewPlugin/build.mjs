import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const requireFromRepo = createRequire(path.resolve(__dirname, '../../../CodeBolt/package.json'));
const { build } = requireFromRepo('esbuild');

await build({
  entryPoints: [path.join(__dirname, 'src', 'index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: path.join(__dirname, 'dist', 'index.js'),
  minify: false,
  sourcemap: true,
  external: [],
});

console.log('Build complete - dist/index.js is bundled CommonJS.');
