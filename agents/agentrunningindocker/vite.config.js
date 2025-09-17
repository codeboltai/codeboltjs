"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const path_1 = require("path");
exports.default = (0, vite_1.defineConfig)({
    build: {
        target: 'node18',
        lib: {
            entry: (0, path_1.resolve)(__dirname, 'src/index.ts'),
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
