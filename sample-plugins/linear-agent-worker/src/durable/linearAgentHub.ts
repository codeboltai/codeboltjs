/**
 * LinearAgentHub — Durable Object
 *
 * Maintains persistent WebSocket connections to CodeBolt apps and bridges
 * them with Linear's agent session webhook events.
 *
 * Responsibilities:
 *   1. Accept WebSocket connections from CodeBolt apps (with OAuth token)
 *   2. Receive webhook events forwarded from the Worker
 *   3. Forward agent sessions to connected apps
 *   4. Relay activity/state/plan updates from apps back to Linear
 *
 * Inspired by the existing ProxyHub pattern in:
 *   remoteenvironments/codeboltwranglerWsServer/src/durable/proxyHub.ts
 */

import { LinearAgentClient } from '../linear/client.js';
import type {
  AppToHubMessage,
  HubToAppMessage,
  AgentSessionWebhookPayload,
  WebhookForwardPayload,
  AgentSessionPayload,
} from '../types.js';

interface AppConnection {
  socket: WebSocket;
  appToken: string;
  accessToken: string;
  linearClient: LinearAgentClient;
  connectedAt: number;
}

interface PendingSession {
  event: AgentSessionWebhookPayload;
  accessToken: string;
  receivedAt: number;
}

export class LinearAgentHub {
  private readonly state: DurableObjectState;

  /** Connected CodeBolt apps keyed by appToken */
  private readonly apps = new Map<string, AppConnection>();

  /** Pending webhook events when no app is connected (keyed by appToken) */
  private readonly pendingEvents = new Map<string, PendingSession[]>();

  /** Track active sessions to prevent duplicate handling */
  private readonly activeSessions = new Set<string>();

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade for app connections
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocketUpgrade(request);
    }

    // HTTP POST for webhook event forwarding from the Worker
    if (request.method === 'POST' && url.pathname === '/webhook') {
      return this.handleWebhookForward(request);
    }

    // Health/status endpoint
    if (request.method === 'GET' && url.pathname === '/status') {
      return Response.json({
        connectedApps: this.apps.size,
        activeSessions: this.activeSessions.size,
        pendingQueues: this.pendingEvents.size,
      });
    }

    return new Response('Not found', { status: 404 });
  }

  // ---------------------------------------------------------------------------
  // WebSocket handling
  // ---------------------------------------------------------------------------

  private handleWebSocketUpgrade(request: Request): Response {
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();

    server.addEventListener('message', (event: MessageEvent) => {
      try {
        const raw = event.data?.toString();
        if (!raw) return;

        const message = JSON.parse(raw) as AppToHubMessage;
        this.handleAppMessage(server, message);
      } catch (err) {
        console.error('[LinearAgentHub] Failed to process WS message:', err);
      }
    });

    server.addEventListener('close', () => {
      this.removeSocket(server);
    });

    server.addEventListener('error', () => {
      this.removeSocket(server);
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  private handleAppMessage(socket: WebSocket, message: AppToHubMessage): void {
    switch (message.type) {
      case 'register':
        this.handleRegister(socket, message.appToken, message.accessToken);
        break;

      case 'activity':
        this.handleActivityFromApp(message.sessionId, message.activity);
        break;

      case 'session:state':
        this.handleStateUpdateFromApp(message.sessionId, message.state);
        break;

      case 'plan:update':
        this.handlePlanUpdateFromApp(message.sessionId, message.steps);
        break;

      case 'session:external-url':
        this.handleExternalUrlFromApp(message.sessionId, message.urls);
        break;

      case 'ping':
        this.sendJson(socket, { type: 'pong', timestamp: Date.now() });
        break;

      default:
        console.warn(
          '[LinearAgentHub] Unknown message type:',
          (message as { type?: string }).type
        );
    }
  }

  private handleRegister(
    socket: WebSocket,
    appToken: string,
    accessToken: string
  ): void {
    // Close any existing connection for this appToken
    const existing = this.apps.get(appToken);
    if (existing && existing.socket !== socket) {
      try {
        existing.socket.close();
      } catch {
        // ignore
      }
    }

    const connection: AppConnection = {
      socket,
      appToken,
      accessToken,
      linearClient: new LinearAgentClient(accessToken),
      connectedAt: Date.now(),
    };

    this.apps.set(appToken, connection);

    console.log(`[LinearAgentHub] App registered: ${appToken}`);

    // Acknowledge registration
    this.sendJson(socket, {
      type: 'registered',
      appToken,
      success: true,
    } as HubToAppMessage);

    // Flush any pending events for this appToken
    this.flushPendingEvents(appToken);
  }

  // ---------------------------------------------------------------------------
  // Webhook event handling (from Worker via HTTP POST)
  // ---------------------------------------------------------------------------

  private async handleWebhookForward(request: Request): Promise<Response> {
    try {
      const payload = (await request.json()) as WebhookForwardPayload;
      const { event, accessToken, organizationId } = payload;

      console.log(
        `[LinearAgentHub] Webhook received: ${event.action} for session ${event.agentSession.id}`
      );

      // Find a connected app (try organizationId-based routing, then any connected app)
      const app = this.findAppForEvent(organizationId, accessToken);

      if (app) {
        await this.forwardEventToApp(app, event);
      } else {
        // No app connected — queue the event and emit a "waiting" thought
        console.log(
          `[LinearAgentHub] No app connected, queuing event for later`
        );
        this.queueEvent(organizationId, event, accessToken);

        // Still emit a thought to Linear so the session isn't marked unresponsive
        const tempClient = new LinearAgentClient(accessToken);
        await tempClient.emitActivity(event.agentSession.id, {
          type: 'thought',
          body: 'Waiting for CodeBolt agent to connect...',
        });
      }

      return new Response('OK', { status: 200 });
    } catch (err) {
      console.error('[LinearAgentHub] Webhook forward error:', err);
      return new Response('Internal error', { status: 500 });
    }
  }

  private async forwardEventToApp(
    app: AppConnection,
    event: AgentSessionWebhookPayload
  ): Promise<void> {
    const sessionId = event.agentSession.id;

    if (event.action === 'created') {
      // New session — emit immediate thought to Linear (within 10s requirement)
      try {
        await app.linearClient.emitActivity(sessionId, {
          type: 'thought',
          body: `Received task. Analyzing ${event.agentSession.issue?.identifier ?? 'issue'}...`,
        });
      } catch (err) {
        console.error(
          `[LinearAgentHub] Failed to emit initial thought:`,
          err
        );
      }

      this.activeSessions.add(sessionId);

      // Forward full session to the app
      this.sendJson(app.socket, {
        type: 'session:created',
        sessionId,
        session: event.agentSession,
      } as HubToAppMessage);
    } else if (event.action === 'prompted') {
      // User sent a follow-up prompt
      const message = event.agentActivity?.body ?? '';

      this.sendJson(app.socket, {
        type: 'session:prompted',
        sessionId,
        message,
        agentActivityId: event.agentActivity?.id,
      } as HubToAppMessage);
    }
  }

  // ---------------------------------------------------------------------------
  // App → Linear relay handlers
  // ---------------------------------------------------------------------------

  private async handleActivityFromApp(
    sessionId: string,
    activity: AppToHubMessage & { type: 'activity' } extends { activity: infer A }
      ? A
      : never
  ): Promise<void> {
    const client = this.findClientForSession(sessionId);
    if (!client) {
      console.error(
        `[LinearAgentHub] No client found for session ${sessionId}`
      );
      return;
    }

    try {
      await client.emitActivity(sessionId, activity);
      console.log(
        `[LinearAgentHub] Emitted ${activity.type} activity for session ${sessionId}`
      );
    } catch (err) {
      console.error(
        `[LinearAgentHub] Failed to emit activity for session ${sessionId}:`,
        err
      );
    }
  }

  private async handleStateUpdateFromApp(
    sessionId: string,
    state: string
  ): Promise<void> {
    const client = this.findClientForSession(sessionId);
    if (!client) return;

    try {
      await client.updateSessionState(
        sessionId,
        state as import('../types.js').AgentSessionState
      );

      if (state === 'complete' || state === 'error') {
        this.activeSessions.delete(sessionId);
      }

      console.log(
        `[LinearAgentHub] Updated session ${sessionId} state to ${state}`
      );
    } catch (err) {
      console.error(
        `[LinearAgentHub] Failed to update state for session ${sessionId}:`,
        err
      );
    }
  }

  private async handlePlanUpdateFromApp(
    sessionId: string,
    steps: import('../types.js').AgentPlanStep[]
  ): Promise<void> {
    const client = this.findClientForSession(sessionId);
    if (!client) return;

    try {
      await client.upsertPlan(sessionId, steps);
      console.log(
        `[LinearAgentHub] Updated plan for session ${sessionId} (${steps.length} steps)`
      );
    } catch (err) {
      console.error(
        `[LinearAgentHub] Failed to update plan for session ${sessionId}:`,
        err
      );
    }
  }

  private async handleExternalUrlFromApp(
    sessionId: string,
    urls: Array<{ label: string; url: string }>
  ): Promise<void> {
    const client = this.findClientForSession(sessionId);
    if (!client) return;

    try {
      await client.updateExternalUrls(sessionId, urls);
      console.log(
        `[LinearAgentHub] Updated external URLs for session ${sessionId}`
      );
    } catch (err) {
      console.error(
        `[LinearAgentHub] Failed to update external URLs for session ${sessionId}:`,
        err
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private findAppForEvent(
    organizationId: string,
    accessToken: string
  ): AppConnection | null {
    // For now, return the first connected app
    // In a multi-tenant setup, you'd match by organizationId or accessToken
    for (const app of this.apps.values()) {
      return app;
    }
    return null;
  }

  private findClientForSession(sessionId: string): LinearAgentClient | null {
    // Return the first connected app's client
    // In production, you'd maintain a sessionId → appToken mapping
    for (const app of this.apps.values()) {
      return app.linearClient;
    }
    return null;
  }

  private queueEvent(
    key: string,
    event: AgentSessionWebhookPayload,
    accessToken: string
  ): void {
    const queue = this.pendingEvents.get(key) ?? [];
    queue.push({
      event,
      accessToken,
      receivedAt: Date.now(),
    });
    this.pendingEvents.set(key, queue);

    // Limit queue size
    if (queue.length > 50) {
      queue.shift();
    }
  }

  private async flushPendingEvents(appToken: string): Promise<void> {
    // Flush all pending events to the newly connected app
    const app = this.apps.get(appToken);
    if (!app) return;

    for (const [key, queue] of this.pendingEvents.entries()) {
      while (queue.length > 0) {
        const pending = queue.shift()!;

        // Update the client's access token if the pending event has one
        if (pending.accessToken) {
          app.linearClient.updateAccessToken(pending.accessToken);
        }

        await this.forwardEventToApp(app, pending.event);
      }
      this.pendingEvents.delete(key);
    }
  }

  private removeSocket(socket: WebSocket): void {
    for (const [appToken, conn] of this.apps.entries()) {
      if (conn.socket === socket) {
        this.apps.delete(appToken);
        console.log(`[LinearAgentHub] App disconnected: ${appToken}`);
        break;
      }
    }
  }

  private sendJson(socket: WebSocket, payload: unknown): void {
    try {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
      }
    } catch (err) {
      console.error('[LinearAgentHub] Failed to send message:', err);
    }
  }
}
