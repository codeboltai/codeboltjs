import { z } from "zod";
import { agentPlanSchema, implementationSpecSchema } from "../artifacts";
import { runSubAgentPhase } from "./subagent";

const { createTool } = require("@codebolt/agent/unified/tools") as typeof import("@codebolt/agent/unified/tools");
const {
  searchApiDocsTool,
  getApiSpecTool,
  getModuleSpecTool,
  listExamplesTool,
} = require("@codebolt/api-docs-index/tools") as typeof import("@codebolt/api-docs-index/tools");
const { getModuleManifest } = require("@codebolt/api-docs-index") as typeof import("@codebolt/api-docs-index");

const RESOLVE_INSTRUCTIONS = `You are the API-resolution phase of the CodeBolt Creation Agent.

Input: an approved capability-level plan. Output: a SELF-CONTAINED implementation spec. The code-writing phase sees only your spec (plus scoped .d.ts) - if an API is not in your apiResolution table, the code phase must not use it. Completeness rules:

- Map EVERY plan capability to concrete APIs. Use get_module_spec(<module>) to fetch a whole module's methods in one call - prefer it over per-method get_api_spec. Make independent lookups in parallel in one turn.
- Copy exact signatures from the specs into the table. Do not abbreviate.
- Reuse hierarchy: prefer an ActionBlock when a suitable one is listed in the task context; otherwise adapt patterns from a reference example; raw SDK calls are the fallback. Check list_examples and name the closest example in referenceExample.
- modulesUsed drives which .d.ts files the code phase receives - list every module you referenced, and "agent-core"/"processor-pieces" for llm-loop agents.
- Include chat.sendMessage-based progress reporting in the resolution for any agent that runs longer than one step.

The module catalogue (what exists):

<module_catalogue>
{{MANIFEST}}
</module_catalogue>`;

export const resolveApisTool = createTool({
  id: "resolve_apis",
  description: "Phase 2: map an approved plan's capabilities to concrete CodeBolt APIs and produce a self-contained implementation spec (API table with exact signatures, modules used, tools, framework config, reference example). Requires the plan artifact from plan_agent.",
  inputSchema: z.object({
    plan: agentPlanSchema,
    availableActionBlocks: z.string().optional().describe("Formatted list of workspace ActionBlocks, when available."),
  }),
  execute: async ({ input }: { input: { plan: z.infer<typeof agentPlanSchema>; availableActionBlocks?: string } }) => {
    const taskSections = [`<approved_plan>\n${JSON.stringify(input.plan, null, 2)}\n</approved_plan>`];
    if (input.availableActionBlocks) {
      taskSections.push(`<available_action_blocks>\n${input.availableActionBlocks}\n</available_action_blocks>`);
    }

    const spec = await runSubAgentPhase({
      phaseName: "resolve",
      instructions: RESOLVE_INSTRUCTIONS.replace("{{MANIFEST}}", getModuleManifest({ includeMethods: true })),
      task: taskSections.join("\n\n"),
      artifactSchema: implementationSpecSchema,
      tools: [getModuleSpecTool, searchApiDocsTool, getApiSpecTool, listExamplesTool],
      maxTurns: 10,
    });

    return spec;
  },
});
