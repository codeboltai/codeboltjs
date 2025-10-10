import express from 'express';
import { createServer } from 'http';
import { ServerConfig, formatLogMessage, AgentCliOptions } from '../types';
import { HttpHandler } from '../handlers/httpHandler';
import { WebSocketServer } from './ws/websocketServer';
import { ChildAgentProcessManager } from '../utils/childAgentManager/childAgentProcessManager';
import { ConnectionManager } from './connectionManagers/connectionManager';
import { SendMessageToAgent } from '../handlers/agentMessaging/sendMessageToAgent';
import { RemoteProxyClient } from './remote/remoteProxyClient';
import { logger } from '../utils/logger';
import { UserMessage } from '@codebolt/types/sdk-types';
import e from 'express';

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
  private remoteProxyClient?: RemoteProxyClient;

  constructor(config: ServerConfig, cliOptions?: AgentCliOptions) {
    this.config = config;
    this.cliOptions = cliOptions;
    this.app = express();
    this.server = createServer(this.app);
    this.childAgentProcessManager = new ChildAgentProcessManager();
    this.httpHandler = new HttpHandler(this.app);
    this.websocketServer = new WebSocketServer(this.server);
    this.sendMessageToAgent = new SendMessageToAgent(this.websocketServer);

    if (this.cliOptions?.remote) {
      const remoteUrl = this.cliOptions.remoteUrl;
      if (remoteUrl) {
        this.remoteProxyClient = RemoteProxyClient.initialize({
          url: remoteUrl,
          serverId: `${this.config.host || 'localhost'}:${this.config.port}`,
          appToken: this.cliOptions.appToken,
          maxReconnectAttempts: this.config.maxReconnectAttempts,
          reconnectDelay: this.config.reconnectDelay
        });
      } else {
        logger.warn('Remote proxy enabled without a URL. Skipping remote proxy initialization.');
      }
    }
  }

  /**
   * Start the server
   */
  public async start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.config.port, this.config.host, async () => {
        logger.info(`Console Agent Server is running on port ${this.config.port}`);
        logger.info(`WebSocket server is ready for connections`);
        logger.info(`Health check available at http://${this.config.host}:${this.config.port}/health`);
        logger.info(`Connection info available at http://${this.config.host}:${this.config.port}/connections`);
        if (this.remoteProxyClient) {
          try {
            this.remoteProxyClient.startConnection();
          } catch (error) {
            logger.logError(error as Error, 'Failed to start remote proxy client');
          }
        }
        // Start agent if agent type and detail are provided
        if (this.cliOptions?.agentType && this.cliOptions?.agentDetail) {
          const { agentType, agentDetail, prompt } = this.cliOptions!;
          
          if (prompt) {
            let messageFromTui: UserMessage = {
              type: 'messageResponse',
              message: {
                
                userMessage: prompt ,

                selectedAgent: {
                  id:  Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                  name: "string", // Get agent name from path/codeboltagent.yaml file key title
                  agentType: agentType,
                  agentDetails: agentDetail
                },
                mentionedFiles: [],
                mentionedFullPaths: [],
                mentionedFolders: [],
                mentionedMCPs: [],
                uploadedImages: [],
                mentionedAgents: [],
                messageId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
                threadId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
              },
              sender: {
                senderType: "user",
                senderInfo: {
                  name: "user",
                }
              },
              templateType: '',
              data: {
                text: ''
              },
              messageId: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
              timestamp:  Date.now().toString(),
            }
            this.sendMessageToAgent.sendInitialMessage(messageFromTui);
          }


          // logger.info(`Starting agent: type=${agentType}, detail=${agentDetail}`);
          // const success = await this.childAgentProcessManager.startAgentByType(
          //   agentType!,
          //   agentDetail!,
          //   'codebolt-server' // application ID
          // );

          // if (success) {
          // console.log(formatLogMessage('info', 'DockerServer', 'Agent started successfully'));

          // Send initial prompt if provided

          // } else {
          //   logger.error('Failed to start agent');
          // }
        }
        else{
          logger.info('No agent type or detail provided. Skipping agent startup.');
        }



        resolve();
      });
    });
  }


  /**
   * Stop the server
   */
  public async stop(): Promise<void> {
    logger.info('Stopping Docker Server...');

    // Stop managed processes
    await this.childAgentProcessManager.stopAll();

    // Close WebSocket connections
    this.websocketServer.close();

    if (this.remoteProxyClient) {
      this.remoteProxyClient.stop();
    }

    // Close HTTP server
    this.server.close();

    logger.info('Docker Server stopped');
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