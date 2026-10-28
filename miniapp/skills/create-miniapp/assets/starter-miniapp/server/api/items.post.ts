import { defineHandler, readBody } from "nitro/h3";
import { useMiniApp } from "@codebolt/miniapp";

export default defineHandler(async (event) => {
  const input = await readBody<{ title?: string }>(event);
  const title = input?.title?.trim();
  if (!title) {
    return new Response(JSON.stringify({ error: "title is required" }), {
      status: 400,
      headers: { "content-type": "application/json" },
    });
  }

  const item = {
    id: crypto.randomUUID(),
    title,
    createdAt: new Date().toISOString(),
  };
  return useMiniApp(event).db.set("items", item.id, item);
});
