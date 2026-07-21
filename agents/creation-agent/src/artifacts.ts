import { z } from "zod";

/**
 * Artifacts passed between phases. Each phase runs in a fresh context and
 * receives ONLY the artifact from the previous phase - never its transcript.
 * The Zod schemas double as ordering enforcement: write_agent_code cannot be
 * called without an ImplementationSpec, so phases cannot be skipped for
 * non-trivial agents.
 */

export const agentPlanSchema = z.object({
  agentId: z.string().describe("Stable kebab-case agent id, used as the folder name."),
  title: z.string().describe("Human-readable agent title."),
  purpose: z.string().describe("One-paragraph description of what the agent does."),
  agentType: z.enum(["procedural", "llm-loop"]).describe("procedural = fixed SDK-call workflow; llm-loop = createAgent reasoning loop with tools."),
  trigger: z.string().describe("How the agent is triggered, for example 'user chat message'."),
  mermaidFlow: z.string().describe("Mermaid flowchart of the agent's runtime behavior."),
  capabilities: z.array(z.string()).describe("Plain-English capabilities needed. NO API or module names here."),
  files: z.array(z.string()).describe("Files the generated agent project will contain."),
  assumptions: z.array(z.string()).describe("Assumptions made and open questions for the user."),
});

export type AgentPlan = z.infer<typeof agentPlanSchema>;


export const targetKindSchema = z.enum(["agent", "plugin", "dynamic-plugin", "provider", "actionblock"]);
export type TargetKind = z.infer<typeof targetKindSchema>;

export const creationPlanSchema = z.object({
  targetKind: targetKindSchema.describe("What kind of CodeBolt extension is being created or updated."),
  targetId: z.string().describe("Stable kebab-case id, used as the folder/package name."),
  title: z.string().describe("Human-readable title."),
  purpose: z.string().describe("One-paragraph description of what the target does."),
  trigger: z.string().describe("How this target is invoked, loaded, or executed."),
  mermaidFlow: z.string().describe("Mermaid flowchart of the target's runtime behavior."),
  capabilities: z.array(z.string()).describe("Plain-English capabilities needed. NO API or module names here."),
  files: z.array(z.string()).describe("Files the generated project will contain."),
  assumptions: z.array(z.string()).describe("Assumptions made and open questions for the user."),
  agentConfig: z.object({
    agentType: z.enum(["procedural", "llm-loop"]),
  }).optional().describe("Agent-only configuration."),
  pluginConfig: z.object({
    pluginType: z.enum(["static", "dynamic"]),
    commands: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    hasUi: z.boolean().optional(),
  }).optional().describe("Plugin-only configuration."),
  providerConfig: z.object({
    providerType: z.enum(["llm", "embedding", "custom"]),
    supportedModels: z.array(z.string()).optional(),
  }).optional().describe("Provider-only configuration."),
  actionBlockConfig: z.object({
    runtime: z.enum(["node", "shell", "python"]).optional(),
    inputSchemaRequired: z.boolean(),
  }).optional().describe("ActionBlock-only configuration."),
});

export type CreationPlan = z.infer<typeof creationPlanSchema>;

export function creationPlanToAgentPlan(plan: CreationPlan): AgentPlan {
  if (plan.targetKind !== "agent") {
    throw new Error(`Cannot convert ${plan.targetKind} creation plan to an agent plan.`);
  }

  return {
    agentId: plan.targetId,
    title: plan.title,
    purpose: plan.purpose,
    agentType: plan.agentConfig?.agentType || "llm-loop",
    trigger: plan.trigger,
    mermaidFlow: plan.mermaidFlow,
    capabilities: plan.capabilities,
    files: plan.files,
    assumptions: plan.assumptions,
  };
}

export function agentPlanToCreationPlan(plan: AgentPlan): CreationPlan {
  return {
    targetKind: "agent",
    targetId: plan.agentId,
    title: plan.title,
    purpose: plan.purpose,
    trigger: plan.trigger,
    mermaidFlow: plan.mermaidFlow,
    capabilities: plan.capabilities,
    files: plan.files,
    assumptions: plan.assumptions,
    agentConfig: {
      agentType: plan.agentType,
    },
  };
}

export const apiResolutionEntrySchema = z.object({
  capability: z.string().describe("The plan capability this resolves."),
  apiId: z.string().describe("API doc id, for example codeboltjs.chat.sendMessage, or an ActionBlock id."),
  signature: z.string().describe("Exact signature copied from the API spec."),
  notes: z.string().optional().describe("Usage notes: parameters to use, error handling, ordering."),
});

export const localToolPlanSchema = z.object({
  id: z.string(),
  description: z.string(),
  inputOutline: z.string().describe("Plain-language outline of the tool's input fields."),
});

export const implementationSpecSchema = z.object({
  plan: agentPlanSchema,
  apiResolution: z.array(apiResolutionEntrySchema).describe("Every SDK call the implementation will make. Code phase must not use APIs absent from this table."),
  modulesUsed: z.array(z.string()).describe("Module names used, for example ['fs','chat','agent-core']. Drives scoped .d.ts delivery."),
  localTools: z.array(localToolPlanSchema).describe("Local tools the generated agent exposes to its own LLM loop. Empty for procedural agents."),
  frameworkConfig: z.string().describe("For llm-loop agents: createAgent options to use (maxTurns, modifiers, processors). For procedural: 'none'."),
  systemPromptOutline: z.string().describe("For llm-loop agents: outline of the generated agent's system prompt. For procedural: 'none'."),
  referenceExample: z.string().optional().describe("Example id from list_examples that the code phase should read and adapt."),
  testPlan: z.array(z.string()).describe("Validation steps, for example 'npm run typecheck passes'."),
});

export type ImplementationSpec = z.infer<typeof implementationSpecSchema>;


export const creationImplementationSpecSchema = z.object({
  plan: creationPlanSchema,
  apiResolution: z.array(apiResolutionEntrySchema).describe("Every SDK call or platform contract the implementation will use. Code phase must not use APIs absent from this table."),
  modulesUsed: z.array(z.string()).describe("Module names used, for example ['fs','chat','agent-core']. Drives scoped .d.ts delivery."),
  localTools: z.array(localToolPlanSchema).describe("Local tools or commands exposed by the generated target. Empty when not applicable."),
  frameworkConfig: z.string().describe("Framework/runtime/manifest configuration to use, or 'none'."),
  systemPromptOutline: z.string().describe("Prompt outline for LLM-driven targets, or 'none'."),
  referenceExample: z.string().optional().describe("Example id from list_examples that the code phase should read and adapt."),
  targetDocsUsed: z.array(z.string()).describe("Target-specific docs or conventions used for manifest/runtime shape."),
  testPlan: z.array(z.string()).describe("Validation steps, for example 'npm run typecheck passes'."),
});

export type CreationImplementationSpec = z.infer<typeof creationImplementationSpecSchema>;

export const buildResultSchema = z.object({
  projectPath: z.string(),
  files: z.array(z.string()),
  typecheckPassed: z.boolean(),
  validationOutput: z.string(),
  specGaps: z.array(z.string()).describe("APIs or details the spec was missing (escape-hatch lookups used by the code phase)."),
});

export type BuildResult = z.infer<typeof buildResultSchema>;

export const inspectionSchema = z.object({
  projectPath: z.string(),
  title: z.string(),
  uniqueId: z.string(),
  agentType: z.enum(["procedural", "llm-loop", "unknown"]),
  summary: z.string().describe("How the agent works: entry point, flow, notable patterns."),
  modulesUsed: z.array(z.string()),
  files: z.array(z.string()),
  issues: z.array(z.string()).describe("Problems or oddities noticed while reading the code."),
});

export type Inspection = z.infer<typeof inspectionSchema>;

/**
 * Extracts the last JSON object from an LLM final message (fenced ```json block
 * preferred, bare object as fallback) and validates it against the schema.
 */
export function parseArtifact<T>(schema: z.ZodType<T>, text: string): { artifact?: T; error?: string } {
  const fencedBlocks = [...text.matchAll(/```(?:json)?\s*\n([\s\S]*?)```/g)];
  const bareCandidates: string[] = [];

  const firstBrace = text.indexOf("{");
  const lastBrace = text.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    bareCandidates.push(text.slice(firstBrace, lastBrace + 1));
  }

  const validateCandidate = (candidate: string): { artifact?: T; error?: string } => {
    let parsed: unknown;
    try {
      parsed = JSON.parse(candidate);
    } catch (error) {
      return { error: `JSON parse failed: ${error instanceof Error ? error.message : String(error)}` };
    }

    const result = schema.safeParse(parsed);
    if (result.success) {
      return { artifact: result.data };
    }

    return {
      error: `Schema validation failed: ${result.error.issues
        .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
        .join("; ")}`,
    };
  };

  let lastError = "No JSON object found in the response.";

  // Fenced JSON is the explicit artifact. If it parses but fails schema
  // validation, preserve that error instead of hiding it behind fallback parsing.
  for (const match of fencedBlocks.reverse()) {
    const result = validateCandidate(match[1]);
    if (result.artifact !== undefined) {
      return result;
    }
    lastError = result.error || lastError;
    if (lastError.startsWith("Schema validation failed:")) {
      return { error: lastError };
    }
  }

  for (const candidate of bareCandidates) {
    const result = validateCandidate(candidate);
    if (result.artifact !== undefined) {
      return result;
    }
    lastError = result.error || lastError;
  }

  return { error: lastError };
}
