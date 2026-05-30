import codebolt from '@codebolt/codeboltjs';
import { CodeboltAgent, LoopDetectionService } from '@codebolt/agent/unified';
import {
  CoreSystemPromptModifier,
  ToolInjectionModifier,
} from '@codebolt/agent/processor-pieces';
import type { FlatUserMessage } from '@codebolt/types/sdk';
import fs from 'fs';
import http from 'http';
import net from 'net';
import path from 'path';

const STARTUP_MESSAGE = 'Website agent-browser testing ActionBlock started';
const ACTIONBLOCK_EXIT_DELAY_MS = 250;
const SERVER_SESSION_PREFIX = 'website-static-server';
const PREPARATION_SESSION_PREFIX = 'website-static-build';
const MAX_MESSAGE_CONTENT_LENGTH = 4000;

type VerificationVerdict = 'passed' | 'failed' | 'inconclusive';

interface ActionBlockInvocationMetadata {
  sideExecutionId?: string;
  threadId?: string;
  parentAgentId?: string;
  parentAgentInstanceId?: string;
  timestamp?: string;
}

interface ThreadContextMessage {
  sender?: string;
  role?: string;
  content: string;
}

interface InvocationContext {
  threadId?: string;
  projectPath?: string;
  params: Record<string, unknown>;
  spec?: unknown;
  messages: ThreadContextMessage[];
}

interface StartupMessageResult {
  sent: boolean;
  warning?: string;
}

interface CheckReport {
  name: string;
  success: boolean;
  details: string;
}

interface CommandReport {
  command: string;
  cwd?: string;
  success?: boolean;
  exitCode?: number;
  summary?: string;
}

interface AgentBrowserReport {
  verdict: VerificationVerdict;
  summary: string;
  scope: string[];
  commandsRun: CommandReport[];
  checks: CheckReport[];
  issues: string[];
  recommendations: string[];
  rawFinalMessage?: string;
  parseError?: string;
}

interface WebsiteServerResult {
  sessionId: string;
  started: boolean;
  projectPath: string;
  url: string;
  port: number;
  processId?: number;
  logPath?: string;
  screenPreview?: string;
  raw?: unknown;
  warning?: string;
  cleanup?: {
    attempted: boolean;
    success: boolean;
    warning?: string;
  };
}

interface ActiveWebsiteServer {
  result: WebsiteServerResult;
}

interface WebsitePreparationResult {
  success: boolean;
  checks: CheckReport[];
  logPath?: string;
  screenPreview?: string;
  raw?: unknown;
  warning?: string;
}

interface VerificationResult {
  checks: CheckReport[];
  passed: boolean;
}

interface ActionBlockResult {
  success: boolean;
  result: {
    title: string;
    verdict: VerificationVerdict;
    summary: string;
    artifactCreated: boolean;
    appUrl?: string;
    issues: string[];
    recommendations: string[];
  };
  verification: VerificationResult;
  filesCreated: string[];
  error?: string;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function stringifyForPrompt(value: unknown, maxLength = 12000): string {
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

function sanitizeInvocationValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeInvocationValue);
  }

  if (!isRecord(value)) {
    return value;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, nestedValue] of Object.entries(value)) {
    const normalizedKey = key.toLowerCase();
    if (
      normalizedKey === 'command' ||
      normalizedKey === 'commands' ||
      normalizedKey === 'shellcommand' ||
      normalizedKey === 'terminalcommand'
    ) {
      sanitized[key] = '[removed: verifier must use agent-browser through its own terminal commands]';
      continue;
    }

    sanitized[key] = sanitizeInvocationValue(nestedValue);
  }

  return sanitized;
}

function normalizeThreadMessages(rawMessages: unknown): ThreadContextMessage[] {
  if (!Array.isArray(rawMessages)) {
    return [];
  }

  return rawMessages
    .slice(-12)
    .map((rawMessage): ThreadContextMessage | undefined => {
      if (!isRecord(rawMessage)) {
        return undefined;
      }

      const content = normalizeText(rawMessage.content).trim();
      if (!content) {
        return undefined;
      }

      return {
        sender: typeof rawMessage.sender === 'string' ? rawMessage.sender : undefined,
        role: typeof rawMessage.role === 'string' ? rawMessage.role : undefined,
        content: content.length > MAX_MESSAGE_CONTENT_LENGTH
          ? `${content.slice(0, MAX_MESSAGE_CONTENT_LENGTH)}...`
          : content,
      };
    })
    .filter((message): message is ThreadContextMessage => Boolean(message));
}

function normalizeInvocationContext(threadContext: unknown): InvocationContext {
  const context = isRecord(threadContext) ? threadContext : {};
  const rawParams = isRecord(context.params) ? context.params : {};
  const params = sanitizeInvocationValue(rawParams);
  const sanitizedParams = isRecord(params) ? params : {};

  return {
    threadId: typeof context.threadId === 'string' ? context.threadId : undefined,
    projectPath: typeof context.projectPath === 'string' ? context.projectPath : undefined,
    params: sanitizedParams,
    spec: sanitizedParams.spec,
    messages: normalizeThreadMessages(context.messages),
  };
}

function deriveTitle(context: InvocationContext): string {
  if (isRecord(context.spec)) {
    const title = context.spec.title || context.spec.featureName || context.spec.description;
    if (typeof title === 'string' && title.trim()) {
      return title.trim().slice(0, 120);
    }
  }

  if (typeof context.spec === 'string' && context.spec.trim()) {
    return context.spec.trim().slice(0, 120);
  }

  return 'Website Agent-Browser Verification';
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
      source: 'test-web-site',
    }));

    return { sent: true };
  } catch (error) {
    return {
      sent: false,
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

async function resolveProjectRoot(context: InvocationContext): Promise<string> {
  const cwd = context.params.cwd;
  if (typeof cwd === 'string' && cwd.trim()) {
    return path.resolve(cwd.trim());
  }

  if (context.projectPath) {
    return path.resolve(context.projectPath);
  }

  try {
    const projectApi = (codebolt as unknown as {
      project?: { getProjectPath?: () => Promise<unknown> };
    }).project;

    if (projectApi?.getProjectPath) {
      const response = await projectApi.getProjectPath();
      const projectPath = extractProjectPathResponse(response);
      if (projectPath) {
        return path.resolve(projectPath);
      }
    }
  } catch {
    // Fall through to the ActionBlock-relative default below.
  }

  return path.resolve(process.cwd(), '../../..');
}

function buildPreflightChecks(projectPath: string): CheckReport[] {
  const requiredFiles = ['package.json', 'content/site.yaml', 'template/package.json'];
  return requiredFiles.map((fileName) => {
    const filePath = path.join(projectPath, fileName);
    return {
      name: `${fileName}-exists`,
      success: fs.existsSync(filePath),
      details: fs.existsSync(filePath)
        ? `${filePath} exists.`
        : `${filePath} is missing.`,
    };
  });
}

function getFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.on('error', reject);
    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      server.close(() => {
        if (typeof address === 'object' && address?.port) {
          resolve(address.port);
        } else {
          reject(new Error('Unable to allocate an HTTP port for the website.'));
        }
      });
    });
  });
}

function waitForHttpOk(url: string, timeoutMs = 10000): Promise<void> {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attempt = (): void => {
      const request = http.get(url, (response) => {
        response.resume();
        if (response.statusCode && response.statusCode >= 200 && response.statusCode < 400) {
          resolve();
          return;
        }

        retry(`HTTP status ${response.statusCode}`);
      });

      request.on('error', (error) => retry(error.message));
      request.setTimeout(1000, () => {
        request.destroy();
        retry('HTTP request timed out');
      });
    };

    const retry = (reason: string): void => {
      if (Date.now() - startedAt >= timeoutMs) {
        reject(new Error(`Website did not respond at ${url}: ${reason}`));
        return;
      }
      setTimeout(attempt, 250);
    };

    attempt();
  });
}

function extractScreenPreview(raw: unknown): string {
  if (typeof raw === 'string') {
    return raw.slice(0, 3000);
  }

  if (isRecord(raw)) {
    const result = isRecord(raw.result) ? raw.result : raw;
    const output = result.screen || result.output || result.text || raw.screen || raw.output;
    if (typeof output === 'string') {
      return output.slice(0, 3000);
    }
  }

  return stringifyForPrompt(raw, 3000);
}

function shellQuote(value: string): string {
  return `'${value.replace(/'/g, `'\\''`)}'`;
}

function extractBackgroundPid(raw: unknown): number | undefined {
  const text = stringifyForPrompt(raw, 4000);
  const pidMatch = text.match(/WEBSITE_SERVER_PID=(\d+)/);
  if (!pidMatch) {
    return undefined;
  }

  return Number(pidMatch[1]);
}

function extractExitCode(raw: unknown, marker: string): number | undefined {
  const text = stringifyForPrompt(raw, 4000);
  const exitMatch = text.match(new RegExp(`${marker}=(\\d+)`));
  if (!exitMatch) {
    return undefined;
  }

  return Number(exitMatch[1]);
}

async function runTerminalCommand(command: string): Promise<unknown> {
  const terminalApi = (codebolt as unknown as {
    terminal?: {
      executeCommand?: (command: string, returnEmptyStringOnSuccess?: boolean) => Promise<unknown>;
    };
  }).terminal;

  if (!terminalApi?.executeCommand) {
    throw new Error('codebolt.terminal.executeCommand is unavailable in this runtime.');
  }

  return terminalApi.executeCommand(command, false);
}

async function prepareStaticWebsite(projectPath: string): Promise<WebsitePreparationResult> {
  const sessionId = `${PREPARATION_SESSION_PREFIX}-${Date.now()}`;
  const logPath = path.join('/tmp', `${sessionId}.log`);
  const staticIndexPath = path.join(projectPath, 'site', 'dist', 'index.html');

  try {
    const preparationCommand = [
      `cd ${shellQuote(projectPath)}`,
      'set +e',
      `npm install --loglevel error > ${shellQuote(logPath)} 2>&1`,
      'WEBSITE_INSTALL_EXIT=$?',
      `npm run build >> ${shellQuote(logPath)} 2>&1`,
      'WEBSITE_BUILD_EXIT=$?',
      'echo WEBSITE_INSTALL_EXIT=$WEBSITE_INSTALL_EXIT',
      'echo WEBSITE_BUILD_EXIT=$WEBSITE_BUILD_EXIT',
      'exit 0',
    ].join('\n');
    const raw = await runTerminalCommand(preparationCommand);
    const installExitCode = extractExitCode(raw, 'WEBSITE_INSTALL_EXIT');
    const buildExitCode = extractExitCode(raw, 'WEBSITE_BUILD_EXIT');
    const staticIndexExists = fs.existsSync(staticIndexPath);
    const logPreview = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8').slice(0, 3000) : '';
    const checks: CheckReport[] = [
      {
        name: 'website-npm-install',
        success: installExitCode === 0,
        details: installExitCode === 0
          ? 'npm install completed successfully before agent verification.'
          : `npm install failed before agent verification with exit code ${installExitCode ?? 'unknown'}.`,
      },
      {
        name: 'website-static-build',
        success: buildExitCode === 0,
        details: buildExitCode === 0
          ? 'npm run build completed successfully before agent verification.'
          : `npm run build failed before agent verification with exit code ${buildExitCode ?? 'unknown'}.`,
      },
      {
        name: 'website-static-index',
        success: staticIndexExists,
        details: staticIndexExists
          ? `${staticIndexPath} exists.`
          : `${staticIndexPath} is missing after the static build.`,
      },
    ];

    return {
      success: checks.every((check) => check.success),
      checks,
      logPath,
      screenPreview: logPreview,
      raw,
      ...(checks.every((check) => check.success)
        ? {}
        : { warning: 'Website install/build preparation failed. Agent verification was not started.' }),
    };
  } catch (error) {
    return {
      success: false,
      checks: [
        {
          name: 'website-static-preparation',
          success: false,
          details: error instanceof Error ? error.message : String(error),
        },
      ],
      logPath,
      warning: error instanceof Error ? error.message : String(error),
    };
  }
}

async function startWebsiteServer(projectPath: string): Promise<ActiveWebsiteServer> {
  const port = await getFreePort();
  const sessionId = `${SERVER_SESSION_PREFIX}-${Date.now()}`;
  const url = `http://127.0.0.1:${port}/`;
  const logPath = path.join('/tmp', `${sessionId}.log`);

  try {
    const launchCommand = [
      `cd ${shellQuote(projectPath)}`,
      `npm run dev -- --port ${port} > ${shellQuote(logPath)} 2>&1 &`,
      'echo WEBSITE_SERVER_PID=$!',
    ].join('\n');
    const raw = await runTerminalCommand(launchCommand);
    const processId = extractBackgroundPid(raw);
    if (!processId) {
      throw new Error(`Unable to read website server PID from launch output: ${stringifyForPrompt(raw, 1000)}`);
    }

    await waitForHttpOk(url, 120000);
    const logPreview = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf8').slice(0, 3000) : '';

    return {
      result: {
        sessionId,
        started: true,
        projectPath,
        url,
        port,
        processId,
        logPath,
        screenPreview: logPreview || `Website dev server started at ${url}`,
        raw,
      },
    };
  } catch (error) {
    return {
      result: {
        sessionId,
        started: false,
        projectPath,
        url,
        port,
        logPath,
        warning: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

async function cleanupWebsiteServer(activeServer: ActiveWebsiteServer): Promise<WebsiteServerResult> {
  const result = activeServer.result;

  if (!result.started || !result.processId) {
    return {
      ...result,
      cleanup: {
        attempted: false,
        success: true,
      },
    };
  }

  try {
    await runTerminalCommand(`kill ${result.processId} || true`);
    return {
      ...result,
      cleanup: {
        attempted: true,
        success: true,
      },
    };
  } catch (error) {
    return {
      ...result,
      cleanup: {
        attempted: true,
        success: false,
        warning: error instanceof Error ? error.message : String(error),
      },
    };
  }
}

function buildVerifierSystemPrompt(): string {
  return `
You are a verification mini-agent running inside the CodeBolt ActionBlock named test-web-site.

Your job is to test the running website as a black-box browser user. The wrapper has already started a local HTTP server for the website. You must perform the actual UI testing through agent-browser started from terminal commands.

Mandatory behavior:
- Use terminal_execute_command or execute_command to start and control agent-browser. Prefer checking available syntax with "npx agent-browser --help" or "agent-browser --help" first if needed.
- Do not inspect source files, HTML, CSS, JavaScript, git diffs, package manifests, or repository internals.
- Do not run a DOM/unit test, Playwright script, curl-only test, or hand-written JavaScript test. The verification must be done by driving the visible website UI through agent-browser.
- Open the supplied app URL in agent-browser.
- After agent-browser can see the website page, start agent-browser video recording IMMEDIATELY before any website interaction.
- You MUST NOT perform website testing until recording has successfully started. If recording cannot be started, report "inconclusive" and do not perform the UI test interactions.
- Keep recording active for the full testing session.
- Test only the task provided by the main agent. Follow spec.whatToTest, spec.howToTest, testPlan, acceptanceCriteria, or equivalent fields.
- Do not invent or run fallback website scenarios. If the main agent did not provide a concrete test task, report "inconclusive" and explain that no test instructions were supplied.
- Interact with the website exactly as a user would: click links/buttons, type into visible inputs when the supplied task requires it, scroll where needed, and verify visible page content, layout, navigation, or interaction results.
- If agent-browser is unavailable or cannot operate the page, report "inconclusive" with the exact terminal failure.
- After testing completes and before returning your final JSON report, stop/export the agent-browser recording.
- Export/save the recording inside the current active project/worktree whenever agent-browser supports choosing an output path. Do not intentionally record to /tmp, the home directory, or any path outside the current project.
- Create a small static-site folder inside the active project/worktree, not in /tmp or outside the project. The CodeBolt artifact server rejects source_path values outside the active project.
- Put an index.html page in that folder that links to or embeds the exported video recording. If agent-browser unavoidably exports the recording outside the project, copy it into this in-project static-site folder before creating the artifact.
- Before creating the artifact, you MUST call the tool search/discovery tool with query "artifact_create artifact static_site" to find the artifact creation tool. Use tool_search or codebolt--tool_search, whichever is available.
- Create a CodeBolt artifact for that in-project folder by calling the discovered artifact creation tool, normally artifact_create or codebolt--artifact_create. Use type "static_site", entrypoint "index.html", source_path set to the in-project static-site folder, and a clear title such as "Website Agent-Browser Test Recording". Do not call codebolt.artifact.create() directly and do not send raw artifact.create messages.
- Do not report artifact_create as unavailable unless you already attempted tool_search/codebolt--tool_search for "artifact_create artifact static_site" and no usable artifact creation tool was returned.
- Your final checks array MUST include a check named exactly "agent-browser-recording-artifact" with success true only when artifact_create successfully publishes the recording site.
- You MUST NOT return verdict "passed" unless the "agent-browser-recording-artifact" check is present and successful.
- The recording artifact must be attempted for passed, failed, and inconclusive outcomes. If recording export or artifact creation fails, include that failure in checks, issues, and recommendations.
- Finish, close, or end the agent-browser job before returning your final report. Never leave agent-browser running.

Your final answer must be exactly one JSON object with this shape and no markdown fences, no prose, and no progress text:
{
  "verdict": "passed" | "failed" | "inconclusive",
  "summary": "brief verification summary",
  "scope": ["website browser UI"],
  "checks": [
    {
      "name": "short check name",
      "success": true,
      "details": "visible UI behavior verified"
    },
    {
      "name": "agent-browser-recording-artifact",
      "success": true,
      "details": "recording was exported and published with artifact_create"
    }
  ],
  "issues": ["blocking issue or failed behavior"],
  "recommendations": ["specific next step"]
}

Use "passed" only if agent-browser-driven interactions confirmed the main-agent-provided task and the recording artifact was successfully created. Use "failed" if the page can be tested but behavior is wrong. Use "inconclusive" if no concrete test task was supplied, or if agent-browser, recording, artifact creation, or the website cannot be operated enough to verify behavior.
`.trim();
}

function buildVerifierUserMessage(
  context: InvocationContext,
  metadata: ActionBlockInvocationMetadata,
  server: WebsiteServerResult,
  preflightChecks: CheckReport[],
  preparationChecks: CheckReport[],
): string {
  return [
    'Test the website through agent-browser from terminal commands.',
    '',
    'ActionBlock metadata:',
    stringifyForPrompt(metadata, 3000),
    '',
    'Website server:',
    stringifyForPrompt({
      url: server.url,
      started: server.started,
      projectPath: server.projectPath,
      recordingArtifactDirectoryRequirement: `Save/export the recording and create the recording static-site folder under this projectPath (${server.projectPath}); artifact_create source_path must not be /tmp or any path outside projectPath.`,
      sessionId: server.sessionId,
      screenPreview: server.screenPreview,
      warning: server.warning,
    }, 6000),
    '',
    'Preflight file checks:',
    stringifyForPrompt(preflightChecks, 4000),
    '',
    'Install and static build checks:',
    stringifyForPrompt(preparationChecks, 4000),
    '',
    'Verifier hints from main agent:',
    stringifyForPrompt({
      spec: context.spec,
      params: context.params,
      recentThreadContext: context.messages.map((message) => ({
        role: message.role || message.sender || 'unknown',
        content: message.content,
      })),
    }, 10000),
    '',
    'Required workflow:',
    `- Open ${server.url} in agent-browser.`,
    '- Start agent-browser video recording before any website interaction.',
    '- Drive the visible UI with browser actions, not by inspecting files or running code-level tests.',
    '- Test only the task requested by the main agent. If no concrete task exists, report inconclusive.',
    '- Stop/export the recording after the test interactions.',
    `- Save/export the recording inside ${server.projectPath} whenever agent-browser supports choosing an output path.`,
    '- Search for the artifact creation tool first using tool_search/codebolt--tool_search with query "artifact_create artifact static_site".',
    `- Create a static_site artifact for the recording using the discovered artifact creation tool with source_path pointing to a folder under ${server.projectPath}.`,
    '- Return only the required final JSON object. Do not include terminal commands, command history, raw logs, or source details.',
  ].join('\n');
}

function buildFlatUserMessage(
  context: InvocationContext,
  metadata: ActionBlockInvocationMetadata,
  server: WebsiteServerResult,
  preflightChecks: CheckReport[],
  preparationChecks: CheckReport[],
): FlatUserMessage {
  const threadId = metadata.threadId || context.threadId || `website-actionblock-${Date.now()}`;

  return {
    userMessage: buildVerifierUserMessage(context, metadata, server, preflightChecks, preparationChecks),
    selectedAgent: {
      id: 'test-web-site',
      name: 'Test Web Site',
    },
    mentionedFiles: [],
    mentionedFullPaths: [],
    mentionedFolders: [],
    mentionedMCPs: [],
    uploadedImages: [],
    mentionedAgents: [],
    messageId: `website-verifier-${Date.now()}`,
    threadId,
  } as FlatUserMessage;
}

function extractJsonObject(finalMessage: string): string | undefined {
  const fencedJsonMatch = finalMessage.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fencedJsonMatch?.[1]) {
    return extractFirstBalancedJsonObject(fencedJsonMatch[1].trim());
  }

  const firstBraceIndex = finalMessage.indexOf('{');
  if (firstBraceIndex === -1) {
    return undefined;
  }

  return extractFirstBalancedJsonObject(finalMessage.slice(firstBraceIndex));
}

function extractFirstBalancedJsonObject(text: string): string | undefined {
  let depth = 0;
  let inString = false;
  let escaping = false;
  let startIndex = -1;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaping) {
        escaping = false;
      } else if (char === '\\') {
        escaping = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }

    if (char === '{') {
      if (depth === 0) {
        startIndex = index;
      }
      depth += 1;
      continue;
    }

    if (char === '}') {
      depth -= 1;
      if (depth === 0 && startIndex !== -1) {
        return text.slice(startIndex, index + 1);
      }
      if (depth < 0) {
        return undefined;
      }
    }
  }

  return undefined;
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

  return value.map((item) => normalizeText(item).trim()).filter(Boolean);
}

function normalizeCommandsRun(value: unknown): CommandReport[] {
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

function normalizeChecks(value: unknown): CheckReport[] {
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

function parseAgentReport(finalMessage: string | undefined): AgentBrowserReport {
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
      recommendations: ['Rerun the ActionBlock after checking verifier logs.'],
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
      recommendations: ['Rerun the ActionBlock after checking verifier logs.'],
      rawFinalMessage: finalMessage,
      parseError: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runVerifierAgent(
  context: InvocationContext,
  metadata: ActionBlockInvocationMetadata,
  server: WebsiteServerResult,
  preflightChecks: CheckReport[],
  preparationChecks: CheckReport[],
): Promise<{ finalMessage?: string; report: AgentBrowserReport }> {
  const verifierSystemPrompt = buildVerifierSystemPrompt();
  const loopDetectionService = new LoopDetectionService({
    toolCallLoopThreshold: 4,
    debug: false,
  });

  const agent = new CodeboltAgent({
    instructions: verifierSystemPrompt,
    enableLogging: true,
    loopDetectionService,
    maxTurns: 80,
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
            'artifact_create',
            'codebolt--artifact_create',
            'tool_search',
            'codebolt--tool_search',
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
      buildFlatUserMessage(context, metadata, server, preflightChecks, preparationChecks),
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
  preflightChecks: CheckReport[],
  preparationChecks: CheckReport[],
  server: WebsiteServerResult,
  report: AgentBrowserReport,
): VerificationResult {
  const recordingArtifactCheck = report.checks.find((check) => check.name === 'agent-browser-recording-artifact');
  const recordingArtifactCreated = recordingArtifactCheck?.success === true;
  const checks: CheckReport[] = [
    ...preflightChecks,
    ...preparationChecks,
    {
      name: 'website-test-result',
      success: report.verdict === 'passed',
      details: report.summary,
    },
    {
      name: 'recording-artifact-created',
      success: recordingArtifactCreated,
      details: recordingArtifactCreated
        ? recordingArtifactCheck?.details || 'The mini-agent reported that artifact_create published the recording.'
        : 'The mini-agent must create a CodeBolt static_site artifact for the exported agent-browser recording and report check "agent-browser-recording-artifact" as success true.',
    },
  ];

  return {
    checks,
    passed:
      preflightChecks.every((check) => check.success) &&
      preparationChecks.every((check) => check.success) &&
      server.started &&
      report.verdict === 'passed' &&
      recordingArtifactCreated,
  };
}

function buildRecommendations(
  startupMessageResult: StartupMessageResult,
  preparation: WebsitePreparationResult,
  server: WebsiteServerResult,
  report: AgentBrowserReport,
): string[] {
  const recommendations = [...report.recommendations];

  if (!startupMessageResult.sent && startupMessageResult.warning) {
    recommendations.push(`Startup message warning: ${startupMessageResult.warning}`);
  }

  if (!preparation.success && preparation.warning) {
    recommendations.push(`Website install/build warning: ${preparation.warning}`);
  }

  if (!server.started && server.warning) {
    recommendations.push(`Website launch warning: ${server.warning}`);
  }

  if (server.cleanup?.attempted && !server.cleanup.success) {
    recommendations.push(`Website server cleanup warning: ${server.cleanup.warning || 'unknown cleanup failure'}`);
  }

  if (!report.checks.some((check) => check.name === 'agent-browser-recording-artifact' && check.success)) {
    recommendations.push('Create a CodeBolt static_site artifact for the exported agent-browser recording using artifact_create.');
  }

  if (recommendations.length === 0 && report.verdict === 'passed') {
    recommendations.push('Website verification passed through the agent-browser black-box workflow.');
  }

  if (recommendations.length === 0) {
    recommendations.push('Review the mini-agent report and rerun the ActionBlock after addressing findings.');
  }

  return recommendations;
}

function buildNotStartedServer(projectPath: string, warning: string): WebsiteServerResult {
  return {
    sessionId: '',
    started: false,
    projectPath,
    url: '',
    port: 0,
    warning,
  };
}

function buildInactiveServer(projectPath: string, warning: string): ActiveWebsiteServer {
  return {
    result: buildNotStartedServer(projectPath, warning),
  };
}

function buildSkippedPreparation(warning: string): WebsitePreparationResult {
  return {
    success: false,
    checks: [
      {
        name: 'website-static-preparation',
        success: false,
        details: warning,
      },
    ],
    warning,
  };
}

async function runActionBlock(
  threadContext: unknown,
  metadata: ActionBlockInvocationMetadata,
): Promise<ActionBlockResult> {
  const startupMessageResult = await sendStartupMessage();
  const context = normalizeInvocationContext(threadContext);
  const title = deriveTitle(context);
  const projectPath = await resolveProjectRoot(context);
  const preflightChecks = buildPreflightChecks(projectPath);
  const preparation = preflightChecks.every((check) => check.success)
    ? await prepareStaticWebsite(projectPath)
    : buildSkippedPreparation('Required website files are missing. Install and static build were skipped.');

  const activeServer = preflightChecks.every((check) => check.success) && preparation.success
    ? await startWebsiteServer(projectPath)
    : buildInactiveServer(projectPath, preparation.warning || 'Website install/build preparation failed. Server launch was skipped.');
  let server = activeServer.result;

  let report: AgentBrowserReport;

  try {
    if (server.started) {
      const verifierResult = await runVerifierAgent(context, metadata, server, preflightChecks, preparation.checks);
      report = verifierResult.report;
    } else {
      report = {
        verdict: 'failed',
        summary: 'Website could not be launched for agent-browser testing.',
        scope: ['website launch'],
        commandsRun: [],
        checks: [],
        issues: [server.warning || 'Website server did not start.'],
        recommendations: ['Repair the website launch failure, then rerun test-web-site.'],
      };
    }
  } finally {
    server = await cleanupWebsiteServer(activeServer);
  }

  const verification = buildVerification(startupMessageResult, preflightChecks, preparation.checks, server, report);
  const recommendations = buildRecommendations(startupMessageResult, preparation, server, report);
  const artifactCreated = report.checks.some((check) => check.name === 'agent-browser-recording-artifact' && check.success);

  return {
    success: verification.passed,
    result: {
      title,
      verdict: report.verdict,
      summary: report.summary,
      artifactCreated,
      appUrl: server.url,
      issues: report.issues,
      recommendations,
    },
    verification,
    filesCreated: [],
    ...(verification.passed ? {} : { error: 'Website agent-browser verification did not pass.' }),
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
      const messageText = error instanceof Error ? error.message : stringifyForPrompt(error, 1200);
      closeActionBlockProcessAfterCompletion();
      return {
        success: false,
        result: {
          title: 'Website Agent-Browser Verification',
          verdict: 'inconclusive',
          summary: messageText,
          artifactCreated: false,
          issues: [messageText],
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
