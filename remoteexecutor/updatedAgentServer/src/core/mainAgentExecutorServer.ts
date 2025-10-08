import express from 'express';
import { createServer } from 'http';
import { ServerConfig, formatLogMessage, AgentCliOptions } from '../types';
import { HttpHandler } from '../handlers/httpHandler';
import { WebSocketServer } from './websocketServer';
import { ChildAgentProcessManager } from '../utils/childAgentProcessManager';
import { ConnectionManager } from './connectionManagers/connectionManager';
import { SendMessageToAgent } from '../handlers/agentMessaging/sendMessageToAgent';

/**
 * Main Docker Server class
 */
export class AgentExecutorServer {
  private app: express.Application;
  private server: ReturnType<typeof createServer>;
  private websocketServer!: WebSocketServer;
  private httpHandler!: HttpHandler;
  private childAgentProcessManager: ChildAgentProcessManager;
  private sendMessageToAgent: SendMessageToAgent;
  private config: ServerConfig;
  private cliOptions?: AgentCliOptions;

  constructor(config: ServerConfig, cliOptions?: AgentCliOptions) {
    this.config = config;
    this.cliOptions = cliOptions;
    this.app = express();
    this.server = createServer(this.app);
    this.childAgentProcessManager = new ChildAgentProcessManager();
    this.sendMessageToAgent = new SendMessageToAgent();
    this.setupHandlers();
  }

  /**
   * Setup HTTP and WebSocket handlers
   */
  private setupHandlers(): void {
    this.httpHandler = new HttpHandler(this.app);
    this.websocketServer = new WebSocketServer(this.server);
    this.sendMessageToAgent = new SendMessageToAgent(this.websocketServer);
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.config.port, this.config.host, async () => {
        console.log(formatLogMessage('info', 'DockerServer', `Console Agent Server is running on port ${this.config.port}`));
        console.log(formatLogMessage('info', 'DockerServer', `WebSocket server is ready for connections`));
        console.log(formatLogMessage('info', 'DockerServer', `Health check available at http://${this.config.host}:${this.config.port}/health`));
        console.log(formatLogMessage('info', 'DockerServer', `Connection info available at http://${this.config.host}:${this.config.port}/connections`));
        
        // Start agent if agent type and detail are provided
        if (this.cliOptions?.agentType && this.cliOptions?.agentDetail) {
            const { agentType, agentDetail, prompt } = this.cliOptions!;
            
            console.log(formatLogMessage('info', 'DockerServer', `Starting agent: type=${agentType}, detail=${agentDetail}`));
            const success = await this.childAgentProcessManager.startAgentByType(
              agentType!,
              agentDetail!,
              'codebolt-server' // application ID
            );
            
            if (success) {
              console.log(formatLogMessage('info', 'DockerServer', 'Agent started successfully'));
              
              // Send initial prompt if provided
              if (prompt) {
                  this.sendMessageToAgent.sendInitialPrompt(prompt);
              }
            } else {
              console.error(formatLogMessage('error', 'DockerServer', 'Failed to start agent'));
            }
        }
        
        resolve();
      });
    });
  }


  /**
   * Stop the server
   */
  public async stop(): Promise<void> {
    console.log(formatLogMessage('info', 'DockerServer', 'Stopping Docker Server...'));
    
    // Stop managed processes
    await this.childAgentProcessManager.stopAll();
    
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