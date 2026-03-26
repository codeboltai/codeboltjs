/**
 * LinearAgentHub — Durable Object
 *
 * Maintains persistent WebSocket connections to CodeBolt apps and bridges
 * them with Linear's agent session webhook events.
 *
 * Simplified architecture:
 *   - Apps just connect with an appToken (no OAuth token needed)
 *   - Worker looks up access tokens from KV (stored during OAuth install)
 *   - Webhook events are broadcast to ALL connected apps
 *   - Any connected app can respond; the DO relays back to Linear
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

  /** Pending webhook events when no app is connected */
  private readonly pendingEvents: PendingSession[] = [];

  /** Track active sessions to prevent duplicate handling */
  private readonly activeSessions = new Set<string>();

  /** Linear client using the org's OAuth token (set from webhook payload) */
  private linearClient: LinearAgentClient | null = null;

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
        appTokens: Array.from(this.apps.keys()),
        activeSessions: this.activeSessions.size,
        pendingEvents: this.pendingEvents.length,
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
        this.handleRegister(socket, message.appToken);
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

  private handleRegister(socket: WebSocket, appToken: string): void {
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
      connectedAt: Date.now(),
    };

    this.apps.set(appToken, connection);

    console.log(`[LinearAgentHub] App registered: ${appToken} (total: ${this.apps.size})`);

    // Acknowledge registration
    this.sendJson(socket, {
      type: 'registered',
      appToken,
      success: true,
    } as HubToAppMessage);

    // Flush any pending events to all connected apps
    this.flushPendingEvents();
  }

  // ---------------------------------------------------------------------------
  // Webhook event handling (from Worker via HTTP POST)
  // ---------------------------------------------------------------------------

  private async handleWebhookForward(request: Request): Promise<Response> {
    try {
      const payload = (await request.json()) as WebhookForwardPayload;
      const { event, accessToken } = payload;

      console.log(
        `[LinearAgentHub] Webhook received: ${event.action} for session ${event.agentSession.id}`
      );

      // Update the linear client with the access token from KV
      if (accessToken) {
        if (!this.linearClient) {
          this.linearClient = new LinearAgentClient(accessToken);
        } else {
          this.linearClient.updateAccessToken(accessToken);
        }
      }

      if (this.apps.size > 0) {
        // Broadcast to ALL connected apps
        await this.broadcastEvent(event);
      } else {
        // No apps connected — respond to Linear immediately
        console.log(
          `[LinearAgentHub] No apps connected, notifying Linear and queuing event`
        );

        const sessionId = event.agentSession.id;

        if (!accessToken || !this.linearClient) {
          console.error(
            `[LinearAgentHub] No access token available — cannot respond to Linear for session ${sessionId}`
          );
          return new Response('No access token', { status: 500 });
        }

        // Tell Linear that no local server is running
        await this.linearClient.emitActivity(sessionId, {
          type: 'response',
          body: [
            '**No local CodeBolt server is currently connected.**',
            '',
            'The CodeBolt agent plugin needs to be running locally to process this request.',
            '',
            '**To fix this:**',
            '1. Open CodeBolt on your machine',
            '2. Ensure the Linear Agent plugin is installed and enabled',
            '3. Verify the plugin shows "Connected" status in its settings panel',
            '',
            'Once connected, you can @mention the agent again or re-assign this issue.',
          ].join('\n'),
        });

        await this.linearClient.updateSessionState(sessionId, 'awaitingInput');

        // Queue so it can be replayed when an app connects
        this.pendingEvents.push({
          event,
          accessToken,
          receivedAt: Date.now(),
        });

        // Limit queue size
        if (this.pendingEvents.length > 50) {
          this.pendingEvents.shift();
        }
      }

      return new Response('OK', { status: 200 });
    } catch (err) {
      console.error('[LinearAgentHub] Webhook forward error:', err);
      return new Response('Internal error', { status: 500 });
    }
  }

  /**
   * Broadcast a webhook event to ALL connected apps.
   */
  private async broadcastEvent(event: AgentSessionWebhookPayload): Promise<void> {
    const sessionId = event.agentSession.id;

    if (event.action === 'created') {
      // Emit immediate thought to Linear (within 10s requirement)
      if (this.linearClient) {
        try {
          await this.linearClient.emitActivity(sessionId, {
            type: 'thought',
            body: `Received task. Analyzing ${event.agentSession.issue?.identifier ?? 'issue'}...`,
          });
        } catch (err) {
          console.error(`[LinearAgentHub] Failed to emit initial thought:`, err);
        }
      }

      this.activeSessions.add(sessionId);

      // Send to all connected apps
      const msg: HubToAppMessage = {
        type: 'session:created',
        sessionId,
        session: event.agentSession,
      };

      for (const app of this.apps.values()) {
        this.sendJson(app.socket, msg);
      }

      console.log(`[LinearAgentHub] Broadcast session:created to ${this.apps.size} app(s)`);
    } else if (event.action === 'prompted') {
      const message = event.agentActivity?.body ?? '';

      const msg: HubToAppMessage = {
        type: 'session:prompted',
        sessionId,
        message,
        agentActivityId: event.agentActivity?.id,
      };

      for (const app of this.apps.values()) {
        this.sendJson(app.socket, msg);
      }

      console.log(`[LinearAgentHub] Broadcast session:prompted to ${this.apps.size} app(s)`);
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
    if (!this.linearClient) {
      console.error(`[LinearAgentHub] No linear client — cannot emit activity for session ${sessionId}`);
      return;
    }

    try {
      await this.linearClient.emitActivity(sessionId, activity);
      console.log(`[LinearAgentHub] Emitted ${activity.type} activity for session ${sessionId}`);
    } catch (err) {
      console.error(`[LinearAgentHub] Failed to emit activity for session ${sessionId}:`, err);
    }
  }

  private async handleStateUpdateFromApp(
    sessionId: string,
    state: string
  ): Promise<void> {
    if (!this.linearClient) return;

    try {
      await this.linearClient.updateSessionState(
        sessionId,
        state as import('../types.js').AgentSessionState
      );

      if (state === 'complete' || state === 'error') {
        this.activeSessions.delete(sessionId);
      }

      console.log(`[LinearAgentHub] Updated session ${sessionId} state to ${state}`);
    } catch (err) {
      console.error(`[LinearAgentHub] Failed to update state for session ${sessionId}:`, err);
    }
  }

  private async handlePlanUpdateFromApp(
    sessionId: string,
    steps: import('../types.js').AgentPlanStep[]
  ): Promise<void> {
    if (!this.linearClient) return;

    try {
      await this.linearClient.upsertPlan(sessionId, steps);
      console.log(`[LinearAgentHub] Updated plan for session ${sessionId} (${steps.length} steps)`);
    } catch (err) {
      console.error(`[LinearAgentHub] Failed to update plan for session ${sessionId}:`, err);
    }
  }

  private async handleExternalUrlFromApp(
    sessionId: string,
    urls: Array<{ label: string; url: string }>
  ): Promise<void> {
    if (!this.linearClient) return;

    try {
      await this.linearClient.updateExternalUrls(sessionId, urls);
      console.log(`[LinearAgentHub] Updated external URLs for session ${sessionId}`);
    } catch (err) {
      console.error(`[LinearAgentHub] Failed to update external URLs for session ${sessionId}:`, err);
    }
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private async flushPendingEvents(): Promise<void> {
    if (this.pendingEvents.length === 0 || this.apps.size === 0) return;

    let flushedCount = 0;
    while (this.pendingEvents.length > 0) {
      const pending = this.pendingEvents.shift()!;

      // Update the linear client's token
      if (pending.accessToken && this.linearClient) {
        this.linearClient.updateAccessToken(pending.accessToken);
      }

      // Notify Linear that agent is now online
      const sessionId = pending.event.agentSession.id;
      if (this.linearClient) {
        try {
          await this.linearClient.emitActivity(sessionId, {
            type: 'thought',
            body: 'CodeBolt agent is now connected. Processing your request...',
          });
        } catch (err) {
          console.error(
            `[LinearAgentHub] Failed to emit reconnection notice for ${sessionId}:`,
            err
          );
        }
      }

      await this.broadcastEvent(pending.event);
      flushedCount++;
    }

    if (flushedCount > 0) {
      console.log(`[LinearAgentHub] Flushed ${flushedCount} pending event(s) to ${this.apps.size} app(s)`);
    }
  }

  private removeSocket(socket: WebSocket): void {
    for (const [appToken, conn] of this.apps.entries()) {
      if (conn.socket === socket) {
        this.apps.delete(appToken);
        console.log(`[LinearAgentHub] App disconnected: ${appToken} (remaining: ${this.apps.size})`);
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
