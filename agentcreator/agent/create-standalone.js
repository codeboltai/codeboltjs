#!/usr/bin/env node

import { build } from 'esbuild';
import { readFileSync, writeFileSync, unlinkSync, mkdirSync, existsSync, copyFileSync } from 'fs';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function createStandaloneAgent() {
  console.log('🔨 Creating standalone single-file agent bundle...');

  try {
    // Build with esbuild to create a single CommonJS file
    console.log('📦 Building with esbuild...');

    await build({
      entryPoints: ['src/agent.ts'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      format: 'cjs',
      outfile: 'dist/index-temp.cjs',
      minify: false,
      sourcemap: false,
      external: [], // Bundle everything except Node.js built-ins
      treeShaking: true,
      define: {
        'process.env.NODE_ENV': '"production"',
      }
    });

    console.log('✅ Temporary bundle created');

    // Read the temporary bundle
    let tempContent = readFileSync('dist/index-temp.cjs', 'utf8');

    // Replace import_meta.url with __filename (CommonJS compatible)
    // esbuild creates: var import_meta = {}; var __filename = fileURLToPath(import_meta.url);
    // We need to replace import_meta.url with __filename
    tempContent = tempContent.replace(
      /var __filename = \(0, import_url\.fileURLToPath\)\(import_meta\.url\);/g,
      'var __filename = typeof __filename !== "undefined" ? __filename : require("url").fileURLToPath("file://" + __dirname + "/index.cjs");'
    );

    // Also replace any other import_meta.url references
    tempContent = tempContent.replace(/import_meta\.url/g, '"file://" + __filename');

    // Create the final single file with shebang and polyfills
    const finalContent = `#!/usr/bin/env node

// ========================================
// SINGLE FILE AGENT BUNDLE
// All dependencies included - Node.js built-ins are external
// No npm install required
// ========================================

// Polyfills and setup for CommonJS
if (typeof globalThis.window === 'undefined') {
  globalThis.window = globalThis;
}

// Override require to provide WebSocket polyfill
const originalRequire = require;
require = function(id) {
  if (id === 'ws') {
    try {
      return originalRequire('ws');
    } catch (e) {
      console.log('Warning: WebSocket (ws) module not found - providing polyfill...');
      // Provide minimal WebSocket polyfill
      return {
        WebSocket: class {
          constructor() { this.readyState = 1; }
          addEventListener() {}
          send() {}
          close() {}
        }
      };
    }
  }
  return originalRequire(id);
};

// Get WebSocket using our patched require
let WebSocket;
try {
  WebSocket = require('ws').WebSocket;
} catch (e) {
  // This should not happen with our require override, but just in case
  WebSocket = class {
    constructor() { this.readyState = 1; }
    addEventListener() {}
    send() {}
    close() {}
  };
}

// Make WebSocket globally available
global.WebSocket = WebSocket;

// Ensure process is available
if (typeof process === 'undefined') {
  global.process = {
    env: {},
    cwd: () => '.',
    platform: 'node',
    argv: []
  };
}

// ========================================
// START OF BUNDLED AGENT CODE
// ========================================

${tempContent}
`;

    // Write the final bundle
    writeFileSync('dist/index.cjs', finalContent);

    // Clean up temp file
    unlinkSync('dist/index-temp.cjs');

    // Make it executable
    try {
      execSync('chmod +x dist/index.cjs');
    } catch (e) {
      console.log('Could not make file executable');
    }

    // Copy data.json to dist if it exists
    if (existsSync('test/readFileGraph.json')) {
      copyFileSync('test/readFileGraph.json', 'dist/data.json');
      console.log('✅ Copied test data to dist/data.json');
    }

    // Get file size
    const stats = readFileSync('dist/index.cjs');
    const sizeInMB = (stats.length / 1024 / 1024).toFixed(2);

    console.log(`✅ Single file bundle created: dist/index.cjs`);
    console.log(`📦 Bundle size: ${sizeInMB} MB`);
    console.log('');
    console.log('🚀 Usage:');
    console.log('  # Run with default data.json in same directory');
    console.log('  node dist/index.cjs');
    console.log('');
    console.log('  # Run with custom data file');
    console.log('  agentFlowPath=custom-data.json node dist/index.cjs');
    console.log('');
    console.log('📋 You can now move dist/index.cjs and dist/data.json anywhere!');

  } catch (error) {
    console.error('❌ Build failed:', error);
    console.error(error.stack);
    process.exit(1);
  }
}

createStandaloneAgent();