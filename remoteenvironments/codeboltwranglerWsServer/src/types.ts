export type ActorType = 'agent' | 'app';

export interface RegisterMessage {
  type: 'registered';
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
  userId?: string;
  timestamp?: number | string;
  runtimeId?: string;
  runtimeType?: 'local' | 'e2b' | 'docker' | 'custom';
  projectPath?: string;
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

export interface RequestSyncMessage {
  type: 'requestSync';
}

export interface RequestThreadMessagesMessage {
  type: 'requestThreadMessages';
  threadId: string;
}

export interface ForwardToRuntimeMessage {
  type: 'forward_to_runtime';
  appToken?: string;
  runtimeId: string;
  payload: unknown;
}

export interface TaskEventMessage {
  type: 'taskEvent';
  runtimeId: string;
  appToken?: string;
  data: {
    action: 'created' | 'updated' | 'deleted';
    task: Record<string, unknown>;
  };
  timestamp: string;
}

export type ProxyIncomingMessage =
  | RegisterMessage
  | ForwardMessage
  | GatewayRegisterMessage
  | GatewayForwardFromAgent
  | GatewayForwardFromApp
  | PingMessage
  | { type: 'pong'; timestamp?: number }
  | RequestConnectionsMessage
  | RequestSyncMessage
  | RequestThreadMessagesMessage
  | ForwardToRuntimeMessage
  | TaskEventMessage;

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
  runtimes: RuntimeInfo[];
  timestamp: number;
}

export interface RuntimeInfo {
  runtimeId: string;
  runtimeType: 'local' | 'e2b' | 'docker' | 'custom';
  projectPath?: string;
  connectedAt: number;
}

export interface RuntimeConnectedMessage {
  type: 'runtime_connected';
  runtimeId: string;
  runtimeType: 'local' | 'e2b' | 'docker' | 'custom';
  projectPath?: string;
  timestamp: number;
}

export interface RuntimeDisconnectedMessage {
  type: 'runtime_disconnected';
  runtimeId: string;
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
  | RegisteredMessage
  | RuntimeConnectedMessage
  | RuntimeDisconnectedMessage;

export interface Env {
  PROXY_HUB: DurableObjectNamespace;
  CHAT_STORE: KVNamespace;
}
