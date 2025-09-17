import express from 'express';
import { createServer } from 'http';
import { ServerConfig, formatLogMessage } from '@codebolt/shared-types';
import { HttpHandler } from './../handlers/httpHandler';
import { WebSocketServer } from './websocketServer';
import { ProcessManager } from './../utils/processManager';
import { ConnectionManager } from './connectionManager';

/**
 * Main Docker Server class
 */
export class DockerServer {
  private app: express.Application;
  private server: ReturnType<typeof createServer>;
  private websocketServer!: WebSocketServer;
  private httpHandler!: HttpHandler;
  private processManager: ProcessManager;
  private config: ServerConfig;

  constructor(config: ServerConfig) {
    this.config = config;
    this.app = express();
    this.server = createServer(this.app);
    this.processManager = new ProcessManager();
    
    this.setupHandlers();
  }

  /**
   * Setup HTTP and WebSocket handlers
   */
  private setupHandlers(): void {
    this.httpHandler = new HttpHandler(this.app);
    this.websocketServer = new WebSocketServer(this.server);
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.config.port, this.config.host, () => {
        console.log(formatLogMessage('info', 'DockerServer', `Docker Server is running on port ${this.config.port}`));
        console.log(formatLogMessage('info', 'DockerServer', `WebSocket server is ready for connections`));
        console.log(formatLogMessage('info', 'DockerServer', `Health check available at http://${this.config.host}:${this.config.port}/health`));
        console.log(formatLogMessage('info', 'DockerServer', `Connection info available at http://${this.config.host}:${this.config.port}/connections`));
        
        // We Will do this later when preparring for production
        // // Start the sample client after a delay if enabled
        // if (this.config.enableSampleClient) {
        //   setTimeout(() => {
        //     this.startSampleClient();
        //   }, this.config.sampleClientDelay);
        // }
        
        resolve();
      });
    });
  }

  /**
   * Start the sample client
   */
  // private async startSampleClient(): Promise<void> {
  //   try {
  //     await this.processManager.startSampleClient();
  //   } catch (error) {
  //     console.error(formatLogMessage('error', 'DockerServer', `Failed to start sample client: ${error}`));
  //   }
  // }

  /**
   * Stop the server
   */
  public async stop(): Promise<void> {
    console.log(formatLogMessage('info', 'DockerServer', 'Stopping Docker Server...'));
    
    // Stop managed processes
    await this.processManager.stopAll();
    
    // Close WebSocket connections
    this.websocketServer.close();
    
    // Close HTTP server
    this.server.close();
    
    console.log(formatLogMessage('info', 'DockerServer', 'Docker Server stopped'));
  }

  /**
   * Get server statistics
   */
  public getStats(): {
    clients: number;
    agents: number;
    totalConnections: number;
    websocketConnections: number;
  } {
    const connectionManager = ConnectionManager.getInstance();
    const connectionCounts = connectionManager.getConnectionCounts();
    
    return {
      clients: connectionCounts.apps,
      agents: connectionCounts.agents,
      totalConnections: connectionCounts.apps + connectionCounts.agents,
      websocketConnections: connectionCounts.apps + connectionCounts.agents
    };
  }

  /**
   * Get server configuration
   */
  public getConfig(): ServerConfig {
    return { ...this.config };
  }

  /**
   * Broadcast message to all clients
   */
  public broadcast(message: unknown): void {
    this.websocketServer.broadcast(message);
  }
}