import { useMiniApp } from "@codebolt/miniapp-sdk";
import { defineHandler, readBody } from "nitro/h3";

export default defineHandler(async (event) => {
  const input = await readBody(event);
  const id = input.id || crypto.randomUUID();
  return useMiniApp(event).db.set("leads", id, {
    name: input.name,
    company: input.company,
    email: input.email,
  });
});
