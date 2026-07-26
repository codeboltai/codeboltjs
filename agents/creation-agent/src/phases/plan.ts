import { z } from "zod";
import { agentPlanSchema, creationPlanSchema, inspectionSchema, type AgentPlan, type CreationPlan } from "../artifacts";
import { runSubAgentPhase } from "./subagent";

const { createTool } = require("@codebolt/agent/unified/tools") as typeof import("@codebolt/agent/unified/tools");
const { getModuleManifest } = require("@codebolt/api-docs-index") as typeof import("@codebolt/api-docs-index");

const codebolt = require("@codebolt/codeboltjs");

interface ConfirmationResponseEnvelope {
  answer?: unknown;
  feedback?: unknown;
  userMessage?: unknown;
  message?: unknown;
  value?: unknown;
  label?: unknown;
  data?: {
    answer?: unknown;
    feedback?: unknown;
    value?: unknown;
    label?: unknown;
  };
}

const APPROVAL_RESPONSES = new Set(["proceed", "process", "approve", "approved", "confirm", "confirmed", "yes"]);

function stringFromUnknown(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeConfirmationResponse(response: unknown): string {
  if (typeof response === "string") {
    return response.trim();
  }

  if (!response || typeof response !== "object") {
    return "";
  }

  const confirmation = response as ConfirmationResponseEnvelope;
  return (
    stringFromUnknown(confirmation.answer) ||
    stringFromUnknown(confirmation.feedback) ||
    stringFromUnknown(confirmation.userMessage) ||
    stringFromUnknown(confirmation.message) ||
    stringFromUnknown(confirmation.value) ||
    stringFromUnknown(confirmation.label) ||
    stringFromUnknown(confirmation.data?.answer) ||
    stringFromUnknown(confirmation.data?.feedback) ||
    stringFromUnknown(confirmation.data?.value) ||
    stringFromUnknown(confirmation.data?.label)
  );
}

function isPlanApproved(response: unknown): boolean {
  const normalized = normalizeConfirmationResponse(response).toLowerCase();
  if (!normalized) return false;

  const firstWord = normalized.split(/\s+/, 1)[0];
  return APPROVAL_RESPONSES.has(firstWord);
}

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



const CREATION_PLAN_INSTRUCTIONS = `You are the planning phase of the CodeBolt Creation Agent.

Produce a user-facing plan for the requested CodeBolt extension. The target can be an agent, plugin, dynamic-plugin, provider, or actionblock.

Rules:
- Return exactly one fenced json artifact and no prose outside the final fenced block.
- The artifact must match the CreationPlan schema exactly. Do not add manifest, panel, package, permissions, ui, invocation, dataSource, settings, activationEvents, entry, displayName, description, summary, or per-file purpose fields.
- Use title, not displayName. Use purpose, not description or summary.
- files must be an array of string paths only, not objects.
- pluginConfig is plan-level only: it may contain only pluginType, commands, tools, and hasUi.
- Set targetKind exactly: "agent", "plugin", "dynamic-plugin", "provider", or "actionblock".
- Use targetId as the stable kebab-case folder/package id.
- Describe WHAT the target does, not which APIs it calls. Do not mention module or API names in capabilities.
- mermaidFlow must be a valid mermaid flowchart (flowchart TD) of the runtime/load/execution behavior.
- List every file the generated project will contain.
- Fill only the config object that matches targetKind: agentConfig, pluginConfig, providerConfig, or actionBlockConfig.
- For dynamic plugins use targetKind "dynamic-plugin" and pluginConfig.pluginType "dynamic".
- For dashboard, workflow, monitor, inspector, status, or control-panel plugins that fetch live data, handle UI button actions, run commands, or push panel updates, use targetKind "dynamic-plugin" and pluginConfig.pluginType "dynamic".
- Record assumptions explicitly; they are shown to the user for correction.

Required JSON shape examples:

Dynamic panel plugin:
<dynamic_plugin_example_json>
{
  "targetKind": "dynamic-plugin",
  "targetId": "task-dashboard-panel",
  "title": "Task Dashboard Panel",
  "purpose": "A dynamic CodeBolt plugin panel that shows workspace tasks grouped by status and lets the user refresh the task list.",
  "trigger": "User opens the plugin panel and can refresh task data from the UI.",
  "mermaidFlow": "flowchart TD\n  A[User opens panel] --> B[Plugin loads dashboard]\n  B --> C[Fetch task data]\n  C --> D[Group tasks by status]\n  D --> E[Render dashboard]\n  E --> F{Refresh clicked?}\n  F -->|Yes| C\n  F -->|No| E",
  "capabilities": [
    "Open an interactive dashboard panel.",
    "Fetch workspace tasks from the configured task source.",
    "Group tasks by status and show counts.",
    "Refresh task data from the panel UI.",
    "Show setup guidance when task data is unavailable."
  ],
  "files": [
    "package.json",
    "tsconfig.json",
    "src/index.ts",
    "ui/default/index.html",
    "README.md"
  ],
  "assumptions": [
    "The task source is configured before runtime."
  ],
  "pluginConfig": {
    "pluginType": "dynamic",
    "commands": ["open-task-dashboard"],
    "tools": [],
    "hasUi": true
  }
}
</dynamic_plugin_example_json>

Normal plugin:
<normal_plugin_example_json>
{
  "targetKind": "plugin",
  "targetId": "workspace-helper",
  "title": "Workspace Helper",
  "purpose": "A CodeBolt plugin that registers background helpers without a custom panel.",
  "trigger": "Plugin starts manually or on configured workspace events.",
  "mermaidFlow": "flowchart TD\n  A[Plugin starts] --> B[Register helpers]\n  B --> C[Handle requests]",
  "capabilities": ["Run background plugin logic."],
  "files": ["package.json", "tsconfig.json", "src/index.ts", "README.md"],
  "assumptions": [],
  "pluginConfig": {
    "pluginType": "static",
    "commands": [],
    "tools": [],
    "hasUi": false
  }
}
</normal_plugin_example_json>

The module catalogue below tells you what the CodeBolt platform can do, so you can judge feasibility. Use it for scoping only - capabilities stay API-free.

<module_catalogue>
{{MANIFEST}}
</module_catalogue>`;

function renderCreationPlanForUser(plan: CreationPlan): string {
  const lines = [
    `## Plan: ${plan.title} (${plan.targetKind}: \`${plan.targetId}\`)`,
    "",
    plan.purpose,
    "",
    `**Trigger / entrypoint:** ${plan.trigger}`,
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

    const userResponse = normalizeConfirmationResponse(decision);
    const approved = isPlanApproved(decision);
    return {
      approved,
      userResponse,
      plan,
    };
  },
});


export const planCreationTool = createTool({
  id: "plan_creation",
  description: "Phase 1: produce a capability-level plan for a CodeBolt extension target: agent, plugin, dynamic-plugin, provider, or actionblock. Shows the plan to the user for confirmation.",
  inputSchema: z.object({
    userRequest: z.string().describe("The user's creation/update request, verbatim plus any clarifications."),
    inspection: inspectionSchema.optional().describe("Inspection artifact when updating an existing target."),
    revisionFeedback: z.string().optional().describe("User feedback from a previously rejected plan."),
  }),
  execute: async ({ input }: { input: { userRequest: string; inspection?: unknown; revisionFeedback?: string } }) => {
    const taskSections = [`<user_request>\n${input.userRequest}\n</user_request>`];
    if (input.inspection) {
      taskSections.push(`<existing_target_inspection>\n${JSON.stringify(input.inspection, null, 2)}\n</existing_target_inspection>\nThis is an UPDATE: plan the changed behavior, keeping the existing target id and structure unless the user asked otherwise.`);
    }
    if (input.revisionFeedback) {
      taskSections.push(`<user_feedback_on_previous_plan>\n${input.revisionFeedback}\n</user_feedback_on_previous_plan>`);
    }

    const plan = await runSubAgentPhase({
      phaseName: "plan-creation",
      instructions: CREATION_PLAN_INSTRUCTIONS.replace("{{MANIFEST}}", getModuleManifest({ includeMethods: false })),
      task: taskSections.join("\n\n"),
      artifactSchema: creationPlanSchema,
      maxTurns: 3,
    });

    const planText = renderCreationPlanForUser(plan);
    const decision = await codebolt.chat.sendConfirmationRequest(
      `${planText}\n\nProceed with building this CodeBolt extension?`,
      ["Proceed", "Revise"],
      true,
    );

    const userResponse = normalizeConfirmationResponse(decision);
    const approved = isPlanApproved(decision);
    return {
      approved,
      userResponse,
      plan,
    };
  },
});
