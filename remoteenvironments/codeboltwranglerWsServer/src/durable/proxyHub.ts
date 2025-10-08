import {
  ForwardMessage,
  GatewayForwardFromAgent,
  GatewayForwardFromApp,
  GatewayOutgoingMessage,
  GatewayRegisterMessage,
  ProxyIncomingMessage,
  RegisterMessage,
  RegisteredMessage
} from '../types';

const DEFAULT_TOKEN = 'default';

export class ProxyHub {
  private readonly agents = new Map<string, WebSocket>();
  private readonly appSocketsByToken = new Map<string, WebSocket>();
  private readonly gatewaySocketsByToken = new Map<string, WebSocket>();

  private readonly pendingAgentMessages = new Map<string, unknown[]>();
  private readonly pendingAppMessagesByToken = new Map<string, unknown[]>();
  private readonly pendingGatewayMessagesByToken = new Map<string, GatewayOutgoingMessage[]>();

  constructor(private readonly state: DurableObjectState) {}

  async fetch(request: Request): Promise<Response> {
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket upgrade', { status: 426 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();

    server.addEventListener('message', (event) => {
      try {
        const raw = event.data?.toString();
        if (!raw) {
          return;
        }

        const message = JSON.parse(raw) as ProxyIncomingMessage;
        this.handleMessage(server, message);
      } catch (error) {
        console.error('[ProxyHub] Failed to process message', error);
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

  private handleMessage(socket: WebSocket, message: ProxyIncomingMessage): void {
    switch (message.type) {
      case 'register':
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
      case 'request_connections':
        this.sendJson(socket, {
          type: 'connections_snapshot',
          summary: this.getConnectionSummary(),
          timestamp: Date.now()
        });
        break;
      default:
        console.warn('[ProxyHub] Unknown message type received:', (message as { type?: string }).type);
    }
  }

  private handleClientRegistration(socket: WebSocket, message: RegisterMessage): void {
    const ack = this.registerSocket(socket, message);
    this.sendJson(socket, ack);
    this.flushQueuesAfterRegister(message);
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
    this.sendJson(socket, {
      type: 'registered',
      actor: 'gateway',
      serverId: message.serverId,
      appToken: token
    });
    this.flushGatewayQueue(token);
  }

  private handleForward(message: ForwardMessage, includeGateway: boolean): void {
    const token = this.normalizeToken(message.appToken);
    if (message.target === 'app') {
      this.deliverToApps({
        token,
        payload: message.payload,
        agentId: message.agentId
      }, includeGateway);
      return;
    }

    this.deliverToAgents({
      token,
      payload: message.payload,
      agentId: message.agentId
    }, includeGateway);
  }

  private handleForwardFromGatewayAgent(message: GatewayForwardFromAgent): void {
    const token = this.normalizeToken(message.appToken);
    this.deliverToApps({ token, payload: message.payload }, false);
  }

  private handleForwardFromGatewayApp(message: GatewayForwardFromApp): void {
    const token = this.normalizeToken(message.appToken);
    this.deliverToAgents({ token, payload: message.payload, agentId: message.agentId }, false);
  }

  private registerSocket(socket: WebSocket, message: RegisterMessage): RegisteredMessage {
    if (message.actor === 'agent' && message.agentId) {
      this.agents.set(message.agentId, socket);
      return { type: 'registered', actor: 'agent', agentId: message.agentId, appToken: this.normalizeToken(message.appToken) };
    }

    const token = this.normalizeToken(message.appToken);
    this.appSocketsByToken.set(token, socket);
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
      } else {
        const queue = this.pendingAgentMessages.get(params.agentId) ?? [];
        queue.push(params.payload);
        this.pendingAgentMessages.set(params.agentId, queue);
      }
    } else {
      const recipients = Array.from(this.agents.values());
      if (recipients.length) {
        recipients.forEach((socket) => this.sendJson(socket, params.payload));
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
    for (const [agentId, ws] of this.agents.entries()) {
      if (ws === socket) {
        this.agents.delete(agentId);
      }
    }

    for (const [token, ws] of this.appSocketsByToken.entries()) {
      if (ws === socket) {
        this.appSocketsByToken.delete(token);
      }
    }

    for (const [token, ws] of this.gatewaySocketsByToken.entries()) {
      if (ws === socket) {
        this.gatewaySocketsByToken.delete(token);
      }
    }
  }

  private normalizeToken(token?: string): string {
    return token?.trim() || DEFAULT_TOKEN;
  }
}
