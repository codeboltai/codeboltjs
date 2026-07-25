import { useMiniApp } from "@codebolt/miniapp";
import { defineHandler, getQuery } from "nitro/h3";

export default defineHandler(async (event) => {
  const { leadId } = getQuery(event);
  return {
    count: await useMiniApp(event).codebolt.tasks.count({
      entityType: "lead",
      entityId: String(leadId || ""),
    }),
  };
});

