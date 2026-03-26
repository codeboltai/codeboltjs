import { execSync } from 'child_process';
import * as fs from 'fs';
import codebolt from '@codebolt/codeboltjs';
import { dispatchJsonlEntry } from './notifications';
import { findClaudeProjectDir, findLatestSessionFile, watchJsonlFile } from './jsonl-watcher';

// ── PTY session state ──
let pty: any = null;
let stopWatcher: (() => void) | null = null;
let isClaudeReady = false;
let claudeSessionId: string | null = null;

// ── Session persistence (like Carapace session-history.ts) ──
// Persist session ID to file so we can --resume across agent restarts
const SESSION_FILE_NAME = '.claude-pty-session';

function getSessionFilePath(cwd: string): string {
    return `${cwd}/.codebolt/${SESSION_FILE_NAME}`;
}

function loadPersistedSessionId(cwd: string): string | null {
    try {
        const filePath = getSessionFilePath(cwd);
        if (fs.existsSync(filePath)) {
            const id = fs.readFileSync(filePath, 'utf-8').trim();
            if (id) {
                console.log(`[claude-pty] Loaded persisted session ID: ${id}`);
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
        console.log(`[claude-pty] Persisted session ID: ${sessionId}`);
    } catch (err) {
        console.log(`[claude-pty] Failed to persist session ID: ${err}`);
    }
}

// ── Thinking state (like Carapace) ──
// Set when user sends Enter, cleared by JSONL end_turn or idle timeout
let isThinking = false;
let thinkingTimer: ReturnType<typeof setTimeout> | null = null;
let maxThinkingTimer: ReturnType<typeof setTimeout> | null = null;
const IDLE_THRESHOLD_MS = 15000;   // fallback: clear spinner 15s after no JSONL activity
const MAX_THINKING_MS = 300000;    // absolute max: 5 minutes

// ── Readiness detection (like Carapace scheduler) ──
// Claude is ready when we see the status line in PTY output
// Resumed sessions take much longer to load (~20-30s vs ~2s fresh)
const STARTUP_GRACE_MS_FRESH = 15000;     // fallback for fresh sessions
const STARTUP_GRACE_MS_RESUME = 60000;    // fallback for resumed sessions (longer load)
const MAX_READY_WAIT_MS_FRESH = 30000;    // max wait for fresh
const MAX_READY_WAIT_MS_RESUME = 90000;   // max wait for resume
let startupGraceMs = STARTUP_GRACE_MS_FRESH;
let maxReadyWaitMs = MAX_READY_WAIT_MS_FRESH;
let sessionCreatedAt = 0;

// ── Completion tracking for JSONL ──
let completionCount = 0;

// ── Response promise ──
// Resolves when Claude finishes responding (end_turn detected in JSONL)
let responseResolve: (() => void) | null = null;

// ── Trust/bypass dialog auto-handling (from Carapace scheduler.ts) ──
// Carapace detects trust/safety/bypass prompts and auto-accepts with Enter
// Minimum time after spawn before checking for trust dialog (skip shell echo period)
const TRUST_CHECK_DELAY_MS = 3000;
let trustDetected = false;
let trustAccepted = false;

// ── Permission mode ──
// In PTY mode, only bypass is passed as a flag.
// Other modes would require Claude's interactive prompts.
let bypassPermissions = true;

/**
 * Find the claude CLI executable path.
 */
function findClaudePath(): string {
    try {
        const result = execSync('which claude', { encoding: 'utf-8', timeout: 3000 }).trim();
        if (result) return result;
    } catch {
        // not found via which
    }
    const paths = [
        '/usr/local/bin/claude',
        `${process.env.HOME}/.npm-global/bin/claude`,
        `${process.env.HOME}/.local/bin/claude`,
        '/opt/homebrew/bin/claude',
    ];
    for (const p of paths) {
        if (fs.existsSync(p)) return p;
    }
    return 'claude';
}

// ── Thinking state management (mirrors Carapace's pty-manager.ts) ──

function setThinking(): void {
    if (isThinking) return;
    isThinking = true;
    console.log('[claude-pty] Thinking: ON');

    // Idle timeout — fallback if JSONL detection fails
    thinkingTimer = setTimeout(() => {
        thinkingTimer = null;
        clearThinking();
    }, IDLE_THRESHOLD_MS);

    // Absolute max timer
    maxThinkingTimer = setTimeout(() => {
        maxThinkingTimer = null;
        clearThinking();
    }, MAX_THINKING_MS);
}

function clearThinking(): void {
    if (!isThinking) return;
    if (thinkingTimer) { clearTimeout(thinkingTimer); thinkingTimer = null; }
    if (maxThinkingTimer) { clearTimeout(maxThinkingTimer); maxThinkingTimer = null; }
    isThinking = false;
    console.log('[claude-pty] Thinking: OFF');
}

/**
 * Re-arm thinking on tool_use — Claude is still working.
 * Like Carapace: resets both timers when JSONL shows tool_use stop_reason.
 */
function rearmThinking(): void {
    if (thinkingTimer) { clearTimeout(thinkingTimer); thinkingTimer = null; }
    if (maxThinkingTimer) { clearTimeout(maxThinkingTimer); maxThinkingTimer = null; }

    thinkingTimer = setTimeout(() => {
        thinkingTimer = null;
        clearThinking();
    }, IDLE_THRESHOLD_MS);

    maxThinkingTimer = setTimeout(() => {
        maxThinkingTimer = null;
        clearThinking();
    }, MAX_THINKING_MS);

    if (!isThinking) {
        isThinking = true;
        console.log('[claude-pty] Thinking: RE-ARMED (tool_use)');
    }
}

/**
 * Spawn Claude CLI in interactive mode inside a PTY.
 *
 * Approach from Carapace (github.com/customink/Carapace):
 *   1. Spawn an interactive login shell via node-pty
 *   2. After shell init, exec into claude CLI
 *   3. Write user messages to PTY stdin
 *   4. Watch JSONL session file for structured output
 */
async function spawnClaudePty(resumeSessionId?: string | null): Promise<void> {
    const claudePath = findClaudePath();
    const { projectPath } = await codebolt.project.getProjectPath();
    const cwd = projectPath || process.cwd();

    let flags = '';
    if (bypassPermissions) {
        flags = ' --dangerously-skip-permissions';
    }
    // Like Carapace session-spawner.ts: pass --resume to continue conversation
    if (resumeSessionId) {
        flags += ` --resume ${resumeSessionId}`;
    }

    console.log(`[claude-pty] ──────────────────────────────────`);
    console.log(`[claude-pty] Claude path: ${claudePath}`);
    console.log(`[claude-pty] Working dir: ${cwd}`);
    console.log(`[claude-pty] Bypass permissions: ${bypassPermissions}`);
    if (resumeSessionId) {
        console.log(`[claude-pty] Resuming session: ${resumeSessionId}`);
    }

    // Build clean env — remove CLAUDECODE to avoid nesting detection
    const env = { ...process.env } as Record<string, string>;
    delete env['CLAUDECODE'];
    env['TERM'] = 'xterm-256color';
    env['COLORTERM'] = 'truecolor';

    // Resolve user's default shell
    const shell = process.env.SHELL || '/bin/zsh';

    // Try to load node-pty (native addon)
    // Priority: bundled copy in dist/node_modules/node-pty (self-contained, no host dependency)
    let nodePty: any;
    let nodePtySource = '';

    // 1. Try bundled node-pty shipped alongside this agent's dist
    const bundledPtyPath = require('path').join(__dirname, 'node_modules', 'node-pty');
    try {
        nodePty = require(bundledPtyPath);
        nodePtySource = `bundled (${bundledPtyPath})`;
    } catch (err1) {
        console.log(`[claude-pty] Could not load bundled node-pty: ${(err1 as Error).message}`);
        // 2. Fallback: try standard require resolution (host or global)
        try {
            nodePty = require('node-pty');
            nodePtySource = 'node-pty (resolved)';
        } catch (err2) {
            console.log(`[claude-pty] Could not load 'node-pty': ${(err2 as Error).message}`);
        }
    }
    if (nodePty) {
        console.log(`[claude-pty] node-pty loaded via '${nodePtySource}'`);
        // Fix spawn-helper execute permissions (may be lost during zip packaging)
        try {
            const { execSync: fixExec } = require('child_process');
            fixExec(`find "${bundledPtyPath}" -name "spawn-helper" -exec chmod +x {} + 2>/dev/null`, { timeout: 3000 });
        } catch { /* ignore */ }
    } else {
        throw new Error('node-pty not available: could not load bundled or system node-pty');
    }

    // Spawn interactive login shell via PTY (like Carapace pty-manager.ts)
    try {
        pty = nodePty.spawn(shell, ['-l', '-i'], {
            name: 'xterm-256color',
            cols: 200,
            rows: 50,
            cwd: cwd,
            env,
        });
    } catch (spawnErr: any) {
        console.error(`[claude-pty] PTY spawn failed: ${spawnErr.message}`);
        console.log(`[claude-pty] Shell: ${shell}, CWD: ${cwd}`);
        console.log(`[claude-pty] Trying direct claude spawn without shell...`);

        // Fallback: spawn Claude directly instead of going through shell + exec
        const args = bypassPermissions ? ['--dangerously-skip-permissions'] : [];
        try {
            pty = nodePty.spawn(claudePath, args, {
                name: 'xterm-256color',
                cols: 200,
                rows: 50,
                cwd: cwd,
                env,
            });
            // Mark that we spawned Claude directly (no shell exec needed)
            pty._spawnedViaShell = false;
            console.log(`[claude-pty] Direct spawn succeeded (PID: ${pty.pid})`);
        } catch (fallbackErr: any) {
            console.error(`[claude-pty] Direct spawn also failed: ${fallbackErr.message}`);
            throw fallbackErr;
        }
    }

    // Track whether we went through shell or spawned claude directly
    const spawnedViaShell = pty._spawnedViaShell !== false;

    sessionCreatedAt = Date.now();
    isClaudeReady = false;
    completionCount = 0;
    trustDetected = false;
    trustAccepted = false;

    // Resumed sessions take much longer to load — use longer timeouts
    startupGraceMs = resumeSessionId ? STARTUP_GRACE_MS_RESUME : STARTUP_GRACE_MS_FRESH;
    maxReadyWaitMs = resumeSessionId ? MAX_READY_WAIT_MS_RESUME : MAX_READY_WAIT_MS_FRESH;
    console.log(`[claude-pty] Timeouts: grace=${startupGraceMs}ms, maxReady=${maxReadyWaitMs}ms`);

    console.log(`[claude-pty] PTY spawned (PID: ${pty.pid}), via shell: ${spawnedViaShell}`);

    // After shell initializes, exec into Claude (like Carapace does)
    // Skip if we already spawned Claude directly (fallback path)
    if (spawnedViaShell) {
        setTimeout(() => {
            // Clear the raw buffer before exec so trust detection doesn't
            // match against our own command text being echoed back
            rawBuffer = '';
            console.log(`[claude-pty] Exec'ing into Claude: exec ${claudePath}${flags}`);
            pty.write(`exec ${claudePath}${flags}\r`);
        }, 500);
    }

    // ── PTY output handler ──
    // Exact pattern from Carapace scheduler.ts:
    //   1. Accumulate raw buffer
    //   2. Strip ANSI codes for keyword matching
    //   3. Detect trust/bypass dialog → send Enter to dismiss
    //   4. After trust handled, wait for "cost:" → mark ready
    //   5. Fallback: max timeout marks ready regardless
    let rawBuffer = '';

    // Helper: strip ANSI from accumulated buffer for matching
    function getStrippedLower(): string {
        return rawBuffer
            .replace(/\x1b\[[^\x40-\x7e]*[\x40-\x7e]/g, '')  // CSI sequences
            .replace(/\x1b\][^\x07]*\x07/g, '')                // OSC sequences
            .replace(/\x1b[^[]/g, '')                           // other escape sequences
            .replace(/[\x00-\x1f]/g, ' ')                      // control chars → space
            .toLowerCase();
    }

    // Helper: run trust/ready detection against current buffer
    function checkBufferForDialogAndReady(): void {
        if (!pty) return;
        const lower = getStrippedLower();

        // Step 1: Handle bypass warning or trust dialog.
        //
        // Bypass warning shows a selection menu:
        //   ❯ 1. No, exit    2. Yes, I accept
        //   Enter to confirm · Esc to cancel
        // Default is "No, exit" — bare Enter exits Claude!
        // Must: Down arrow → "Yes, I accept" → Enter
        //
        // Trust dialog (non-bypass): just needs Enter.
        if (!trustDetected && !trustAccepted) {
            // These keywords ONLY appear in the bypass warning dialog, not in the TUI status bar
            const isBypassWarning = (lower.includes('no,exit') && lower.includes('yes,iaccept')) ||
                lower.includes('entertoconfirm');
            // Folder trust dialog: "Yes, I trust this folder" / "No, exit"
            const isFolderTrust = lower.includes('trustthisfolder') ||
                (lower.includes('trust') && lower.includes('no,exit'));
            const isTrustDialog = lower.includes('safety') ||
                lower.includes('entertoconfirm') ||
                isFolderTrust;

            if (isBypassWarning || isTrustDialog) {
                trustDetected = true;
                const dialogType = isBypassWarning ? 'bypass warning' : isFolderTrust ? 'folder trust dialog' : 'trust dialog';
                console.log(`[claude-pty] ${dialogType} detected, auto-accepting in 1.5s...`);
                setTimeout(() => {
                    if (!pty) return;
                    trustAccepted = true;
                    if (isBypassWarning) {
                        // Down arrow to select "Yes, I accept", then Enter
                        console.log('[claude-pty] Down arrow → "Yes, I accept"');
                        pty.write('\x1b[B');
                        setTimeout(() => {
                            if (pty) {
                                console.log('[claude-pty] Enter to confirm');
                                pty.write('\r');
                            }
                        }, 500);
                    } else if (isFolderTrust) {
                        // Folder trust: "Yes, I trust this folder" is first option
                        // but ❯ may be on "No, exit" — need Up arrow first, then Enter
                        console.log('[claude-pty] Up arrow → "Yes, I trust this folder"');
                        pty.write('\x1b[A');
                        setTimeout(() => {
                            if (pty) {
                                console.log('[claude-pty] Enter to confirm trust');
                                pty.write('\r');
                            }
                        }, 500);
                    } else {
                        // Trust dialog: just Enter
                        console.log('[claude-pty] Enter to accept trust dialog');
                        pty.write('\r');
                        setTimeout(() => { if (pty) pty.write('\r'); }, 500);
                    }
                }, 1500);
            }
        }

        // Step 2: Don't check for ready until dialog is handled
        if (trustDetected && !trustAccepted) return;

        // Step 3: Detect Claude ready — multiple indicators from Claude's TUI
        // Only check AFTER trust dialog is fully handled (detected + accepted)
        if (!isClaudeReady) {
            // Check stripped text for status bar indicators (most reliable — unique to TUI)
            const hasStatusBar = lower.includes('cost:') ||
                lower.includes('/effort') ||
                lower.includes('medium') ||
                lower.includes('claude code') ||
                lower.includes('bypass permissions');
            // Check raw buffer for the ❯ prompt — but ONLY if no trust dialog is active
            // Trust dialogs also contain ❯ as a menu cursor, so we must exclude those
            const hasPrompt = !trustDetected && rawBuffer.includes('❯');
            if (hasStatusBar || hasPrompt) {
                isClaudeReady = true;
                const indicator = hasStatusBar ? 'status bar' : '❯ prompt';
                console.log(`[claude-pty] Claude is ready (detected ${indicator})`);
            }
        }
    }

    // Timer-based detection: check accumulated buffer periodically.
    // - With bypass: no trust dialog, just wait for "cost:" readiness
    // - Without bypass: detect trust dialog and auto-accept with Enter
    const bufferCheckInterval = setInterval(() => {
        if (!pty) { clearInterval(bufferCheckInterval); return; }
        if (Date.now() - sessionCreatedAt < TRUST_CHECK_DELAY_MS) return; // too early
        if (isClaudeReady) { clearInterval(bufferCheckInterval); return; } // done

        console.log(`[claude-pty] Timer check: buffer=${rawBuffer.length} chars, trustDetected=${trustDetected}, trustAccepted=${trustAccepted}, ready=${isClaudeReady}`);
        checkBufferForDialogAndReady();
    }, 1000);

    pty.onData((data: string) => {
        rawBuffer += data;

        // Keep buffer bounded
        if (rawBuffer.length > 50000) {
            rawBuffer = rawBuffer.slice(-20000);
        }

        // Also check on data events (for quick detection after trust is accepted)
        if (Date.now() - sessionCreatedAt > TRUST_CHECK_DELAY_MS) {
            checkBufferForDialogAndReady();
        }

        // Raw PTY output logging (for debugging)
        const escaped = data
            .replace(/\x1b/g, '\\e')
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n');
        if (escaped.length > 0 && escaped.length < 1000) {
            console.log(`[pty-raw] ${escaped.substring(0, 300)}`);
        }

        // Stripped output logging
        const currentStripped = data
            .replace(/\x1b\[[^\x40-\x7e]*[\x40-\x7e]/g, '')
            .replace(/\x1b\][^\x07]*\x07/g, '')
            .replace(/\x1b[^[]/g, '')
            .replace(/[\x00-\x1f]/g, ' ')
            .trim();
        if (currentStripped && currentStripped.length > 0 && currentStripped.length < 500) {
            console.log(`[pty-out] ${currentStripped.substring(0, 200)}`);
        }
    });

    // ── PTY exit handling ──
    pty.onExit(({ exitCode }: { exitCode: number }) => {
        console.log(`[claude-pty] PTY exited (code: ${exitCode})`);
        if (stopWatcher) { stopWatcher(); stopWatcher = null; }
        clearThinking();
        pty = null;
        isClaudeReady = false;
        claudeSessionId = null;

        codebolt.notify.system.AgentCompletionNotify(
            exitCode === 0 ? 'Session ended' : `Session exited with code ${exitCode}`,
            undefined, ''
        );
    });

    // ── JSONL file watching ──
    // Simple approach: poll every 2s for the latest modified JSONL file.
    // Once found, tail it. If a newer file appears, switch to it.
    let projectDir = findClaudeProjectDir(cwd);

    const startLogTailing = () => {
        if (!projectDir) {
            projectDir = findClaudeProjectDir(cwd);
        }
        if (!projectDir) {
            console.log('[jsonl] Project dir not found, retrying in 3s...');
            setTimeout(startLogTailing, 3000);
            return;
        }

        console.log(`[jsonl] Watching project dir: ${projectDir}`);
        let tailingFile: string | null = null;

        // Poll for the latest file every 2s
        const pollInterval = setInterval(() => {
            if (!pty) { clearInterval(pollInterval); return; }

            const latest = findLatestSessionFile(projectDir!);
            if (!latest) return;

            // Already tailing this file
            if (latest === tailingFile) return;

            // Found a file to tail (new or different from current)
            tailingFile = latest;
            console.log(`[jsonl] Tailing session file: ${latest}`);

            const filename = latest.split('/').pop() || '';
            claudeSessionId = filename.replace('.jsonl', '');
            console.log(`[claude-pty] Session ID: ${claudeSessionId}`);

            // Persist session ID for resume across agent restarts (like Carapace)
            persistSessionId(cwd, claudeSessionId);

            // Stop previous watcher if any
            if (stopWatcher) { stopWatcher(); stopWatcher = null; }

            stopWatcher = watchJsonlFile(latest, (entry) => {
                // JSONL init event = Claude has loaded
                if (entry.type === 'system' && entry.subtype === 'init') {
                    if (!isClaudeReady) {
                        isClaudeReady = true;
                        console.log(`[claude-pty] Claude is ready (JSONL init event)`);
                    }
                }

                // end_turn: Claude finished → clear thinking, resolve response promise
                if (entry.type === 'assistant' && entry.message?.stop_reason === 'end_turn') {
                    completionCount++;
                    clearThinking();
                    console.log(`[claude-pty] Completion #${completionCount}`);
                    if (responseResolve) {
                        const resolve = responseResolve;
                        responseResolve = null;
                        // Small delay to let the dispatch complete first
                        setTimeout(() => {
                            codebolt.notify.system.AgentCompletionNotify('Task completed', undefined, '');
                            resolve();
                        }, 500);
                    }
                }
                // tool_use: Claude still working → re-arm thinking
                if (entry.type === 'assistant' && entry.message?.stop_reason === 'tool_use') {
                    rearmThinking();
                }

                // Dispatch to codebolt notifications
                dispatchJsonlEntry(entry);
            });
            console.log(`[jsonl] Watcher started`);
        }, 2000);
    };

    // Delay JSONL watching to let Claude create the session file
    console.log(`[claude-pty] Will start JSONL tailing in 2s...`);
    setTimeout(() => startLogTailing(), 2000);

    // Fallback readiness: DON'T mark ready if trust dialog is pending.
    // Use a longer timeout that checks trust state first.
    const readyFallbackCheck = () => {
        if (isClaudeReady) return; // already ready
        if (trustDetected && !trustAccepted) {
            // Trust dialog detected but not yet accepted — wait more
            console.log(`[claude-pty] Grace period: trust detected but not accepted, waiting...`);
            setTimeout(readyFallbackCheck, 2000);
            return;
        }
        isClaudeReady = true;
        console.log(`[claude-pty] Claude marked ready (fallback)`);
    };
    setTimeout(readyFallbackCheck, startupGraceMs);

    // Notify codebolt that agent is initialized
    codebolt.notify.system.AgentInitNotify();
}

/**
 * Write a message to the running Claude PTY.
 * Like Carapace's writeToPty — writes the message + carriage return.
 */
function sendMessageToPty(message: string): void {
    if (!pty) {
        console.log('[claude-pty] No PTY session — cannot send message');
        return;
    }

    console.log(`[claude-pty] Writing to PTY: "${message.substring(0, 100)}"`);

    // Mark as thinking (like Carapace: set on Enter keypress)
    setThinking();

    // Write the message followed by carriage return (Enter key)
    pty.write(message + '\r');
}

/**
 * Parse special commands from the message.
 *
 * Commands:
 *   /bypass on|off   - Toggle --dangerously-skip-permissions (requires restart)
 *   /restart         - Kill PTY and respawn Claude
 *   /kill            - Kill the PTY session
 *   /status          - Show session ID, PTY state, and completions
 */
function parseCommand(message: string): { command: string | null; arg: string } {
    const trimmed = message.trim();

    if (trimmed === '/bypass on') {
        return { command: 'bypass-on', arg: '' };
    }
    if (trimmed === '/bypass off') {
        return { command: 'bypass-off', arg: '' };
    }
    if (trimmed === '/restart') {
        return { command: 'restart', arg: '' };
    }
    if (trimmed === '/kill') {
        return { command: 'kill', arg: '' };
    }
    if (trimmed === '/status') {
        return { command: 'status', arg: '' };
    }

    return { command: null, arg: trimmed };
}

// ── Set up CodeboltJS message handler ──
console.log('[claude-pty] Agent initializing (PTY mode)...');
console.log(`[claude-pty] Bypass permissions: ${bypassPermissions}`);

codebolt.onMessage(async (userMessage: any) => {
    try {
        console.log('[claude-pty] Received message from codebolt');

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
            console.log('[claude-pty] Empty message, skipping');
            return;
        }

        const trimmedMessage = messageContent.trim();
        console.log(`[claude-pty] Message: "${trimmedMessage.substring(0, 100)}"`);

        // Parse for special commands
        const { command, arg } = parseCommand(trimmedMessage);

        // ── Command handling ──
        if (command === 'bypass-on') {
            bypassPermissions = true;
            codebolt.notify.chat.AgentTextResponseNotify(
                'Bypass permissions **enabled**. Use `/restart` to apply.'
            );
            return;
        }
        if (command === 'bypass-off') {
            bypassPermissions = false;
            codebolt.notify.chat.AgentTextResponseNotify(
                'Bypass permissions **disabled**. Use `/restart` to apply.'
            );
            return;
        }
        if (command === 'kill') {
            if (pty) {
                console.log('[claude-pty] Killing PTY session...');
                pty.kill();
                pty = null;
                isClaudeReady = false;
                clearThinking();
                codebolt.notify.chat.AgentTextResponseNotify('Session killed.');
            } else {
                codebolt.notify.chat.AgentTextResponseNotify('No active session.');
            }
            return;
        }
        if (command === 'status') {
            if (!pty) {
                codebolt.notify.chat.AgentTextResponseNotify('No active PTY session.');
                return;
            }
            // Send /status to Claude Code PTY and capture the TUI output
            // /status is a local command — it renders in PTY but NOT in JSONL
            // So we temporarily capture raw PTY output to extract session info
            console.log('[claude-pty] Sending /status to Claude Code PTY');
            let statusBuffer = '';
            const statusListener = (data: string) => {
                statusBuffer += data;
            };
            pty.onData(statusListener);
            pty.write('/status\r');

            // Wait for the status output to render, then parse it
            setTimeout(() => {
                // Strip ANSI codes for parsing
                const stripped = statusBuffer
                    .replace(/\x1b\[[^\x40-\x7e]*[\x40-\x7e]/g, '')
                    .replace(/\x1b\][^\x07]*\x07/g, '')
                    .replace(/\x1b[^[]/g, '')
                    .replace(/[\x00-\x1f]/g, ' ')
                    .replace(/\s+/g, ' ');

                console.log(`[claude-pty] /status output (stripped): ${stripped.substring(0, 500)}`);

                // Extract session ID from status output (format: "Session: <uuid>")
                const sessionMatch = stripped.match(/[Ss]ession[:\s]+([a-f0-9-]{36})/);
                if (sessionMatch) {
                    claudeSessionId = sessionMatch[1];
                    console.log(`[claude-pty] Session ID from /status: ${claudeSessionId}`);
                }

                // Build status response with our state + anything we parsed
                const status = [
                    `**Session ID:** ${claudeSessionId || 'unknown'}`,
                    `**PTY:** active (PID: ${pty?.pid || 'n/a'})`,
                    `**Ready:** ${isClaudeReady}`,
                    `**Thinking:** ${isThinking}`,
                    `**Completions:** ${completionCount}`,
                    `**Bypass permissions:** ${bypassPermissions}`,
                ];
                codebolt.notify.chat.AgentTextResponseNotify(status.join('\n'));
            }, 2000);
            return;
        }
        if (command === 'restart') {
            if (pty) {
                console.log('[claude-pty] Restarting PTY session...');
                if (stopWatcher) { stopWatcher(); stopWatcher = null; }
                pty.kill();
                pty = null;
                isClaudeReady = false;
                clearThinking();
            }
            await spawnClaudePty();
            await waitForReady();
            codebolt.notify.chat.AgentTextResponseNotify('Session restarted.');
            return;
        }

        // ── If no PTY session exists, spawn one ──
        // Like Carapace: load persisted session ID for --resume to maintain conversation
        if (!pty) {
            const { projectPath: pp } = await codebolt.project.getProjectPath();
            const savedSessionId = pp ? loadPersistedSessionId(pp) : null;
            console.log(`[claude-pty] No PTY session — spawning Claude...${savedSessionId ? ` (resuming ${savedSessionId})` : ''}`);
            await spawnClaudePty(savedSessionId);
            await waitForReady();
        }

        // Write the message directly to the running PTY — no kill/restart
        // Create a response promise that resolves when end_turn is detected in JSONL
        const responsePromise = new Promise<void>((resolve) => {
            responseResolve = resolve;
            // Safety timeout: resolve after 5 minutes max
            setTimeout(() => {
                if (responseResolve === resolve) {
                    console.log('[claude-pty] Response timeout — resolving anyway');
                    responseResolve = null;
                    codebolt.notify.system.AgentCompletionNotify('Response timeout', undefined, '');
                    resolve();
                }
            }, MAX_THINKING_MS);
        });

        sendMessageToPty(arg);

        // Wait for Claude to finish responding
        await responsePromise;

    } catch (error) {
        console.error(`[claude-pty] Error: ${error}`);
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

/**
 * Wait for Claude to be ready to accept input.
 * Uses PTY output detection with a max timeout fallback (like Carapace scheduler).
 */
function waitForReady(): Promise<void> {
    return new Promise<void>((resolve) => {
        const startWait = Date.now();
        const check = () => {
            if (isClaudeReady) {
                resolve();
            } else if (Date.now() - startWait > maxReadyWaitMs) {
                // Safety: send anyway after max wait (like Carapace's 30s fallback)
                console.log('[claude-pty] Max wait exceeded — sending anyway');
                isClaudeReady = true;
                resolve();
            } else {
                setTimeout(check, 300);
            }
        };
        check();
    });
}

console.log('[claude-pty] Agent ready. Listening for messages.');
console.log('[claude-pty] Commands: /bypass on|off, /restart, /kill, /status');
console.log('[claude-pty] Messages are written directly to Claude PTY — no kill/restart needed.');
