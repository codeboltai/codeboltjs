import { useMiniApp } from "@codebolt/miniapp-sdk";
import { defineHandler, readBody } from "nitro/h3";

export default defineHandler(async (event) => {
  const input = await readBody(event);
  const data = new TextEncoder().encode(String(input.content ?? ""));
  await useMiniApp(event).blob.put(input.key, data, {
    contentType: input.contentType || "text/plain",
  });
  return { key: input.key, size: data.byteLength };
});
