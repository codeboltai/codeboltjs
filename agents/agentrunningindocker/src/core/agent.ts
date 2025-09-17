import { v4 as uuidv4 } from 'uuid';
import { ClientConfig, formatLogMessage } from '@codebolt/shared-types';
import { AgentWebSocketClient } from './websocketClient';

/**
 * Main Sample Codebolt Client class
 */
export class SampleCodeboltAgent {
  private clientId: string;
  private wsClient: AgentWebSocketClient;

  constructor(private config: ClientConfig) {
    // Use provided agent ID from environment or generate a new one
    this.clientId = process.env.AGENT_ID || uuidv4();
    this.wsClient = new AgentWebSocketClient(config, this.clientId);
  }

  /**
   * Start the client
   */
  async start(): Promise<void> {
    console.log(formatLogMessage('info', 'Client', `Starting Sample Codebolt Client (ID: ${this.clientId})...`));
    await this.wsClient.connect();
    console.log(formatLogMessage('info', 'Client', 'Sample Codebolt Client started successfully'));
  }

  /**
   * Stop the client
   */
  async stop(): Promise<void> {
    console.log(formatLogMessage('info', 'Client', 'Stopping Sample Codebolt Client...'));
    
    this.wsClient.disconnect();
    
    console.log(formatLogMessage('info', 'Client', 'Sample Codebolt Client stopped'));
  }

  /**
   * Get client status
   */
  getStatus(): {
    id: string;
    connected: boolean;
    demoRunning: boolean;
    config: ClientConfig;
  } {
    const demoManager = this.wsClient.getDemoManager();
    
    return {
      id: this.clientId,
      connected: this.wsClient.getConnectionStatus(),
      demoRunning: demoManager.isRunning(),
      config: this.config
    };
  }

  /**
   * Get client ID
   */
  getId(): string {
    return this.clientId;
  }

  /**
   * Get demo statistics
   */
  getDemoStats() {
    return this.wsClient.getDemoManager().getStats();
  }
}