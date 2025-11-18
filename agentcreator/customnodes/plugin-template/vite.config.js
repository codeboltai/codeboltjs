import { defineConfig } from 'vite';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  build: {
    lib: {
      entry: {
        ui: resolve(__dirname, 'src/ui/index.ts'),
        backend: resolve(__dirname, 'src/backend/index.ts')
      },
      formats: ['es'],
      fileName: (format, entryName) => `${entryName}.js`
    },
    rollupOptions: {
      external: [
        '@codebolt/litegraph',
        // Add other shared dependencies that should be external
      ],
      output: {
        globals: {
          '@codebolt/litegraph': 'LiteGraph'
        }
      }
    },
    target: 'es2020',
    minify: false, // Keep unminified for debugging
    sourcemap: true
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
});