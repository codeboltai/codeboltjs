import { z } from "zod";
import { buildResultSchema, implementationSpecSchema, type ImplementationSpec } from "../artifacts";
import { runSubAgentPhase } from "./subagent";

const { createTool } = require("@codebolt/agent/unified/tools") as typeof import("@codebolt/agent/unified/tools");
const {
  getModuleSpecTool,
  testRunAgentSandboxTool,
} = require("@codebolt/api-docs-index/tools") as typeof import("@codebolt/api-docs-index/tools");
const {
  createAgentProject,
  getExample,
  getModuleDts,
} = require("@codebolt/api-docs-index") as typeof import("@codebolt/api-docs-index");

const codebolt = require("@codebolt/codeboltjs");

const WRITE_INSTRUCTIONS = `You are the code-writing phase of the CodeBolt Creation Agent.

A project scaffold (package.json, tsconfig, webpack config, codeboltagent.yaml, README, starter src/index.ts) has ALREADY been created at the given project path. Your job:

1. Rewrite src/index.ts to implement the spec. Adapt structure and style from the reference example when one is provided.
2. Update codeboltagent.yaml (description, tags, actions) to match the agent's real behavior.
3. Validate with test_run_agent_sandbox (typecheck). Fix errors and re-run until clean. If dependencies are not installed and typecheck cannot run, report the exact blocker instead of pretending success.

Hard rules:
- Everything you need is in the spec and the scoped .d.ts below. Use ONLY APIs from the spec's apiResolution table.
- If something is genuinely missing from the spec, the spec is wrong: you may use spec_gap_lookup to unblock yourself, but every use MUST be reported in the specGaps field of your artifact.
- Do not invent CodeBolt APIs. The .d.ts is the ground truth for signatures and types.
- Keep generated code readable: explicit function names, typed parameters, clear error handling, deterministic user-facing progress via codebolt.chat.sendMessage.`;

export const writeAgentCodeTool = createTool({
  id: "write_agent_code",
  description: "Phase 3: scaffold the agent project deterministically, then write the implementation from the spec with scoped .d.ts and the reference example in context, and typecheck it. Requires the ImplementationSpec from resolve_apis (for trivial agents an inline minimal spec is acceptable).",
  inputSchema: z.object({
    spec: implementationSpecSchema,
    targetDirectory: z.string().optional().describe("Relative target directory inside the workspace. Defaults to agents/<agentId>."),
  }),
  execute: async ({ input }: { input: { spec: ImplementationSpec; targetDirectory?: string } }) => {
    const spec = input.spec;

    const projectResponse = await codebolt.project.getProjectPath() as { projectPath?: string; path?: string };
    const projectRoot = projectResponse.projectPath || projectResponse.path;
    if (!projectRoot) {
      throw new Error("Could not determine the active CodeBolt project path.");
    }

    const scaffold = createAgentProject({
      projectRoot,
      agentId: spec.plan.agentId,
      title: spec.plan.title,
      description: spec.plan.purpose,
      templateId: spec.plan.agentType === "procedural" ? "simple-message-agent" : "llm-agent-with-local-tools",
      ...(input.targetDirectory ? { targetDirectory: input.targetDirectory } : {}),
      overwrite: true,
    });

    const dts = getModuleDts(spec.modulesUsed);

    const taskSections = [
      `<implementation_spec>\n${JSON.stringify(spec, null, 2)}\n</implementation_spec>`,
      `<project_path>${scaffold.projectPath}</project_path>`,
      `<scaffolded_files>\n${scaffold.files.join("\n")}\n</scaffolded_files>`,
      `<scoped_type_declarations modules="${dts.found.join(", ")}"${dts.missing.length ? ` missing="${dts.missing.join(", ")}"` : ""}>\n${dts.content}\n</scoped_type_declarations>`,
    ];

    if (spec.referenceExample) {
      const example = getExample(spec.referenceExample);
      if (example) {
        const exampleText = example.fileContents
          .map((file) => `--- ${file.path} ---\n${file.content}`)
          .join("\n\n");
        taskSections.push(`<reference_example id="${example.id}" note="${example.description}">\n${exampleText}\n</reference_example>`);
      }
    }

    // Escape hatch that leaves a trace: same behavior as get_module_spec, but
    // every use means the spec was incomplete, which the artifact must surface.
    const gapLookups: string[] = [];
    const specGapLookupTool = createTool({
      id: "spec_gap_lookup",
      description: "Look up a module's API records when the implementation spec is missing something. Using this tool means the spec was incomplete - report every use in specGaps.",
      inputSchema: z.object({
        module: z.string().describe("Module name to look up."),
        reason: z.string().describe("What the spec was missing."),
      }),
      execute: async ({ input: lookupInput }: { input: { module: string; reason: string } }) => {
        gapLookups.push(`${lookupInput.module}: ${lookupInput.reason}`);
        return getModuleSpecTool.execute({ module: lookupInput.module }, {});
      },
    });

    const buildResult = await runSubAgentPhase({
      phaseName: "write",
      instructions: WRITE_INSTRUCTIONS,
      task: taskSections.join("\n\n"),
      artifactSchema: buildResultSchema,
      tools: [specGapLookupTool, testRunAgentSandboxTool],
      maxTurns: 20,
      includeDefaults: true,
    });

    const mergedGaps = Array.from(new Set([...buildResult.specGaps, ...gapLookups]));
    return { ...buildResult, projectPath: buildResult.projectPath || scaffold.projectPath, specGaps: mergedGaps };
  },
});
