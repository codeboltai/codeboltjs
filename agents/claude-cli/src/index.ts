import { spawn, execSync, ChildProcess } from 'child_process';
import * as fs from 'fs';
import codebolt from '@codebolt/codeboltjs';
import { dispatchJsonlEntry } from './notifications';
import { findClaudeProjectDir, waitForSessionFile, watchJsonlFile } from './jsonl-watcher';

let claudeProcess: ChildProcess | null = null;
let stopWatcher: (() => void) | null = null;

// ── Permission mode state ──
// Supported modes: "plan" | "acceptEdits" | "bypassPermissions" | "default"
// - plan: Claude plans/reasons but all tool executions are denied
// - acceptEdits: Auto-accept file edits, prompt for dangerous ops
// - bypassPermissions: Skip all permission checks (default for this agent)
// - default: Prompt for each tool use (not useful in non-interactive CLI mode)
type PermissionMode = 'plan' | 'acceptEdits' | 'bypassPermissions' | 'default';
let currentPermissionMode: PermissionMode = 'bypassPermissions';

// ── Session tracking for resume/continue ──
// Persisted to file so session continues across agent restarts.
let lastSessionId: string | null = null;
const SESSION_FILE_NAME = '.claude-cli-session';

function getSessionFilePath(cwd: string): string {
    return `${cwd}/.codebolt/${SESSION_FILE_NAME}`;
}

function loadPersistedSessionId(cwd: string): string | null {
    try {
        const filePath = getSessionFilePath(cwd);
        if (fs.existsSync(filePath)) {
            const id = fs.readFileSync(filePath, 'utf-8').trim();
            if (id) {
                console.log(`[claude-cli] Loaded persisted session ID: ${id}`);
                return id;
            }
        }
    } catch { /* ignore */ }
    return null;
}

function persistSessionId(cwd: string, sessionId: string): void {
    try {
        const filePath = getSessionFilePath(cwd);
        const dir = filePath.substring(0, filePath.lastIndexOf('/'));
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(filePath, sessionId, 'utf-8');
        console.log(`[claude-cli] Persisted session ID: ${sessionId}`);
    } catch (err) {
        console.log(`[claude-cli] Failed to persist session ID: ${err}`);
    }
}

// Dedup set to avoid processing same entry from both stdout and JSONL watcher
const processedUuids = new Set<string>();
const MAX_PROCESSED_CACHE = 500;

function deduplicatedDispatch(entry: any, source: string) {
    const uuid = entry.uuid;
    if (uuid) {
        if (processedUuids.has(uuid)) {
            console.log(`[${source}] Skipping duplicate uuid=${uuid.substring(0, 8)}... type=${entry.type}`);
            return;
        }
        processedUuids.add(uuid);
        if (processedUuids.size > MAX_PROCESSED_CACHE) {
            const first = processedUuids.values().next().value;
            if (first) processedUuids.delete(first);
        }
    }

    // Capture session ID from init message for resume support
    if (entry.type === 'system' && entry.subtype === 'init' && entry.session_id) {
        lastSessionId = entry.session_id;
        console.log(`[claude-cli] Session ID captured: ${lastSessionId}`);
        // Persist so it survives agent restarts
        codebolt.project.getProjectPath().then(({ projectPath }: any) => {
            if (projectPath && lastSessionId) persistSessionId(projectPath, lastSessionId);
        }).catch(() => {});
    }

    console.log(`[${source}] Dispatching: type=${entry.type}${entry.subtype ? ` subtype=${entry.subtype}` : ''}${uuid ? ` uuid=${uuid.substring(0, 8)}...` : ''}`);
    dispatchJsonlEntry(entry);
}

/**
 * Find the claude CLI executable path.
 */
function findClaudePath(): string {
    try {
        const result = execSync('which claude', { encoding: 'utf-8' }).trim();
        if (result) return result;
    } catch {
        // not found via which
    }
    const paths = [
        '/usr/local/bin/claude',
        `${process.env.HOME}/.npm-global/bin/claude`,
        `${process.env.HOME}/.local/bin/claude`,
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    return 'claude';
}

/**
 * Parse special commands from the message.
 * Returns { command, prompt } where command is null if no special command.
 *
 * Supported commands:
 *   /plan <prompt>       - Run in planning mode (no tool execution)
 *   /execute <prompt>    - Run in execution mode (bypass permissions)
 *   /mode <mode>         - Switch permission mode without running
 *   /resume              - Continue last session
 */
function parseCommand(message: string): { command: string | null; arg: string } {
    const trimmed = message.trim();

    if (trimmed.startsWith('/plan ')) {
        return { command: 'plan', arg: trimmed.slice(6).trim() };
    }
    if (trimmed === '/plan') {
        return { command: 'set-mode-plan', arg: '' };
    }
    if (trimmed.startsWith('/execute ')) {
        return { command: 'execute', arg: trimmed.slice(9).trim() };
    }
    if (trimmed === '/execute') {
        return { command: 'set-mode-execute', arg: '' };
    }
    if (trimmed.startsWith('/mode ')) {
        return { command: 'set-mode', arg: trimmed.slice(6).trim() };
    }
    if (trimmed === '/resume' || trimmed.startsWith('/resume ')) {
        return { command: 'resume', arg: trimmed.slice(7).trim() };
    }

    return { command: null, arg: trimmed };
}

/**
 * Spawn Claude CLI as a child process and tail its JSONL session log.
 *
 * Two-channel approach:
 *   Channel 1 (JSONL): Tails ~/.claude/projects/<project>/<session>.jsonl
 *   Channel 2 (stdout): Parses --output-format stream-json from stdout
 *
 * Both channels feed into deduplicatedDispatch() which uses entry UUIDs
 * to avoid sending the same notification twice.
 */
async function executeClaudeCli(
    prompt: string,
    options: {
        permissionMode?: PermissionMode;
        resumeSessionId?: string;
    } = {}
): Promise<void> {
    const claudePath = findClaudePath();
    const { projectPath } = await codebolt.project.getProjectPath();
    const cwd = projectPath || process.cwd();

    const mode = options.permissionMode || currentPermissionMode;

    console.log(`[claude-cli] ──────────────────────────────────`);
    console.log(`[claude-cli] Claude path: ${claudePath}`);
    console.log(`[claude-cli] Working dir: ${cwd}`);
    console.log(`[claude-cli] Permission mode: ${mode}`);
    console.log(`[claude-cli] Prompt: "${prompt.trim().substring(0, 100)}"`);
    if (options.resumeSessionId) {
        console.log(`[claude-cli] Resuming session: ${options.resumeSessionId}`);
    }

    // Find the Claude project directory
    let projectDir = findClaudeProjectDir(cwd);
    if (projectDir) {
        console.log(`[claude-cli] Project dir: ${projectDir}`);
    } else {
        console.log(`[claude-cli] Project dir not found yet (will retry after spawn)`);
    }

    // Clear dedup cache for new execution
    processedUuids.clear();

    // Notify init
    codebolt.notify.system.AgentInitNotify();

    return new Promise(async (resolve, reject) => {
        // Build CLI args
        const args: string[] = [
            '--print',
            '--output-format', 'stream-json',
            '--verbose',
        ];

        // ── Permission mode ──
        // "plan" mode: Claude reasons and plans but cannot execute any tools
        // "acceptEdits": Auto-accept file edits
        // "bypassPermissions": Skip all checks (needs --dangerously-skip-permissions too)
        // "default": Prompt for each tool (not useful in non-interactive)
        args.push('--permission-mode', mode);

        if (mode === 'bypassPermissions') {
            args.push('--dangerously-skip-permissions');
        }

        // Resume session if specified
        if (options.resumeSessionId) {
            args.push('--resume', options.resumeSessionId);
        }

        // Add the prompt
        args.push(prompt);

        console.log(`[claude-cli] Spawning process...`);
        console.log(`[claude-cli] Args: ${args.map(a => a.length > 50 ? a.substring(0, 50) + '...' : a).join(' ')}`);

        claudeProcess = spawn(claudePath, args, {
            cwd: cwd,
            env: { ...process.env, TERM: 'dumb' },
            stdio: ['pipe', 'pipe', 'pipe'],
        });

        const pid = claudeProcess.pid;
        console.log(`[claude-cli] Process started (PID: ${pid})`);

        // ── Channel 1: JSONL log tailing ──
        const startLogTailing = async () => {
            try {
                if (!projectDir) {
                    projectDir = findClaudeProjectDir(cwd);
                }
                if (!projectDir) {
                    console.log('[jsonl] Project dir still not found, using stdout only');
                    return;
                }

                console.log(`[jsonl] Watching project dir: ${projectDir}`);
                const sessionFile = await waitForSessionFile(projectDir, 15000);
                console.log(`[jsonl] Tailing session file: ${sessionFile}`);

                stopWatcher = watchJsonlFile(sessionFile, (entry) => {
                    deduplicatedDispatch(entry, 'jsonl');
                });
                console.log(`[jsonl] Watcher started`);
            } catch (err) {
                console.log(`[jsonl] Could not start tailing: ${err}`);
            }
        };

        setTimeout(() => startLogTailing(), 1000);

        // ── Channel 2: stdout stream-json parsing ──
        let stdoutBuffer = '';
        let stdoutLineCount = 0;

        claudeProcess.stdout?.on('data', (data: Buffer) => {
            stdoutBuffer += data.toString();
            const lines = stdoutBuffer.split('\n');
            stdoutBuffer = lines.pop() || '';

            for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed) continue;
                try {
                    const message = JSON.parse(trimmed);
                    stdoutLineCount++;
                    deduplicatedDispatch(message, 'stdout');
                } catch {
                    console.log(`[stdout] Non-JSON: ${trimmed.substring(0, 150)}`);
                }
            }
        });

        // ── stderr logging ──
        let stderrBuffer = '';
        claudeProcess.stderr?.on('data', (data: Buffer) => {
            stderrBuffer += data.toString();
            const lines = stderrBuffer.split('\n');
            stderrBuffer = lines.pop() || '';
            for (const line of lines) {
                if (line.trim()) console.log(`[stderr] ${line.trim()}`);
            }
        });

        // ── Process exit ──
        claudeProcess.on('close', (code: number | null) => {
            if (stdoutBuffer.trim()) {
                try {
                    deduplicatedDispatch(JSON.parse(stdoutBuffer.trim()), 'stdout');
                } catch { /* ignore */ }
            }

            if (stopWatcher) { stopWatcher(); stopWatcher = null; }

            claudeProcess = null;
            console.log(`[claude-cli] ──────────────────────────────────`);
            console.log(`[claude-cli] Process exited (code: ${code})`);
            console.log(`[claude-cli] Mode was: ${mode}`);
            console.log(`[claude-cli] Total stdout lines parsed: ${stdoutLineCount}`);
            console.log(`[claude-cli] Total unique entries dispatched: ${processedUuids.size}`);

            if (code === 0 || code === null) {
                codebolt.notify.system.AgentCompletionNotify('Task completed', undefined, '');
                resolve();
            } else {
                const err = new Error(`Claude CLI exited with code ${code}`);
                codebolt.notify.system.AgentCompletionNotify(
                    `Error: ${err.message}`, undefined, ''
                );
                reject(err);
            }
        });

        claudeProcess.on('error', (err: Error) => {
            if (stopWatcher) { stopWatcher(); stopWatcher = null; }
            claudeProcess = null;
            console.error(`[claude-cli] Failed to start: ${err.message}`);
            reject(err);
        });
    });
}

// ── Set up CodeboltJS message handler ──
console.log('[claude-cli] Agent initializing...');
console.log(`[claude-cli] Default permission mode: ${currentPermissionMode}`);

codebolt.onMessage(async (userMessage: any) => {
    try {
        console.log('[claude-cli] Received message from codebolt');

        let messageContent = '';
        if (typeof userMessage === 'string') {
            messageContent = userMessage;
        } else if (userMessage && typeof userMessage === 'object') {
            if ('content' in userMessage && typeof userMessage.content === 'string') {
                messageContent = userMessage.content;
            } else if ('message' in userMessage && typeof userMessage.message === 'string') {
                messageContent = userMessage.message;
            } else if ('text' in userMessage && typeof userMessage.text === 'string') {
                messageContent = userMessage.text;
            } else {
                messageContent = userMessage.userMessage;
            }
        }

        if (!messageContent || messageContent.trim() === '') {
            console.log('[claude-cli] Empty message, skipping');
            return;
        }

        const trimmedMessage = messageContent.trim();
        console.log(`[claude-cli] Message: "${trimmedMessage.substring(0, 100)}"`);

        // Parse for special commands
        const { command, arg } = parseCommand(trimmedMessage);

        // Handle mode-only commands (no execution)
        if (command === 'set-mode-plan') {
            currentPermissionMode = 'plan';
            console.log(`[claude-cli] Switched to planning mode`);
            codebolt.notify.chat.AgentTextResponseNotify(
                'Switched to **planning mode**. Claude will plan and reason but won\'t execute any tools. Send a message to start planning.'
            );
            return;
        }
        if (command === 'set-mode-execute') {
            currentPermissionMode = 'bypassPermissions';
            console.log(`[claude-cli] Switched to execution mode`);
            codebolt.notify.chat.AgentTextResponseNotify(
                'Switched to **execution mode**. Claude will execute tools freely.'
            );
            return;
        }
        if (command === 'set-mode') {
            const validModes: PermissionMode[] = ['plan', 'acceptEdits', 'bypassPermissions', 'default'];
            if (validModes.includes(arg as PermissionMode)) {
                currentPermissionMode = arg as PermissionMode;
                console.log(`[claude-cli] Switched to mode: ${currentPermissionMode}`);
                codebolt.notify.chat.AgentTextResponseNotify(
                    `Switched to **${currentPermissionMode}** mode.`
                );
            } else {
                codebolt.notify.chat.AgentTextResponseNotify(
                    `Invalid mode "${arg}". Valid modes: ${validModes.join(', ')}`
                );
            }
            return;
        }

        // Load persisted session ID if we don't have one in memory
        if (!lastSessionId) {
            const { projectPath: pp } = await codebolt.project.getProjectPath();
            if (pp) lastSessionId = loadPersistedSessionId(pp);
        }

        // If a process is already running, send the message directly to its
        // stdin (e.g. answering a permission prompt or user question) instead
        // of killing and restarting
        if (claudeProcess && claudeProcess.stdin) {
            console.log(`[claude-cli] Process running — piping message to stdin: "${arg.substring(0, 80)}"`);
            claudeProcess.stdin.write(arg + '\n');
            return;
        }

        // No running process — handle execution commands
        // If we have a previous session, resume it to maintain conversation context
        if (command === 'plan') {
            const opts: any = { permissionMode: 'plan' };
            if (lastSessionId) opts.resumeSessionId = lastSessionId;
            await executeClaudeCli(arg, opts);
        } else if (command === 'execute') {
            const opts: any = { permissionMode: 'bypassPermissions' };
            if (lastSessionId) opts.resumeSessionId = lastSessionId;
            await executeClaudeCli(arg, opts);
        } else if (command === 'resume') {
            const sessionId = arg || lastSessionId;
            if (!sessionId) {
                codebolt.notify.chat.AgentTextResponseNotify(
                    'No session to resume. Run a task first, or use `/resume <session-id>`.'
                );
                return;
            }
            await executeClaudeCli('continue', { resumeSessionId: sessionId });
        } else {
            // Regular message: resume existing session if available
            if (lastSessionId) {
                console.log(`[claude-cli] Resuming session ${lastSessionId} with new message`);
                await executeClaudeCli(arg, { resumeSessionId: lastSessionId });
            } else {
                await executeClaudeCli(arg);
            }
        }

    } catch (error) {
        console.error(`[claude-cli] Error: ${error}`);
        codebolt.notify.chat.AgentTextResponseNotify(
            `Error: ${error instanceof Error ? error.message : String(error)}`,
            true
        );
        codebolt.notify.system.AgentCompletionNotify(
            `Error: ${error instanceof Error ? error.message : String(error)}`,
            undefined, '0ms'
        );
    }
});

console.log('[claude-cli] Agent ready. Listening for messages.');
console.log('[claude-cli] Commands: /plan <prompt>, /execute <prompt>, /mode <mode>, /resume');
