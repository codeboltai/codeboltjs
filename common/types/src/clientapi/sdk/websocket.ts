/** WebSocket connection options */
export interface WsConnectionOptions {
  /** Auto-reconnect on disconnect */
  reconnect: boolean;
  /** Base interval between reconnection attempts in ms */
  reconnectInterval: number;
  /** Maximum reconnection attempts */
  maxReconnectAttempts: number;
}

/** WebSocket connection state */
export enum WsConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTING = 'disconnecting',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  FAILED = 'failed'
}

/** Generic WebSocket message envelope */
export interface WsMessage<T = unknown> {
  type: string;
  action?: string;
  data?: T;
  messageId?: string;
  threadId?: string;
  timestamp?: string;
}

/** WebSocket action message (client -> server) */
export interface WsActionMessage<T = unknown> {
  action: string;
  [key: string]: T | string | undefined;
}

/** WebSocket event message (server -> client) */
export interface WsEventMessage<T = unknown> {
  type: string;
  data?: T;
  error?: string;
  action?: string;
}
