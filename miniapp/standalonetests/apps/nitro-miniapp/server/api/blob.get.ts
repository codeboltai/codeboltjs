import { defineHandler, getQuery } from "nitro/h3";
import { useMiniApp } from "@codebolt/standalone-miniapp-nitro/runtime";

export default defineHandler(async (event) => {
  const key = String(getQuery(event).key ?? "note.txt");
  const blob = await useMiniApp(event).blob.get(key);
  if (!blob) return null;
  return { key: blob.key, value: new TextDecoder().decode(blob.data), contentType: blob.contentType };
});
