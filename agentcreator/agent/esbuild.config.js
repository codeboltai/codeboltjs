import { build } from 'esbuild';
import { readFileSync, writeFileSync } from 'fs';

// Create a simple bundle configuration
const config = {
  entryPoints: ['src/agent.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  outfile: 'dist/agent-bundle.js',
  minify: false,
  sourcemap: false,
  external: [
  'fs', 'path', 'os', 'crypto', 'util', 'url', 'events', 'stream', 'buffer',
  'child_process', 'net', 'tls', 'http', 'https', 'ws', 'zlib', 'readline'
], // External Node.js built-ins
  treeShaking: true,
  metafile: true,
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  banner: {
    js: `#!/usr/bin/env node`
  }
};

// Build the bundle
async function buildBundle() {
  try {
    console.log('Building single file bundle...');

    const result = await build(config);

    // Make the output file executable
    const fs = await import('fs/promises');
    try {
      await fs.chmod('dist/agent-bundle.js', '755');
    } catch (err) {
      console.log('Could not make file executable:', err.message);
    }

    console.log('✅ Bundle created successfully: dist/agent-bundle.js');

    // Output bundle stats
    if (config.metafile && result.metafile) {
      const outputs = Object.keys(result.metafile.outputs);
      const bundleSize = result.metafile.outputs['dist/agent-bundle.js'].bytes;
      console.log(`📦 Bundle size: ${(bundleSize / 1024 / 1024).toFixed(2)} MB`);

      // List the biggest inputs
      const inputs = Object.entries(result.metafile.inputs)
        .sort(([,a], [,b]) => b.bytes - a.bytes)
        .slice(0, 10);

      console.log('\n📊 Largest dependencies:');
      inputs.forEach(([path, info]) => {
        console.log(`  ${path}: ${(info.bytes / 1024).toFixed(1)} KB`);
      });
    }

  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}

buildBundle();