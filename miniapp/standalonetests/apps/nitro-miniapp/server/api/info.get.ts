import { defineHandler } from "nitro/h3";
import { useMiniApp } from "@codebolt/standalone-miniapp-nitro/runtime";

export default defineHandler((event) => ({
  title: "Nitro MiniApp",
  instance: useMiniApp(event).instance,
}));
