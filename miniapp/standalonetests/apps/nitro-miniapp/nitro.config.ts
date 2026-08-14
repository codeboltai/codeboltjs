import { defineConfig } from "nitro";
import { standaloneMiniApp } from "@codebolt/standalone-miniapp-nitro/nitro";

export default defineConfig({
  preset: "cloudflare-module",
  compatibilityDate: "2026-07-29",
  serverDir: "server",
  output: { dir: "{{ rootDir }}/.output-miniapp" },
  modules: [
    standaloneMiniApp({
      id: "nitro-miniapp",
      title: "Nitro MiniApp",
      version: "0.1.0",
      capabilities: ["storage.documents", "storage.blobs"],
    }),
  ],
});
