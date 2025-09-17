import WebSocket from 'ws';
import { ClientConfig, formatLogMessage, sleep } from '@codebolt/shared-types';
import { AgentMessageHandler } from '../handlers/messageHandler';
import { DemoManager } from '../demo/demoManager';

/**
 * WebSocket client for connecting to Docker Server
 */
export class AgentWebSocketClient {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private messageHandler: AgentMessageHandler;
  private demoManager: DemoManager;
  private isConnected = false;

  constructor(private config: ClientConfig, private clientId: string) {
    this.messageHandler = new AgentMessageHandler();
    this.demoManager = new DemoManager(config, clientId, this.sendMessage.bind(this));
  }

  /**
   * Connect to the Docker Server
   */
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(formatLogMessage('info', 'WebSocketClient', 'Connecting to Docker Server as agent...'));
      
      // Build connection URL with query parameters if parentId is available
      let connectionUrl = this.config.serverUrl;
      const parentId = process.env.parentId;
      
      if (parentId) {
        const url = new URL(connectionUrl);
        url.searchParams.set('agentId', this.clientId);
        url.searchParams.set('parentId', parentId);
        url.searchParams.set('clientType', 'agent');
        connectionUrl = url.toString();
        console.log(formatLogMessage('info', 'WebSocketClient', `Connecting with query params: agentId=${this.clientId}, parentId=${parentId}`));
      }
      
      this.ws = new WebSocket(connectionUrl);

      this.ws.on('open', () => {
        console.log(formatLogMessage('info', 'WebSocketClient', 'Connected to Docker Server'));
        this.isConnected = true;
        
        // Only send manual registration if not using connection parameters
        const parentId = process.env.parentId;
        if (!parentId) {
          // Register as an agent with specific ID (fallback method)
          const registrationMessage: any = {
            type: 'register',
            clientType: 'agent',
            agentId: this.clientId
          };

          console.log(formatLogMessage('info', 'WebSocketClient', 'Sending manual registration message'));
          this.sendMessage(registrationMessage);
        } else {
          console.log(formatLogMessage('info', 'WebSocketClient', 'Skipping manual registration - using connection parameters'));
        }
        
        this.reconnectAttempts = 0;
        
        // Start demo operations after connecting
        if (this.config.demoEnabled) {
          this.demoManager.start();
        }
        
        resolve();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          const message = JSON.parse(data.toString());
          this.messageHandler.handleMessage(message);
        } catch (error) {
          console.error(formatLogMessage('error', 'WebSocketClient', `Error parsing message: ${error}`));
        }
      });

      this.ws.on('close', () => {
        console.log(formatLogMessage('warn', 'WebSocketClient', 'Disconnected from Docker Server'));
        this.isConnected = false;
        this.ws = null;
        this.demoManager.stop();
        this.attemptReconnect();
      });

      this.ws.on('error', (error) => {
        console.error(formatLogMessage('error', 'WebSocketClient', `WebSocket error: ${error}`));
        if (this.reconnectAttempts === 0) {
          reject(error);
        }
      });
    });
  }

  /**
   * Send message to server
   */
  private sendMessage(message: unknown): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      console.log(formatLogMessage('info', 'WebSocketClient', `Sent message: ${JSON.stringify(message)}`));
    } else {
      console.error(formatLogMessage('error', 'WebSocketClient', 'Cannot send message: WebSocket not connected'));
    }
  }

  /**
   * Attempt to reconnect to server
   */
  private async attemptReconnect(): Promise<void> {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error(formatLogMessage('error', 'WebSocketClient', 'Max reconnection attempts reached. Giving up.'));
      return;
    }

    this.reconnectAttempts++;
    console.log(formatLogMessage('info', 'WebSocketClient', `Attempting to reconnect (${this.reconnectAttempts}/${this.config.maxReconnectAttempts})...`));
    
    await sleep(this.config.reconnectDelay);
    
    try {
      await this.connect();
    } catch (error) {
      console.error(formatLogMessage('error', 'WebSocketClient', `Reconnection failed: ${error}`));
      this.attemptReconnect();
    }
  }

  /**
   * Disconnect from server
   */
  disconnect(): void {
    this.demoManager.stop();
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
      this.isConnected = false;
    }
  }

  /**
   * Check if connected
   */
  getConnectionStatus(): boolean {
    return this.isConnected;
  }

  /**
   * Get demo manager for external control
   */
  getDemoManager(): DemoManager {
    return this.demoManager;
  }
}