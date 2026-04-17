import {
  ForwardMessage,
  GatewayForwardFromAgent,
  GatewayForwardFromApp,
  GatewayOutgoingMessage,
  GatewayRegisterMessage,
  ProxyIncomingMessage,
  RegisterMessage,
  RegisteredMessage,
  Env,
} from '../types';

const DEFAULT_TOKEN = 'default';

interface SocketMeta {
  role: 'gateway' | 'app' | 'agent';
  token: string;
  userId?: string;
}

interface SocketAttachment {
  role: SocketMeta['role'];
  token: string;
  userId?: string;
  agentId?: string;
}

export class ProxyHub {
  private readonly agents = new Map<string, WebSocket>();
  private readonly appSocketsByToken = new Map<string, WebSocket>();
  private readonly gatewaySocketsByToken = new Map<string, WebSocket>();
  private readonly monitoringSockets = new Set<WebSocket>();

  private readonly pendingAgentMessages = new Map<string, unknown[]>();
  private readonly pendingAppMessagesByToken = new Map<string, unknown[]>();
  private readonly pendingGatewayMessagesByToken = new Map<string, GatewayOutgoingMessage[]>();

  private readonly socketMeta = new WeakMap<WebSocket, SocketMeta>();

  // Buffered KV writes — accumulate messages in memory, flush every 2s
  private readonly messageBuffer = new Map<string, any[]>(); // key → messages to append
  private readonly threadUpdates = new Map<string, { appToken: string; threadId: string }>(); // key → thread info
  private flushScheduled = false;

  constructor(readonly state: DurableObjectState, private readonly env: Env) {
    // Enable auto-response for WebSocket pings so the DO auto-replies
    // to ping messages even while hibernating.
    this.state.setWebSocketAutoResponse(
      new WebSocketRequestResponsePair('{"type":"ping"}', '{"type":"pong"}')
    );
  }

  /**
   * Restore monitoring sockets from hibernation tags.
   * Role-based sockets (gateway/app/agent) are re-registered via their
   * first message after wake-up (register_gateway / registered).
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

  /**
   * Alarm handler — flushes buffered messages to KV.
   */
  async alarm(): Promise<void> {
    this.flushScheduled = false;
    await this.flushBufferToKV();
  }

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];

    const isMonitoringClient = request.headers.get('X-Monitoring-Client') === 'true';

    // Use Hibernation API so the DO can sleep without dropping WebSockets.
    // Tag the socket so webSocketMessage/webSocketClose can identify it.
    const tags: string[] = [];
    if (isMonitoringClient) tags.push('monitoring');
    this.state.acceptWebSocket(server, tags);

    if (isMonitoringClient) {
      this.monitoringSockets.add(server);
      this.sendJson(server, {
        type: 'connection_update',
        timestamp: Date.now(),
        actor: 'monitor',
        connected: true
      });
      this.broadcastConnectionUpdate();
    }

    return new Response(null, { status: 101, webSocket: client });
  }

  /**
   * Hibernation API: called when a hibernatable WebSocket receives a message.
   */
  async webSocketMessage(ws: WebSocket, data: string | ArrayBuffer): Promise<void> {
    // Restore in-memory state if waking from hibernation
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

  /**
   * Hibernation API: called when a hibernatable WebSocket is closed.
   */
  async webSocketClose(ws: WebSocket, _code: number, _reason: string, _wasClean: boolean): Promise<void> {
    this.restoreSocketsFromHibernation();
    const tags = this.state.getTags(ws);
    if (tags.includes('monitoring')) {
      this.monitoringSockets.delete(ws);
      this.broadcastConnectionUpdate();
    }
    this.removeSocket(ws);
  }

  /**
   * Hibernation API: called when a hibernatable WebSocket encounters an error.
   */
  async webSocketError(ws: WebSocket, _error: unknown): Promise<void> {
    this.restoreSocketsFromHibernation();
    const tags = this.state.getTags(ws);
    if (tags.includes('monitoring')) {
      this.monitoringSockets.delete(ws);
      this.broadcastConnectionUpdate();
    }
    this.removeSocket(ws);
  }

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
      case 'ping':
        this.sendJson(socket, { type: 'pong', timestamp: Date.now() });
        break;
      case 'pong':
        // Heartbeat acknowledgement. No routing needed.
        break;
      case 'request_connections':
        this.sendJson(socket, {
          type: 'connections_snapshot',
          summary: this.getConnectionSummary(),
          timestamp: Date.now()
        });
        break;
      case 'requestSync':
        await this.handleRequestSync(socket);
        break;
      case 'requestThreadMessages':
        await this.handleRequestThreadMessages(socket, message);
        break;
      default:
        // Raw forwarding: forward unknown message types between gateway and app sockets
        await this.handleRawForward(socket, message as any);
    }
  }

  private handleClientRegistration(socket: WebSocket, message: RegisterMessage): void {
    const ack = this.registerSocket(socket, message);
    this.sendJson(socket, ack);
    this.flushQueuesAfterRegister(message);
    this.broadcastConnectionUpdate();
    this.logMessage(message.actor === 'agent' ? 'incoming' : 'incoming', message.actor, message.agentId, message, message);
  }

  private handleGatewayRegistration(socket: WebSocket, message: GatewayRegisterMessage): void {
    const token = this.normalizeToken(message.appToken);
    const existing = this.gatewaySocketsByToken.get(token);
    if (existing && existing !== socket) {
      try {
        existing.close();
      } catch (error) {
        console.error('[ProxyHub] Failed to close previous gateway', error);
      }
    }

    this.gatewaySocketsByToken.set(token, socket);
    this.persistSocketMeta(socket, { role: 'gateway', token, userId: message.userId });

    this.sendJson(socket, {
      type: 'registered',
      actor: 'gateway',
      serverId: message.serverId,
      appToken: token
    });
    this.flushGatewayQueue(token);
    this.broadcastConnectionUpdate();
    this.logMessage('incoming', 'system', undefined, message, message);
  }

  private handleForward(message: ForwardMessage, includeGateway: boolean): void {
    const token = this.normalizeToken(message.appToken);
    if (message.target === 'app') {
      this.deliverToApps({
        token,
        payload: message.payload,
        agentId: message.agentId
      }, includeGateway);
      this.logMessage('outgoing', 'agent', message.agentId, message.payload, message);
      return;
    }

    this.deliverToAgents({
      token,
      payload: message.payload,
      agentId: message.agentId
    }, includeGateway);
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

  /**
   * Handle raw forwarding for unknown message types.
   * If sender is gateway -> forward to all app sockets for that token
   * If sender is app -> forward to gateway socket for that token
   */
  private async handleRawForward(socket: WebSocket, message: any): Promise<void> {
    const meta = this.getSocketMeta(socket);
    if (!meta) {
      console.warn('[ProxyHub] Unknown message type from unregistered socket:', message?.type);
      return;
    }

    if (meta.role === 'gateway') {
      // Gateway -> forward to all app sockets for this token
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
      // App -> forward to gateway socket for this token
      const gatewaySocket = this.gatewaySocketsByToken.get(meta.token);
      if (gatewaySocket) {
        this.sendJson(gatewaySocket, message);
      }
      this.logMessage('outgoing', 'agent', undefined, message, message);
    }
  }

  /**
   * Buffer a chat message for batch KV write.
   */
  private bufferChatMessage(appToken: string, messageData: any): void {
    const threadId = messageData.threadId;
    const key = `messages:${appToken}:${threadId}`;

    const buf = this.messageBuffer.get(key) || [];
    buf.push(messageData);
    this.messageBuffer.set(key, buf);
    this.threadUpdates.set(`${appToken}:${threadId}`, { appToken, threadId });

    // Schedule flush if not already scheduled
    if (!this.flushScheduled) {
      this.flushScheduled = true;
      this.state.storage.setAlarm(Date.now() + 2000); // flush in 2s
    }
  }

  /**
   * Flush all buffered messages to KV in a single batch.
   */
  private async flushBufferToKV(): Promise<void> {
    if (!this.env.CHAT_STORE || this.messageBuffer.size === 0) return;

    try {
      // Flush message buffers
      for (const [key, newMessages] of this.messageBuffer) {
        const existingRaw = await this.env.CHAT_STORE.get(key);
        const existing: any[] = existingRaw ? JSON.parse(existingRaw) : [];
        existing.push(...newMessages);
        // Cap at 1000 messages per thread
        while (existing.length > 1000) existing.shift();
        await this.env.CHAT_STORE.put(key, JSON.stringify(existing));
      }
      this.messageBuffer.clear();

      // Flush thread list updates
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

  /**
   * Handle sync request -- return list of threads from KV.
   */
  private async handleRequestSync(socket: WebSocket): Promise<void> {
    const meta = this.getSocketMeta(socket);
    if (!meta) return;

    // Flush any buffered messages before responding
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

  /**
   * Handle request for thread messages -- return messages from KV.
   */
  private async handleRequestThreadMessages(socket: WebSocket, message: any): Promise<void> {
    const meta = this.getSocketMeta(socket);
    if (!meta) return;

    const threadId = message.threadId;
    if (!threadId) return;

    // Flush any buffered messages before responding
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

  private registerSocket(socket: WebSocket, message: RegisterMessage): RegisteredMessage {
    if (message.actor === 'agent' && message.agentId) {
      this.agents.set(message.agentId, socket);
      const token = this.normalizeToken(message.appToken);
      this.persistSocketMeta(socket, { role: 'agent', token, agentId: message.agentId });
      return { type: 'registered', actor: 'agent', agentId: message.agentId, appToken: token };
    }

    const token = this.normalizeToken(message.appToken);
    this.appSocketsByToken.set(token, socket);
    this.persistSocketMeta(socket, { role: 'app', token, userId: message.appId });
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
        payload: params.payload
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
        payload: params.payload
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
    const gatewaySocket = this.gatewaySocketsByToken.get(token);
    if (gatewaySocket && gatewaySocket.readyState === WebSocket.OPEN) {
      this.sendJson(gatewaySocket, message);
      return;
    }

    const queue = this.pendingGatewayMessagesByToken.get(token) ?? [];
    queue.push(message);
    this.pendingGatewayMessagesByToken.set(token, queue);
  }

  private flushGatewayQueue(token: string): void {
    const gatewaySocket = this.gatewaySocketsByToken.get(token);
    if (!gatewaySocket || gatewaySocket.readyState !== WebSocket.OPEN) {
      return;
    }

    const queue = this.pendingGatewayMessagesByToken.get(token);
    if (!queue?.length) {
      return;
    }

    while (queue.length) {
      const message = queue.shift();
      if (message) {
        this.sendJson(gatewaySocket, message);
      }
    }

    this.pendingGatewayMessagesByToken.delete(token);
  }

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
      apps: this.appSocketsByToken.size
    };
  }

  private removeSocket(socket: WebSocket): void {
    let disconnectedActor: { actor: string; id?: string } | null = null;

    for (const [agentId, ws] of this.agents.entries()) {
      if (ws === socket) {
        this.agents.delete(agentId);
        disconnectedActor = { actor: 'agent', id: agentId };
        break;
      }
    }

    for (const [token, ws] of this.appSocketsByToken.entries()) {
      if (ws === socket) {
        this.appSocketsByToken.delete(token);
        disconnectedActor = { actor: 'app', id: token };
        break;
      }
    }

    for (const [token, ws] of this.gatewaySocketsByToken.entries()) {
      if (ws === socket) {
        this.gatewaySocketsByToken.delete(token);
        disconnectedActor = { actor: 'gateway', id: token };
        break;
      }
    }

    if (disconnectedActor) {
      this.broadcastConnectionUpdate();
      this.logMessage('system', 'system', undefined,
        { type: 'disconnection', actor: disconnectedActor.actor, id: disconnectedActor.id },
        disconnectedActor
      );
    }
  }

  private persistSocketMeta(socket: WebSocket, meta: SocketAttachment): void {
    this.socketMeta.set(socket, { role: meta.role, token: meta.token, userId: meta.userId });
    const attachableSocket = socket as WebSocket & {
      serializeAttachment?: (value: SocketAttachment) => void;
    };

    try {
      attachableSocket.serializeAttachment?.(meta);
    } catch (error) {
      console.warn('[ProxyHub] Failed to persist socket metadata:', error);
    }
  }

  private restoreSocketMeta(socket: WebSocket): SocketMeta | null {
    const existing = this.socketMeta.get(socket);
    if (existing) return existing;

    const attachableSocket = socket as WebSocket & {
      deserializeAttachment?: () => SocketAttachment | undefined;
    };

    try {
      const attachment = attachableSocket.deserializeAttachment?.();
      if (!attachment?.role || !attachment?.token) {
        return null;
      }

      const meta: SocketMeta = {
        role: attachment.role,
        token: this.normalizeToken(attachment.token),
        userId: attachment.userId,
      };
      this.socketMeta.set(socket, meta);

      if (meta.role === 'app') {
        this.appSocketsByToken.set(meta.token, socket);
      } else if (meta.role === 'gateway') {
        this.gatewaySocketsByToken.set(meta.token, socket);
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
    return this.socketMeta.get(socket) || this.restoreSocketMeta(socket);
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
      monitoringClients: this.monitoringSockets.size
    };

    this.monitoringSockets.forEach(socket => {
      this.sendJson(socket, update);
    });
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
      raw
    };

    this.monitoringSockets.forEach(socket => {
      this.sendJson(socket, logEntry);
    });
  }
}
