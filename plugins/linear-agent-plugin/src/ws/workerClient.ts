/**
 * WorkerClient — WebSocket client for the Linear Agent Cloudflare Worker.
 *
 * Connects to the Durable Object via WebSocket, registers with an OAuth
 * access token, and provides methods to send activities/state/plans back
 * to Linear through the worker proxy.
 */

import { EventEmitter } from 'events';
import WebSocket from 'ws';
import type { AgentSessionState, AgentPlanStep } from '../linear/types.js';

// ---------------------------------------------------------------------------
// Message types (matches the worker's protocol in types.ts)
// ---------------------------------------------------------------------------

interface ActivityContent {
    type: 'thought' | 'action' | 'response' | 'error' | 'elicitation';
    body?: string;
    action?: string;
    parameter?: string;
    result?: string;
}

interface ActivityMessage {
    type: 'activity';
    sessionId: string;
    activity: ActivityContent;
}

interface SessionStateMessage {
    type: 'session:state';
    sessionId: string;
    state: AgentSessionState;
}

interface PlanUpdateMessage {
    type: 'plan:update';
    sessionId: string;
    steps: AgentPlanStep[];
}

interface PingMessage {
    type: 'ping';
    timestamp: number;
}

// Incoming messages from the worker
export interface SessionCreatedEvent {
    sessionId: string;
    session: {
        id: string;
        state: string;
        promptContext: string;
        issueId?: string;
        issue?: {
            id: string;
            identifier: string;
            title: string;
            description?: string;
            url: string;
            project?: { name: string };
            team?: { name: string; key: string };
            labels?: Array<{ name: string }>;
            priority?: number;
            state?: { name: string };
        };
        createdAt: string;
        updatedAt: string;
    };
}

export interface SessionPromptedEvent {
    sessionId: string;
    message: string;
}

// ---------------------------------------------------------------------------
// Events
// ---------------------------------------------------------------------------

export interface WorkerClientEvents {
    'connected': () => void;
    'disconnected': () => void;
    'session:new': (event: SessionCreatedEvent) => void;
    'session:prompted': (event: SessionPromptedEvent) => void;
    'error': (error: Error) => void;
}

export declare interface WorkerClient {
    on<K extends keyof WorkerClientEvents>(event: K, listener: WorkerClientEvents[K]): this;
    emit<K extends keyof WorkerClientEvents>(event: K, ...args: Parameters<WorkerClientEvents[K]>): boolean;
}

// ---------------------------------------------------------------------------
// Client
// ---------------------------------------------------------------------------

export class WorkerClient extends EventEmitter {
    private workerUrl: string;
    private appToken: string;
    private reconnectIntervalMs: number;

    private ws: WebSocket | null = null;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private pingTimer: ReturnType<typeof setInterval> | null = null;
    private isConnected = false;
    private shouldReconnect = true;

    constructor(
        workerUrl: string,
        appToken: string,
        reconnectIntervalMs = 5000
    ) {
        super();
        this.workerUrl = workerUrl;
        this.appToken = appToken;
        this.reconnectIntervalMs = reconnectIntervalMs;
    }

    get connected(): boolean {
        return this.isConnected;
    }

    connect(): void {
        if (this.ws) {
            this.disconnect();
        }

        this.shouldReconnect = true;

        // Build WebSocket URL: wss://worker/ws/<appToken>
        const wsUrl = `${this.workerUrl}/ws/${this.appToken}`;
        console.log(`[WorkerClient] Connecting to ${wsUrl}`);

        try {
            this.ws = new WebSocket(wsUrl);
        } catch (err) {
            console.error('[WorkerClient] Failed to create WebSocket:', err);
            this.scheduleReconnect();
            return;
        }

        this.ws.on('open', () => {
            console.log('[WorkerClient] WebSocket connected, registering...');
            this.sendJson({
                type: 'register',
                appToken: this.appToken,
            });

            // Start ping keepalive
            this.startPing();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
            try {
                const raw = data.toString();
                const message = JSON.parse(raw);
                this.handleMessage(message);
            } catch (err) {
                console.error('[WorkerClient] Failed to parse message:', err);
            }
        });

        this.ws.on('close', () => {
            console.log('[WorkerClient] WebSocket closed');
            this.handleDisconnect();
        });

        this.ws.on('error', (err: Error) => {
            console.error('[WorkerClient] WebSocket error:', err.message);
            this.emit('error', err);
        });
    }

    disconnect(): void {
        this.shouldReconnect = false;
        this.stopPing();

        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }

        if (this.ws) {
            try {
                this.ws.close();
            } catch {
                // ignore
            }
            this.ws = null;
        }

        if (this.isConnected) {
            this.isConnected = false;
            this.emit('disconnected');
        }
    }

    // -----------------------------------------------------------------------
    // Send methods (plugin → worker → Linear)
    // -----------------------------------------------------------------------

    sendActivity(sessionId: string, activity: ActivityContent): void {
        this.sendJson({
            type: 'activity',
            sessionId,
            activity,
        } as ActivityMessage);
    }

    sendStateUpdate(sessionId: string, state: AgentSessionState): void {
        this.sendJson({
            type: 'session:state',
            sessionId,
            state,
        } as SessionStateMessage);
    }

    sendPlanUpdate(sessionId: string, steps: AgentPlanStep[]): void {
        this.sendJson({
            type: 'plan:update',
            sessionId,
            steps,
        } as PlanUpdateMessage);
    }

    // -----------------------------------------------------------------------
    // Internal
    // -----------------------------------------------------------------------

    private handleMessage(message: any): void {
        switch (message.type) {
            case 'registered':
                console.log(`[WorkerClient] Registered as ${message.appToken}`);
                this.isConnected = true;
                this.emit('connected');
                break;

            case 'session:created':
                console.log(`[WorkerClient] New session: ${message.sessionId}`);
                this.emit('session:new', {
                    sessionId: message.sessionId,
                    session: message.session,
                });
                break;

            case 'session:prompted':
                console.log(`[WorkerClient] Session prompted: ${message.sessionId}`);
                this.emit('session:prompted', {
                    sessionId: message.sessionId,
                    message: message.message,
                });
                break;

            case 'pong':
                // Keepalive acknowledged
                break;

            case 'error':
                console.error(`[WorkerClient] Error from worker: ${message.error}`);
                this.emit('error', new Error(message.error));
                break;

            default:
                console.warn(`[WorkerClient] Unknown message type: ${message.type}`);
        }
    }

    private handleDisconnect(): void {
        this.stopPing();
        const wasConnected = this.isConnected;
        this.isConnected = false;
        this.ws = null;

        if (wasConnected) {
            this.emit('disconnected');
        }

        if (this.shouldReconnect) {
            this.scheduleReconnect();
        }
    }

    private scheduleReconnect(): void {
        if (this.reconnectTimer) return;

        console.log(`[WorkerClient] Reconnecting in ${this.reconnectIntervalMs}ms...`);
        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            if (this.shouldReconnect) {
                this.connect();
            }
        }, this.reconnectIntervalMs);
    }

    private startPing(): void {
        this.stopPing();
        this.pingTimer = setInterval(() => {
            this.sendJson({ type: 'ping', timestamp: Date.now() } as PingMessage);
        }, 30000);
    }

    private stopPing(): void {
        if (this.pingTimer) {
            clearInterval(this.pingTimer);
            this.pingTimer = null;
        }
    }

    private sendJson(payload: unknown): void {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(payload));
        } else {
            console.warn('[WorkerClient] Cannot send — WebSocket not open');
        }
    }
}
