const fs = require('fs');
const path = require('path');
const { transpileFile } = require('./transpile-typescript');

const blockDir = path.resolve(process.argv[2] || process.cwd());
const srcIndex = path.join(blockDir, 'src', 'index.ts');
const manifest = path.join(blockDir, 'actionblock.yml');
const distDir = path.join(blockDir, 'dist');

if (!fs.existsSync(srcIndex)) {
  throw new Error(`Missing ${srcIndex}`);
}
if (!fs.existsSync(manifest)) {
  throw new Error(`Missing ${manifest}`);
}

fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });
transpileFile(srcIndex, path.join(distDir, 'index.js'));
fs.copyFileSync(manifest, path.join(distDir, 'actionblock.yml'));

console.log(`[platformMofier] built ${path.relative(path.resolve(__dirname, '..'), blockDir)}`);
