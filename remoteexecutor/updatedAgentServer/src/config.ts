import { ServerConfig, DEFAULT_SERVER_CONFIG } from '@codebolt/shared-types';

/**
 * Server configuration with environment variable overrides
 */
export function getServerConfig(): ServerConfig {
  return {
    ...DEFAULT_SERVER_CONFIG,
    port: process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_SERVER_CONFIG.port,
    host: process.env.HOST || DEFAULT_SERVER_CONFIG.host,
    enableSampleClient: process.env.ENABLE_SAMPLE_CLIENT !== 'false',
    sampleClientDelay: process.env.SAMPLE_CLIENT_DELAY ? 
      parseInt(process.env.SAMPLE_CLIENT_DELAY) : 
      DEFAULT_SERVER_CONFIG.sampleClientDelay,
    maxReconnectAttempts: process.env.MAX_RECONNECT_ATTEMPTS ? 
      parseInt(process.env.MAX_RECONNECT_ATTEMPTS) : 
      DEFAULT_SERVER_CONFIG.maxReconnectAttempts,
    reconnectDelay: process.env.RECONNECT_DELAY ? 
      parseInt(process.env.RECONNECT_DELAY) : 
      DEFAULT_SERVER_CONFIG.reconnectDelay,
  };
}