import { defineHandler } from "nitro/h3";
import { useMiniApp } from "@codebolt/miniapp";

export default defineHandler((event) => {
  return useMiniApp(event).db.list("items", { limit: 100 });
});
