import WebSocket from 'ws';
import { formatLogMessage, Message } from '../../types';
import { ConnectionManager } from '../connectionManagers/connectionManager';
import { RemoteMessageRouter } from '../../handlers/remoteMessaging/routerforMessageReceivedFromRemote';
import { logger } from '../../utils/logger';

export interface RemoteProxyClientOptions {
  url: string;
  serverId?: string;
  appToken?: string;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
}

type RemoteProxyEnvelope =
  | { type: 'register_gateway'; serverId: string; appToken?: string; timestamp: number }
  | { type: 'pong'; timestamp: number }
  | { type: 'forward_from_agent'; agentId?: string; appToken?: string; payload: unknown }
  | { type: 'forward_from_app'; appId?: string; appToken?: string; payload: unknown }
  | { type: 'forward_from_tui'; appId?: string; appToken?: string; payload: unknown }
  | { type: 'connections_snapshot'; data: unknown };

type RemoteProxyIncomingMessage =
  | {
      type: 'ping';
      timestamp?: number;
    }
  | {
      type: 'forward_to_agent';
      agentId?: string;
      applicationId?: string;
      appToken?: string;
      payload: unknown;
    }
  | {
      type: 'forward_to_app';
      appId?: string;
      appToken?: string;
      payload: unknown;
    }
  | {
      type: 'broadcast_to_apps';
      payload: unknown;
    }
  | {
      type: 'request_connections';
    };

export class RemoteProxyClient {
  private static instance: RemoteProxyClient | undefined;

  private websocket?: WebSocket;
  private reconnectAttempts = 0;
  private manualClose = false;
  private readonly options: RemoteProxyClientOptions;
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly remoteRouter = new RemoteMessageRouter();

  private constructor(options: RemoteProxyClientOptions) {
    this.options = options;
  }

  static initialize(options: RemoteProxyClientOptions): RemoteProxyClient {
    if (!options.url) {
      throw new Error('Wrangler proxy URL is required');
    }

    if (!RemoteProxyClient.instance) {
      RemoteProxyClient.instance = new RemoteProxyClient(options);
    }

    return RemoteProxyClient.instance;
  }

  static getInstance(): RemoteProxyClient | undefined {
    return RemoteProxyClient.instance;
  }

  public startConnection(): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      return;
    }

    this.manualClose = false;
    this.connect();
  }

  public stop(): void {
    this.manualClose = true;
    if (this.websocket) {
      this.websocket.close();
    }
  }

  public forwardAgentMessage(agentId: string | undefined, payload: unknown): void {
    this.send({
      type: 'forward_from_agent',
      agentId,
      appToken: this.options.appToken,
      payload
    });
  }

  public forwardAppMessage(appId: string | undefined, payload: unknown): void {
    this.send({
      type: 'forward_from_app',
      appId,
      appToken: this.options.appToken,
      payload
    });
  }
  public forwardTUIMessage(appId: string | undefined, payload: unknown): void {
    this.send({
      type: 'forward_from_tui',
      appId,
      appToken: this.options.appToken,
      payload
    });
  }

  private connect(): void {
    try {
      // Ensure the URL uses the correct WebSocket scheme
      let url = this.options.url;
      if (url.startsWith('http://')) {
        url = url.replace('http://', 'ws://');
      } else if (url.startsWith('https://')) {
        url = url.replace('https://', 'wss://');
      }
      
      logger.info(formatLogMessage('info', 'WranglerProxyClient', `Connecting to remote proxy: ${url}`));

      this.websocket = new WebSocket(url);

      this.websocket.on('open', () => {
        this.reconnectAttempts = 0;
        this.onOpen();
      });

      this.websocket.on('message', (data) => {
        this.onMessage(data.toString());
      });

      this.websocket.on('close', () => {
        this.websocket?.removeAllListeners();
        this.websocket = undefined;
        this.onClose();
      });

      this.websocket.on('error', (error) => {
        logger.error(formatLogMessage('error', 'WranglerProxyClient', `WebSocket error: ${error}`));
      });
    } catch (error) {
      logger.error(formatLogMessage('error', 'WranglerProxyClient', `Failed to connect: ${error}`));
      this.scheduleReconnect();
    }
  }

  private onOpen(): void {
    logger.info(formatLogMessage('info', 'WranglerProxyClient', `Remote proxy connection established with appToken ${this.options.appToken}`));
    this.send({
      type: 'register_gateway',
      serverId: this.options.serverId || 'codebolt-agent-executor',
      appToken: this.options.appToken,
      timestamp: Date.now()
    });
  }

  private onMessage(data: string): void {
    try {
      const message = JSON.parse(data) as RemoteProxyIncomingMessage;
      this.handleIncomingMessage(message);
    } catch (error) {
      logger.error(formatLogMessage('error', 'WranglerProxyClient', `Failed to parse message: ${error}`));
    }
  }

  private handleIncomingMessage(message: RemoteProxyIncomingMessage): void {
    switch (message.type) {
      case 'ping':
        this.send({ type: 'pong', timestamp: Date.now() });
        break;
      case 'forward_to_agent': {
        this.routeInboundMessage('agent', message.payload, {
          agentId: message.agentId,
          clientId: message.applicationId
        });
        break;
      }
      case 'forward_to_app': {
        this.routeInboundMessage('app', message.payload, {
          clientId: message.appId
        });
        break;
      }
      case 'broadcast_to_apps': {
        this.routeInboundMessage('app', message.payload, {});
        break;
      }
      case 'request_connections': {
        const summary = this.connectionManager.getConnectionCounts();
        this.send({
          type: 'connections_snapshot',
          data: {
            ...summary,
            timestamp: Date.now()
          }
        });
        break;
      }
      default: {
        const unknownType = (message as { type?: string }).type ?? 'unknown';
        logger.warn(formatLogMessage('warn', 'WranglerProxyClient', `Unknown message type: ${unknownType}`));
      }
    }
  }

  private routeInboundMessage(
    target: 'agent' | 'app' | 'tui',
    payload: unknown,
    extra: { agentId?: string; clientId?: string; tuiId?: string }
  ): void {
    if (!payload || typeof payload !== 'object') {
      logger.warn(formatLogMessage('warn', 'WranglerProxyClient', 'Ignoring non-object payload from remote proxy'));
      return;
    }

    // Create a properly typed message object
    const message: any = {
      ...(payload as Record<string, unknown>),
      target,
      agentId: extra.agentId,
      clientId: extra.clientId,
      tuiId: extra.tuiId
    };

    this.remoteRouter.handleRemoteMessage(message);
  }

  private onClose(): void {
    logger.info(formatLogMessage('info', 'WranglerProxyClient', 'Remote proxy connection closed'));
    if (!this.manualClose) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    const maxAttempts = this.options.maxReconnectAttempts ?? 5;
    if (this.manualClose || this.reconnectAttempts >= maxAttempts) {
      if (!this.manualClose) {
        logger.warn(
          formatLogMessage('warn', 'WranglerProxyClient', 'Max reconnect attempts reached; giving up on remote proxy')
        );
      }
      return;
    }

    this.reconnectAttempts += 1;
    const delay = this.options.reconnectDelay ?? 2000;
    logger.info(
      formatLogMessage(
        'info',
        'WranglerProxyClient',
        `Reconnecting to remote proxy in ${delay}ms (attempt ${this.reconnectAttempts}/${maxAttempts})`
      )
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  private send(message: RemoteProxyEnvelope): void {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      try {
        this.websocket.send(JSON.stringify(message));
      } catch (error) {
        logger.error(formatLogMessage('error', 'WranglerProxyClient', `Failed to send message: ${error}`));
      }
    }
  }
}
