import path from "path";
import { z } from "zod";
import { buildResultSchema, creationImplementationSpecSchema, implementationSpecSchema, type CreationImplementationSpec, type ImplementationSpec, type TargetKind } from "../artifacts";
import { runSubAgentPhase } from "./subagent";

const { createTool } = require("@codebolt/agent/unified/tools") as typeof import("@codebolt/agent/unified/tools");
const {
  getModuleSpecTool,
  testRunAgentSandboxTool,
  validateApiUsageTool,
} = require("@codebolt/api-docs-index/tools") as typeof import("@codebolt/api-docs-index/tools");
const {
  createAgentProject,
  createAuthoringProject,
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
    targetDirectory: z.string().optional().describe("Relative target directory inside the workspace. Defaults to .codebolt/agents/<agentId>."),
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
      targetDirectory: input.targetDirectory || `.codebolt/agents/${spec.plan.agentId}`,
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


interface ExtensionWriterConfig {
  id: string;
  targetKind: TargetKind;
  description: string;
  defaultDirectory: string;
  targetName: string;
  instructions: string;
}

const EXTENSION_WRITE_BASE_INSTRUCTIONS = `You are a target-specific code-writing phase of the CodeBolt Creation Agent.

When scaffolded_files is present, a target-family scaffold has already been created at the project path. Your job is to implement or update that scaffold from the implementation spec and target conventions.

Hard rules:
- Respect spec.plan.targetKind exactly. Do not create an agent unless targetKind is "agent".
- Everything you need is in the spec and scoped .d.ts below. Use ONLY APIs from the spec.apiResolution table.
- If something is genuinely missing from the spec, the spec is wrong: you may use spec_gap_lookup to unblock yourself, but every use MUST be reported in specGaps.
- Do not invent CodeBolt APIs. The .d.ts is the ground truth for signatures and types.
- Create the manifest/config files expected for the target kind, not codeboltagent.yaml unless the target is an agent.
- Keep generated code readable: explicit function names, typed parameters, clear error handling, and deterministic progress/status messages where the runtime supports them.
- Validate with the commands from spec.testPlan. If dependencies are missing and validation cannot run, report the exact blocker instead of pretending success.
- Run validate_api_usage when CodeBolt SDK calls are present and fix unknown API usages before returning success.`;

async function getProjectRoot(): Promise<string> {
  const projectResponse = await codebolt.project.getProjectPath() as { projectPath?: string; path?: string };
  const projectRoot = projectResponse.projectPath || projectResponse.path;
  if (!projectRoot) {
    throw new Error("Could not determine the active CodeBolt project path.");
  }
  return projectRoot;
}

function defaultTargetDirectory(config: ExtensionWriterConfig, targetId: string): string {
  return `${config.defaultDirectory}/${targetId}`;
}

function pluginTemplateForSpec(spec: CreationImplementationSpec, config: ExtensionWriterConfig): string | undefined {
  if (config.targetKind === "provider") {
    if (spec.plan.providerConfig?.providerType === "llm") return "llm-provider-plugin";
    return undefined;
  }

  if (config.targetKind === "dynamic-plugin") return "dynamic-panel-plugin";
  if (config.targetKind !== "plugin") return undefined;

  const pluginConfig = spec.plan.pluginConfig;
  if (pluginConfig?.hasUi || pluginConfig?.pluginType === "dynamic") return "dynamic-panel-plugin";
  if (pluginConfig?.tools?.length) return "tool-plugin";
  if (pluginConfig?.commands?.length) return "command-plugin";
  return "normal-plugin";
}

function createExtensionScaffold(
  spec: CreationImplementationSpec,
  config: ExtensionWriterConfig,
  projectRoot: string,
  relativeTargetDirectory: string,
): { projectPath: string; files: string[]; templateId: string } | undefined {
  const templateId = pluginTemplateForSpec(spec, config);
  if (!templateId) return undefined;

  return createAuthoringProject({
    targetType: "plugin",
    targetId: spec.plan.targetId,
    title: spec.plan.title,
    description: spec.plan.purpose,
    templateId,
    targetDirectory: relativeTargetDirectory,
    projectRoot,
    overwrite: true,
  });
}

function createExtensionWriteTool(config: ExtensionWriterConfig) {
  return createTool({
    id: config.id,
    description: config.description,
    inputSchema: z.object({
      spec: creationImplementationSpecSchema,
      targetDirectory: z.string().optional().describe(`Relative target directory inside the workspace. Defaults to ${config.defaultDirectory}/<targetId>.`),
    }),
    execute: async ({ input }: { input: { spec: CreationImplementationSpec; targetDirectory?: string } }) => {
      const spec = input.spec;
      if (spec.plan.targetKind !== config.targetKind) {
        throw new Error(`${config.id} can only write ${config.targetKind} targets. Received ${spec.plan.targetKind}.`);
      }

      const projectRoot = await getProjectRoot();
      const relativeTargetDirectory = input.targetDirectory || defaultTargetDirectory(config, spec.plan.targetId);
      const scaffold = createExtensionScaffold(spec, config, projectRoot, relativeTargetDirectory);
      const targetPath = scaffold?.projectPath || path.join(projectRoot, relativeTargetDirectory);
      const dts = getModuleDts(spec.modulesUsed);

      const taskSections = [
        `<target_kind>${config.targetKind}</target_kind>`,
        `<target_name>${config.targetName}</target_name>`,
        `<implementation_spec>\n${JSON.stringify(spec, null, 2)}\n</implementation_spec>`,
        `<project_root>${projectRoot}</project_root>`,
        `<project_path>${targetPath}</project_path>`,
        `<relative_target_directory>${relativeTargetDirectory}</relative_target_directory>`,
        `<scoped_type_declarations modules="${dts.found.join(", ")}"${dts.missing.length ? ` missing="${dts.missing.join(", ")}"` : ""}>\n${dts.content}\n</scoped_type_declarations>`,
        `<target_specific_instructions>\n${config.instructions}\n</target_specific_instructions>`,
      ];

      if (scaffold) {
        taskSections.push(
          `<scaffolded_files template="${scaffold.templateId}">\n${scaffold.files.join("\n")}\n</scaffolded_files>`,
        );
      }

      if (spec.referenceExample) {
        const example = getExample(spec.referenceExample);
        if (example) {
          const exampleText = example.fileContents
            .map((file) => `--- ${file.path} ---\n${file.content}`)
            .join("\n\n");
          taskSections.push(`<reference_example id="${example.id}" note="${example.description}">\n${exampleText}\n</reference_example>`);
        }
      }

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
        phaseName: config.id,
        instructions: `${EXTENSION_WRITE_BASE_INSTRUCTIONS}\n\n${config.instructions}`,
        task: taskSections.join("\n\n"),
        artifactSchema: buildResultSchema,
        tools: [specGapLookupTool, validateApiUsageTool],
        maxTurns: 20,
        includeDefaults: true,
      });

      const mergedGaps = Array.from(new Set([...buildResult.specGaps, ...gapLookups]));
      return { ...buildResult, projectPath: buildResult.projectPath || targetPath, specGaps: mergedGaps };
    },
  });
}

export const writePluginCodeTool = createExtensionWriteTool({
  id: "write_plugin_code",
  targetKind: "plugin",
  targetName: "plugin",
  defaultDirectory: ".codebolt/plugins",
  description: "Phase 3: create or update a CodeBolt plugin project from a target-aware implementation spec, then validate build/API usage.",
  instructions: `Create a normal CodeBolt plugin project. Include the plugin manifest/config, package metadata, source entrypoint, README, and any command/tool/UI files required by spec.pluginConfig. Do not create codeboltagent.yaml.`,
});

export const writeDynamicPluginCodeTool = createExtensionWriteTool({
  id: "write_dynamic_plugin_code",
  targetKind: "dynamic-plugin",
  targetName: "dynamic plugin",
  defaultDirectory: ".codebolt/plugins",
  description: "Phase 3: create or update a dynamic CodeBolt plugin project from a target-aware implementation spec, then validate build/API usage.",
  instructions: `Create a dynamic CodeBolt plugin project. Include dynamic registration/loading code, manifest/config, package metadata, source entrypoint, README, and any runtime discovery files required by spec.pluginConfig. Do not create codeboltagent.yaml.`,
});

export const writeProviderCodeTool = createExtensionWriteTool({
  id: "write_provider_code",
  targetKind: "provider",
  targetName: "provider",
  defaultDirectory: ".codebolt/plugins",
  description: "Phase 3: create or update a CodeBolt provider project from a target-aware implementation spec, then validate build/API usage.",
  instructions: `Create a plugin-backed CodeBolt provider project under .codebolt/plugins. Include package.json#codebolt.plugin, package metadata, source entrypoint, provider contract implementation, streaming/error handling where applicable, README, and validation scripts. Do not create codeboltagent.yaml.`,
});

export const writeActionBlockCodeTool = createExtensionWriteTool({
  id: "write_actionblock_code",
  targetKind: "actionblock",
  targetName: "ActionBlock",
  defaultDirectory: "action-blocks",
  description: "Phase 3: create or update a CodeBolt ActionBlock project from a target-aware implementation spec, then validate build/API usage.",
  instructions: `Create a CodeBolt ActionBlock project. Include metadata/manifest, input/output schema, deterministic execution entrypoint, package/build files when needed, README, and validation scripts. Do not create codeboltagent.yaml.`,
});
