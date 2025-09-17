import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    target: 'node18',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'SampleCodeboltClient',
      fileName: 'sampleclient',
      formats: ['cjs']
    },
    outDir: 'dist/bundle',
    rollupOptions: {
      external: [
        // Mark Node.js built-ins as external
        'fs', 'path', 'crypto', 'http', 'https', 'url', 'events',
        'stream', 'util', 'os', 'child_process', 'cluster',
        // Mark dependencies as external
        'ws', 'uuid', '@codebolt/shared-types'
      ],
      output: {
        format: 'cjs',
        entryFileNames: 'sampleclient.js',
        banner: '#!/usr/bin/env node',
      }
    },
    minify: true,
    sourcemap: false,
    emptyOutDir: false,
  },
  define: {
    'process.env.NODE_ENV': '"production"'
  },
  esbuild: {
    platform: 'node',
    target: 'node18',
    format: 'cjs'
  }
});