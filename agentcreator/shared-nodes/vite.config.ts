import { defineConfig } from 'vite';
import { resolve } from 'path';
import dts from 'vite-plugin-dts';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'AgentCreatorSharedNodes',
      fileName: (format) => `index.${format}.js`,
      formats: ['es']
    },
    rollupOptions: {
      external: ['@codebolt/litegraph'],
      output: {
        preserveModules: true,
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: false,
    minify: false
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  plugins: [
    dts({
      include: ['src/**/*'],
      exclude: ['**/*.test.*', '**/*.spec.*'],
      outDir: 'dist',
      insertTypesEntry: true,
      rollupTypes: true,
      outputDir: 'dist',
      entryRoot: 'src',
      fileName: 'index.d.ts'
    })
  ]
});