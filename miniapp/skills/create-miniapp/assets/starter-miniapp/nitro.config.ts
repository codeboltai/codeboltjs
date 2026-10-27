import { defineConfig } from "nitro";
import { codeboltMiniApp, resolveTarget } from "@codebolt/miniapp/nitro";

export default defineConfig({
  ...resolveTarget(),
  compatibilityDate: "2026-07-24",
  serverDir: "server",
  modules: [
    codeboltMiniApp({
      id: "starter-miniapp",
      title: "Starter MiniApp",
      version: "0.1.0",
      description: "A minimal full-stack CodeBolt MiniApp.",
      route: "/",
      installPolicy: "developer_only",
      defaultAccess: "private",
    }),
  ],
});
