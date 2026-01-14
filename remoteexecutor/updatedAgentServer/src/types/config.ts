/**
 * Configuration interfaces
 */

export interface ServerConfig {
  port: number;
  host?: string;
  enableSampleClient?: boolean;
  sampleClientDelay?: number;
  maxReconnectAttempts?: number;
  reconnectDelay?: number;
  healthCheckInterval?: number;
}

export interface AgentConfig {
  serverUrl: string;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  startupTimeout: number;
  aiResponseDelay?: number;
}

export interface ClientConfig {
  serverUrl: string;
  maxReconnectAttempts: number;
  reconnectDelay: number;
  demoEnabled?: boolean;
  demoInterval?: number;
  maxDemoOperations?: number;
}

/**
 * Default configurations
 */
export const DEFAULT_SERVER_CONFIG: ServerConfig = {
  port: 3001,
  host: 'localhost',
  enableSampleClient: true,
  sampleClientDelay: 2000,
  maxReconnectAttempts: 10,
  reconnectDelay: 2000,
  healthCheckInterval: 30000,
};

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  serverUrl: 'ws://localhost:3001',
  maxReconnectAttempts: 10,
  reconnectDelay: 2000,
  startupTimeout: 30000,
  aiResponseDelay: 1000,
};

export const DEFAULT_CLIENT_CONFIG: ClientConfig = {
  serverUrl: 'ws://localhost:3001',
  maxReconnectAttempts: 10,
  reconnectDelay: 2000,
  demoEnabled: true,
  demoInterval: 5000,
  maxDemoOperations: 10,
};

/**
 * Docker Provider specific configuration
 */
export interface DockerProviderConfig {
  serverUrl: string;
  socketPort: string;
  agentId: string;
  agentTask?: string;
  isDev: boolean;
  maxReconnectAttempts: number;
  providerId: string,
  storedTaskId: string;
  reconnectDelay: number;
  connectionTimeout: number;
  environmentId: string
}

/**
 * Proxy type configuration for individual event types
 */
export interface EventProxyConfig {
  proxyType: 'local' | 'proxy';
  primaryProxy?: 'cloud' | 'custom';
}

/**
 * Proxy configuration profile for all event types
 */
export interface ProxyConfig {
  fsEvent: EventProxyConfig;
  inference: EventProxyConfig;
  [key: string]: EventProxyConfig;
}