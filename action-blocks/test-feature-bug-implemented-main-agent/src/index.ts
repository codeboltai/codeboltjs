import codebolt from '@codebolt/codeboltjs';
import { CodeboltAgent, LoopDetectionService } from '@codebolt/agent/unified';
import {
  CoreSystemPromptModifier,
  ToolInjectionModifier,
} from '@codebolt/agent/processor-pieces';
import type { FlatUserMessage } from '@codebolt/types/sdk';
import fs from 'fs';
import os from 'os';
import path from 'path';

const STARTUP_MESSAGE = 'CLI testing ActionBlock started';
const MAX_THREAD_MESSAGES = 24;
const MAX_BEHAVIORAL_THREAD_MESSAGES = 12;
const MAX_MESSAGE_CONTENT_LENGTH = 4000;
const AGENTIC_TUI_SESSION_PREFIX = 'actionblock-agentic-tui';
const AGENTIC_TUI_TEMP_PROJECT_PREFIX = 'codebolt-agentic-tui-test-';
const ACTIONBLOCK_EXIT_DELAY_MS = 250;

type VerificationVerdict = 'passed' | 'failed' | 'inconclusive';

interface ActionBlockInvocationMetadata {
  sideExecutionId?: string;
  threadId?: string;
  parentAgentId?: string;
  parentAgentInstanceId?: string;
  timestamp?: string;
}

interface ThreadContextMessage {
  messageId?: string;
  sender?: string;
  role?: string;
  templateType?: string;
  content: string;
  timestamp?: string;
}

interface SanitizedInvocationContext {
  threadId?: string;
  projectPath?: string;
  agentId?: string;
  agentInstanceId?: string;
  params: Record<string, unknown>;
  spec?: unknown;
  messages: ThreadContextMessage[];
}

interface StartupMessageResult {
  sent: boolean;
  warning?: string;
}

interface LifecycleStepResult {
  name: string;
  phase: 'setup' | 'package' | 'launch' | 'cleanup';
  scriptName: string;
  success: boolean;
  outputPreview: string;
  exitCode?: number;
  warning?: string;
}

interface AgenticTuiSessionResult {
  sessionId: string;
  started: boolean;
  projectPath?: string;
  sourceProjectPath?: string;
  screenPreview?: string;
  warning?: string;
  raw?: unknown;
  cleanup?: {
    attempted: boolean;
    success: boolean;
    warning?: string;
  };
  tempProjectCleanup?: {
    attempted: boolean;
    success: boolean;
    warning?: string;
  };
}

interface AgentCommandReport {
  command: string;
  cwd?: string;
  success?: boolean;
  exitCode?: number;
  summary?: string;
}

interface AgentCheckReport {
  name: string;
  success: boolean;
  details: string;
}

interface AgentVerificationReport {
  verdict: VerificationVerdict;
  summary: string;
  scope: string[];
  commandsRun: AgentCommandReport[];
  checks: AgentCheckReport[];
  issues: string[];
  recommendations: string[];
  rawFinalMessage?: string;
  parseError?: string;
}

interface VerificationResult {
  checks: AgentCheckReport[];
  passed: boolean;
}

interface ActionBlockResult {
  success: boolean;
  result: {
    title: string;
    startupMessage: string;
    startupMessageSent: boolean;
    startupMessageWarning?: string;
    lifecycleSteps: LifecycleStepResult[];
    agenticTuiSession: AgenticTuiSessionResult;
    sanitizedSpec?: unknown;
    sanitizedParams: Record<string, unknown>;
    miniAgentReport: AgentVerificationReport;
    miniAgentFinalMessage?: string;
    recommendations: string[];
  };
  verification: VerificationResult;
  filesCreated: string[];
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringifyForPrompt(value: unknown, maxLength = 20000): string {
  const serialized = typeof value === 'string' ? value : JSON.stringify(value, null, 2);
  if (!serialized) {
    return '';
  }
  return serialized.length > maxLength ? `${serialized.slice(0, maxLength)}...` : serialized;
}

function normalizeText(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value === undefined || value === null) {
    return '';
  }
  return stringifyForPrompt(value, MAX_MESSAGE_CONTENT_LENGTH);
}

function redactDeterministicCommandText(text: string): string {
  return text
    .replace(/\bnpm\s+(?:install|intall|i)\b[^\n\r]*/gi, '[redacted deterministic setup command]')
    .replace(/\bnpm\s+run\s+build\b[^\n\r]*/gi, '[redacted deterministic package command]')
    .replace(/\bnpm\s+(?:run\s+)?start\b[^\n\r]*/gi, '[redacted deterministic launch command]');
}

function sanitizeInvocationValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeInvocationValue);
  }

  if (typeof value === 'string') {
    return redactDeterministicCommandText(value);
  }

  if (!isRecord(value)) {
    return value;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    const normalizedKey = key.toLowerCase();
    const isCallerSuppliedCommand =
      normalizedKey === 'command' ||
      normalizedKey === 'commands' ||
      normalizedKey === 'shellcommand' ||
      normalizedKey === 'terminalcommand';

    if (isCallerSuppliedCommand) {
      sanitized[key] = '[removed: verifier chooses commands independently]';
      continue;
    }

    sanitized[key] = sanitizeInvocationValue(nestedValue);
  }

  return sanitized;
}

function sanitizeParams(rawParams: unknown): Record<string, unknown> {
  if (!isRecord(rawParams)) {
    return {};
  }

  const sanitized = sanitizeInvocationValue(rawParams);
  return isRecord(sanitized) ? sanitized : {};
}

function normalizeThreadMessages(rawMessages: unknown): ThreadContextMessage[] {
  if (!Array.isArray(rawMessages)) {
    return [];
  }

  return rawMessages
    .slice(-MAX_THREAD_MESSAGES)
    .map((rawMessage): ThreadContextMessage | undefined => {
      if (!isRecord(rawMessage)) {
        return undefined;
      }

      const content = redactDeterministicCommandText(normalizeText(rawMessage.content));
      if (!content.trim()) {
        return undefined;
      }

      return {
        messageId: typeof rawMessage.messageId === 'string' ? rawMessage.messageId : undefined,
        sender: typeof rawMessage.sender === 'string' ? rawMessage.sender : undefined,
        role: typeof rawMessage.role === 'string' ? rawMessage.role : undefined,
        templateType: typeof rawMessage.templateType === 'string' ? rawMessage.templateType : undefined,
        timestamp: typeof rawMessage.timestamp === 'string' ? rawMessage.timestamp : undefined,
        content: content.length > MAX_MESSAGE_CONTENT_LENGTH
          ? `${content.slice(0, MAX_MESSAGE_CONTENT_LENGTH)}...`
          : content,
      };
    })
    .filter((message): message is ThreadContextMessage => Boolean(message));
}

function normalizeInvocationContext(threadContext: unknown): SanitizedInvocationContext {
  const context = isRecord(threadContext) ? threadContext : {};
  const sanitizedParams = sanitizeParams(context.params);

  return {
    threadId: typeof context.threadId === 'string' ? context.threadId : undefined,
    projectPath: typeof context.projectPath === 'string' ? context.projectPath : undefined,
    agentId: typeof context.agentId === 'string' ? context.agentId : undefined,
    agentInstanceId: typeof context.agentInstanceId === 'string' ? context.agentInstanceId : undefined,
    params: sanitizedParams,
    spec: sanitizedParams.spec,
    messages: normalizeThreadMessages(context.messages),
  };
}

function deriveTitle(context: SanitizedInvocationContext): string {
  const spec = context.spec;
  if (typeof spec === 'string' && spec.trim()) {
    return spec.trim().slice(0, 120);
  }

  if (isRecord(spec)) {
    const title = spec.title || spec.featureName || spec.bugSummary || spec.description;
    if (typeof title === 'string' && title.trim()) {
      return title.trim().slice(0, 120);
    }
  }

  return 'GotUI and CLI Feature/Bug Verification';
}

async function sendStartupMessage(): Promise<StartupMessageResult> {
  try {
    const chatApi = (codebolt as unknown as {
      chat?: { sendMessage?: (message: string, payload?: object) => unknown };
    }).chat;

    if (!chatApi?.sendMessage) {
      return {
        sent: false,
        warning: 'codebolt.chat.sendMessage is unavailable in this runtime.',
      };
    }

    await Promise.resolve(chatApi.sendMessage(STARTUP_MESSAGE, {
      source: 'test-feature-bug-implemented-main-agent',
    }));

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      warning: error instanceof Error ? error.message : String(error),
    };
  }
}

function extractExitCode(raw: unknown): number | undefined {
  if (isRecord(raw)) {
    if (typeof raw.exitCode === 'number') {
      return raw.exitCode;
    }
    if (typeof raw.code === 'number') {
      return raw.code;
    }
    if (typeof raw.status === 'number') {
      return raw.status;
    }
  }

  const serialized = stringifyForPrompt(raw, 6000);
  const exitCodeMatch = serialized.match(/(?:exitCode|exit code|code|status)["'\s:=]+(-?\d+)/i);
  return exitCodeMatch ? Number(exitCodeMatch[1]) : undefined;
}

function inferCommandSuccess(raw: unknown, exitCode: number | undefined): boolean {
  if (exitCode !== undefined) {
    return exitCode === 0;
  }

  if (isRecord(raw) && typeof raw.success === 'boolean') {
    return raw.success;
  }

  const serialized = stringifyForPrompt(raw, 6000).toLowerCase();
  if (/command_error|error|failed|exit code [1-9]/.test(serialized)) {
    return false;
  }

  return true;
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

async function runLifecycleScript(
  name: string,
  phase: LifecycleStepResult['phase'],
  scriptName: string,
  sourceProjectPath: string,
): Promise<LifecycleStepResult> {
  const command = [
    `cd ${shellQuote(process.cwd())}`,
    `CODEBOLT_BASE_PROJECT_PATH=${shellQuote(sourceProjectPath)} npm run ${scriptName}`,
  ].join(' && ');

  try {
    const terminalApi = (codebolt as unknown as {
      terminal?: { executeCommand?: (command: string, returnEmptyStringOnSuccess?: boolean) => Promise<unknown> };
    }).terminal;

    if (!terminalApi?.executeCommand) {
      throw new Error('codebolt.terminal.executeCommand is unavailable in this runtime.');
    }

    const raw = await terminalApi.executeCommand(command, false);
    const exitCode = extractExitCode(raw);

    return {
      name,
      phase,
      scriptName,
      success: inferCommandSuccess(raw, exitCode),
      exitCode,
      outputPreview: stringifyForPrompt(raw, 3000),
    };
  } catch (error) {
    return {
      name,
      phase,
      scriptName,
      success: false,
      outputPreview: error instanceof Error ? error.message : String(error),
      warning: error instanceof Error ? error.message : String(error),
    };
  }
}

function extractProjectPathResponse(raw: unknown): string | undefined {
  if (!isRecord(raw)) {
    return undefined;
  }

  if (typeof raw.projectPath === 'string' && raw.projectPath.trim()) {
    return raw.projectPath.trim();
  }

  const projectSettings = raw.projectSettings;
  if (
    isRecord(projectSettings) &&
    typeof projectSettings.user_active_project_path === 'string' &&
    projectSettings.user_active_project_path.trim()
  ) {
    return projectSettings.user_active_project_path.trim();
  }

  return undefined;
}

async function resolveProjectRoot(context: SanitizedInvocationContext): Promise<string> {
  let projectPathError: string | undefined;

  try {
    const projectApi = (codebolt as unknown as {
      project?: {
        getProjectPath?: () => Promise<unknown>;
      };
    }).project;

    if (projectApi?.getProjectPath) {
      const response = await projectApi.getProjectPath();
      const projectPath = extractProjectPathResponse(response);
      if (projectPath) {
        return projectPath;
      }

      projectPathError = `codebolt.project.getProjectPath returned no projectPath: ${stringifyForPrompt(response, 1000)}`;
    } else {
      projectPathError = 'codebolt.project.getProjectPath is unavailable in this runtime.';
    }
  } catch (error) {
    projectPathError = error instanceof Error ? error.message : String(error);
  }

  if (context.projectPath) {
    return context.projectPath;
  }

  const envProjectPath = process.env.CODEBOLT_EFFECTIVE_PROJECT_PATH || process.env.CODEBOLT_PROJECT_PATH;
  if (envProjectPath) {
    return envProjectPath;
  }

  throw new Error(`Unable to resolve CodeBolt project path. ${projectPathError}`);
}

function createAgenticTuiTestProject(sourceProjectPath: string): string {
  const testProjectPath = fs.mkdtempSync(path.join(os.tmpdir(), AGENTIC_TUI_TEMP_PROJECT_PREFIX));
  fs.writeFileSync(
    path.join(testProjectPath, 'README.md'),
    [
      '# Agentic TUI Test Workspace',
      '',
      'Temporary workspace created by test-feature-bug-implemented-main-agent.',
      `Source project under verification: ${sourceProjectPath}`,
      'Use this folder only for black-box Agentic TUI behavior tests.',
      '',
    ].join('\n'),
  );

  return testProjectPath;
}

function cleanupAgenticTuiTestProject(
  agenticTuiSession: AgenticTuiSessionResult,
): AgenticTuiSessionResult['tempProjectCleanup'] {
  if (!agenticTuiSession.projectPath) {
    return {
      attempted: false,
      success: true,
    };
  }

  const resolvedProjectPath = path.resolve(agenticTuiSession.projectPath);
  const resolvedTempRoot = path.resolve(os.tmpdir());
  const isExpectedTempProject =
    path.basename(resolvedProjectPath).startsWith(AGENTIC_TUI_TEMP_PROJECT_PREFIX) &&
    resolvedProjectPath.startsWith(`${resolvedTempRoot}${path.sep}`);

  if (!isExpectedTempProject) {
    return {
      attempted: false,
      success: false,
      warning: `Refusing to remove non-temp Agentic TUI project path: ${agenticTuiSession.projectPath}`,
    };
  }

  try {
    fs.rmSync(resolvedProjectPath, { recursive: true, force: true });
    return {
      attempted: true,
      success: true,
    };
  } catch (error) {
    return {
      attempted: true,
      success: false,
      warning: error instanceof Error ? error.message : String(error),
    };
  }
}

function extractScreenPreview(raw: unknown): string {
  if (typeof raw === 'string') {
    return raw.length > 3000 ? `${raw.slice(0, 3000)}...` : raw;
  }

  if (isRecord(raw)) {
    const result = isRecord(raw.result) ? raw.result : raw;
    const output = result.screen || result.output || result.text || raw.screen || raw.output;
    if (typeof output === 'string') {
      return output.length > 3000 ? `${output.slice(0, 3000)}...` : output;
    }
  }

  return stringifyForPrompt(raw, 3000);
}

function buildNotStartedSession(warning: string): AgenticTuiSessionResult {
  return {
    sessionId: '',
    started: false,
    warning,
  };
}

async function startAgenticTuiSession(
  sourceProjectPath: string,
): Promise<{ step: LifecycleStepResult; session: AgenticTuiSessionResult }> {
  const testProjectPath = createAgenticTuiTestProject(sourceProjectPath);
  const sessionId = `${AGENTIC_TUI_SESSION_PREFIX}-${Date.now()}`;

  try {
    const terminalApi = (codebolt as unknown as {
      terminal?: {
        tui?: {
          run?: (params: {
            command: string;
            args?: string[];
            cwd?: string;
            env?: Record<string, string>;
            cols?: number;
            rows?: number;
            visible?: boolean;
            sessionId?: string;
          }) => Promise<unknown>;
          wait?: (params: {
            sessionId?: string;
            text?: string;
            stable?: boolean;
            timeoutMs?: number;
          }) => Promise<unknown>;
          screen?: (params: {
            sessionId?: string;
            trimWhitespace?: boolean;
            includeEmpty?: boolean;
          }) => Promise<unknown>;
        };
      };
    }).terminal;

    if (!terminalApi?.tui?.run) {
      throw new Error('codebolt.terminal.tui.run is unavailable in this runtime.');
    }

    const raw = await terminalApi.tui.run({
      command: 'node',
      args: [
        'packages/cli/dist/index.js',
        '--project',
        testProjectPath
      ],
      cwd: sourceProjectPath,
      visible: true,
      cols: 120,
      rows: 40,
      sessionId,
    });

    if (terminalApi.tui.wait) {
      await terminalApi.tui.wait({
        sessionId,
        stable: true,
        timeoutMs: 10000,
      });
    }

    const screen = terminalApi.tui.screen
      ? await terminalApi.tui.screen({
        sessionId,
        trimWhitespace: true,
        includeEmpty: false,
      })
      : raw;

    return {
      step: {
        name: 'Agentic TUI launch',
        phase: 'launch',
        scriptName: 'terminal.tui.run',
        success: true,
        outputPreview: 'Agentic TUI session started.',
      },
      session: {
        sessionId,
        started: true,
        projectPath: testProjectPath,
        sourceProjectPath,
        screenPreview: extractScreenPreview(screen),
        raw,
      },
    };
  } catch (error) {
    const warning = error instanceof Error ? error.message : String(error);
    return {
      step: {
        name: 'Agentic TUI launch',
        phase: 'launch',
        scriptName: 'terminal.tui.run',
        success: false,
        outputPreview: warning,
        warning,
      },
      session: {
        sessionId,
        started: false,
        projectPath: testProjectPath,
        sourceProjectPath,
        warning,
      },
    };
  }
}

async function runAgenticTuiPreparation(
  context: SanitizedInvocationContext,
): Promise<{ lifecycleSteps: LifecycleStepResult[]; agenticTuiSession: AgenticTuiSessionResult }> {
  const lifecycleSteps: LifecycleStepResult[] = [];
  let sourceProjectPath: string;

  try {
    sourceProjectPath = await resolveProjectRoot(context);
  } catch (error) {
    const warning = error instanceof Error ? error.message : String(error);
    lifecycleSteps.push({
      name: 'Agentic TUI project path resolution',
      phase: 'setup',
      scriptName: 'codebolt.project.getProjectPath',
      success: false,
      outputPreview: warning,
      warning,
    });

    return {
      lifecycleSteps,
      agenticTuiSession: buildNotStartedSession('Project path resolution failed. Agentic TUI was not launched.'),
    };
  }

  const setupStep = await runLifecycleScript(
    'Agentic TUI dependency setup',
    'setup',
    'prepare:agentic-tui:setup',
    sourceProjectPath,
  );
  // lifecycleSteps.push(setupStep);
  if (!setupStep.success) {
    return {
      lifecycleSteps,
      agenticTuiSession: buildNotStartedSession('Dependency setup failed. Agentic TUI was not launched.'),
    };
  }

  const packageStep = await runLifecycleScript(
    'Agentic TUI package build',
    'package',
    'prepare:agentic-tui:package',
    sourceProjectPath,
  );
  lifecycleSteps.push(packageStep);
  if (!packageStep.success) {
    return {
      lifecycleSteps,
      agenticTuiSession: buildNotStartedSession('Package build failed. Agentic TUI was not launched.'),
    };
  }

  const launchResult = await startAgenticTuiSession(sourceProjectPath);
  lifecycleSteps.push(launchResult.step);

  return {
    lifecycleSteps,
    agenticTuiSession: launchResult.session,
  };
}

async function cleanupAgenticTuiSession(
  agenticTuiSession: AgenticTuiSessionResult,
): Promise<AgenticTuiSessionResult> {
  if (!agenticTuiSession.started || !agenticTuiSession.sessionId) {
    return {
      ...agenticTuiSession,
      cleanup: {
        attempted: false,
        success: true,
      },
      tempProjectCleanup: cleanupAgenticTuiTestProject(agenticTuiSession),
    };
  }

  try {
    const terminalApi = (codebolt as unknown as {
      terminal?: {
        tui?: {
          kill?: (params: { sessionId?: string }) => Promise<unknown>;
        };
      };
    }).terminal;

    if (!terminalApi?.tui?.kill) {
      throw new Error('codebolt.terminal.tui.kill is unavailable in this runtime.');
    }

    await terminalApi.tui.kill({ sessionId: agenticTuiSession.sessionId });
    return {
      ...agenticTuiSession,
      cleanup: {
        attempted: true,
        success: true,
      },
      tempProjectCleanup: cleanupAgenticTuiTestProject(agenticTuiSession),
    };
  } catch (error) {
    return {
      ...agenticTuiSession,
      cleanup: {
        attempted: true,
        success: false,
        warning: error instanceof Error ? error.message : String(error),
      },
      tempProjectCleanup: cleanupAgenticTuiTestProject(agenticTuiSession),
    };
  }
}

function summarizeLifecycleStepsForPrompt(
  lifecycleSteps: LifecycleStepResult[],
): Array<Record<string, unknown>> {
  return lifecycleSteps.map((step, stepIndex) => ({
    stepId: `${step.phase}-${stepIndex + 1}`,
    name: step.name,
    phase: step.phase,
    success: step.success,
    exitCode: step.exitCode,
    warning: step.warning,
  }));
}

function stripImplementationDetailsForTester(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, '[redacted implementation/code block]')
    .split(/\r?\n/)
    .filter((line) => {
      const trimmed = line.trim();
      if (!trimmed) {
        return true;
      }

      return !/^(@@|diff --git|index\s+[a-f0-9]|---\s|\+\+\+\s|[+-]\s*(import|export|const|let|var|function|class|interface|type)\b)/.test(trimmed);
    })
    .map((line) => line.replace(/\bpackages\/(?:gotui|cli)\/\S+/g, '[redacted implementation path]'))
    .join('\n')
    .slice(0, MAX_MESSAGE_CONTENT_LENGTH);
}

function summarizeBehavioralThreadContext(messages: ThreadContextMessage[]): Array<Record<string, unknown>> {
  return messages
    .slice(-MAX_BEHAVIORAL_THREAD_MESSAGES)
    .map((message) => ({
      role: message.role || message.sender || 'unknown',
      content: stripImplementationDetailsForTester(message.content),
    }))
    .filter((message) => message.content.trim().length > 0);
}

function buildBehavioralTestBrief(context: SanitizedInvocationContext): Record<string, unknown> {
  const params = { ...context.params };
  delete params.command;
  delete params.commands;
  delete params.shellCommand;
  delete params.terminalCommand;

  return {
    threadId: context.threadId,
    sourceProjectPath: context.projectPath,
    spec: context.spec,
    params,
    behavioralThreadContext: summarizeBehavioralThreadContext(context.messages),
  };
}

function buildVerifierSystemPrompt(): string {
  return `
You are a verification mini-agent running inside the CodeBolt ActionBlock named test-feature-bug-implemented-main-agent.

Your job is to behave like a black-box tester for a feature or bug fix that the main agent just implemented in Agentic TUI.

Mandatory behavior:
- Use only the provided terminal_tui session. The ActionBlock wrapper has already performed setup, build, and launch work.
- Use the tool-calling interface for terminal_tui. Do not print terminal_tui action JSON or progress narration as your answer.
- The running Agentic TUI is opened against a temporary test project folder, not the CodeBolt source checkout.
- Do not inspect source code, diffs, package manifests, repository files, or internal implementation details.
- Do not run install, build, start, shell, or source-inspection commands.
- Do not use terminal_tui run or attach unless the provided session is unavailable and you must report inconclusive.
- Start by reading the current screen for the provided sessionId.
- Drive the TUI like a tester using screen, wait, type, press, search, region, wheel, resize, cursor, and output actions.
- Verify behavior from visible screen state and interaction results only.
- Treat params.command, params.commands, and any setup/build/start text as removed deterministic work.
- Do not close or kill the provided TUI session; the ActionBlock wrapper closes it after your final verdict.

Your final answer must be exactly one JSON object with this shape and no markdown fences, no prose, and no progress update text:
{
  "verdict": "passed" | "failed" | "inconclusive",
  "summary": "brief verification summary",
  "scope": ["packages/gotui", "packages/cli"],
  "commandsRun": [],
  "checks": [
    {
      "name": "short check name",
      "success": true,
      "details": "what was verified"
    }
  ],
  "issues": ["blocking issue or failed behavior"],
  "recommendations": ["specific next step for the main agent"]
}

Use "failed" if the visible TUI behavior does not match the requested feature or bug fix.
Use "inconclusive" if the TUI cannot be operated enough to verify the behavior or if terminal_tui is unavailable.
Use "passed" only after a real TUI interaction confirms the requested behavior.
`.trim();
}

function buildVerifierUserMessage(
  context: SanitizedInvocationContext,
  metadata: ActionBlockInvocationMetadata,
  lifecycleSteps: LifecycleStepResult[],
  agenticTuiSession: AgenticTuiSessionResult,
): string {
  return [
    'Verify the feature or bug fix implemented by the main agent using the already running Agentic TUI session.',
    '',
    'ActionBlock metadata:',
    stringifyForPrompt(metadata, 3000),
    '',
    'Deterministic ActionBlock lifecycle summary:',
    stringifyForPrompt(summarizeLifecycleStepsForPrompt(lifecycleSteps), 6000),
    '',
    'Agentic TUI session:',
    stringifyForPrompt({
      sessionId: agenticTuiSession.sessionId,
      started: agenticTuiSession.started,
      projectPath: agenticTuiSession.projectPath,
      sourceProjectPath: agenticTuiSession.sourceProjectPath,
      initialScreenPreview: agenticTuiSession.screenPreview,
      warning: agenticTuiSession.warning,
    }, 8000),
    '',
    'Behavioral test brief:',
    stringifyForPrompt(buildBehavioralTestBrief(context), 12000),
    '',
    'Important:',
    '- The startup chat message has already been attempted by the ActionBlock wrapper.',
    '- Dependency setup, package build, and Agentic TUI launch were handled deterministically outside the LLM.',
    '- The Agentic TUI project path is a temporary test folder, not the CodeBolt repository.',
    '- Do not inspect source code or repository files.',
    '- Do not send progress updates. Call terminal_tui first, then finish with the required report JSON.',
    `- Use terminal_tui only with sessionId ${agenticTuiSession.sessionId}.`,
    '- Test only by interacting with the visible TUI behavior.',
  ].join('\n');
}

function buildFlatUserMessage(
  context: SanitizedInvocationContext,
  metadata: ActionBlockInvocationMetadata,
  lifecycleSteps: LifecycleStepResult[],
  agenticTuiSession: AgenticTuiSessionResult,
): FlatUserMessage {
  const threadId = metadata.threadId || context.threadId || `actionblock-${Date.now()}`;

  return {
    userMessage: buildVerifierUserMessage(context, metadata, lifecycleSteps, agenticTuiSession),
    selectedAgent: {
      id: 'test-feature-bug-implemented-main-agent',
      name: 'Test Feature Bug Implemented Main Agent',
    },
    mentionedFiles: [],
    mentionedFullPaths: [],
    mentionedFolders: [],
    mentionedMCPs: [],
    uploadedImages: [],
    mentionedAgents: [],
    messageId: `actionblock-verifier-${Date.now()}`,
    threadId,
  } as FlatUserMessage;
}

function extractJsonObject(finalMessage: string): string | undefined {
  const fencedJsonMatch = finalMessage.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedJsonMatch?.[1]) {
    return fencedJsonMatch[1].trim();
  }

  const firstBraceIndex = finalMessage.indexOf('{');
  const lastBraceIndex = finalMessage.lastIndexOf('}');
  if (firstBraceIndex === -1 || lastBraceIndex === -1 || lastBraceIndex <= firstBraceIndex) {
    return undefined;
  }

  return finalMessage.slice(firstBraceIndex, lastBraceIndex + 1);
}

function normalizeVerdict(value: unknown): VerificationVerdict {
  if (value === 'passed' || value === 'failed' || value === 'inconclusive') {
    return value;
  }
  return 'inconclusive';
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .map((item) => normalizeText(item).trim())
    .filter(Boolean);
}

function normalizeCommandsRun(value: unknown): AgentCommandReport[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((commandReport) => ({
      command: normalizeText(commandReport.command).trim(),
      cwd: typeof commandReport.cwd === 'string' ? commandReport.cwd : undefined,
      success: typeof commandReport.success === 'boolean' ? commandReport.success : undefined,
      exitCode: typeof commandReport.exitCode === 'number' ? commandReport.exitCode : undefined,
      summary: typeof commandReport.summary === 'string' ? commandReport.summary : undefined,
    }))
    .filter((commandReport) => commandReport.command.length > 0);
}

function normalizeChecks(value: unknown): AgentCheckReport[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(isRecord)
    .map((check) => ({
      name: normalizeText(check.name).trim() || 'unnamed-check',
      success: typeof check.success === 'boolean' ? check.success : false,
      details: normalizeText(check.details).trim(),
    }));
}

function parseAgentReport(finalMessage: string | undefined): AgentVerificationReport {
  if (!finalMessage?.trim()) {
    return {
      verdict: 'inconclusive',
      summary: 'Mini-agent did not return a final message.',
      scope: [],
      commandsRun: [],
      checks: [],
      issues: ['Mini-agent did not return a final message.'],
      recommendations: ['Rerun the ActionBlock and inspect mini-agent runtime logs.'],
    };
  }

  const jsonText = extractJsonObject(finalMessage);
  if (!jsonText) {
    return {
      verdict: 'inconclusive',
      summary: 'Mini-agent final message did not contain a JSON object.',
      scope: [],
      commandsRun: [],
      checks: [],
      issues: ['Mini-agent response was not parseable as JSON.'],
      recommendations: ['Ask the main agent to rerun the ActionBlock after checking verifier logs.'],
      rawFinalMessage: finalMessage,
      parseError: 'No JSON object found.',
    };
  }

  try {
    const parsed = JSON.parse(jsonText);
    if (!isRecord(parsed)) {
      throw new Error('Parsed JSON is not an object.');
    }

    return {
      verdict: normalizeVerdict(parsed.verdict),
      summary: normalizeText(parsed.summary).trim() || 'Mini-agent returned no summary.',
      scope: normalizeStringArray(parsed.scope),
      commandsRun: normalizeCommandsRun(parsed.commandsRun),
      checks: normalizeChecks(parsed.checks),
      issues: normalizeStringArray(parsed.issues),
      recommendations: normalizeStringArray(parsed.recommendations),
      rawFinalMessage: finalMessage,
    };
  } catch (error) {
    return {
      verdict: 'inconclusive',
      summary: 'Mini-agent final message JSON could not be parsed.',
      scope: [],
      commandsRun: [],
      checks: [],
      issues: ['Mini-agent response JSON parse failed.'],
      recommendations: ['Ask the main agent to rerun the ActionBlock after checking verifier logs.'],
      rawFinalMessage: finalMessage,
      parseError: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runVerifierAgent(
  context: SanitizedInvocationContext,
  metadata: ActionBlockInvocationMetadata,
  lifecycleSteps: LifecycleStepResult[],
  agenticTuiSession: AgenticTuiSessionResult,
): Promise<{ finalMessage?: string; report: AgentVerificationReport }> {
  const verifierSystemPrompt = buildVerifierSystemPrompt();
  const loopDetectionService = new LoopDetectionService({
    toolCallLoopThreshold: 4,
    debug: false,
  });

  const agent = new CodeboltAgent({
    instructions: verifierSystemPrompt,
    enableLogging: true,
    loopDetectionService,
    maxTurns: 20,
    compaction: {
      enableLogging: false,
      autoCompactEnabled: true,
      contextCollapseEnabled: false,
    },
    processors: {
      messageModifiers: [
        new CoreSystemPromptModifier({ customSystemPrompt: verifierSystemPrompt }),
        new ToolInjectionModifier({
          includeToolDescriptions: true,
          allowedTools: [
            'codebolt--terminal_tui',
          ],
        }),
      ],
      preInferenceProcessors: [],
      postInferenceProcessors: [],
      preToolCallProcessors: [],
      postToolCallProcessors: [],
    },
  });

  try {
    const executionResult = await agent.processMessage(
      buildFlatUserMessage(context, metadata, lifecycleSteps, agenticTuiSession),
    );
    if (!executionResult.success) {
      const errorMessage = executionResult.error || 'Mini-agent failed without an error message.';
      return {
        finalMessage: executionResult.finalMessage,
        report: {
          verdict: 'inconclusive',
          summary: errorMessage,
          scope: [],
          commandsRun: [],
          checks: [],
          issues: [errorMessage],
          recommendations: ['Inspect the mini-agent failure and rerun the ActionBlock.'],
          rawFinalMessage: executionResult.finalMessage,
        },
      };
    }

    return {
      finalMessage: executionResult.finalMessage,
      report: parseAgentReport(executionResult.finalMessage),
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      report: {
        verdict: 'inconclusive',
        summary: `Mini-agent execution failed: ${errorMessage}`,
        scope: [],
        commandsRun: [],
        checks: [],
        issues: [errorMessage],
        recommendations: ['Inspect the ActionBlock runtime error and rerun the verifier.'],
      },
    };
  }
}

function buildVerification(
  startupMessageResult: StartupMessageResult,
  agentReport: AgentVerificationReport,
  lifecycleSteps: LifecycleStepResult[],
  agenticTuiSession: AgenticTuiSessionResult,
): VerificationResult {
  const checks: AgentCheckReport[] = [
    {
      name: 'startup-message-attempted',
      success: true,
      details: startupMessageResult.sent
        ? `${STARTUP_MESSAGE} was sent.`
        : `${STARTUP_MESSAGE} could not be sent: ${startupMessageResult.warning || 'unknown error'}`,
    },
    {
      name: 'mini-agent-verdict',
      success: agentReport.verdict === 'passed',
      details: agentReport.summary,
    },
    {
      name: 'agentic-tui-started',
      success: agenticTuiSession.started,
      details: agenticTuiSession.started
        ? `Agentic TUI session ${agenticTuiSession.sessionId} started.`
        : agenticTuiSession.warning || 'Agentic TUI session was not started.',
    },
    ...lifecycleSteps.map((step) => ({
      name: step.name,
      success: step.success,
      details: step.warning || step.outputPreview || `${step.scriptName} completed.`,
    })),
    ...agentReport.checks,
  ];

  return {
    checks,
    passed:
      agentReport.verdict === 'passed' &&
      agenticTuiSession.started &&
      lifecycleSteps.every((step) => step.success),
  };
}

function buildRecommendations(
  startupMessageResult: StartupMessageResult,
  agentReport: AgentVerificationReport,
  lifecycleSteps: LifecycleStepResult[],
  agenticTuiSession: AgenticTuiSessionResult,
): string[] {
  const recommendations = [...agentReport.recommendations];

  if (!startupMessageResult.sent && startupMessageResult.warning) {
    recommendations.push(`Startup message warning: ${startupMessageResult.warning}`);
  }

  for (const step of lifecycleSteps) {
    if (!step.success) {
      recommendations.push(`Repair ActionBlock lifecycle failure: ${step.name}.`);
    }
  }

  if (!agenticTuiSession.started && agenticTuiSession.warning) {
    recommendations.push(`Agentic TUI launch warning: ${agenticTuiSession.warning}`);
  }

  if (agenticTuiSession.cleanup?.attempted && !agenticTuiSession.cleanup.success) {
    recommendations.push(`Agentic TUI cleanup warning: ${agenticTuiSession.cleanup.warning || 'unknown cleanup failure'}`);
  }

  if (agenticTuiSession.tempProjectCleanup && !agenticTuiSession.tempProjectCleanup.success) {
    recommendations.push(`Agentic TUI temp project cleanup warning: ${agenticTuiSession.tempProjectCleanup.warning || 'unknown cleanup failure'}`);
  }

  if (recommendations.length === 0 && agentReport.verdict === 'passed') {
    recommendations.push('Verification passed through the Agentic TUI black-box tester workflow.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Review the mini-agent report and rerun the ActionBlock after addressing findings.');
  }

  return recommendations;
}

async function runActionBlock(
  threadContext: unknown,
  metadata: ActionBlockInvocationMetadata,
): Promise<ActionBlockResult> {
  const startupMessageResult = await sendStartupMessage();
  const context = normalizeInvocationContext(threadContext);
  const title = deriveTitle(context);
  const preparation = await runAgenticTuiPreparation(context);
  let finalMessage: string | undefined;
  let report: AgentVerificationReport;
  let agenticTuiSession = preparation.agenticTuiSession;

  try {
    if (preparation.agenticTuiSession.started && preparation.lifecycleSteps.every((step) => step.success)) {
      const verifierResult = await runVerifierAgent(
        context,
        metadata,
        preparation.lifecycleSteps,
        preparation.agenticTuiSession,
      );
      finalMessage = verifierResult.finalMessage;
      report = verifierResult.report;
    } else {
      report = {
        verdict: 'failed',
        summary: 'ActionBlock could not prepare and launch Agentic TUI for black-box testing.',
        scope: ['agentic-tui'],
        commandsRun: [],
        checks: [],
        issues: preparation.lifecycleSteps
          .filter((step) => !step.success)
          .map((step) => step.warning || `${step.name} failed.`),
        recommendations: ['Repair the deterministic setup/build/launch failure, then rerun this ActionBlock.'],
      };
    }
  } finally {
    agenticTuiSession = await cleanupAgenticTuiSession(preparation.agenticTuiSession);
  }

  const verification = buildVerification(
    startupMessageResult,
    report,
    preparation.lifecycleSteps,
    agenticTuiSession,
  );
  const recommendations = buildRecommendations(
    startupMessageResult,
    report,
    preparation.lifecycleSteps,
    agenticTuiSession,
  );

  return {
    success: verification.passed,
    result: {
      title,
      startupMessage: STARTUP_MESSAGE,
      startupMessageSent: startupMessageResult.sent,
      ...(startupMessageResult.warning ? { startupMessageWarning: startupMessageResult.warning } : {}),
      lifecycleSteps: preparation.lifecycleSteps,
      agenticTuiSession,
      sanitizedSpec: context.spec,
      sanitizedParams: context.params,
      miniAgentReport: report,
      ...(finalMessage ? { miniAgentFinalMessage: finalMessage } : {}),
      recommendations,
    },
    verification,
    filesCreated: [],
    ...(verification.passed ? {} : { error: 'GotUI/CLI verification did not pass.' }),
  };
}

function closeActionBlockProcessAfterCompletion(): void {
  setTimeout(() => {
    process.exit(0);
  }, ACTIONBLOCK_EXIT_DELAY_MS).unref();
}

codebolt.onActionBlockInvocation(
  async (
    threadContext: unknown,
    metadata: ActionBlockInvocationMetadata = {},
  ): Promise<ActionBlockResult> => {
    try {
      const result = await runActionBlock(threadContext, metadata);
      closeActionBlockProcessAfterCompletion();
      return result;
    } catch (error) {
      const messageText = error instanceof Error ? error.message : String(error);
      closeActionBlockProcessAfterCompletion();
      return {
        success: false,
        result: {
          title: 'GotUI and CLI Feature/Bug Verification',
          startupMessage: STARTUP_MESSAGE,
          startupMessageSent: false,
          startupMessageWarning: 'ActionBlock failed before startup message state could be finalized.',
          lifecycleSteps: [],
          agenticTuiSession: buildNotStartedSession('ActionBlock failed before Agentic TUI launch could be attempted.'),
          sanitizedParams: {},
          miniAgentReport: {
            verdict: 'inconclusive',
            summary: messageText,
            scope: [],
            commandsRun: [],
            checks: [],
            issues: [messageText],
            recommendations: ['Repair the ActionBlock runtime error, then retry.'],
          },
          recommendations: ['Repair the ActionBlock runtime error, then retry.'],
        },
        verification: {
          checks: [
            {
              name: 'unhandled-error',
              success: false,
              details: messageText,
            },
          ],
          passed: false,
        },
        filesCreated: [],
        error: messageText,
      };
    }
  },
);
