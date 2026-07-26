process.env.WS_NO_BUFFER_UTIL = '1';
process.env.WS_NO_UTF_8_VALIDATE = '1';
process.env.CODEBOLT_URL = process.env.CODEBOLT_URL || 'ws://localhost:31245/codebolt';
process.env.CODEBOLT_ID = process.env.CODEBOLT_ID || 'creation-agent';

import type { FlatUserMessage } from '@codebolt/types/sdk';
import { planAgentTool, planCreationTool } from './phases/plan';
import { resolveApisTool, resolveCreationApisTool } from './phases/resolve';
import { writeActionBlockCodeTool, writeAgentCodeTool, writeDynamicPluginCodeTool, writePluginCodeTool, writeProviderCodeTool } from './phases/write';
import { inspectAgentTool } from './phases/inspect';
import { verifyAgentTool } from './phases/verify';

const codebolt = require('@codebolt/codeboltjs') as CodeboltRuntime;
const { createAgent } = require('@codebolt/agent/unified') as typeof import('@codebolt/agent/unified');
const { getModuleManifest } = require('@codebolt/api-docs-index') as typeof import('@codebolt/api-docs-index');

interface CodeboltRuntime {
  onMessage(handler: (message: FlatUserMessage) => Promise<string | void>): void;
  chat: {
    sendMessage(message: string, payload?: object): void;
    processStarted?(): unknown;
    processFinished?(): unknown;
  };
  actionBlock?: {
    list?(): Promise<unknown>;
  };
}

type FlexibleIncomingMessage = Partial<FlatUserMessage> & {
  message?: unknown;
};

const ORCHESTRATOR_SYSTEM_PROMPT = `You are Creation Agent, the CodeBolt agent that creates and updates CodeBolt extensions: agents, plugins, dynamic plugins, providers, and ActionBlocks.

You are an ORCHESTRATOR. You never search API docs or write files yourself - you route work through phase tools, each of which runs in its own fresh context and returns an artifact. Your context should only ever contain artifacts and decisions.

## Phase tools and when to use them

Agent create flow:
1. plan_agent(userRequest) -> capability-level agent plan, shown to the user for confirmation automatically.
   - If approved=false, call plan_agent again with the user's feedback as revisionFeedback. Do not proceed unapproved.
2. resolve_apis(plan) -> self-contained agent implementation spec.
3. write_agent_code(spec) -> scaffolded, implemented, typechecked agent project.
4. verify_agent(buildResult, plan) -> manifest/API/build validation + plan-drift report.
5. Summarize for the user: project path, files, validation results, any remaining steps.

Extension create flow for plugin, dynamic-plugin, provider, and actionblock:
1. plan_creation(userRequest) -> target-aware capability plan with targetKind, shown to the user for confirmation automatically.
   - If approved=false, call plan_creation again with the user's feedback as revisionFeedback. Do not proceed unapproved.
2. resolve_creation_apis(plan) -> target-aware implementation spec with API, manifest, runtime, and validation requirements.
3. Route by plan.targetKind:
   - plugin -> write_plugin_code(spec)
   - dynamic-plugin -> write_dynamic_plugin_code(spec)
   - provider -> write_provider_code(spec)
   - actionblock -> write_actionblock_code(spec)
4. Summarize project path, files, validation results, spec gaps, and any checks that could not run.

Update flow:
- Existing agents: inspect_agent(projectPath) FIRST, then plan_agent(userRequest, inspection) and continue the agent flow.
- Existing plugins, dynamic plugins, providers, or ActionBlocks: use plan_creation with the existing project context supplied by the user until a generic inspect tool is available.

Fast path:
- Only use the old fast path for trivial agents: call write_agent_code directly with a minimal inline spec. Do not fast-path plugin/provider/actionblock creation because their manifests and runtime contracts need target-aware resolution.

## Reuse hierarchy (bake into specs)
1. ActionBlocks: prebuilt hardened components - prefer when one fits.
2. Reference examples: complete working targets to adapt when available.
3. Raw SDK: fallback, always typechecked or honestly reported as unvalidated.

## Module catalogue (everything the platform offers)
{{MANIFEST}}

## Rules
- Do not force non-agent requests through plan_agent, write_agent_code, codeboltagent.yaml, or verify_agent.
- Do not call grep, glob, read_file, read_many_files, execute_command, terminal, fs, or codebase search tools to learn CodeBolt SDK, plugin SDK, provider, manifest, or dynamic-panel contracts. Route that through resolve_apis or resolve_creation_apis.
- Use filesystem/default tools only for user workspace facts that are not CodeBolt platform documentation, and only after the matching phase tool cannot answer the question.
- If a writer returns specGaps, mention them to the user and consider re-running the matching resolve phase when they are substantial.
- If verify_agent reports plan drift or failures, send write_agent_code a corrected spec before reporting success.
- Report results faithfully, including what could not be validated and why.`;

function getNestedMessage(incomingMessage: FlexibleIncomingMessage): FlexibleIncomingMessage | undefined {
  if (typeof incomingMessage.message === 'object' && incomingMessage.message !== null && !Array.isArray(incomingMessage.message)) {
    return incomingMessage.message as FlexibleIncomingMessage;
  }

  return undefined;
}

function getUserRequest(incomingMessage: FlexibleIncomingMessage): string {
  const nestedMessage = getNestedMessage(incomingMessage);

  if (typeof incomingMessage.userMessage === 'string' && incomingMessage.userMessage.trim()) {
    return incomingMessage.userMessage.trim();
  }

  if (typeof nestedMessage?.userMessage === 'string' && nestedMessage.userMessage.trim()) {
    return nestedMessage.userMessage.trim();
  }

  if (typeof incomingMessage.message === 'string' && incomingMessage.message.trim()) {
    return incomingMessage.message.trim();
  }

  if (typeof nestedMessage?.message === 'string' && nestedMessage.message.trim()) {
    return nestedMessage.message.trim();
  }

  return '';
}

async function getActionBlocksSection(): Promise<string> {
  try {
    const listActionBlocks = codebolt.actionBlock?.list;
    if (!listActionBlocks) return '';

    const response = await listActionBlocks.call(codebolt.actionBlock) as {
      actionBlocks?: Array<{ id: string; name?: string; description?: string }>;
    };
    const blocks = response?.actionBlocks || [];
    if (blocks.length === 0) return '';

    const lines = blocks.map((block) => `- ${block.id}: ${block.description || block.name || block.id}`);
    return `\n\n## Available ActionBlocks in this workspace\n${lines.join('\n')}`;
  } catch {
    // ActionBlocks are workspace-level and optional; absence must not block creation.
    return '';
  }
}

codebolt.onMessage(async (reqMessage: FlatUserMessage): Promise<string> => {
  const userRequest = getUserRequest(reqMessage as FlexibleIncomingMessage);

  if (!userRequest) {
    const emptyRequestMessage = 'Tell me what CodeBolt extension you want to create or update, including what it should do and where you want it placed.';
    codebolt.chat.sendMessage(emptyRequestMessage);
    return emptyRequestMessage;
  }

  codebolt.chat.processStarted?.();

  try {
    const actionBlocksSection = await getActionBlocksSection();
    const orchestrator = createAgent({
      name: 'creation-agent',
      instructions: ORCHESTRATOR_SYSTEM_PROMPT.replace('{{MANIFEST}}', getModuleManifest({ includeMethods: false })) + actionBlocksSection,
      tools: [
        planAgentTool,
        planCreationTool,
        resolveApisTool,
        resolveCreationApisTool,
        writeAgentCodeTool,
        writePluginCodeTool,
        writeDynamicPluginCodeTool,
        writeProviderCodeTool,
        writeActionBlockCodeTool,
        inspectAgentTool,
        verifyAgentTool,
      ],
      maxTurns: 200,
      includeDefaultModifiers: true,
      includeDefaultProcessors: true,
      enableLogging: true,
    });

    const runResult = await orchestrator.run({
      ...reqMessage,
      userMessage: userRequest,
    });

    if (!runResult.success) {
      const failureMessage = runResult.error || 'Creation agent failed before producing a final result.';
      codebolt.chat.sendMessage(failureMessage);
      return failureMessage;
    }

    const finalMessage = runResult.finalMessage || 'Creation agent finished. Review the generated files and validation output above.';
    codebolt.chat.sendMessage(finalMessage);
    return finalMessage;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    codebolt.chat.sendMessage(`Creation agent failed: ${errorMessage}`);
    return `Creation agent failed: ${errorMessage}`;
  } finally {
    codebolt.chat.processFinished?.();
  }
});
