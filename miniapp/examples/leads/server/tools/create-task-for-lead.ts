import { defineTool } from "@codebolt/miniapp-sdk";

export default defineTool<{ leadId: string; title: string }>({
  name: "create-task-for-lead",
  description: "Create a CodeBolt task associated with a lead.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["leadId", "title"],
    properties: {
      leadId: { type: "string", minLength: 1 },
      title: { type: "string", minLength: 1 },
    },
  },
  async handler(context, input) {
    const lead = await context.db.get("leads", input.leadId);
    if (!lead) {
      throw new Error("LEAD_NOT_FOUND");
    }
    return context.codebolt.tasks.create({
      title: input.title,
      entityType: "lead",
      entityId: input.leadId,
    });
  },
});
