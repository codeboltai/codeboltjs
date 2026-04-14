import type { ExecutorState, IExecutor } from '../../types.js';
import type { OpenClawExecutorOptions } from './types.js';

/**
 * Executor for OpenClaw Gateway (WebSocket-based).
 *
 * Unlike other executors that spawn child processes, this connects to
 * an OpenClaw gateway via WebSocket and communicates using a JSON RPC protocol.
 *
 * The executor yields JSONL lines (stringified JSON events) to maintain
 * compatibility with the MessageStream pipeline.
 */
export class OpenClawExecutor implements IExecutor {
    private _state: ExecutorState = 'idle';
    private _sessionId: string | null = null;
    private ws: any = null;
    private readonly options: OpenClawExecutorOptions;

    constructor(options: OpenClawExecutorOptions) {
        this.options = options;
    }

    get state(): ExecutorState {
        return this._state;
    }

    get sessionId(): string | null {
        return this._sessionId;
    }

    setSessionId(id: string): void {
        this._sessionId = id;
    }

    async *execute(prompt: string): AsyncGenerator<string> {
        if (this._state === 'running') {
            throw new Error('Executor is already running');
        }

        const url = this.options.url;
        if (!url) {
            throw new Error('OpenClaw gateway URL is required');
        }

        this._state = 'running';

        // Push-queue for converting WebSocket events into async iteration
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

        let requestId = 0;
        const nextId = () => `req_${++requestId}`;

        try {
            // Dynamic import of ws module
            const { default: WebSocket } = await import('ws');

            const headers: Record<string, string> = {};
            if (this.options.authToken) {
                headers['Authorization'] = `Bearer ${this.options.authToken}`;
            }

            this.ws = new WebSocket(url, { headers });

            // Emit init event
            enqueue(JSON.stringify({
                type: 'system',
                subtype: 'init',
                gateway: url,
            }));

            this.ws.on('open', () => {
                console.log(`[openclaw] Connected to ${url}`);

                // Send agent request
                const agentRequest = {
                    type: 'req',
                    id: nextId(),
                    method: 'agent',
                    params: {
                        message: prompt,
                        sessionKey: this.buildSessionKey(),
                        idempotencyKey: `run_${Date.now()}`,
                        timeoutMs: (this.options.timeoutSec || 120) * 1000,
                        ...(this.options.payloadTemplate || {}),
                    },
                };
                this.ws.send(JSON.stringify(agentRequest));
            });

            this.ws.on('message', (data: Buffer | string) => {
                const text = typeof data === 'string' ? data : data.toString();
                try {
                    const frame = JSON.parse(text);
                    const frameType = frame.type;

                    if (frameType === 'event') {
                        // Convert gateway events to our format
                        const event = frame.event;
                        const payload = frame.payload || {};

                        if (event === 'agent') {
                            // Agent stream events
                            const streamType = payload.streamType || payload.type;
                            if (streamType === 'assistant') {
                                enqueue(JSON.stringify({
                                    type: 'assistant',
                                    message: { text: payload.delta || payload.text || '' },
                                }));
                            } else if (streamType === 'error') {
                                enqueue(JSON.stringify({
                                    type: 'error',
                                    message: payload.message || payload.error || 'Agent error',
                                }));
                            } else if (streamType === 'lifecycle') {
                                if (payload.status === 'completed' || payload.status === 'finished') {
                                    enqueue(JSON.stringify({
                                        type: 'result',
                                        result: payload.summary || 'Completed',
                                        usage: payload.usage || {},
                                        total_cost_usd: payload.costUsd || 0,
                                    }));
                                } else if (payload.status === 'error' || payload.status === 'failed') {
                                    enqueue(JSON.stringify({
                                        type: 'error',
                                        message: payload.error || payload.message || 'Agent failed',
                                    }));
                                }
                            }
                        } else if (event === 'connect.challenge') {
                            // Respond to auth challenge
                            const connectReq = {
                                type: 'req',
                                id: nextId(),
                                method: 'connect',
                                params: {
                                    protocolVersion: { min: 3, max: 3 },
                                    client: {
                                        id: this.options.clientId || 'codebolt-openclaw',
                                        version: '1.0.0',
                                        platform: 'codebolt',
                                        mode: 'headless',
                                    },
                                    auth: {
                                        token: this.options.authToken || '',
                                        password: this.options.sharedPassword || '',
                                    },
                                    nonce: payload.nonce,
                                },
                            };
                            this.ws.send(JSON.stringify(connectReq));
                        } else if (event === 'shutdown') {
                            enqueue(JSON.stringify({
                                type: 'error',
                                message: 'Gateway shutdown',
                            }));
                            finish();
                        }
                    } else if (frameType === 'res') {
                        // Handle response frames
                        if (frame.ok === false) {
                            const errorMsg = frame.error?.message || 'Request failed';
                            enqueue(JSON.stringify({
                                type: 'error',
                                message: errorMsg,
                            }));
                        } else if (frame.payload) {
                            // Successful response — may contain session or result data
                            if (frame.payload.sessionId) {
                                this._sessionId = frame.payload.sessionId;
                            }
                            if (frame.payload.summary || frame.payload.result) {
                                enqueue(JSON.stringify({
                                    type: 'result',
                                    result: frame.payload.summary || frame.payload.result || 'Completed',
                                    usage: frame.payload.usage || {},
                                    total_cost_usd: frame.payload.costUsd || 0,
                                }));
                                finish();
                            }
                        }
                    }
                } catch {
                    // Non-JSON message, emit as raw
                    enqueue(text);
                }
            });

            this.ws.on('close', () => {
                console.log('[openclaw] WebSocket closed');
                this._state = this._state === 'stopped' ? 'stopped' : 'completed';
                finish();
            });

            this.ws.on('error', (err: Error) => {
                console.error(`[openclaw] WebSocket error: ${err.message}`);
                this._state = 'error';
                finish(err);
            });

            // Timeout
            let timeoutHandle: ReturnType<typeof setTimeout> | null = null;
            const timeoutSec = this.options.timeoutSec || 120;
            if (timeoutSec > 0) {
                timeoutHandle = setTimeout(() => {
                    console.log(`[openclaw] Timeout after ${timeoutSec}s`);
                    this.stop();
                }, timeoutSec * 1000);
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

                while (queue.length > 0) {
                    yield queue.shift()!;
                }

                if (exitError) {
                    throw exitError;
                }
            } finally {
                if (timeoutHandle) clearTimeout(timeoutHandle);
            }
        } catch (err) {
            this._state = 'error';
            throw err;
        }
    }

    stop(): void {
        this._state = 'stopped';
        if (this.ws) {
            try {
                this.ws.close();
            } catch {
                // already closed
            }
            this.ws = null;
        }
    }

    sendInput(_text: string): void {
        console.log('[openclaw] sendInput not supported for WebSocket executor');
    }

    private buildSessionKey(): string {
        const strategy = this.options.sessionKeyStrategy || 'run';
        const agentId = this.options.agentId || 'default';

        if (strategy === 'fixed' && this.options.sessionKey) {
            return `agent:${agentId}:${this.options.sessionKey}`;
        }
        // Default to run-based session
        return `agent:${agentId}:codebolt:run:${Date.now()}`;
    }
}
