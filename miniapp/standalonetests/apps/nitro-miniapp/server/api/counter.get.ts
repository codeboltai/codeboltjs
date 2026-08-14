import { defineHandler } from "nitro/h3";
import { useMiniApp } from "@codebolt/standalone-miniapp-nitro/runtime";

export default defineHandler(async (event) => {
  return await useMiniApp(event).db.get("state", "counter") ?? { id: "counter", value: 0 };
});
