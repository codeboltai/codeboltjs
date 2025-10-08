export type ActorType = 'agent' | 'app';

export interface RegisterMessage {
  type: 'register';
  actor: ActorType;
  agentId?: string;
  appId?: string;
  appToken?: string;
}

export interface ForwardMessage {
  type: 'forward';
  actor: ActorType;
  agentId?: string;
  appId?: string;
  appToken?: string;
  target: ActorType;
  payload: unknown;
}

export interface GatewayRegisterMessage {
  type: 'register_gateway';
  serverId?: string;
  appToken?: string;
  timestamp?: number;
}

export interface GatewayForwardFromAgent {
  type: 'forward_from_agent';
  agentId?: string;
  appToken?: string;
  payload: unknown;
}

export interface GatewayForwardFromApp {
  type: 'forward_from_app';
  agentId?: string;
  appId?: string;
  appToken?: string;
  payload: unknown;
}

export interface PingMessage {
  type: 'ping';
  timestamp?: number;
}

export interface RequestConnectionsMessage {
  type: 'request_connections';
}

export type ProxyIncomingMessage =
  | RegisterMessage
  | ForwardMessage
  | GatewayRegisterMessage
  | GatewayForwardFromAgent
  | GatewayForwardFromApp
  | PingMessage
  | RequestConnectionsMessage;

export interface RegisteredMessage {
  type: 'registered';
  actor: ActorType | 'gateway';
  agentId?: string;
  appId?: string;
  serverId?: string;
  appToken?: string;
}

export interface GatewayForwardToAgent {
  type: 'forward_to_agent';
  agentId?: string;
  appId?: string;
  appToken?: string;
  payload: unknown;
}

export interface GatewayForwardToApp {
  type: 'forward_to_app';
  agentId?: string;
  appId?: string;
  appToken?: string;
  payload: unknown;
}

export interface GatewayConnectionsSnapshot {
  type: 'connections_snapshot';
  summary: {
    agents: number;
    apps: number;
  };
  timestamp: number;
}

export interface PongMessage {
  type: 'pong';
  timestamp: number;
}

export type GatewayOutgoingMessage =
  | GatewayForwardToAgent
  | GatewayForwardToApp
  | GatewayConnectionsSnapshot
  | PongMessage
  | RegisteredMessage;

export interface Env {
  PROXY_HUB: DurableObjectNamespace;
}
