const path = require('path');

// Resolve esbuild - try normal require first, fall back to pnpm store
let esbuild;
try {
  esbuild = require('esbuild');
} catch {
  // In pnpm monorepo, esbuild may not be directly linked - find it in the store
  const { execSync } = require('child_process');
  try {
    const esbuildPath = execSync('node -e "console.log(require.resolve(\'esbuild\', { paths: [process.cwd(), path.join(process.cwd(), \'../../\')] }))"', {
      cwd: __dirname, encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe']
    }).trim();
    esbuild = require(esbuildPath);
  } catch {
    // Last resort: find esbuild in the pnpm store
    const fs = require('fs');
    const monorepoRoot = path.resolve(__dirname, '../..');
    const pnpmStore = path.join(monorepoRoot, 'node_modules', '.pnpm');
    const esbuildDirs = fs.readdirSync(pnpmStore).filter(d => d.startsWith('esbuild@')).sort().reverse();
    if (esbuildDirs.length > 0) {
      esbuild = require(path.join(pnpmStore, esbuildDirs[0], 'node_modules', 'esbuild'));
    } else {
      console.error('Could not find esbuild. Run: pnpm add -D esbuild');
      process.exit(1);
    }
  }
}

async function build() {
  try {
    await esbuild.build({
      entryPoints: [path.resolve(__dirname, 'src/index.ts')],
      bundle: true,
      outfile: path.resolve(__dirname, 'dist/index.js'),
      platform: 'node',
      target: 'node18',
      format: 'cjs',
      sourcemap: false,
      minify: false,
      external: [
        // Node.js built-in modules only - everything else gets bundled
        'fs', 'path', 'http', 'https', 'net', 'tls', 'crypto', 'stream',
        'events', 'util', 'os', 'url', 'querystring', 'zlib', 'child_process',
        'dns', 'http2', 'assert', 'buffer', 'console', 'constants', 'domain',
        'module', 'process', 'punycode', 'readline', 'repl', 'string_decoder',
        'sys', 'timers', 'tty', 'vm', 'worker_threads'
      ],
      define: {
        'process.env.NODE_ENV': '"production"'
      },
      loader: {
        '.ts': 'ts'
      },
      tsconfig: path.resolve(__dirname, 'tsconfig.json'),
      logLevel: 'info'
    });

    console.log('Build completed successfully');
  } catch (error) {
    console.error('Build failed:', error);
    process.exit(1);
  }
}

build();
