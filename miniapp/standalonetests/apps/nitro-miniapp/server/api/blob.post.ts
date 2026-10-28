import { defineHandler, readBody } from "nitro/h3";
import { useMiniApp } from "@codebolt/standalone-miniapp-nitro/runtime";

export default defineHandler(async (event) => {
  const body = await readBody<{ key?: string; value?: string }>(event);
  const key = body.key ?? "note.txt";
  await useMiniApp(event).blob.put(key, new TextEncoder().encode(body.value ?? "hello from Nitro"), { contentType: "text/plain; charset=utf-8" });
  return { stored: true, key };
});
