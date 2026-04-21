import {
  ForwardMessage,
  ForwardToRuntimeMessage,
  GatewayForwardFromAgent,
  GatewayForwardFromApp,
  GatewayOutgoingMessage,
  GatewayRegisterMessage,
  ProxyIncomingMessage,
  RegisterMessage,
  RegisteredMessage,
  RuntimeInfo,
  TaskEventMessage,
  Env,
} from '../types';

const DEFAULT_TOKEN = 'default';

interface SocketMeta {
  role: 'gateway' | 'app' | 'agent';
  token: string;
  userId?: string;
  runtimeId?: string;
}

// Persisted across DO hibernation via serializeAttachment/deserializeAttachment
interface SocketAttachment {
  role: SocketMeta['role'];
  token: string;
  userId?: string;
  agentId?: string;
  runtimeId?: string;
}

export class ProxyHub {
  private readonly agents = new Map<string, WebSocket>();
  private readonly appSocketsByToken = new Map<string, WebSocket>();

  // Multi-runtime: appToken → Map<runtimeId, WebSocket>
  private readonly gatewaysByRuntime = new Map<string, Map<string, WebSocket>>();
  // Runtime metadata: appToken → Map<runtimeId, RuntimeInfo & connectedAt>
  private readonly runtimeMeta = new Map<string, Map<string, RuntimeInfo & { connectedAt: number }>>();

  private readonly monitoringSockets = new Set<WebSocket>();

  private readonly pendingAgentMessages = new Map<string, unknown[]>();
  private readonly pendingAppMessagesByToken = new Map<string, unknown[]>();
  private readonly pendingGatewayMessagesByToken = new Map<string, GatewayOutgoingMessage[]>();

  private readonly socketMeta = new WeakMap<WebSocket, SocketMeta>();

  // Buffered KV writes — accumulate messages in memory, flush every 2s
  private readonly messageBuffer = new Map<string, any[]>();
  private readonly threadUpdates = new Map<string, { appToken: string; threadId: string }>();
  private flushScheduled = false;

  constructor(readonly state: DurableObjectState, private readonly env: Env) {
    // Auto-respond to JSON ping messages even while the DO is hibernating
    this.state.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair('{"type":"ping"}', '{"type":"pong"}')
    );
  }

  // ─── Hibernation helpers ───────────────────────────────────────────────────

  /**
   * Restore in-memory socket maps from hibernation attachment data.
   * Called at the start of every hibernation-API handler.
   */
  private restoreSocketsFromHibernation(): void {
    const allSockets = this.state.getWebSockets();
    for (const ws of allSockets) {
      const tags = this.state.getTags(ws);
      if (tags.includes('monitoring') && !this.monitoringSockets.has(ws)) {
        this.monitoringSockets.add(ws);
      }
      this.restoreSocketMeta(ws);
    }
  }

  // ─── Alarm ────────────────────────────────────────────────────────────────

  async alarm(): Promise<void> {
    this.flushScheduled = false;
    await this.flushBufferToKV();
  }

  // ─── fetch (new connections) ───────────────────────────────────────────────

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    const isMonitoringClient = request.headers.get('X-Monitoring-Client') === 'true';

    // Hibernation API — tag monitoring sockets so close/error handlers can identify them
    const tags: string[] = [];
    if (isMonitoringClient) tags.push('monitoring');
    this.state.acceptWebSocket(server, tags);

    if (isMonitoringClient) {
      this.monitoringSockets.add(server);
      this.sendJson(server, {
        type: 'connection_update',
        timestamp: Date.now(),
        actor: 'monitor',
        connected: true,
      });
      this.broadcastConnectionUpdate();
    }

    // addEventListener listeners are kept for non-hibernated sockets;
    // the webSocketMessage/Close/Error methods below handle hibernated ones.
    server.addEventListener('message', async (event) => {
      try {
        const raw = event.data?.toString();
        if (!raw) return;
        const message = JSON.parse(raw) as ProxyIncomingMessage;
        await this.handleMessage(server, message);
      } catch (error) {
        console.error('[ProxyHub] Failed to process message', error);
      }
    });

    server.addEventListener('close', () => {
      if (isMonitoringClient) {
        this.monitoringSockets.delete(server);
        this.broadcastConnectionUpdate();
      }
      this.removeSocket(server);
    });

    server.addEventListener('error', () => {
      if (isMonitoringClient) {
        this.monitoringSockets.delete(server);
        this.broadcastConnectionUpdate();
      }
      this.removeSocket(server);
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  // ─── Hibernation API handlers ──────────────────────────────────────────────

  async webSocketMessage(ws: WebSocket, data: string | ArrayBuffer): Promise<void> {
    this.restoreSocketsFromHibernation();
    try {
      const raw = typeof data === 'string' ? data : new TextDecoder().decode(data);
      if (!raw) return;
      const message = JSON.parse(raw) as ProxyIncomingMessage;
      await this.handleMessage(ws, message);
    } catch (error) {
      console.error('[ProxyHub] Failed to process message', error);
    }
  }

  async webSocketClose(ws: WebSocket, _code: number, _reason: string, _wasClean: boolean): Promise<void> {
    this.restoreSocketsFromHibernation();
    const tags = this.state.getTags(ws);
    if (tags.includes('monitoring')) {
      this.monitoringSockets.delete(ws);
      this.broadcastConnectionUpdate();
    }
    this.removeSocket(ws);
  }

  async webSocketError(ws: WebSocket, _error: unknown): Promise<void> {
    this.restoreSocketsFromHibernation();
    const tags = this.state.getTags(ws);
    if (tags.includes('monitoring')) {
      this.monitoringSockets.delete(ws);
      this.broadcastConnectionUpdate();
    }
    this.removeSocket(ws);
  }

  // ─── Message routing ───────────────────────────────────────────────────────

  private async handleMessage(socket: WebSocket, message: ProxyIncomingMessage): Promise<void> {
    switch (message.type) {
      case 'registered':
        this.handleClientRegistration(socket, message);
        break;
      case 'forward':
        this.handleForward(message, true);
        break;
      case 'register_gateway':
        this.handleGatewayRegistration(socket, message);
        break;
      case 'forward_from_agent':
        this.handleForwardFromGatewayAgent(message);
        break;
      case 'forward_from_app':
        this.handleForwardFromGatewayApp(message);
        break;
      case 'forward_to_runtime':
        this.handleForwardToRuntime(message);
        break;
      case 'taskEvent':
        await this.handleTaskEvent(socket, message);
        break;
      case 'ping':
        this.sendJson(socket, { type: 'pong', timestamp: Date.now() });
        break;
      case 'pong':
        // Heartbeat acknowledgement — no routing needed
        break;
      case 'request_connections':
        this.sendJson(socket, {
          type: 'connections_snapshot',
          summary: this.getConnectionSummary(),
          runtimes: this.getRuntimeList(this.getSocketMeta(socket)?.token ?? DEFAULT_TOKEN),
          timestamp: Date.now(),
        });
        break;
      case 'requestSync':
        await this.handleRequestSync(socket);
        break;
      case 'requestThreadMessages':
        await this.handleRequestThreadMessages(socket, message);
        break;
      default:
        await this.handleRawForward(socket, message as any);
    }
  }

  private handleClientRegistration(socket: WebSocket, message: RegisterMessage): void {
    const ack = this.registerSocket(socket, message);
    this.sendJson(socket, ack);
    this.flushQueuesAfterRegister(message);
    this.broadcastConnectionUpdate();
    this.logMessage('incoming', message.actor, message.agentId, message, message);
  }

  private handleGatewayRegistration(socket: WebSocket, message: GatewayRegisterMessage): void {
    const token = this.normalizeToken(message.appToken);
    const runtimeId = message.runtimeId ?? message.serverId ?? 'default';
    const runtimeType = message.runtimeType ?? 'local';
    const projectPath = message.projectPath;
    const projectName = message.projectName;
    const gitRemoteUrl = message.gitRemoteUrl;

    // Ensure per-token maps exist
    if (!this.gatewaysByRuntime.has(token)) {
      this.gatewaysByRuntime.set(token, new Map());
    }
    if (!this.runtimeMeta.has(token)) {
      this.runtimeMeta.set(token, new Map());
    }

    const runtimeMap = this.gatewaysByRuntime.get(token)!;
    const metaMap = this.runtimeMeta.get(token)!;

    // Close existing socket for this specific runtimeId (same instance reconnecting)
    const existing = runtimeMap.get(runtimeId);
    if (existing && existing !== socket) {
      try { existing.close(); } catch (_) {}
    }

    runtimeMap.set(runtimeId, socket);
    metaMap.set(runtimeId, { runtimeId, runtimeType, projectPath, projectName, gitRemoteUrl, connectedAt: Date.now() });

    // Persist meta both in-memory and via hibernation attachment
    const meta: SocketMeta = { role: 'gateway', token, runtimeId, userId: message.userId };
    this.socketMeta.set(socket, meta);
    this.persistSocketMeta(socket, { role: 'gateway', token, runtimeId, userId: message.userId });

    this.sendJson(socket, {
      type: 'registered',
      actor: 'gateway',
      serverId: runtimeId,
      appToken: token,
    });

    this.flushGatewayQueue(token);
    this.broadcastConnectionUpdate();

    // Notify all portal app sockets that a new runtime came online
    this.broadcastToAppSockets(token, {
      type: 'runtime_connected',
      runtimeId,
      runtimeType,
      projectPath,
      projectName,
      gitRemoteUrl,
      timestamp: Date.now(),
    });

    this.logMessage('incoming', 'system', undefined, message, message);
  }

  private handleForward(message: ForwardMessage, includeGateway: boolean): void {
    const token = this.normalizeToken(message.appToken);
    if (message.target === 'app') {
      this.deliverToApps({ token, payload: message.payload, agentId: message.agentId }, includeGateway);
      this.logMessage('outgoing', 'agent', message.agentId, message.payload, message);
      return;
    }
    this.deliverToAgents({ token, payload: message.payload, agentId: message.agentId }, includeGateway);
    this.logMessage('outgoing', 'app', message.agentId, message.payload, message);
  }

  private handleForwardFromGatewayAgent(message: GatewayForwardFromAgent): void {
    const token = this.normalizeToken(message.appToken);
    this.deliverToApps({ token, payload: message.payload }, false);
    this.logMessage('incoming', 'agent', undefined, message.payload, message);
  }

  private handleForwardFromGatewayApp(message: GatewayForwardFromApp): void {
    const token = this.normalizeToken(message.appToken);
    this.deliverToAgents({ token, payload: message.payload, agentId: message.agentId }, false);
    this.logMessage('incoming', 'app', message.agentId, message.payload, message);
  }

  // Route a message to one specific runtime by runtimeId
  private handleForwardToRuntime(message: ForwardToRuntimeMessage): void {
    const token = this.normalizeToken(message.appToken);
    const runtimeMap = this.gatewaysByRuntime.get(token);
    if (!runtimeMap) return;

    const gatewaySocket = runtimeMap.get(message.runtimeId);
    if (gatewaySocket && gatewaySocket.readyState === WebSocket.OPEN) {
      this.sendJson(gatewaySocket, message.payload);
    } else {
      // Queue for when this runtime reconnects
      const queue = this.pendingGatewayMessagesByToken.get(token) ?? [];
      queue.push({ type: 'forward_to_agent', appToken: token, payload: message.payload });
      this.pendingGatewayMessagesByToken.set(token, queue);
    }
  }

  // Buffer task events to KV and broadcast to app sockets
  private async handleTaskEvent(socket: WebSocket, message: TaskEventMessage): Promise<void> {
    const meta = this.getSocketMeta(socket);
    const token = this.normalizeToken(message.appToken ?? meta?.token);

    if (this.env.CHAT_STORE && message.data?.task) {
      const taskId = (message.data.task as any).taskId ?? (message.data.task as any).id;
      if (taskId) {
        const key = `task:${token}:${taskId}`;
        await this.env.CHAT_STORE.put(key, JSON.stringify({
          ...message.data.task,
          _action: message.data.action,
          _syncedAt: message.timestamp,
        }));

        // Update task index
        const indexKey = `tasks:${token}`;
        const raw = await this.env.CHAT_STORE.get(indexKey);
        const index: string[] = raw ? JSON.parse(raw) : [];
        if (!index.includes(taskId)) {
          index.push(taskId);
          await this.env.CHAT_STORE.put(indexKey, JSON.stringify(index));
        }
      }
    }

    // Broadcast to all portal app sockets for this token
    this.broadcastToAppSockets(token, message);
  }

  private async handleRawForward(socket: WebSocket, message: any): Promise<void> {
    const meta = this.getSocketMeta(socket);
    if (!meta) {
      console.warn('[ProxyHub] Unknown message type from unregistered socket:', message?.type);
      return;
    }

    if (meta.role === 'gateway') {
      // Gateway → forward to app socket
      const appSocket = this.appSocketsByToken.get(meta.token);
      if (appSocket) {
        this.sendJson(appSocket, message);
      }

      // Buffer chatEvent messages for batch KV write
      if (message.type === 'chatEvent' && message.data) {
        const d = message.data;
        const threadId = d.threadId || d.message?.threadId || message.threadId;
        if (threadId) {
          this.bufferChatMessage(meta.token, { ...d, threadId });
        }
      }

      this.logMessage('outgoing', 'app', undefined, message, message);
    } else if (meta.role === 'app') {
      // App → forward to ALL gateways for this token (broadcast to all runtimes)
      const runtimeMap = this.gatewaysByRuntime.get(meta.token);
      if (runtimeMap) {
        for (const gatewaySocket of runtimeMap.values()) {
          if (gatewaySocket.readyState === WebSocket.OPEN) {
            this.sendJson(gatewaySocket, message);
          }
        }
      }
      this.logMessage('outgoing', 'agent', undefined, message, message);
    }
  }

  // ─── KV buffering ──────────────────────────────────────────────────────────

  private bufferChatMessage(appToken: string, messageData: any): void {
    const threadId = messageData.threadId;
    const key = `messages:${appToken}:${threadId}`;

    const buf = this.messageBuffer.get(key) || [];
    buf.push(messageData);
    this.messageBuffer.set(key, buf);
    this.threadUpdates.set(`${appToken}:${threadId}`, { appToken, threadId });

    if (!this.flushScheduled) {
      this.flushScheduled = true;
      this.state.storage.setAlarm(Date.now() + 2000);
    }
  }

  private async flushBufferToKV(): Promise<void> {
    if (!this.env.CHAT_STORE || this.messageBuffer.size === 0) return;

    try {
      for (const [key, newMessages] of this.messageBuffer) {
        const existingRaw = await this.env.CHAT_STORE.get(key);
        const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];
        existing.push(...newMessages);
        while (existing.length > 1000) existing.shift();
        await this.env.CHAT_STORE.put(key, JSON.stringify(existing));
      }
      this.messageBuffer.clear();

      const threadsByToken = new Map<string, { threadId: string }[]>();
      for (const { appToken, threadId } of this.threadUpdates.values()) {
        const list = threadsByToken.get(appToken) || [];
        list.push({ threadId });
        threadsByToken.set(appToken, list);
      }

      for (const [appToken, updates] of threadsByToken) {
        const threadsKey = `threads:${appToken}`;
        const threadsRaw = await this.env.CHAT_STORE.get(threadsKey);
        const threads: any[] = threadsRaw ? JSON.parse(threadsRaw) : [];
        for (const { threadId } of updates) {
          const existing = threads.find((t: any) => t.threadId === threadId);
          if (existing) {
            existing.updatedAt = Date.now();
          } else {
            threads.push({ threadId, updatedAt: Date.now() });
          }
        }
        await this.env.CHAT_STORE.put(threadsKey, JSON.stringify(threads));
      }
      this.threadUpdates.clear();
    } catch (error) {
      console.error('[ProxyHub] Failed to flush buffer to KV:', error);
    }
  }

  // ─── Sync handlers ─────────────────────────────────────────────────────────

  private async handleRequestSync(socket: WebSocket): Promise<void> {
    const meta = this.getSocketMeta(socket);
    if (!meta) return;

    await this.flushBufferToKV();

    if (!this.env.CHAT_STORE) {
      this.sendJson(socket, { type: 'syncThreadList', data: [] });
      return;
    }

    try {
      const threadsKey = `threads:${meta.token}`;
      const threadsRaw = await this.env.CHAT_STORE.get(threadsKey);
      const threads = threadsRaw ? JSON.parse(threadsRaw) : [];
      this.sendJson(socket, { type: 'syncThreadList', data: threads });
    } catch (error) {
      console.error('[ProxyHub] Failed to handle requestSync:', error);
      this.sendJson(socket, { type: 'syncThreadList', data: [] });
    }
  }

  private async handleRequestThreadMessages(socket: WebSocket, message: any): Promise<void> {
    const meta = this.getSocketMeta(socket);
    if (!meta) return;

    const threadId = message.threadId;
    if (!threadId) return;

    await this.flushBufferToKV();

    if (!this.env.CHAT_STORE) {
      this.sendJson(socket, { type: 'syncThreadMessages', threadId, data: [] });
      return;
    }

    try {
      const key = `messages:${meta.token}:${threadId}`;
      const msgsRaw = await this.env.CHAT_STORE.get(key);
      const msgs = msgsRaw ? JSON.parse(msgsRaw) : [];
      this.sendJson(socket, { type: 'syncThreadMessages', threadId, data: msgs });
    } catch (error) {
      console.error('[ProxyHub] Failed to handle requestThreadMessages:', error);
      this.sendJson(socket, { type: 'syncThreadMessages', threadId, data: [] });
    }
  }

  // ─── Socket registration ───────────────────────────────────────────────────

  private registerSocket(socket: WebSocket, message: RegisterMessage): RegisteredMessage {
    if (message.actor === 'agent' && message.agentId) {
      this.agents.set(message.agentId, socket);
      const token = this.normalizeToken(message.appToken);
      this.persistSocketMeta(socket, { role: 'agent', token, agentId: message.agentId });
      this.socketMeta.set(socket, { role: 'agent', token });
      return { type: 'registered', actor: 'agent', agentId: message.agentId, appToken: token };
    }

    const token = this.normalizeToken(message.appToken);
    this.appSocketsByToken.set(token, socket);
    this.persistSocketMeta(socket, { role: 'app', token, userId: message.appId });
    this.socketMeta.set(socket, { role: 'app', token });
    return { type: 'registered', actor: 'app', appToken: token };
  }

  private flushQueuesAfterRegister(message: RegisterMessage): void {
    if (message.actor === 'agent' && message.agentId) {
      this.flushAgentQueue(message.agentId);
      return;
    }
    if (message.actor === 'app') {
      const token = this.normalizeToken(message.appToken);
      this.flushAppQueue(token);
    }
  }

  // ─── Delivery helpers ──────────────────────────────────────────────────────

  private deliverToApps(
    params: { token: string; payload: unknown; agentId?: string },
    includeGateway: boolean
  ): void {
    const socket = this.appSocketsByToken.get(params.token);
    if (socket) {
      this.sendJson(socket, params.payload);
      this.logMessage('outgoing', 'app', params.agentId, params.payload, { target: 'app', ...params });
    } else {
      const queue = this.pendingAppMessagesByToken.get(params.token) ?? [];
      queue.push(params.payload);
      this.pendingAppMessagesByToken.set(params.token, queue);
    }

    if (includeGateway) {
      this.enqueueGatewayMessage(params.token, {
        type: 'forward_to_app',
        appToken: params.token,
        agentId: params.agentId,
        payload: params.payload,
      });
    }
  }

  private deliverToAgents(
    params: { token: string; payload: unknown; agentId?: string },
    includeGateway: boolean
  ): void {
    if (params.agentId) {
      const socket = this.agents.get(params.agentId);
      if (socket) {
        this.sendJson(socket, params.payload);
        this.logMessage('outgoing', 'agent', params.agentId, params.payload, { target: 'agent', ...params });
      } else {
        const queue = this.pendingAgentMessages.get(params.agentId) ?? [];
        queue.push(params.payload);
        this.pendingAgentMessages.set(params.agentId, queue);
      }
    } else {
      const recipients = Array.from(this.agents.values());
      if (recipients.length) {
        recipients.forEach((socket) => this.sendJson(socket, params.payload));
        this.logMessage('outgoing', 'agent', 'broadcast', params.payload, { target: 'broadcast', ...params });
      }
    }

    if (includeGateway) {
      this.enqueueGatewayMessage(params.token, {
        type: 'forward_to_agent',
        appToken: params.token,
        agentId: params.agentId,
        payload: params.payload,
      });
    }
  }

  private flushAgentQueue(agentId: string): void {
    const socket = this.agents.get(agentId);
    const queue = this.pendingAgentMessages.get(agentId);
    if (socket && queue?.length) {
      queue.forEach((payload) => this.sendJson(socket, payload));
    }
    this.pendingAgentMessages.delete(agentId);
  }

  private flushAppQueue(token: string): void {
    const socket = this.appSocketsByToken.get(token);
    if (socket) {
      const queue = this.pendingAppMessagesByToken.get(token);
      queue?.forEach((payload) => this.sendJson(socket, payload));
      this.pendingAppMessagesByToken.delete(token);
    }
  }

  private enqueueGatewayMessage(token: string, message: GatewayOutgoingMessage): void {
    const runtimeMap = this.gatewaysByRuntime.get(token);
    if (runtimeMap?.size) {
      for (const gatewaySocket of runtimeMap.values()) {
        if (gatewaySocket.readyState === WebSocket.OPEN) {
          this.sendJson(gatewaySocket, message);
          return;
        }
      }
    }

    const queue = this.pendingGatewayMessagesByToken.get(token) ?? [];
    queue.push(message);
    this.pendingGatewayMessagesByToken.set(token, queue);
  }

  private flushGatewayQueue(token: string): void {
    const runtimeMap = this.gatewaysByRuntime.get(token);
    if (!runtimeMap?.size) return;

    const queue = this.pendingGatewayMessagesByToken.get(token);
    if (!queue?.length) return;

    for (const gatewaySocket of runtimeMap.values()) {
      if (gatewaySocket.readyState === WebSocket.OPEN) {
        while (queue.length) {
          const msg = queue.shift();
          if (msg) this.sendJson(gatewaySocket, msg);
        }
        break;
      }
    }

    this.pendingGatewayMessagesByToken.delete(token);
  }

  private broadcastToAppSockets(token: string, payload: unknown): void {
    const appSocket = this.appSocketsByToken.get(token);
    if (appSocket && appSocket.readyState === WebSocket.OPEN) {
      this.sendJson(appSocket, payload);
    }
  }

  // ─── Socket metadata (hibernation-safe) ───────────────────────────────────

  /**
   * Persist socket role/token/runtimeId via the DO hibernation attachment API
   * so it survives DO sleep/wake cycles.
   */
  private persistSocketMeta(socket: WebSocket, meta: SocketAttachment): void {
    const attachableSocket = socket as WebSocket & {
      serializeAttachment?: (value: SocketAttachment) => void;
    };
    try {
      attachableSocket.serializeAttachment?.(meta);
    } catch (error) {
      console.warn('[ProxyHub] Failed to persist socket metadata:', error);
    }
  }

  /**
   * Restore in-memory socket maps from the hibernation attachment after a DO wake.
   * Also rebuilds `gatewaysByRuntime` for gateway sockets so routing works immediately.
   */
  private restoreSocketMeta(socket: WebSocket): SocketMeta | null {
    const existing = this.socketMeta.get(socket);
    if (existing) return existing;

    const attachableSocket = socket as WebSocket & {
      deserializeAttachment?: () => SocketAttachment | undefined;
    };

    try {
      const attachment = attachableSocket.deserializeAttachment?.();
      if (!attachment?.role || !attachment?.token) return null;

      const meta: SocketMeta = {
        role: attachment.role,
        token: this.normalizeToken(attachment.token),
        userId: attachment.userId,
        runtimeId: attachment.runtimeId,
      };
      this.socketMeta.set(socket, meta);

      if (meta.role === 'app') {
        this.appSocketsByToken.set(meta.token, socket);
      } else if (meta.role === 'gateway' && meta.runtimeId) {
        // Restore into multi-runtime map
        if (!this.gatewaysByRuntime.has(meta.token)) {
          this.gatewaysByRuntime.set(meta.token, new Map());
        }
        this.gatewaysByRuntime.get(meta.token)!.set(meta.runtimeId, socket);
      } else if (meta.role === 'agent' && attachment.agentId) {
        this.agents.set(attachment.agentId, socket);
      }

      return meta;
    } catch (error) {
      console.warn('[ProxyHub] Failed to restore socket metadata:', error);
      return null;
    }
  }

  private getSocketMeta(socket: WebSocket): SocketMeta | null {
    return this.socketMeta.get(socket) ?? this.restoreSocketMeta(socket);
  }

  // ─── Cleanup ───────────────────────────────────────────────────────────────

  private removeSocket(socket: WebSocket): void {
    const meta = this.getSocketMeta(socket);

    for (const [agentId, ws] of this.agents.entries()) {
      if (ws === socket) { this.agents.delete(agentId); break; }
    }
    for (const [token, ws] of this.appSocketsByToken.entries()) {
      if (ws === socket) { this.appSocketsByToken.delete(token); break; }
    }

    // Remove from per-runtime gateway map and notify portal
    if (meta?.role === 'gateway' && meta.runtimeId) {
      const runtimeMap = this.gatewaysByRuntime.get(meta.token);
      if (runtimeMap) {
        runtimeMap.delete(meta.runtimeId);
        if (runtimeMap.size === 0) this.gatewaysByRuntime.delete(meta.token);
      }
      const metaMap = this.runtimeMeta.get(meta.token);
      if (metaMap) {
        metaMap.delete(meta.runtimeId);
        if (metaMap.size === 0) this.runtimeMeta.delete(meta.token);
      }

      this.broadcastToAppSockets(meta.token, {
        type: 'runtime_disconnected',
        runtimeId: meta.runtimeId,
        timestamp: Date.now(),
      });
    }

    this.broadcastConnectionUpdate();
  }

  // ─── Utilities ─────────────────────────────────────────────────────────────

  private sendJson(socket: WebSocket, payload: unknown): void {
    try {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(payload));
      }
    } catch (error) {
      console.error('[ProxyHub] Failed to send message', error);
    }
  }

  private getConnectionSummary(): { agents: number; apps: number } {
    return {
      agents: this.agents.size,
      apps: this.appSocketsByToken.size,
    };
  }

  private getRuntimeList(token: string): RuntimeInfo[] {
    const metaMap = this.runtimeMeta.get(token);
    if (!metaMap) return [];
    return Array.from(metaMap.values());
  }

  private normalizeToken(token?: string): string {
    return token?.trim() || DEFAULT_TOKEN;
  }

  private broadcastConnectionUpdate(): void {
    const update = {
      type: 'connection_update',
      timestamp: Date.now(),
      actor: 'system',
      connectedAgents: Array.from(this.agents.keys()),
      connectedApps: Array.from(this.appSocketsByToken.keys()),
      monitoringClients: this.monitoringSockets.size,
    };
    this.monitoringSockets.forEach((socket) => this.sendJson(socket, update));
  }

  private logMessage(
    direction: 'incoming' | 'outgoing' | 'system',
    actor: 'agent' | 'app' | 'system',
    agentId: string | undefined,
    payload: unknown,
    raw: unknown
  ): void {
    const logEntry = {
      type: 'message_log',
      timestamp: Date.now(),
      direction,
      actor,
      agentId,
      payload,
      raw,
    };
    this.monitoringSockets.forEach((socket) => this.sendJson(socket, logEntry));
  }
}
