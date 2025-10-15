import { ServerConfig, DEFAULT_SERVER_CONFIG } from './types';


import path from "path"; 
import os from "os";
 

 export function CodeboltApplicationPath(): string {
    // For testing purposes, return the specified test path
    // return '/Users/ravirawat/Documents/codeboltai/codeboltjs/agents/remote-agent';
    
    const platform = os.platform();
    
    switch (platform) {
      case 'darwin': // macOS
        return path.join(os.homedir(), 'Library', 'Application Support', 'codebolt', '.codebolt');
      case 'win32': // Windows
        return path.join(os.homedir(), 'AppData', 'Local', 'codebolt', '.codebolt');
      case 'linux':
        return path.join(os.homedir(), '.local', 'share', 'codebolt', '.codebolt');
      default:
        // Fallback to a generic path
        return path.join(os.homedir(), '.codebolt');
    }
    
  }

// Store the custom port if set
let customPort: number | null = null;

/**
 * Server configuration with environment variable overrides
 */
export function getServerConfig(): ServerConfig {
  const config = {
    ...DEFAULT_SERVER_CONFIG,
    port: customPort ?? (process.env.PORT ? parseInt(process.env.PORT) : DEFAULT_SERVER_CONFIG.port),
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

  return config;
}

/**
 * Sets a custom port for the server configuration
 * @param port - The port number to set
 * @returns ServerConfig with the specified port
 */
export function setServerPort(port: number): ServerConfig {
  customPort = port;
  return getServerConfig();
}