import { defineTool } from "@codebolt/miniapp-sdk";

export default defineTool<{ employeeId: string; step: string }>({
  name: "complete-step",
  description: "Mark an employee onboarding step complete.",
  inputSchema: {
    type: "object",
    additionalProperties: false,
    required: ["employeeId", "step"],
    properties: {
      employeeId: { type: "string", minLength: 1 },
      step: { type: "string", minLength: 1 },
    },
  },
  async handler(context, input) {
    const employee = await context.db.get("employees", input.employeeId);
    if (!employee) throw new Error("EMPLOYEE_NOT_FOUND");
    const completed = [...new Set([...(employee.completed as string[]), input.step])];
    return context.db.set("employees", input.employeeId, { ...employee, completed });
  },
});
