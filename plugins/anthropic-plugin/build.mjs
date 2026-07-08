import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { build } from 'esbuild';

const localOutfile = 'dist/index.js';
const deployedPluginDirs = [
  path.join(os.homedir(), '.codebolt', 'plugins', 'anthropic-plugin'),
  path.join(os.homedir(), '.codebolt', 'plugin', 'anthropic-plugin'),
];

const filesToSync = ['package.json', 'package-lock.json', 'tsconfig.json', 'build.mjs'];
const directoriesToSync = ['src', 'dist'];

function syncPath(deployedPluginDir, relativePath) {
  const sourcePath = path.resolve(relativePath);
  const destinationPath = path.join(deployedPluginDir, relativePath);
  fs.mkdirSync(path.dirname(destinationPath), { recursive: true });
  fs.cpSync(sourcePath, destinationPath, {
    recursive: true,
    force: true,
  });
}

await build({
  entryPoints: ['src/index.ts'],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: localOutfile,
  external: [],
  minify: false,
  sourcemap: true,
});

for (const deployedPluginDir of deployedPluginDirs) {
  const deployedOutfile = path.join(deployedPluginDir, 'dist', 'index.js');
  fs.mkdirSync(path.dirname(deployedOutfile), { recursive: true });

  for (const file of filesToSync) {
    syncPath(deployedPluginDir, file);
  }

  for (const directory of directoriesToSync) {
    syncPath(deployedPluginDir, directory);
  }
}

console.log(`Build complete - synced plugin to: ${deployedPluginDirs.join(', ')}`);
