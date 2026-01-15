#!/usr/bin/env node

import { build } from 'esbuild';
import { readFileSync, writeFileSync, copyFileSync, unlinkSync } from 'fs';
import { execSync } from 'child_process';

async function createSingleFileBundle() {
  console.log('🔨 Creating single-file bundle with all dependencies...');

  try {
    // First build with esbuild
    console.log('📦 Building with esbuild...');
    await build({
      entryPoints: ['src/agent.ts'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'cjs', // Use CommonJS format
      outfile: 'dist/agent-temp.js',
      minify: false,
      sourcemap: false,
      external: [], // Bundle everything for now
      treeShaking: true,
      define: {
        'process.env.NODE_ENV': '"production"',
        'global': 'globalThis'
      }
    });

    console.log('✅ Temporary bundle created');

    // Read the temporary bundle
    const tempContent = readFileSync('dist/agent-temp.js', 'utf8');

    // Create the final single file with necessary polyfills and module resolution
    const finalContent = `#!/usr/bin/env node

// Node.js polyfills and global setup
if (typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis;
}

// Polyfill import.meta.url for CommonJS
if (typeof import.meta === 'undefined') {
  global.import = {
    meta: {
      url: 'file://' + process.cwd() + '/dist/agent-single-file.cjs'
    }
  };
}

// WebSocket polyfill wrapper
try {
  var WebSocket = require('ws');
  global.WebSocket = WebSocket;
} catch (e) {
  console.log('WebSocket module not available, some features may not work');
}

// Dynamic require polyfill to handle modules that weren't bundled
const originalRequire = require;
global.require = function(module) {
  // Try to require normally first
  try {
    return originalRequire(module);
  } catch (e) {
    // Handle some common cases
    if (module === 'ws') {
      return global.WebSocket;
    }
    throw e;
  }
};

// Make process.env available
if (typeof process === 'undefined') {
  global.process = { env: {}, platform: 'node' };
}

// Start of bundled code
${tempContent}
`;

    // Write the final bundle
    writeFileSync('dist/agent-single-file.cjs', finalContent);

    // Clean up temp file
    unlinkSync('dist/agent-temp.js');

    // Make it executable
    try {
      execSync('chmod +x dist/agent-single-file.cjs');
    } catch (e) {
      console.log('Could not make file executable');
    }

    // Get file size
    const stats = readFileSync('dist/agent-single-file.cjs');
    const sizeInMB = (stats.length / 1024 / 1024).toFixed(2);

    console.log(`✅ Single file bundle created: dist/agent-single-file.cjs`);
    console.log(`📦 Bundle size: ${sizeInMB} MB`);
    console.log('');
    console.log('🚀 Usage:');
    console.log('  # Run with default data.json');
    console.log('  node dist/agent-single-file.cjs');
    console.log('');
    console.log('  # Run with custom data file');
    console.log('  AGENT_FLOW_PATH=custom-data.json node dist/agent-single-file.cjs');

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

createSingleFileBundle();