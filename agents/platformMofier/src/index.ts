import codebolt from '@codebolt/codeboltjs';
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
  getActionBlockPath,
  inferArtifactsFromText,
  normalizeArtifact,
} from './artifactRegistry';

const eventQueue = codebolt.agentEventQueue;
const agentTracker = codebolt.backgroundChildThreads;

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

function parseJson(text) {
  const clean = stripCodeFence(text);
  try {
    return JSON.parse(clean);
  } catch (_error) {
    const match = clean.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new Error('No JSON object found in planner response');
    }
    return JSON.parse(match[0]);
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

  await codebolt.chat.sendMessage(`Starting ${spec.artifactType}: ${spec.name}`, {
    actionBlockPath,
    targetDirectory: spec.targetDirectory,
  });

  const result = await codebolt.sideExecution.startWithActionBlock(
    actionBlockPath,
    { spec },
    900000,
  );

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
