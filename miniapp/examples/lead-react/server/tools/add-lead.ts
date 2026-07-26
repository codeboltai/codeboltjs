import { defineTool } from "@codebolt/miniapp";

export default defineTool<{
  id: string;
  name: string;
  company: string;
  email?: string;
}>({
  name: "add-lead",
  description: "Store a lead from the React MiniApp.",
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
  handler: (context, input) => context.db.set("leads", input.id, input),
});
