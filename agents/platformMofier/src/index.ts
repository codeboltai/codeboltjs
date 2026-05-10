import codebolt from '@codebolt/codeboltjs';
import path from 'path';
import { InitialPromptGenerator } from '@codebolt/agent/unified';
import {
  ChatHistoryMessageModifier,
  EnvironmentContextModifier,
  DirectoryContextModifier,
  IdeContextModifier,
  CoreSystemPromptModifier,
  ToolInjectionModifier,
  AtFileProcessorModifier,
} from '@codebolt/agent/processor-pieces';
import { PLANNER_SYSTEM_PROMPT } from './prompts';
import { runWhileLoop } from './agentLoop';
import { processExternalEvent } from './eventHandlers';
import {
  ARTIFACT_BLOCKS,
  getActionBlockInvocationNames,
  getActionBlockPath,
  inferArtifactsFromText,
  normalizeArtifact,
} from './artifactRegistry';

interface ActionBlockStartResult {
  success?: boolean;
  error?: string;
  result?: unknown;
}

interface ActionBlockRegistry {
  start: (actionBlockName: string, params: Record<string, unknown>) => Promise<ActionBlockStartResult>;
}

interface SideExecutionRegistry {
  startWithActionBlock: (
    actionBlockPath: string,
    params: Record<string, unknown>,
    timeoutMs: number,
  ) => Promise<ActionBlockStartResult>;
}

interface PlatformRuntime {
  actionBlock?: ActionBlockRegistry;
  sideExecution?: SideExecutionRegistry;
}

interface LocalActionBlockModule {
  runActionBlockMiniAgent?: (threadContext: Record<string, unknown>) => Promise<unknown>;
  default?: {
    runActionBlockMiniAgent?: (threadContext: Record<string, unknown>) => Promise<unknown>;
  };
}

const platformRuntime = codebolt as typeof codebolt & PlatformRuntime;
const eventQueue = codebolt.agentEventQueue;
const agentTracker = codebolt.backgroundChildThreads;
const ACTION_BLOCK_TIMEOUT_MS = 900000;

function isMissingActionBlockError(message) {
  return /not found|not registered|unknown|missing/i.test(String(message || ''));
}

function getUserText(message) {
  if (typeof message === 'string') {
    return message;
  }
  return String(message && (message.userMessage || message.content || message.message || '') || '');
}

function stripCodeFence(text) {
  return String(text || '')
    .replace(/^```(?:json)?/i, '')
    .replace(/```$/i, '')
    .trim();
}

function extractFirstJsonObject(text) {
  const source = String(text || '');
  const start = source.indexOf('{');
  if (start < 0) {
    return '';
  }

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < source.length; index += 1) {
    const character = source[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (character === '\\') {
      escaped = true;
      continue;
    }

    if (character === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (character === '{') {
      depth += 1;
    } else if (character === '}') {
      depth -= 1;
      if (depth === 0) {
        return source.slice(start, index + 1);
      }
    }
  }

  return '';
}

function parseJson(text) {
  const clean = stripCodeFence(text);
  try {
    return JSON.parse(clean);
  } catch (_error) {
    const firstJsonObject = extractFirstJsonObject(clean);
    if (!firstJsonObject) {
      throw new Error('No JSON object found in planner response');
    }
    return JSON.parse(firstJsonObject);
  }
}

async function getProjectPath() {
  try {
    const response = await codebolt.project.getProjectPath();
    return response && response.projectPath ? response.projectPath : process.cwd();
  } catch (_error) {
    return process.cwd();
  }
}

async function runPlannerLoop(reqMessage) {
  const promptGenerator = new InitialPromptGenerator({
    processors: [
      new ChatHistoryMessageModifier({ enableChatHistory: true }),
      new EnvironmentContextModifier({ enableFullContext: true }),
      new DirectoryContextModifier(),
      new IdeContextModifier({
        includeActiveFile: true,
        includeOpenFiles: true,
        includeCursorPosition: true,
        includeSelectedText: true,
      }),
      new CoreSystemPromptModifier({ customSystemPrompt: PLANNER_SYSTEM_PROMPT }),
      new ToolInjectionModifier({ includeToolDescriptions: true }),
      new AtFileProcessorModifier({ enableRecursiveSearch: true }),
    ],
    baseSystemPrompt: PLANNER_SYSTEM_PROMPT,
  });

  let prompt = await promptGenerator.processMessage(reqMessage);
  let executionResult = null;
  let continueLoop = false;

  do {
    continueLoop = false;
    const result = await runWhileLoop(reqMessage, prompt);
    if (result instanceof Error) {
      throw result;
    }

    executionResult = result.executionResult;
    prompt = result.prompt;

    const runningCount = agentTracker && agentTracker.getRunningAgentCount
      ? agentTracker.getRunningAgentCount()
      : 0;
    const pendingEventCount = eventQueue && eventQueue.getPendingExternalEventCount
      ? eventQueue.getPendingExternalEventCount()
      : 0;

    if (runningCount > 0 || pendingEventCount > 0) {
      continueLoop = true;

      if (pendingEventCount === 0 && runningCount > 0 && eventQueue.waitForAnyExternalEvent) {
        const nextEvent = await eventQueue.waitForAnyExternalEvent();
        processExternalEvent(nextEvent, prompt);
      }

      if (eventQueue.getPendingExternalEvents) {
        const remainingEvents = eventQueue.getPendingExternalEvents();
        for (const event of remainingEvents) {
          processExternalEvent(event, prompt);
        }
      }
    }
  } while (continueLoop);

  return executionResult;
}

async function createGenerationPlan(reqMessage) {
  const userText = getUserText(reqMessage);
  try {
    const executionResult = await runPlannerLoop(reqMessage);
    if (executionResult && executionResult.finalMessage) {
      const parsed = parseJson(executionResult.finalMessage);
      const artifacts = Array.isArray(parsed.artifacts)
        ? parsed.artifacts
        : Array.isArray(parsed.result && parsed.result.artifacts)
          ? parsed.result.artifacts
          : [];

      if (artifacts.length > 0) {
        return {
          intentSummary: parsed.intentSummary || parsed.result && parsed.result.intentSummary || userText.slice(0, 140),
          artifacts,
        };
      }
    }
  } catch (error) {
    await codebolt.chat.sendMessage(`Planner fallback used: ${error.message}`, {});
  }

  return {
    intentSummary: userText.slice(0, 140),
    artifacts: inferArtifactsFromText(userText),
  };
}

async function runArtifact(spec) {
  const blockName = ARTIFACT_BLOCKS[spec.artifactType];
  const actionBlockPath = getActionBlockPath(blockName);
  const invocationNames = getActionBlockInvocationNames(blockName);

  await codebolt.chat.sendMessage(`Starting ${spec.artifactType}: ${spec.name}`, {
    actionBlockPath,
    actionBlockNames: invocationNames,
    targetDirectory: spec.targetDirectory,
  });

  let result = null;
  if (platformRuntime.actionBlock && platformRuntime.actionBlock.start) {
    const errors = [];
    for (const actionBlockName of invocationNames) {
      const attempt = await platformRuntime.actionBlock.start(actionBlockName, { spec });
      if (attempt && attempt.success) {
        result = attempt;
        break;
      }

      const errorMessage = attempt && attempt.error ? attempt.error : `ActionBlock failed: ${actionBlockName}`;
      errors.push(`${actionBlockName}: ${errorMessage}`);
      if (!isMissingActionBlockError(errorMessage)) {
        result = attempt;
        break;
      }
    }

    if (!result && !(platformRuntime.sideExecution && platformRuntime.sideExecution.startWithActionBlock)) {
      throw new Error(errors.join('; ') || `ActionBlock failed: ${blockName}`);
    }
  }

  if (!result) {
    const modulePath = path.join(actionBlockPath, 'dist', 'index.js');
    const actionBlockModule: LocalActionBlockModule = await import(modulePath);
    const runner = actionBlockModule.runActionBlockMiniAgent
      || (actionBlockModule.default && actionBlockModule.default.runActionBlockMiniAgent);

    if (runner) {
      result = {
        success: true,
        result: await runner({ params: { spec } }),
      };
    }
  }

  if (!result && platformRuntime.sideExecution && platformRuntime.sideExecution.startWithActionBlock) {
    result = await platformRuntime.sideExecution.startWithActionBlock(
      actionBlockPath,
      { spec },
      ACTION_BLOCK_TIMEOUT_MS,
    );
  }

  if (!result) {
    throw new Error('No CodeBolt ActionBlock execution API is available in this runtime');
  }

  if (!result || !result.success) {
    throw new Error((result && result.error) || `ActionBlock failed: ${blockName}`);
  }

  return result.result && typeof result.result === 'object'
    ? result.result as Record<string, unknown>
    : {};
}

codebolt.onMessage(async (reqMessage) => {
  const userText = getUserText(reqMessage);
  try {
    await codebolt.chat.sendMessage('PlatformMofier planning phase started.', {});

    const projectPath = await getProjectPath();
    const plan = await createGenerationPlan(reqMessage);
    const specs = plan.artifacts.map((artifact) => normalizeArtifact(artifact, projectPath, userText));
    const results = [];

    await codebolt.chat.sendMessage(`PlatformMofier planned ${specs.length} artifact(s). Starting internal ActionBlocks.`, {
      artifacts: specs.map((spec) => ({ artifactType: spec.artifactType, name: spec.name })),
    });

    for (const spec of specs) {
      const result = await runArtifact(spec);
      results.push({
        artifactType: spec.artifactType,
        name: spec.name,
        targetDirectory: spec.targetDirectory,
        ...result,
      });
    }

    const summary = results
      .map((result) => `- ${result.artifactType} ${result.name}: ${result.artifactPath || result.targetDirectory}`)
      .join('\n');

    await codebolt.chat.sendMessage(`PlatformMofier completed:\n${summary}`, { results });
    return JSON.stringify({ success: true, intentSummary: plan.intentSummary, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await codebolt.chat.sendMessage(`PlatformMofier failed: ${message}`, {});
    return JSON.stringify({ success: false, error: message });
  }
});
