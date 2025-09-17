import { ClientConfig, DEFAULT_CLIENT_CONFIG } from '@codebolt/shared-types';

/**
 * Client configuration with environment variable overrides
 */
export function getClientConfig(): ClientConfig {
  return {
    ...DEFAULT_CLIENT_CONFIG,
    serverUrl: process.env.SERVER_URL || DEFAULT_CLIENT_CONFIG.serverUrl,
    maxReconnectAttempts: process.env.MAX_RECONNECT_ATTEMPTS ? 
      parseInt(process.env.MAX_RECONNECT_ATTEMPTS) : 
      DEFAULT_CLIENT_CONFIG.maxReconnectAttempts,
    reconnectDelay: process.env.RECONNECT_DELAY ? 
      parseInt(process.env.RECONNECT_DELAY) : 
      DEFAULT_CLIENT_CONFIG.reconnectDelay,
    demoEnabled: process.env.DEMO_ENABLED !== 'false',
    demoInterval: process.env.DEMO_INTERVAL ? 
      parseInt(process.env.DEMO_INTERVAL) : 
      DEFAULT_CLIENT_CONFIG.demoInterval,
    maxDemoOperations: process.env.MAX_DEMO_OPERATIONS ? 
      parseInt(process.env.MAX_DEMO_OPERATIONS) : 
      DEFAULT_CLIENT_CONFIG.maxDemoOperations,
  };
}