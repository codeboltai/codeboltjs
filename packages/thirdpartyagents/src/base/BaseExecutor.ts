import { spawn, execSync, ChildProcess } from 'child_process';
import type { ExecutorOptions, ExecutorState, IExecutor } from '../types.js';

/**
 * Abstract base class for CLI agent executors.
 *
 * Subclasses implement `resolveCommand()` and `buildArgs()` to
 * define how to launch a specific CLI agent. The base class handles
 * child process lifecycle, line-buffered stdout streaming, timeouts,
 * and stop/sendInput control.
 */
export abstract class BaseExecutor implements IExecutor {
    protected process: ChildProcess | null = null;
    protected _state: ExecutorState = 'idle';
    protected _sessionId: string | null = null;

    constructor(protected readonly options: ExecutorOptions) {
        if (options.sessionId) {
            this._sessionId = options.sessionId;
        }
    }

    get state(): ExecutorState {
        return this._state;
    }

    get sessionId(): string | null {
        return this._sessionId;
    }

    /** Subclasses return the resolved CLI command path */
    protected abstract resolveCommand(): string;

    /** Subclasses return the args array for the CLI */
    protected abstract buildArgs(prompt: string): string[];

    /**
     * Override to provide prompt text via stdin instead of CLI args.
     * Return the string to write to stdin, or null to skip (default).
     */
    protected getStdinInput(_prompt: string): string | null {
        return null;
    }

    /** Called when a session ID is captured from output */
    public setSessionId(id: string): void {
        this._sessionId = id;
    }

    /**
     * Spawn the CLI process and yield raw stdout lines.
     */
    async *execute(prompt: string): AsyncGenerator<string> {
        if (this._state === 'running') {
            throw new Error('Executor is already running');
        }

        const command = this.resolveCommand();
        const args = this.buildArgs(prompt);
        const cwd = this.options.cwd || process.cwd();
        const env = { ...process.env, TERM: 'dumb', ...this.options.env };

        this._state = 'running';

        // Push-queue for converting callback-based stdout into async iteration
        const queue: string[] = [];
        let resolve: (() => void) | null = null;
        let done = false;
        let exitError: Error | null = null;

        const enqueue = (line: string): void => {
            queue.push(line);
            if (resolve) {
                const r = resolve;
                resolve = null;
                r();
            }
        };

        const finish = (error?: Error): void => {
            done = true;
            if (error) exitError = error;
            if (resolve) {
                const r = resolve;
                resolve = null;
                r();
            }
        };

        // Spawn
        this.process = spawn(command, args, {
            cwd,
            env,
            stdio: ['pipe', 'pipe', 'pipe'],
        });

        const pid = this.process.pid;
        console.log(`[thirdpartyagents] Process started (PID: ${pid}), command: ${command}`);

        // Optionally write prompt to stdin (for CLIs that accept prompt via stdin)
        const stdinInput = this.getStdinInput(prompt);
        if (stdinInput !== null) {
            this.process.stdin?.write(stdinInput);
        }
        // Close stdin — prompt is either in args or was just written above.
        this.process.stdin?.end();

        // Line-buffered stdout
        let stdoutBuffer = '';
        this.process.stdout?.on('data', (data: Buffer) => {
            stdoutBuffer += data.toString();
            const lines = stdoutBuffer.split('\n');
            stdoutBuffer = lines.pop() || '';
            for (const line of lines) {
                if (line.trim()) {
                    enqueue(line);
                }
            }
        });

        // Log stderr
        let stderrBuffer = '';
        this.process.stderr?.on('data', (data: Buffer) => {
            stderrBuffer += data.toString();
            const lines = stderrBuffer.split('\n');
            stderrBuffer = lines.pop() || '';
            for (const line of lines) {
                if (line.trim()) {
                    console.log(`[thirdpartyagents:stderr] ${line.trim()}`);
                }
            }
        });

        // Process exit
        this.process.on('close', (code: number | null) => {
            // Flush remaining stdout
            if (stdoutBuffer.trim()) {
                enqueue(stdoutBuffer.trim());
                stdoutBuffer = '';
            }

            this.process = null;
            if (this._state === 'stopped') {
                finish();
            } else if (code === 0 || code === null) {
                this._state = 'completed';
                finish();
            } else {
                this._state = 'error';
                finish(new Error(`Process exited with code ${code}`));
            }
        });

        this.process.on('error', (err: Error) => {
            this.process = null;
            this._state = 'error';
            finish(err);
        });

        // Timeout
        let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
        if (this.options.timeoutSec && this.options.timeoutSec > 0) {
            timeoutHandle = setTimeout(() => {
                console.log(`[thirdpartyagents] Timeout after ${this.options.timeoutSec}s, killing process`);
                this.stop();
            }, this.options.timeoutSec * 1000);
        }

        // Yield lines as they arrive
        try {
            while (true) {
                while (queue.length > 0) {
                    yield queue.shift()!;
                }
                if (done) break;
                await new Promise<void>((r) => {
                    resolve = r;
                });
            }

            // Drain any remaining
            while (queue.length > 0) {
                yield queue.shift()!;
            }

            if (exitError) {
                throw exitError;
            }
        } finally {
            if (timeoutHandle) clearTimeout(timeoutHandle);
        }
    }

    stop(): void {
        if (this.process) {
            this._state = 'stopped';
            try {
                // Kill process group on unix
                if (this.process.pid) {
                    process.kill(-this.process.pid, 'SIGTERM');
                }
            } catch {
                // Fallback to direct kill
                try {
                    this.process.kill('SIGTERM');
                } catch {
                    // already dead
                }
            }
        }
    }

    sendInput(text: string): void {
        if (this.process?.stdin && !this.process.stdin.destroyed) {
            this.process.stdin.write(text + '\n');
        } else {
            console.log('[thirdpartyagents] Cannot send input — stdin is closed');
        }
    }

    /**
     * Utility: resolve a command name using `which`.
     * Returns the resolved path or the original command if not found.
     */
    protected resolveCommandPath(command: string, fallbackPaths: string[] = []): string {
        try {
            const result = execSync(`which ${command}`, { encoding: 'utf-8' }).trim();
            if (result) return result;
        } catch {
            // not found via which
        }

        const fs = require('fs');
        for (const p of fallbackPaths) {
            if (fs.existsSync(p)) return p;
        }

        return command;
    }
}
