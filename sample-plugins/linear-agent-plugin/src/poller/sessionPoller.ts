import { EventEmitter } from 'events';
import type { LinearAgentClient } from '../linear/client.js';
import type { AgentSession, AgentSignal } from '../linear/types.js';

export interface SessionPollerEvents {
    'session:new': (session: AgentSession) => void;
    'session:updated': (session: AgentSession) => void;
    'session:signal': (sessionId: string, signal: AgentSignal) => void;
    error: (error: Error) => void;
}

export declare interface SessionPoller {
    on<K extends keyof SessionPollerEvents>(event: K, listener: SessionPollerEvents[K]): this;
    emit<K extends keyof SessionPollerEvents>(event: K, ...args: Parameters<SessionPollerEvents[K]>): boolean;
}

export class SessionPoller extends EventEmitter {
    private client: LinearAgentClient;
    private intervalMs: number;
    private timer: ReturnType<typeof setInterval> | null = null;
    private knownSessions: Map<string, string> = new Map(); // id -> updatedAt
    private isPolling = false;

    constructor(client: LinearAgentClient, intervalMs: number) {
        super();
        this.client = client;
        this.intervalMs = intervalMs;
    }

    start(): void {
        if (this.timer) return;
        console.log(`[SessionPoller] Starting (interval: ${this.intervalMs}ms)`);
        this.poll(); // Immediate first poll
        this.timer = setInterval(() => this.poll(), this.intervalMs);
    }

    stop(): void {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        this.knownSessions.clear();
        console.log('[SessionPoller] Stopped');
    }

    updateInterval(intervalMs: number): void {
        this.intervalMs = intervalMs;
        if (this.timer) {
            this.stop();
            this.start();
        }
    }

    private async poll(): Promise<void> {
        if (this.isPolling) return;
        this.isPolling = true;

        try {
            const sessions = await this.client.fetchActiveSessions();

            for (const session of sessions) {
                const known = this.knownSessions.get(session.id);
                if (!known) {
                    // Brand new session
                    this.knownSessions.set(session.id, session.updatedAt);
                    this.emit('session:new', session);
                } else if (known !== session.updatedAt) {
                    // Session was updated
                    this.knownSessions.set(session.id, session.updatedAt);
                    this.emit('session:updated', session);

                    // Check for signals
                    if (session.signals?.length) {
                        for (const signal of session.signals) {
                            this.emit('session:signal', session.id, signal);
                        }
                    }
                }
            }

            // Clean up sessions no longer in active results
            const activeIds = new Set(sessions.map((s) => s.id));
            for (const [id] of this.knownSessions) {
                if (!activeIds.has(id)) {
                    this.knownSessions.delete(id);
                }
            }
        } catch (err) {
            this.emit('error', err instanceof Error ? err : new Error(String(err)));
        } finally {
            this.isPolling = false;
        }
    }
}
