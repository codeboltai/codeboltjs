/**
 * Project information
 */
export interface ProjectInfo {
  path: string;
  name?: string;
  type?: string;
  metadata?: Record<string, any>;
}

/**
 * Connection information for an app or agent
 */
export interface ClientConnection {
  id: string;
  ws: any; // WebSocket type - avoiding direct ws import for better compatibility
  type: 'app' | 'agent' | 'client';
  connectedAt: Date;
  currentProject?: ProjectInfo;
  instanceId?:string
}

/**
 * Connection statistics
 */
export interface ConnectionStats {
  apps: number;
  agents: number;
  totalConnections: number;
  uptime: number;
}

/**
 * Health check response
 */
export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  connections: ConnectionStats;
  version?: string;
}

/**
 * Connection info for API response
 */
export interface ConnectionInfo {
  id: string;
  type: 'app' | 'agent' | 'client';
  connectedAt: Date;
  currentProject?: ProjectInfo;
}

/**
 * Connections API response
 */
export interface ConnectionsResponse {
  apps: ConnectionInfo[];
  agents: ConnectionInfo[];
  total: number;
}