/**
 * WebSocket Server Types
 * Contains all type definitions related to WebSocket connections and messages
 */

export type ConnectionParams = {
  agentId?: string;
  parentId?: string;
  clientType?: string;
  appId?: string;
  tuiId?: string;
  currentProject?: string;
  projectName?: string;
  projectType?: string;
};

export type RegistrationResult = {
  newClientId?: string;
} | void;

export type ConnectionRegistrationResult = {
  clientId: string;
};

export type RegistrationType = 'auto' | 'manual';

export type ClientType = 'agent' | 'app' | 'tui';

export type ConnectionType = ClientType;

export type HealthStatus = {
  status: 'healthy' | 'unhealthy';
  connections: number;
  uptime: number;
};

export type RegistrationMessage = {
  type: 'registered';
  connectionId: string;
  connectionType: string;
  message: string;
  registrationType: RegistrationType;
  parentId?: string;
};

export type BroadcastStats = {
  successCount: number;
  errorCount: number;
  totalClients: number;
};
