import { defineConfig } from "nitro";
import { resolveTarget } from "../../packages/miniapp/src/nitro";

export default defineConfig({
  ...resolveTarget("local"),
  compatibilityDate: "2026-07-24",
  serverDir: "server",
});
