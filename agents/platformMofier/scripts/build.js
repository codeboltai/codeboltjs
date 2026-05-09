const { spawnSync } = require('child_process');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');

for (const script of ['build-agent.js', 'build-actionblocks.js']) {
  const result = spawnSync(process.execPath, [path.join(rootDir, 'scripts', script)], {
    cwd: rootDir,
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}
