import { defineTool } from "@codebolt/miniapp-sdk";

export default defineTool<{ id: string; name: string; role: string }>({
  name: "add-employee",
  description: "Add an employee to the onboarding cycle.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["id", "name", "role"],
    properties: {
      id: { type: "string", minLength: 1 },
      name: { type: "string", minLength: 1 },
      role: { type: "string", minLength: 1 },
    },
  },
  handler: (context, input) =>
    context.db.set("employees", input.id, { ...input, completed: [] }),
});
