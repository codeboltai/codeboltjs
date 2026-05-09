const fs = require('fs');
const path = require('path');
const { transpileFile } = require('./transpile-typescript');

const rootDir = path.resolve(__dirname, '..');
const actionBlocksDir = path.join(rootDir, 'action-blocks');

const entries = fs.readdirSync(actionBlocksDir, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && entry.name !== 'shared');

for (const entry of entries) {
  const blockDir = path.join(actionBlocksDir, entry.name);
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
  console.log(`[platformMofier] built action-blocks/${entry.name}`);
}
