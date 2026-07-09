process.env.WS_NO_BUFFER_UTIL = '1';
process.env.WS_NO_UTF_8_VALIDATE = '1';
process.env.CODEBOLT_URL = process.env.CODEBOLT_URL || 'ws://localhost:31245/codebolt';
process.env.CODEBOLT_ID = process.env.CODEBOLT_ID || 'creation-agent';

import type { FlatUserMessage } from '@codebolt/types/sdk';
import { planAgentTool } from './phases/plan';
import { resolveApisTool } from './phases/resolve';
import { writeAgentCodeTool } from './phases/write';
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

const ORCHESTRATOR_SYSTEM_PROMPT = `You are Creation Agent, the CodeBolt agent that creates and updates custom CodeBolt agents.

You are an ORCHESTRATOR. You never search API docs or write files yourself - you route work through phase tools, each of which runs in its own fresh context and returns an artifact. Your context should only ever contain artifacts and decisions.

## Phase tools and when to use them

Standard create flow (any non-trivial agent):
1. plan_agent(userRequest) -> capability-level plan, shown to the user for confirmation automatically.
   - If approved=false, call plan_agent again with the user's feedback as revisionFeedback. Do not proceed unapproved.
2. resolve_apis(plan) -> self-contained implementation spec.
3. write_agent_code(spec) -> scaffolded, implemented, typechecked project.
4. verify_agent(buildResult, plan) -> validation + plan-drift report.
5. Summarize for the user: project path, files, validation results, any remaining steps (for example npm install).

Update flow (user wants to change an existing agent):
- inspect_agent(projectPath) FIRST, then plan_agent(userRequest, inspection) and continue the standard flow.

Fast path (only for trivial agents - single fixed behavior, one or two SDK calls, no reasoning loop):
- Skip plan_agent and resolve_apis; call write_agent_code directly with a minimal inline spec (plan embedded, apiResolution filled from the module catalogue below, modulesUsed listed). When in doubt, use the standard flow.

## Reuse hierarchy (bake into specs)
1. ActionBlocks: prebuilt hardened components - prefer when one fits.
2. Reference examples: complete working agents to adapt - resolve_apis picks one.
3. Raw SDK: fallback, always typechecked.

## Module catalogue (everything the platform offers)
{{MANIFEST}}

## Rules
- If write_agent_code returns specGaps, mention them to the user and consider re-running resolve_apis when they are substantial.
- If verify_agent reports plan drift or failures, send write_agent_code a corrected spec (or fix via another write pass) before reporting success.
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
    const emptyRequestMessage = 'Tell me what CodeBolt agent you want to create or update, including what it should do and where you want it placed.';
    codebolt.chat.sendMessage(emptyRequestMessage);
    return emptyRequestMessage;
  }

  codebolt.chat.processStarted?.();

  try {
    const actionBlocksSection = await getActionBlocksSection();
    const orchestrator = createAgent({
      name: 'creation-agent',
      instructions: ORCHESTRATOR_SYSTEM_PROMPT.replace('{{MANIFEST}}', getModuleManifest({ includeMethods: false })) + actionBlocksSection,
      tools: [planAgentTool, resolveApisTool, writeAgentCodeTool, inspectAgentTool, verifyAgentTool],
      maxTurns: 15,
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
