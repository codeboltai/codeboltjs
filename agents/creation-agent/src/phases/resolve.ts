import { z } from "zod";
import { agentPlanSchema, creationImplementationSpecSchema, creationPlanSchema, implementationSpecSchema } from "../artifacts";
import { runSubAgentPhase } from "./subagent";

const { createTool } = require("@codebolt/agent/unified/tools") as typeof import("@codebolt/agent/unified/tools");
const {
  searchApiDocsTool,
  getApiSpecTool,
  getModuleSpecTool,
  listExamplesTool,
  getAuthoringSpecTool,
  listAuthoringConceptsTool,
  getAuthoringConceptTool,
  listAuthoringTemplatesTool,
  getAuthoringTemplateTool,
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



const RESOLVE_CREATION_INSTRUCTIONS = `You are the API and platform-contract resolution phase of the CodeBolt Creation Agent.

Input: an approved capability-level plan for a CodeBolt extension target. Output: a SELF-CONTAINED implementation spec. The code-writing phase sees only your spec plus scoped .d.ts - if an API or platform contract is not in your apiResolution or targetDocsUsed table, the code phase must not use it.

Completeness rules:
- Respect plan.targetKind. Resolve agent, plugin, dynamic-plugin, provider, and actionblock targets differently.
- For plugin, dynamic-plugin, and provider targets, first call list_authoring_concepts({ targetType: "plugin" }) and get_authoring_concept({ targetType: "plugin", conceptId: "plugin-architecture" }) so the spec has plugin architecture, lifecycle, manifest, dynamic-panel router, tool/command, and provider context.
- After the concept lookup, call get_authoring_spec({ targetType: "plugin" }) and list_authoring_templates({ targetType: "plugin" }); choose the concrete template internally and call get_authoring_template for it.
- Map provider targets that are implemented as CodeBolt plugins to targetType "plugin" and record the provider-specific template/contract in targetDocsUsed.
- Map EVERY plan capability to concrete APIs, manifests, runtime hooks, or ActionBlocks.
- Use get_module_spec(<module>) to fetch whole modules when SDK APIs are needed. Prefer it over per-method get_api_spec.
- Copy exact signatures from specs into apiResolution. Do not abbreviate.
- Put manifest/runtime conventions in targetDocsUsed.
- Reuse hierarchy: prefer an ActionBlock when a suitable one is listed in task context; otherwise adapt reference examples; raw SDK calls are fallback.
- modulesUsed drives scoped .d.ts delivery - list every CodeBolt module referenced.
- Include chat.sendMessage-based progress reporting for long-running generated targets when they execute inside an agent/plugin runtime.

Target-specific expectations:
- agent: codeboltagent.yaml, src/index.ts, package/build/typecheck, optional createAgent loop.
- plugin: plugin manifest, command/tool registration, package/build path, workspace-safe file layout.
- dynamic-plugin: dynamic registration/load flow, runtime discovery, plugin manifest/config.
- provider: provider interface/contract, model/stream/error handling, package/build path.
- actionblock: metadata/manifest, input/output schema, deterministic execution entrypoint.

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


export const resolveCreationApisTool = createTool({
  id: "resolve_creation_apis",
  description: "Phase 2: map an approved CodeBolt extension plan to concrete CodeBolt APIs, target manifests/contracts, modules, examples, and a self-contained implementation spec.",
  inputSchema: z.object({
    plan: creationPlanSchema,
    availableActionBlocks: z.string().optional().describe("Formatted list of workspace ActionBlocks, when available."),
  }),
  execute: async ({ input }: { input: { plan: z.infer<typeof creationPlanSchema>; availableActionBlocks?: string } }) => {
    const taskSections = [`<approved_creation_plan>\n${JSON.stringify(input.plan, null, 2)}\n</approved_creation_plan>`];
    if (input.availableActionBlocks) {
      taskSections.push(`<available_action_blocks>\n${input.availableActionBlocks}\n</available_action_blocks>`);
    }

    const spec = await runSubAgentPhase({
      phaseName: "resolve-creation",
      instructions: RESOLVE_CREATION_INSTRUCTIONS.replace("{{MANIFEST}}", getModuleManifest({ includeMethods: true })),
      task: taskSections.join("\n\n"),
      artifactSchema: creationImplementationSpecSchema,
      tools: [
        listAuthoringConceptsTool,
        getAuthoringConceptTool,
        getAuthoringSpecTool,
        listAuthoringTemplatesTool,
        getAuthoringTemplateTool,
        getModuleSpecTool,
        searchApiDocsTool,
        getApiSpecTool,
        listExamplesTool,
      ],
      maxTurns: 12,
    });

    return spec;
  },
});
