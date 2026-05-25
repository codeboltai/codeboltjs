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

const STARTUP_MESSAGE = 'CodeBolt Electron App Tester ActionBlock started';
const MAX_THREAD_MESSAGES = 24;
const MAX_BEHAVIORAL_THREAD_MESSAGES = 12;
const MAX_MESSAGE_CONTENT_LENGTH = 4000;
const ELECTRON_APP_SESSION_PREFIX = 'actionblock-electron-app';
const ELECTRON_APP_TEMP_PROJECT_PREFIX = 'codebolt-electron-app-test-';
const ACTIONBLOCK_EXIT_DELAY_MS = 250;
const DEFAULT_ELECTRON_REMOTE_DEBUGGING_PORT = 9222;

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
  testingGuide?: string;
  messages: ThreadContextMessage[];
}

interface StartupMessageResult {
  sent: boolean;
  warning?: string;
}

interface LifecycleStepResult {
  name: string;
  phase:
    | 'install'
    | 'setup'
    | 'start'
    | 'cleanup';
  scriptName: string;
  success: boolean;
  outputPreview: string;
  exitCode?: number;
  warning?: string;
}

interface ElectronAppSessionResult {
  sessionId: string;
  started: boolean;
  projectPath?: string;
  sourceProjectPath?: string;
  remoteDebuggingPort?: number;
  remoteDebuggingUrl?: string;
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
    electronAppSession: ElectronAppSessionResult;
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

// ── Utility helpers ──────────────────────────────────────────────

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
    .replace(/\bnpm\s+run\s+setup\b[^\n\r]*/gi, '[redacted deterministic setup command]')
    .replace(/\bnpm\s+run\s+build\b[^\n\r]*/gi, '[redacted deterministic build command]')
    .replace(/\bnpm\s+(?:run\s+)?(?:start|dev)\b[^\n\r]*/gi, '[redacted deterministic launch command]');
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

  const testingGuide = typeof sanitizedParams.testingGuide === 'string'
    ? sanitizedParams.testingGuide.trim()
    : undefined;

  return {
    threadId: typeof context.threadId === 'string' ? context.threadId : undefined,
    projectPath: typeof context.projectPath === 'string' ? context.projectPath : undefined,
    agentId: typeof context.agentId === 'string' ? context.agentId : undefined,
    agentInstanceId: typeof context.agentInstanceId === 'string' ? context.agentInstanceId : undefined,
    params: sanitizedParams,
    spec: sanitizedParams.spec,
    testingGuide: testingGuide || undefined,
    messages: normalizeThreadMessages(context.messages),
  };
}

function deriveTitle(context: SanitizedInvocationContext): string {
  const spec = context.spec;
  if (typeof spec === 'string' && spec.trim()) {
    return spec.trim().slice(0, 120);
  }

  if (isRecord(spec)) {
    const title = spec.title || spec.featureName || spec.description;
    if (typeof title === 'string' && title.trim()) {
      return title.trim().slice(0, 120);
    }
  }

  return 'CodeBolt Electron App Feature Verification';
}

// ── Startup message ──────────────────────────────────────────────

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
      source: 'codebolt-electron-app-tester',
    }));

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
      warning: error instanceof Error ? error.message : String(error),
    };
  }
}

// ── Terminal helpers ──────────────────────────────────────────────

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

// ── Project root resolution ──────────────────────────────────────

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

// ── Lifecycle script execution ────────────────────────────────────

async function runLifecycleCommand(
  name: string,
  phase: LifecycleStepResult['phase'],
  commandText: string,
  sourceProjectPath: string,
  scriptName = commandText,
): Promise<LifecycleStepResult> {
  const command = [
    `cd ${shellQuote(sourceProjectPath)}`,
    commandText,
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

// ── Temp project management ───────────────────────────────────────

function createElectronTestProject(sourceProjectPath: string): string {
  const testProjectPath = fs.mkdtempSync(path.join(os.tmpdir(), ELECTRON_APP_TEMP_PROJECT_PREFIX));

  // Create a realistic project structure so CodeBolt treats it as a valid project
  fs.writeFileSync(
    path.join(testProjectPath, 'package.json'),
    JSON.stringify(
      {
        name: 'codebolt-test-project',
        version: '1.0.0',
        description: 'Temporary test project created by codebolt-electron-app-tester',
        main: 'src/index.ts',
        scripts: {
          build: 'tsc',
          start: 'node dist/index.js',
          dev: 'ts-node src/index.ts',
        },
        dependencies: {},
        devDependencies: {
          typescript: '^5.3.3',
        },
      },
      null,
      2,
    ),
  );

  fs.writeFileSync(
    path.join(testProjectPath, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          module: 'commonjs',
          outDir: './dist',
          rootDir: './src',
          strict: true,
          esModuleInterop: true,
        },
        include: ['src'],
      },
      null,
      2,
    ),
  );

  fs.mkdirSync(path.join(testProjectPath, 'src'), { recursive: true });
  fs.writeFileSync(
    path.join(testProjectPath, 'src', 'index.ts'),
    [
      '// Test project entry point',
      'console.log("Hello from CodeBolt test project");',
      '',
    ].join('\n'),
  );

  fs.writeFileSync(
    path.join(testProjectPath, 'README.md'),
    [
      '# CodeBolt Test Project',
      '',
      'Temporary workspace created by codebolt-electron-app-tester.',
      `Source project under verification: ${sourceProjectPath}`,
      '',
    ].join('\n'),
  );

  return testProjectPath;
}

function cleanupElectronTestProject(
  session: ElectronAppSessionResult,
): ElectronAppSessionResult['tempProjectCleanup'] {
  if (!session.projectPath) {
    return {
      attempted: false,
      success: true,
    };
  }

  const resolvedProjectPath = path.resolve(session.projectPath);
  const resolvedTempRoot = path.resolve(os.tmpdir());
  const isExpectedTempProject =
    path.basename(resolvedProjectPath).startsWith(ELECTRON_APP_TEMP_PROJECT_PREFIX) &&
    resolvedProjectPath.startsWith(`${resolvedTempRoot}${path.sep}`);

  if (!isExpectedTempProject) {
    return {
      attempted: false,
      success: false,
      warning: `Refusing to remove non-temp Electron app project path: ${session.projectPath}`,
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

// ── Electron app start via terminal TUI ───────────────────────────

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

function buildNotStartedSession(warning: string): ElectronAppSessionResult {
  return {
    sessionId: '',
    started: false,
    warning,
  };
}

async function startElectronAppSession(
  sourceProjectPath: string,
): Promise<{ step: LifecycleStepResult; session: ElectronAppSessionResult }> {
  const testProjectPath = createElectronTestProject(sourceProjectPath);
  const sessionId = `${ELECTRON_APP_SESSION_PREFIX}-${Date.now()}`;
  const remoteDebuggingPort = Number(
    process.env.CODEBOLT_ELECTRON_MCP_PORT || DEFAULT_ELECTRON_REMOTE_DEBUGGING_PORT,
  );
  const remoteDebuggingUrl = `http://localhost:${remoteDebuggingPort}`;

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

    // Start the Electron app via npm start with MAIN_ARGS pointing to the temp project.
    // MAIN_ARGS is read by webpack.config.renderer.dev.ts and forwarded as CLI args
    // to the Electron main process (electronmon), where handleCommandLineFiles()
    // detects the directory and sets global.directoryToOpen for the renderer.
    //
    // IMPORTANT: When visible=true, tui.run writes the command into an existing shell
    // and ignores the env parameter. So we inline env vars as shell prefixes.
    const envPrefix = [
      `MAIN_ARGS=${shellQuote(testProjectPath)}`,
      `CODEBOLT_ELECTRON_MCP_PORT=${remoteDebuggingPort}`,
      `NODE_ENV=development`,
    ].join(' ');

    const raw = await terminalApi.tui.run({
      command: 'sh',
      args: ['-c', `${envPrefix} npm start`],
      cwd: sourceProjectPath,
      visible: true,
      cols: 160,
      rows: 48,
      sessionId,
    });

    // Wait for webpack compilation to finish — this indicates the Electron app
    // is actually starting up, not just that terminal output stabilized.
    if (terminalApi.tui.wait) {
      await terminalApi.tui.wait({
        sessionId,
        text: 'Starting Main Process',
        timeoutMs: 120000,
      });
      // Give the Electron app additional time to fully load the renderer
      await new Promise(resolve => setTimeout(resolve, 10000));
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
        name: 'Electron app start',
        phase: 'start',
        scriptName: 'npm start (MAIN_ARGS)',
        success: true,
        outputPreview: `Electron app started with MAIN_ARGS=${testProjectPath}`,
      },
      session: {
        sessionId,
        started: true,
        projectPath: testProjectPath,
        sourceProjectPath,
        remoteDebuggingPort,
        remoteDebuggingUrl,
        screenPreview: extractScreenPreview(screen),
        raw,
      },
    };
  } catch (error) {
    const warning = error instanceof Error ? error.message : String(error);
    return {
      step: {
        name: 'Electron app start',
        phase: 'start',
        scriptName: 'npm start (MAIN_ARGS)',
        success: false,
        outputPreview: warning,
        warning,
      },
      session: {
        sessionId,
        started: false,
        projectPath: testProjectPath,
        sourceProjectPath,
        remoteDebuggingPort,
        remoteDebuggingUrl,
        warning,
      },
    };
  }
}

// ── Deterministic preparation pipeline ────────────────────────────

async function runElectronAppPreparation(
  context: SanitizedInvocationContext,
): Promise<{ lifecycleSteps: LifecycleStepResult[]; electronAppSession: ElectronAppSessionResult }> {
  const lifecycleSteps: LifecycleStepResult[] = [];
  let sourceProjectPath: string;

  // Resolve project root
  try {
    sourceProjectPath = await resolveProjectRoot(context);
  } catch (error) {
    const warning = error instanceof Error ? error.message : String(error);
    lifecycleSteps.push({
      name: 'Electron app project path resolution',
      phase: 'cleanup',
      scriptName: 'codebolt.project.getProjectPath',
      success: false,
      outputPreview: warning,
      warning,
    });

    return {
      lifecycleSteps,
      electronAppSession: buildNotStartedSession('Project path resolution failed. Electron app was not started.'),
    };
  }

  // // Step 1: Install dependencies at the project root.
  // const installStep = await runLifecycleCommand(
  //   'Electron app dependency install',
  //   'install',
  //   'npm i',
  //   sourceProjectPath,
  // );
  // lifecycleSteps.push(installStep);
  // if (!installStep.success) {
  //   return {
  //     lifecycleSteps,
  //     electronAppSession: buildNotStartedSession('Dependency install failed. Electron app was not started.'),
  //   };
  // }

  // // Step 2: Run the root setup script.
  // const setupStep = await runLifecycleCommand(
  //   'Electron app setup',
  //   'setup',
  //   'npm run setup',
  //   sourceProjectPath,
  // );
  // lifecycleSteps.push(setupStep);
  // if (!setupStep.success) {
  //   return {
  //     lifecycleSteps,
  //     electronAppSession: buildNotStartedSession('Setup failed. Electron app was not started.'),
  //   };
  // }

  // Step 3: Start the Electron app, then hand browser automation context to the verifier agent.
  const startResult = await startElectronAppSession(sourceProjectPath);
  lifecycleSteps.push(startResult.step);

  return {
    lifecycleSteps,
    electronAppSession: startResult.session,
  };
}

// ── Session cleanup ───────────────────────────────────────────────

async function cleanupElectronAppSession(
  electronAppSession: ElectronAppSessionResult,
): Promise<ElectronAppSessionResult> {
  if (!electronAppSession.started || !electronAppSession.sessionId) {
    return {
      ...electronAppSession,
      cleanup: {
        attempted: false,
        success: true,
      },
      tempProjectCleanup: cleanupElectronTestProject(electronAppSession),
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

    await terminalApi.tui.kill({ sessionId: electronAppSession.sessionId });
    return {
      ...electronAppSession,
      cleanup: {
        attempted: true,
        success: true,
      },
      tempProjectCleanup: cleanupElectronTestProject(electronAppSession),
    };
  } catch (error) {
    return {
      ...electronAppSession,
      cleanup: {
        attempted: true,
        success: false,
        warning: error instanceof Error ? error.message : String(error),
      },
      tempProjectCleanup: cleanupElectronTestProject(electronAppSession),
    };
  }
}

// ── Verifier agent prompt construction ────────────────────────────

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
    .map((line) => line.replace(/\bpackages\/\S+/g, '[redacted implementation path]'))
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
    testingGuide: context.testingGuide,
    params,
    behavioralThreadContext: summarizeBehavioralThreadContext(context.messages),
  };
}

function buildVerifierSystemPrompt(): string {
  return `
You are a verification mini-agent running inside the CodeBolt ActionBlock named codebolt-electron-app-tester.

Your job is to behave like a black-box tester for a feature that the main agent just implemented in the CodeBolt Electron desktop application.

IMPORTANT — The ActionBlock wrapper has already:
1. Created a temporary test project folder with package.json, tsconfig.json, and src/index.ts.
2. Started a NEW Electron app instance via npm start with MAIN_ARGS pointing to the temp project.
3. The new app should open and automatically navigate to the temp project.

You do NOT need to start or launch the Electron app. It has already been started by the wrapper.

Mandatory behavior:
- If a TESTING GUIDE is provided, follow it step by step. It contains the main agent's exact instructions on how to reach and verify the feature (e.g. which panel to open, what to click, what input to type, what result to expect).
- Wait for the Electron app to fully load before attempting to interact with it.
- Use agent-browser CLI to attach to the running Electron app via its remote debugging port.
- Start by loading the external agent-browser Electron workflow guidance if available: agent-browser skills get electron. If agent-browser is not installed, try the equivalent npx agent-browser command.
- Attach agent-browser to the provided Electron remote debugging target.
- Drive the Electron app like a tester using agent-browser snapshots, screenshots, clicks, input, keys, scrolling, waiting, and extraction.
- Verify behavior from visible screen state and interaction results only.
- Do not inspect source code, diffs, package manifests, repository files, or internal implementation details.
- Do not run install, build, start, or any commands that would restart the app.
- Do not close or kill the Electron app process; the ActionBlock wrapper handles cleanup.
- Use the tool-calling interface for command execution. Do not print agent-browser command JSON or progress narration as your answer.

Electron app features you may need to test:
- Editor functionality: opening files, editing code, saving
- File explorer: browsing directories, creating files/folders
- Terminal panel: running commands, viewing output
- Chat panel: sending messages to agents, viewing responses
- Agent interaction: starting agents, viewing agent output
- Search functionality: searching across files, replacing text
- Git integration: viewing changes, committing
- Panel management: resizing, moving, closing panels
- Settings and configuration
- Plugin management
- Action block execution

CodeBolt panel opening guide:
- The wrapper starts CodeBolt with a temporary project path. First wait until the project route is loaded and the dockview workspace is visible; do not test from the project list or landing page.
- If the main agent supplies a TESTING GUIDE, use its target panel, selectors, and steps exactly.
- If no exact panel steps are supplied, open panels through the dockview panel selector: click the small plus button in the dockview header. Prefer the stable selector/accessibility name "Open panel selector" or data-testid "dockview-open-panel-selector".
- In the panel selector, use the search input named "Search panels" or data-testid "dockview-panel-search", type the target panel name, then press Enter or click the matching option.
- Panel option buttons are named "Open <PanelName> panel" and have data-testid "dockview-panel-option-<PanelName>" with spaces replaced by hyphens.
- Common panel names are exact ComponentType values: Code, Chat, Terminal, Browser, Preview, Git, Settings, ProjectSettings, MarketPlace, ActionBlock, Capability, PluginsPanel, RunningAgents, Agent Debug, Plugin Debug, Environment Debug, Problems, EventLog, Knowledge, KnowledgeGraph, VectorDb, Tasks, Jobs, ThreadPanel, ActionPlan, RequirementPlan, Artifact, Extensions.
- Chat and Terminal can have multiple instances; other panels usually open once. If the target tab already exists, focus its visible tab instead of opening another copy.
- If a requested panel cannot be opened after using the panel selector and exact ComponentType name, report the verification as inconclusive and include the panel name and the visible UI state.

Your final answer must be exactly one JSON object with this shape and no markdown fences, no prose, and no progress update text:
{
  "verdict": "passed" | "failed" | "inconclusive",
  "summary": "brief verification summary",
  "scope": ["packages/electron", "packages/server", "packages/ui"],
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

Use "failed" if the visible Electron app behavior does not match the requested feature.
Use "inconclusive" if the Electron app cannot be operated enough to verify the behavior or if agent-browser is unavailable.
Use "passed" only after a real Electron app interaction confirms the requested behavior.
`.trim();
}

function buildVerifierUserMessage(
  context: SanitizedInvocationContext,
  metadata: ActionBlockInvocationMetadata,
  lifecycleSteps: LifecycleStepResult[],
  electronAppSession: ElectronAppSessionResult,
): string {
  return [
    'Verify the feature implemented by the main agent using the already running CodeBolt Electron app session.',
    '',
    'ActionBlock metadata:',
    stringifyForPrompt(metadata, 3000),
    '',
    'Deterministic ActionBlock lifecycle summary:',
    stringifyForPrompt(summarizeLifecycleStepsForPrompt(lifecycleSteps), 6000),
    '',
    'Electron app session:',
    stringifyForPrompt({
      sessionId: electronAppSession.sessionId,
      started: electronAppSession.started,
      projectPath: electronAppSession.projectPath,
      sourceProjectPath: electronAppSession.sourceProjectPath,
      remoteDebuggingPort: electronAppSession.remoteDebuggingPort,
      remoteDebuggingUrl: electronAppSession.remoteDebuggingUrl,
      startupPreview: electronAppSession.screenPreview,
      warning: electronAppSession.warning,
    }, 8000),
    '',
    'Behavioral test brief:',
    stringifyForPrompt(buildBehavioralTestBrief(context), 12000),
    '',
    ...(context.testingGuide
      ? [
          '=== TESTING GUIDE (from main agent) ===',
          'Follow these step-by-step instructions to test the feature.',
          'This tells you exactly what to interact with, which panel to open, what to click, and what to verify.',
          '',
          context.testingGuide,
          '',
          '=== END TESTING GUIDE ===',
          '',
        ]
      : []),
    'Important:',
    '- The Electron app has been started by the ActionBlock wrapper via npm start with MAIN_ARGS.',
    '- Do NOT start, launch, or spawn another app instance.',
    '- The Electron app project path is a temporary test folder, not the CodeBolt repository.',
    `- Use external agent-browser to attach to the running Electron app at ${electronAppSession.remoteDebuggingUrl}.`,
    '- Do not inspect source code or repository files.',
    '- Do not send progress updates. Run agent-browser first, then finish with the required report JSON.',
    '- Test only by interacting with the visible Electron app through external agent-browser commands.',
  ].join('\n');
}

function buildFlatUserMessage(
  context: SanitizedInvocationContext,
  metadata: ActionBlockInvocationMetadata,
  lifecycleSteps: LifecycleStepResult[],
  electronAppSession: ElectronAppSessionResult,
): FlatUserMessage {
  const threadId = metadata.threadId || context.threadId || `actionblock-${Date.now()}`;

  return {
    userMessage: buildVerifierUserMessage(context, metadata, lifecycleSteps, electronAppSession),
    selectedAgent: {
      id: 'codebolt-electron-app-tester',
      name: 'Codebolt Electron App Tester',
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

// ── Report parsing ────────────────────────────────────────────────

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

// ── Verifier agent execution ──────────────────────────────────────

async function runVerifierAgent(
  context: SanitizedInvocationContext,
  metadata: ActionBlockInvocationMetadata,
  lifecycleSteps: LifecycleStepResult[],
  electronAppSession: ElectronAppSessionResult,
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
    maxTurns: 30,
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
            'codebolt--execute_command',
            'codebolt--terminal_execute_command',
            'execute_command',
            'terminal_execute_command',
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
      buildFlatUserMessage(context, metadata, lifecycleSteps, electronAppSession),
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

// ── Result construction ────────────────────────────────────────────

function buildVerification(
  startupMessageResult: StartupMessageResult,
  agentReport: AgentVerificationReport,
  lifecycleSteps: LifecycleStepResult[],
  electronAppSession: ElectronAppSessionResult,
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
      name: 'electron-app-started',
      success: electronAppSession.started,
      details: electronAppSession.started
        ? `Electron app session ${electronAppSession.sessionId} started.`
        : electronAppSession.warning || 'Electron app session was not started.',
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
      electronAppSession.started &&
      lifecycleSteps.every((step) => step.success),
  };
}

function buildRecommendations(
  startupMessageResult: StartupMessageResult,
  agentReport: AgentVerificationReport,
  lifecycleSteps: LifecycleStepResult[],
  electronAppSession: ElectronAppSessionResult,
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

  if (!electronAppSession.started && electronAppSession.warning) {
    recommendations.push(`Electron app start warning: ${electronAppSession.warning}`);
  }

  if (electronAppSession.cleanup?.attempted && !electronAppSession.cleanup.success) {
    recommendations.push(`Electron app cleanup warning: ${electronAppSession.cleanup.warning || 'unknown cleanup failure'}`);
  }

  if (electronAppSession.tempProjectCleanup && !electronAppSession.tempProjectCleanup.success) {
    recommendations.push(`Electron app temp project cleanup warning: ${electronAppSession.tempProjectCleanup.warning || 'unknown cleanup failure'}`);
  }

  if (recommendations.length === 0 && agentReport.verdict === 'passed') {
    recommendations.push('Verification passed through the Electron app black-box tester workflow.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Review the mini-agent report and rerun the ActionBlock after addressing findings.');
  }

  return recommendations;
}

// ── Main action block execution ───────────────────────────────────

async function runActionBlock(
  threadContext: unknown,
  metadata: ActionBlockInvocationMetadata,
): Promise<ActionBlockResult> {
  const startupMessageResult = await sendStartupMessage();
  const context = normalizeInvocationContext(threadContext);
  const title = deriveTitle(context);
  const preparation = await runElectronAppPreparation(context);
  let finalMessage: string | undefined;
  let report: AgentVerificationReport;
  let electronAppSession = preparation.electronAppSession;

  try {
    if (preparation.electronAppSession.started && preparation.lifecycleSteps.every((step) => step.success)) {
      const verifierResult = await runVerifierAgent(
        context,
        metadata,
        preparation.lifecycleSteps,
        preparation.electronAppSession,
      );
      finalMessage = verifierResult.finalMessage;
      report = verifierResult.report;
    } else {
      report = {
        verdict: 'failed',
        summary: 'ActionBlock could not prepare and start the Electron app for testing.',
        scope: ['packages/electron'],
        commandsRun: [],
        checks: [],
        issues: preparation.lifecycleSteps
          .filter((step) => !step.success)
          .map((step) => step.warning || `${step.name} failed.`),
        recommendations: ['Repair the deterministic install/setup/start failure, then rerun this ActionBlock.'],
      };
    }
  } finally {
    electronAppSession = await cleanupElectronAppSession(preparation.electronAppSession);
  }

  const verification = buildVerification(
    startupMessageResult,
    report,
    preparation.lifecycleSteps,
    electronAppSession,
  );
  const recommendations = buildRecommendations(
    startupMessageResult,
    report,
    preparation.lifecycleSteps,
    electronAppSession,
  );

  return {
    success: verification.passed,
    result: {
      title,
      startupMessage: STARTUP_MESSAGE,
      startupMessageSent: startupMessageResult.sent,
      ...(startupMessageResult.warning ? { startupMessageWarning: startupMessageResult.warning } : {}),
      lifecycleSteps: preparation.lifecycleSteps,
      electronAppSession,
      sanitizedSpec: context.spec,
      sanitizedParams: context.params,
      miniAgentReport: report,
      ...(finalMessage ? { miniAgentFinalMessage: finalMessage } : {}),
      recommendations,
    },
    verification,
    filesCreated: [],
    ...(verification.passed ? {} : { error: 'Electron app verification did not pass.' }),
  };
}

function closeActionBlockProcessAfterCompletion(): void {
  setTimeout(() => {
    process.exit(0);
  }, ACTIONBLOCK_EXIT_DELAY_MS).unref();
}

// ── ActionBlock entry point ───────────────────────────────────────

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
          title: 'CodeBolt Electron App Feature Verification',
          startupMessage: STARTUP_MESSAGE,
          startupMessageSent: false,
          startupMessageWarning: 'ActionBlock failed before startup message state could be finalized.',
          lifecycleSteps: [],
          electronAppSession: buildNotStartedSession('ActionBlock failed before Electron app start could be attempted.'),
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
