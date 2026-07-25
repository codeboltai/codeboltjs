import { defineTool } from "@codebolt/miniapp-sdk";

export default defineTool<{
  id: string;
  name: string;
  company: string;
  email?: string;
}>({
  name: "add-lead",
  description: "Store a discovered lead in the shared lead depository.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["id", "name", "company"],
    properties: {
      id: { type: "string", minLength: 1 },
      name: { type: "string", minLength: 1 },
      company: { type: "string", minLength: 1 },
      email: { type: "string" },
    },
  },
  async handler(context, input) {
    return context.db.set("leads", input.id, input);
  },
});
