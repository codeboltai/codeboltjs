import { defineHandler } from "nitro/h3";
import { useMiniApp } from "@codebolt/standalone-miniapp-nitro/runtime";

export default defineHandler(async (event) => {
  const db = useMiniApp(event).db;
  const current = await db.get("state", "counter");
  return db.set("state", "counter", { value: Number(current?.value ?? 0) + 1 });
});
