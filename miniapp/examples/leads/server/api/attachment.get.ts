import { useMiniApp } from "@codebolt/miniapp";
import { defineHandler, getQuery } from "nitro/h3";

export default defineHandler(async (event) => {
  const key = String(getQuery(event).key ?? "");
  const blob = await useMiniApp(event).blob.get(key);
  if (!blob) {
    return { key, found: false };
  }
  return {
    key,
    found: true,
    contentType: blob.contentType,
    content: new TextDecoder().decode(blob.data),
  };
});

