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

interface PostGenerationTestStep {
  name: string;
  tool: string;
  success: boolean;
  skipped?: boolean;
  error?: string;
  result?: unknown;
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
const POST_GENERATION_TEST_TIMEOUT_MS = 120000;

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

function getPlannerResult(parsed) {
  return parsed && parsed.result && typeof parsed.result === 'object' ? parsed.result : {};
}

function getPlannerText(value) {
  return typeof value === 'string' ? value : '';
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

function isSuccessResponse(response) {
  if (!response || typeof response !== 'object') {
    return true;
  }

  if (response.success === false || response.error) {
    return false;
  }

  if (typeof response.exitCode === 'number' && response.exitCode !== 0) {
    return false;
  }

  return true;
}

function simplifyResult(value) {
  if (value === undefined) {
    return undefined;
  }

  try {
    return JSON.parse(JSON.stringify(value));
  } catch (_error) {
    return String(value);
  }
}

async function runOptionalTestStep(name, tool, steps, runner) {
  try {
    const result = await runner();
    steps.push({
      name,
      tool,
      success: isSuccessResponse(result),
      result: simplifyResult(result),
    });
  } catch (error) {
    steps.push({
      name,
      tool,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

function addSkippedTestStep(name, tool, steps, reason) {
  steps.push({
    name,
    tool,
    success: false,
    skipped: true,
    error: reason,
  });
}

function getResultUrl(result) {
  if (!result || typeof result !== 'object') {
    return '';
  }

  const record = result as Record<string, unknown>;
  for (const key of ['url', 'previewUrl', 'previewURL', 'localUrl', 'localURL', 'debugUrl', 'debugURL']) {
    if (typeof record[key] === 'string') {
      return String(record[key]);
    }
  }

  return '';
}

function getTestingToolPlan(artifactType) {
  const common = ['terminal_execute_command', 'autotesting_create_suite', 'autotesting_create_case', 'autotesting_create_run', 'autotesting_update_run_status'];
  const plans = {
    agent: ['agent_list', 'agent_details', 'agent_start'],
    plugin: ['mcp_get_tools', 'mcp_execute_tool', 'capability_list', 'capability_get_status'],
    'llm-plugin': ['llm_get_config', 'llm_inference'],
    'websearch-plugin': ['search_web', 'web_fetch', 'browser_search'],
    provider: ['environment_get_local_providers', 'environment_get_running_providers', 'environment_status', 'environment_start_agent', 'environment_send_message'],
    'dynamic-panel': ['debug_open_browser', 'browser_navigate', 'browser_get_html', 'browser_screenshot', 'crawler_start', 'crawler_go_to_page', 'crawler_click'],
    'custom-ui': ['debug_open_browser', 'browser_navigate', 'browser_get_html', 'browser_screenshot', 'crawler_start', 'crawler_go_to_page', 'crawler_click'],
    'action-block': ['actionBlock_list', 'actionBlock_getDetail', 'actionBlock_start', 'side_execution_list_action_blocks', 'side_execution_start_action_block', 'side_execution_get_status'],
    tool: ['mcp_get_tools', 'mcp_execute_tool', 'getLocalToolBoxes', 'listToolsFromToolBoxes'],
  };

  return [...common, ...(plans[artifactType] || [])];
}

async function recordAutoTestingRun(spec, steps) {
  const runtime = codebolt as any;
  const autoTesting = runtime.autoTesting;
  if (!autoTesting || !autoTesting.createSuite || !autoTesting.createCase || !autoTesting.createRun) {
    addSkippedTestStep('Record generated feature test run', 'autotesting_create_suite/autotesting_create_case/autotesting_create_run', steps, 'autoTesting SDK module is unavailable in this runtime');
    return;
  }

  await runOptionalTestStep('Record generated feature test run', 'autotesting_create_suite/autotesting_create_case/autotesting_create_run', steps, async () => {
    const fullName = spec.fullName || spec.displayName || spec.name;
    const key = `platform-${spec.artifactType}-${String(spec.name || 'artifact').replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`;
    const testCase = await autoTesting.createCase({
      key,
      name: `Smoke test ${spec.artifactType}: ${fullName}`,
      description: `Post-generation validation for ${spec.artifactType} ${fullName}`,
      steps: [
        { content: `Build ${fullName} (${spec.name}) with npm run build`, order: 1 },
        { content: `Validate ${fullName} with feature-specific CodeBolt JS tools: ${getTestingToolPlan(spec.artifactType).join(', ')}`, order: 2 },
      ],
      labels: ['platform-mofier', spec.artifactType],
      priority: 'automated',
      type: 'post-generation-smoke',
    });
    const testCaseId = testCase && testCase.payload && testCase.payload.case
      ? testCase.payload.case.id
      : testCase && testCase.payload && testCase.payload.testCase
        ? testCase.payload.testCase.id
        : undefined;
    const suite = await autoTesting.createSuite({
      name: `PlatformMofier ${spec.artifactType} smoke: ${fullName}`,
      description: `Post-generation smoke suite for ${spec.targetDirectory}`,
      testCaseIds: testCaseId ? [testCaseId] : [],
    });
    const suiteId = suite && suite.payload && suite.payload.suite ? suite.payload.suite.id : undefined;
    const run = suiteId
      ? await autoTesting.createRun({ testSuiteId: suiteId, name: `Post-generation run: ${fullName}` })
      : undefined;

    return { testCase, suite, run };
  });
}

async function runTerminalBuildTest(spec, steps) {
  const runtime = codebolt as any;
  if (!runtime.terminal || !runtime.terminal.executeCommand) {
    addSkippedTestStep('Build generated artifact', 'terminal_execute_command', steps, 'terminal SDK module is unavailable in this runtime');
    return;
  }

  const command = spec.artifactType === 'tool'
    ? `cd ${shellQuote(spec.targetDirectory)} && test -f codebolttool.yaml && node --check index.js`
    : `cd ${shellQuote(spec.targetDirectory)} && npm run build`;

  await runOptionalTestStep('Build generated artifact', 'terminal_execute_command', steps, () => (
    runtime.terminal.executeCommand(command)
  ));
}

async function runActionBlockFeatureTests(spec, steps) {
  const runtime = codebolt as any;
  if (runtime.actionBlock && runtime.actionBlock.list) {
    await runOptionalTestStep('List registered ActionBlocks', 'actionBlock_list', steps, () => runtime.actionBlock.list());
  } else {
    addSkippedTestStep('List registered ActionBlocks', 'actionBlock_list', steps, 'actionBlock SDK module is unavailable in this runtime');
  }

  if (runtime.actionBlock && runtime.actionBlock.getDetail) {
    await runOptionalTestStep('Inspect generated ActionBlock metadata', 'actionBlock_getDetail', steps, () => runtime.actionBlock.getDetail(spec.name));
  } else {
    addSkippedTestStep('Inspect generated ActionBlock metadata', 'actionBlock_getDetail', steps, 'actionBlock SDK module is unavailable in this runtime');
  }

  if (runtime.actionBlock && runtime.actionBlock.start) {
    await runOptionalTestStep('Run generated ActionBlock by name', 'actionBlock_start', steps, () => runtime.actionBlock.start(spec.name, { smokeTest: true, spec }));
  } else {
    addSkippedTestStep('Run generated ActionBlock by name', 'actionBlock_start', steps, 'actionBlock SDK module is unavailable in this runtime');
  }

  if (runtime.sideExecution && runtime.sideExecution.listActionBlocks) {
    await runOptionalTestStep('List ActionBlocks through side execution', 'side_execution_list_action_blocks', steps, () => runtime.sideExecution.listActionBlocks(spec.projectPath));
  }

  if (runtime.sideExecution && runtime.sideExecution.startWithActionBlock) {
    await runOptionalTestStep('Run generated ActionBlock by path', 'side_execution_start_action_block', steps, async () => {
      const response = await runtime.sideExecution.startWithActionBlock(spec.targetDirectory, { smokeTest: true, spec }, POST_GENERATION_TEST_TIMEOUT_MS);
      const sideExecutionId = response && (response.sideExecutionId || response.id);
      if (sideExecutionId && runtime.sideExecution.getStatus) {
        const status = await runtime.sideExecution.getStatus(sideExecutionId);
        return { response, status };
      }
      return response;
    });
  } else {
    addSkippedTestStep('Run generated ActionBlock by path', 'side_execution_start_action_block', steps, 'sideExecution SDK module is unavailable in this runtime');
  }
}

async function runAgentFeatureTests(spec, steps) {
  const runtime = codebolt as any;
  if (!runtime.agent) {
    addSkippedTestStep('Validate generated agent registration', 'agent_list/agent_details/agent_start', steps, 'agent SDK module is unavailable in this runtime');
    return;
  }

  if (runtime.agent.getAgentsList) {
    await runOptionalTestStep('List registered agents', 'agent_list', steps, () => runtime.agent.getAgentsList());
  }
  if (runtime.agent.getAgentsDetail) {
    await runOptionalTestStep('Inspect generated agent details', 'agent_details', steps, () => runtime.agent.getAgentsDetail([spec.name]));
  }
  if (runtime.agent.startAgent) {
    await runOptionalTestStep('Run generated agent smoke task', 'agent_start', steps, () => runtime.agent.startAgent(spec.name, 'Smoke test: respond with a short JSON success object.'));
  }
}

async function runProviderFeatureTests(spec, steps) {
  const runtime = codebolt as any;
  const environment = runtime.environment;
  if (!environment) {
    addSkippedTestStep('Validate generated provider registration', 'environment_get_local_providers/environment_get_running_providers', steps, 'environment SDK module is unavailable in this runtime');
    return;
  }

  if (environment.getLocalProviders) {
    await runOptionalTestStep('List local environment providers', 'environment_get_local_providers', steps, () => environment.getLocalProviders());
  }
  if (environment.getRunningProviders) {
    await runOptionalTestStep('List running environment providers', 'environment_get_running_providers', steps, () => environment.getRunningProviders());
  }
}

async function runLlmPluginFeatureTests(_spec, steps) {
  const runtime = codebolt as any;
  if (!runtime.llm) {
    addSkippedTestStep('Validate LLM provider plugin', 'llm_get_config/llm_inference', steps, 'llm SDK module is unavailable in this runtime');
    return;
  }

  if (runtime.llm.getConfig) {
    await runOptionalTestStep('Read LLM configuration', 'llm_get_config', steps, () => runtime.llm.getConfig());
  }
  if (runtime.llm.inference) {
    await runOptionalTestStep('Run LLM provider smoke inference', 'llm_inference', steps, () => runtime.llm.inference({
      messages: [{ role: 'user', content: 'Smoke test this provider with a short response.' }],
      max_tokens: 32,
      saveToContext: false,
    }));
  }
}

async function runWebSearchPluginFeatureTests(_spec, steps) {
  const runtime = codebolt as any;
  if (runtime.webSearch && runtime.webSearch.search) {
    await runOptionalTestStep('Run web search provider smoke query', 'search_web', steps, () => runtime.webSearch.search('CodeBolt smoke test'));
    return;
  }

  if (runtime.browser && runtime.browser.search) {
    await runOptionalTestStep('Run browser search smoke query', 'browser_search', steps, () => runtime.browser.search('CodeBolt smoke test'));
    return;
  }

  addSkippedTestStep('Run web search provider smoke query', 'search_web/browser_search', steps, 'webSearch and browser search SDK modules are unavailable in this runtime');
}

async function runGenericPluginFeatureTests(_spec, steps) {
  const runtime = codebolt as any;
  if (runtime.mcp && runtime.mcp.getMcpTools) {
    await runOptionalTestStep('List MCP tools exposed by plugins', 'mcp_get_tools', steps, () => runtime.mcp.getMcpTools());
  } else {
    addSkippedTestStep('List MCP tools exposed by plugins', 'mcp_get_tools', steps, 'mcp SDK module is unavailable in this runtime');
  }

  if (runtime.capability && runtime.capability.list) {
    await runOptionalTestStep('List capabilities exposed by plugins', 'capability_list', steps, () => runtime.capability.list());
  }
}

async function runUiFeatureTests(spec, result, steps) {
  const runtime = codebolt as any;
  const url = getResultUrl(result);
  if (!url) {
    addSkippedTestStep('Open generated UI for visual smoke test', 'debug_open_browser/browser_navigate/browser_screenshot', steps, 'generated result did not include a URL to open');
    return;
  }

  if (runtime.debug && runtime.debug.openDebugBrowser) {
    await runOptionalTestStep('Open debug browser for generated UI', 'debug_open_browser', steps, () => runtime.debug.openDebugBrowser(url, 3000));
  }
  if (runtime.browser && runtime.browser.goToPage) {
    await runOptionalTestStep('Navigate browser to generated UI', 'browser_navigate', steps, () => runtime.browser.goToPage(url));
  }
  if (runtime.browser && runtime.browser.screenshot) {
    await runOptionalTestStep('Capture generated UI screenshot', 'browser_screenshot', steps, () => runtime.browser.screenshot({ fullPage: true }));
  }
}

async function runPostGenerationTests(spec, result) {
  const steps: PostGenerationTestStep[] = [];
  await runTerminalBuildTest(spec, steps);
  await recordAutoTestingRun(spec, steps);

  if (spec.artifactType === 'action-block') {
    await runActionBlockFeatureTests(spec, steps);
  } else if (spec.artifactType === 'agent') {
    await runAgentFeatureTests(spec, steps);
  } else if (spec.artifactType === 'provider') {
    await runProviderFeatureTests(spec, steps);
  } else if (spec.artifactType === 'llm-plugin') {
    await runLlmPluginFeatureTests(spec, steps);
  } else if (spec.artifactType === 'websearch-plugin') {
    await runWebSearchPluginFeatureTests(spec, steps);
  } else if (spec.artifactType === 'dynamic-panel' || spec.artifactType === 'custom-ui') {
    await runGenericPluginFeatureTests(spec, steps);
    await runUiFeatureTests(spec, result, steps);
  } else if (spec.artifactType === 'plugin') {
    await runGenericPluginFeatureTests(spec, steps);
  } else if (spec.artifactType === 'tool') {
    await runGenericPluginFeatureTests(spec, steps);
  }

  const executedSteps = steps.filter((step) => !step.skipped);
  return {
    requiredTools: getTestingToolPlan(spec.artifactType),
    attempted: steps,
    passed: executedSteps.length > 0 && executedSteps.every((step) => step.success),
  };
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
      const parsedResult = getPlannerResult(parsed);
      const artifacts = Array.isArray(parsed.artifacts)
        ? parsed.artifacts
        : Array.isArray(parsedResult.artifacts)
          ? parsedResult.artifacts
          : [];

      if (parsed.status === 'answer' || parsedResult.status === 'answer') {
        return {
          intentSummary: parsed.intentSummary || parsedResult.intentSummary || userText.slice(0, 140),
          directResponse: getPlannerText(parsed.message)
            || getPlannerText(parsed.response)
            || getPlannerText(parsedResult.message)
            || getPlannerText(parsedResult.response),
          artifacts: [],
        };
      }

      if (artifacts.length > 0) {
        return {
          intentSummary: parsed.intentSummary || parsedResult.intentSummary || userText.slice(0, 140),
          artifacts,
        };
      }
    }
  } catch (_error) {
  }

  return {
    intentSummary: userText.slice(0, 140),
    directResponse: '',
    artifacts: inferArtifactsFromText(userText),
  };
}

async function runArtifact(spec) {
  const blockName = ARTIFACT_BLOCKS[spec.artifactType];
  const actionBlockPath = getActionBlockPath(blockName);
  const invocationNames = getActionBlockInvocationNames(blockName);

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
    const projectPath = await getProjectPath();
    const plan = await createGenerationPlan(reqMessage);

    if (!plan.artifacts.length) {
      const response = plan.directResponse || '';
      if (response) {
        await codebolt.chat.sendMessage(response, {});
      }
      return JSON.stringify({ success: true, intentSummary: plan.intentSummary, response });
    }

    const specs = plan.artifacts.map((artifact) => normalizeArtifact(artifact, projectPath, userText));
    const results = [];

    for (const spec of specs) {
      const result = await runArtifact(spec);
      const tests = await runPostGenerationTests(spec, result);
      results.push({
        artifactType: spec.artifactType,
        name: spec.name,
        fullName: spec.fullName || spec.displayName || spec.name,
        targetDirectory: spec.targetDirectory,
        ...result,
        tests,
      });
    }

    return JSON.stringify({ success: true, intentSummary: plan.intentSummary, results });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return JSON.stringify({ success: false, error: message });
  }
});
