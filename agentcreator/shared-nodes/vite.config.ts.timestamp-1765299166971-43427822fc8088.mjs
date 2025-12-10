// vite.config.ts
import { defineConfig } from "file:///Users/ravirawat/Documents/codeboltai/codeboltjs/node_modules/.pnpm/vite@5.4.20_@types+node@20.19.19_terser@5.44.0/node_modules/vite/dist/node/index.js";
import { resolve } from "path";
import dts from "file:///Users/ravirawat/Documents/codeboltai/codeboltjs/node_modules/.pnpm/vite-plugin-dts@4.5.4_@types+node@20.19.19_rollup@4.52.4_typescript@5.9.3_vite@5.4.20_@_a72f79e6a4b5ca2426f71dea0fd27587/node_modules/vite-plugin-dts/dist/index.mjs";
var __vite_injected_original_dirname = "/Users/ravirawat/Documents/codeboltai/codeboltjs/agentcreator/shared-nodes";
var vite_config_default = defineConfig({
  build: {
    lib: {
      entry: resolve(__vite_injected_original_dirname, "src/index.ts"),
      name: "AgentCreatorSharedNodes",
      fileName: (format) => `index.${format}.js`,
      formats: ["es"]
    },
    rollupOptions: {
      external: ["@codebolt/litegraph"],
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name].[ext]"
      }
    },
    outDir: "dist",
    emptyOutDir: true,
    sourcemap: false,
    minify: false
  },
  resolve: {
    alias: {
      "@": resolve(__vite_injected_original_dirname, "src")
    }
  },
  plugins: [
    dts({
      include: ["src/**/*"],
      exclude: ["**/*.test.*", "**/*.spec.*"],
      outDir: "dist",
      insertTypesEntry: true,
      rollupTypes: true,
      entryRoot: "src"
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvcmF2aXJhd2F0L0RvY3VtZW50cy9jb2RlYm9sdGFpL2NvZGVib2x0anMvYWdlbnRjcmVhdG9yL3NoYXJlZC1ub2Rlc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL3JhdmlyYXdhdC9Eb2N1bWVudHMvY29kZWJvbHRhaS9jb2RlYm9sdGpzL2FnZW50Y3JlYXRvci9zaGFyZWQtbm9kZXMvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL3JhdmlyYXdhdC9Eb2N1bWVudHMvY29kZWJvbHRhaS9jb2RlYm9sdGpzL2FnZW50Y3JlYXRvci9zaGFyZWQtbm9kZXMvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IHJlc29sdmUgfSBmcm9tICdwYXRoJztcbmltcG9ydCBkdHMgZnJvbSAndml0ZS1wbHVnaW4tZHRzJztcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgYnVpbGQ6IHtcbiAgICBsaWI6IHtcbiAgICAgIGVudHJ5OiByZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9pbmRleC50cycpLFxuICAgICAgbmFtZTogJ0FnZW50Q3JlYXRvclNoYXJlZE5vZGVzJyxcbiAgICAgIGZpbGVOYW1lOiAoZm9ybWF0KSA9PiBgaW5kZXguJHtmb3JtYXR9LmpzYCxcbiAgICAgIGZvcm1hdHM6IFsnZXMnXVxuICAgIH0sXG4gICAgcm9sbHVwT3B0aW9uczoge1xuICAgICAgZXh0ZXJuYWw6IFsnQGNvZGVib2x0L2xpdGVncmFwaCddLFxuICAgICAgb3V0cHV0OiB7XG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnW25hbWVdLmpzJyxcbiAgICAgICAgY2h1bmtGaWxlTmFtZXM6ICdbbmFtZV0uanMnLFxuICAgICAgICBhc3NldEZpbGVOYW1lczogJ1tuYW1lXS5bZXh0XSdcbiAgICAgIH1cbiAgICB9LFxuICAgIG91dERpcjogJ2Rpc3QnLFxuICAgIGVtcHR5T3V0RGlyOiB0cnVlLFxuICAgIHNvdXJjZW1hcDogZmFsc2UsXG4gICAgbWluaWZ5OiBmYWxzZVxuICB9LFxuICByZXNvbHZlOiB7XG4gICAgYWxpYXM6IHtcbiAgICAgICdAJzogcmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMnKVxuICAgIH1cbiAgfSxcbiAgcGx1Z2luczogW1xuICAgIGR0cyh7XG4gICAgICBpbmNsdWRlOiBbJ3NyYy8qKi8qJ10sXG4gICAgICBleGNsdWRlOiBbJyoqLyoudGVzdC4qJywgJyoqLyouc3BlYy4qJ10sXG4gICAgICBvdXREaXI6ICdkaXN0JyxcbiAgICAgIGluc2VydFR5cGVzRW50cnk6IHRydWUsXG4gICAgICByb2xsdXBUeXBlczogdHJ1ZSxcbiAgICAgIGVudHJ5Um9vdDogJ3NyYydcbiAgICB9KVxuICBdXG59KTsiXSwKICAibWFwcGluZ3MiOiAiO0FBQWdaLFNBQVMsb0JBQW9CO0FBQzdhLFNBQVMsZUFBZTtBQUN4QixPQUFPLFNBQVM7QUFGaEIsSUFBTSxtQ0FBbUM7QUFJekMsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsT0FBTztBQUFBLElBQ0wsS0FBSztBQUFBLE1BQ0gsT0FBTyxRQUFRLGtDQUFXLGNBQWM7QUFBQSxNQUN4QyxNQUFNO0FBQUEsTUFDTixVQUFVLENBQUMsV0FBVyxTQUFTLE1BQU07QUFBQSxNQUNyQyxTQUFTLENBQUMsSUFBSTtBQUFBLElBQ2hCO0FBQUEsSUFDQSxlQUFlO0FBQUEsTUFDYixVQUFVLENBQUMscUJBQXFCO0FBQUEsTUFDaEMsUUFBUTtBQUFBLFFBQ04sZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsUUFDaEIsZ0JBQWdCO0FBQUEsTUFDbEI7QUFBQSxJQUNGO0FBQUEsSUFDQSxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsSUFDYixXQUFXO0FBQUEsSUFDWCxRQUFRO0FBQUEsRUFDVjtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxRQUFRLGtDQUFXLEtBQUs7QUFBQSxJQUMvQjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLFNBQVM7QUFBQSxJQUNQLElBQUk7QUFBQSxNQUNGLFNBQVMsQ0FBQyxVQUFVO0FBQUEsTUFDcEIsU0FBUyxDQUFDLGVBQWUsYUFBYTtBQUFBLE1BQ3RDLFFBQVE7QUFBQSxNQUNSLGtCQUFrQjtBQUFBLE1BQ2xCLGFBQWE7QUFBQSxNQUNiLFdBQVc7QUFBQSxJQUNiLENBQUM7QUFBQSxFQUNIO0FBQ0YsQ0FBQzsiLAogICJuYW1lcyI6IFtdCn0K
