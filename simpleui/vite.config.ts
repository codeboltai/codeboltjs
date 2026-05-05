import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  base: '/ui/',
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    postcss: './postcss.config.cjs',
  },
  server: {
    port: 3001,
    proxy: {
      '/api': 'http://localhost:12345',
      '/chat': { target: 'ws://localhost:12345', ws: true },
      '/editor': { target: 'ws://localhost:12345', ws: true },
      '/orchestrator-ws': { target: 'ws://localhost:12345', ws: true },
      '/swarm': { target: 'ws://localhost:12345', ws: true },
      '/environment-ws': { target: 'ws://localhost:12345', ws: true },
      '/tasks-socket': { target: 'ws://localhost:12345', ws: true },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-popover', '@radix-ui/react-tooltip', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
