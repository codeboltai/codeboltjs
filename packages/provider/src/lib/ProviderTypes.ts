import type WebSocket from "ws";
import type { ChildProcess } from "child_process";
import {RawMessageForAgent,AgentStartMessage} from '@codebolt/types/provider'

export type ProviderTransportType = "websocket" | "custom";

export interface ProviderInitVars {
  environmentName: string;
  [key: string]: unknown;
}


export interface ProviderStartResult {
  success: boolean;
  environmentName: string;
  agentServerUrl: string;
  workspacePath: string;
  worktreePath?: string;
  transport: ProviderTransportType;
  [key: string]: unknown;
}

export interface ProviderState {
  initialized: boolean;
  environmentName: string | null;
  projectPath: string | null;
  workspacePath: string | null;
}

export interface AgentServerConnection {
  wsConnection: WebSocket | null;
  process: ChildProcess | null;
  isConnected: boolean;
  serverUrl: string;
  metadata: Record<string, unknown>;
}

export interface BaseProviderConfig {
  agentServerPort: number;
  agentServerHost: string;
  reconnectAttempts: number;
  reconnectDelay: number;
  wsRegistrationTimeout: number;
  transport: ProviderTransportType;
  agentServerPath?: string;
  agentServerArgs?: string[];
  timeouts?: {
    agentServerStartup?: number;
    connection?: number;
    cleanup?: number;
  };
  [key: string]: unknown;
}

export interface ProviderLifecycleHandlers {
  onProviderStart(initVars: ProviderInitVars): Promise<ProviderStartResult>;
  onProviderAgentStart(message: AgentStartMessage): Promise<void>;
  onCloseSignal(): Promise<void>;
  onRawMessage(message: RawMessageForAgent): Promise<void>;
}

export interface ProviderTransport {
  ensureTransportConnection(initVars: ProviderInitVars): Promise<void>;
  sendToAgentServer(message:  AgentStartMessage  | RawMessageForAgent): Promise<boolean>;
}

export interface ProviderEventHandlers {
  onProviderStart: (vars: ProviderInitVars) => Promise<ProviderStartResult>;
  onProviderAgentStart: (message: AgentStartMessage) => Promise<void>;
  onCloseSignal: () => Promise<void>;
  onRawMessage: (message: RawMessageForAgent) => Promise<void>;
}

