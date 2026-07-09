import { z } from "zod";
import { agentPlanSchema, inspectionSchema, type AgentPlan } from "../artifacts";
import { runSubAgentPhase } from "./subagent";

const { createTool } = require("@codebolt/agent/unified/tools") as typeof import("@codebolt/agent/unified/tools");
const { getModuleManifest } = require("@codebolt/api-docs-index") as typeof import("@codebolt/api-docs-index");

const codebolt = require("@codebolt/codeboltjs");

const PLAN_INSTRUCTIONS = `You are the planning phase of the CodeBolt Creation Agent.

Produce a user-facing plan for the requested CodeBolt agent. The plan is written at CAPABILITY level:
- Describe WHAT the agent does, not which APIs it calls. Do not mention module or API names in capabilities.
- Choose agentType: "procedural" (fixed workflow of SDK calls, no internal reasoning loop) or "llm-loop" (createAgent loop with tools) based on whether the agent needs model reasoning at runtime.
- mermaidFlow must be a valid mermaid flowchart (flowchart TD) of the agent's runtime behavior that a non-programmer can follow.
- List every file the generated project will contain (src/index.ts, codeboltagent.yaml, package.json, tsconfig.json, webpack.config.js, README.md).
- Record assumptions explicitly; they are shown to the user for correction.

The module catalogue below tells you what the CodeBolt platform can do, so you can judge feasibility. Use it for scoping only - capabilities stay API-free.

<module_catalogue>
{{MANIFEST}}
</module_catalogue>`;

function renderPlanForUser(plan: AgentPlan): string {
  const lines = [
    `## Plan: ${plan.title} (\`${plan.agentId}\`)`,
    "",
    plan.purpose,
    "",
    `**Type:** ${plan.agentType} - **Trigger:** ${plan.trigger}`,
    "",
    "```mermaid",
    plan.mermaidFlow.trim(),
    "```",
    "",
    "**Capabilities:**",
    ...plan.capabilities.map((capability) => `- ${capability}`),
    "",
    `**Files:** ${plan.files.join(", ")}`,
  ];

  if (plan.assumptions.length > 0) {
    lines.push("", "**Assumptions / open questions:**", ...plan.assumptions.map((assumption) => `- ${assumption}`));
  }

  return lines.join("\n");
}

export const planAgentTool = createTool({
  id: "plan_agent",
  description: "Phase 1: produce a capability-level plan for the requested agent (purpose, type, mermaid flow, capabilities, files) and show it to the user for confirmation. Returns the plan plus the user's decision. Always the first step for a non-trivial create request.",
  inputSchema: z.object({
    userRequest: z.string().describe("The user's agent request, verbatim plus any clarifications."),
    inspection: inspectionSchema.optional().describe("Inspection artifact when updating an existing agent."),
    revisionFeedback: z.string().optional().describe("User feedback from a previously rejected plan."),
  }),
  execute: async ({ input }: { input: { userRequest: string; inspection?: unknown; revisionFeedback?: string } }) => {
    const taskSections = [`<user_request>\n${input.userRequest}\n</user_request>`];
    if (input.inspection) {
      taskSections.push(`<existing_agent_inspection>\n${JSON.stringify(input.inspection, null, 2)}\n</existing_agent_inspection>\nThis is an UPDATE: plan the changed behavior, keeping the existing agentId and structure unless the user asked otherwise.`);
    }
    if (input.revisionFeedback) {
      taskSections.push(`<user_feedback_on_previous_plan>\n${input.revisionFeedback}\n</user_feedback_on_previous_plan>`);
    }

    const plan = await runSubAgentPhase({
      phaseName: "plan",
      instructions: PLAN_INSTRUCTIONS.replace("{{MANIFEST}}", getModuleManifest({ includeMethods: false })),
      task: taskSections.join("\n\n"),
      artifactSchema: agentPlanSchema,
      maxTurns: 3,
    });

    // Deterministic checkpoint: the user sees and approves the plan here, in code,
    // rather than trusting the orchestrator prompt to remember to ask.
    const planText = renderPlanForUser(plan);
    const decision = await codebolt.chat.sendConfirmationRequest(
      `${planText}\n\nProceed with building this agent?`,
      ["Proceed", "Revise"],
      true,
    );

    const approved = typeof decision === "string" && decision.trim().toLowerCase().startsWith("proceed");
    return {
      approved,
      userResponse: decision,
      plan,
    };
  },
});
