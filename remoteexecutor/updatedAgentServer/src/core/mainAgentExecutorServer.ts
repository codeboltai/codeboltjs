import express from 'express';
import { createServer } from 'http';
import { ServerConfig, formatLogMessage, AgentCliOptions } from '../types';
import { HttpHandler } from '../handlers/httpHandler';
import { WebSocketServer } from './ws/websocketServer';
import { ChildAgentProcessManager } from '../utils/childAgentManager/childAgentProcessManager';
import { ConnectionManager } from './connectionManagers/connectionManager';
import { SendMessageToAgent } from '../handlers/agentMessaging/sendMessageToAgent';
import { RemoteProxyClient } from './remote/remoteProxyClient';

import { UserMessage } from '@codebolt/types/sdk-types';
import e from 'express';
import { logger } from '../utils/logger';

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
    
    // Create HttpHandler without project path
    this.httpHandler = new HttpHandler(this.app);
    
    this.websocketServer = new WebSocketServer(this.server);
    this.sendMessageToAgent = new SendMessageToAgent(this.websocketServer);

    // if (this.cliOptions?.remote) {
      const remoteUrl = this.cliOptions?.remoteUrl || 'https://codebolt-wrangler-ws.arrowai.workers.dev';
      if (remoteUrl) {
        // Ensure the URL includes the correct path for the wrangler proxy
        let proxyUrl = remoteUrl;
        logger.info(`Remote proxy URL provided: ${remoteUrl}`);
        logger.info(`App token provided: ${this.cliOptions?.appToken}`);
        if(!this.cliOptions?.appToken){
          logger.warn('App token not provided. Defaulting to "default".');
          this.cliOptions = { ...this.cliOptions, appToken: 'default' };
        }
        if (this.cliOptions?.appToken) {
          // If appToken is provided, ensure the URL ends with /proxy/{appToken}
          try {
            const url = new URL(remoteUrl);
            if (!url.pathname.endsWith(`/proxy/${this.cliOptions.appToken}`)) {
              url.pathname = `/proxy/${this.cliOptions.appToken}`;
              proxyUrl = url.toString().replace('http://', 'ws://').replace('https://', 'wss://');
              // Remove trailing slash if present
              if (proxyUrl.endsWith('/')) {
                proxyUrl = proxyUrl.slice(0, -1);
              }
            }
          } catch (e) {
            // If URL parsing fails, construct the URL manually
            const baseUrl = remoteUrl.replace(/\/+$/, ''); // Remove trailing slashes
            proxyUrl = `${baseUrl}/proxy/${this.cliOptions.appToken}`;
            // Ensure it uses ws:// or wss:// scheme
            if (!proxyUrl.startsWith('ws://') && !proxyUrl.startsWith('wss://')) {
              proxyUrl = proxyUrl.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
              // Default to ws:// if no scheme
              if (!proxyUrl.startsWith('ws://') && !proxyUrl.startsWith('wss://')) {
                proxyUrl = `ws://${proxyUrl}`;
              }
            }
          }
        } else {
          // If no appToken is provided, at least ensure we're using the correct scheme
          if (!proxyUrl.startsWith('ws://') && !proxyUrl.startsWith('wss://')) {
            proxyUrl = proxyUrl.replace(/^http:\/\//, 'ws://').replace(/^https:\/\//, 'wss://');
            // Default to ws:// if no scheme
            if (!proxyUrl.startsWith('ws://') && !proxyUrl.startsWith('wss://')) {
              proxyUrl = `ws://${proxyUrl}`;
            }
          }
          // For backward compatibility, if no appToken, we still try to connect to /proxy path
          try {
            const url = new URL(proxyUrl);
            if (url.pathname === '/') {
              url.pathname = '/proxy/default';
              proxyUrl = url.toString();
            }
          } catch (e) {
            // If URL parsing fails, just append /proxy/default
            const baseUrl = proxyUrl.replace(/\/+$/, ''); // Remove trailing slashes
            proxyUrl = `${baseUrl}/proxy/default`;
          }
        }
        
        logger.info(`Constructed proxy URL: ${proxyUrl}`);
        
        this.remoteProxyClient = RemoteProxyClient.initialize({
          url: proxyUrl,
          serverId: `${this.config.host || 'localhost'}:${this.config.port}`,
          appToken: this.cliOptions.appToken,
          maxReconnectAttempts: this.config.maxReconnectAttempts,
          reconnectDelay: this.config.reconnectDelay
        });
      } else {
        logger.warn('Remote proxy enabled without a URL. Skipping remote proxy initialization.');
      }
    // }
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
        const liveMonitoringUrl = this.getLiveMonitoringUrl(this.cliOptions?.remoteUrl, this.cliOptions?.appToken);
        if (liveMonitoringUrl) {
          logger.info(`Remote live monitoring available at ${liveMonitoringUrl}`);
        }
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
          // logger.info(formatLogMessage('info', 'DockerServer', 'Agent started successfully'));

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

  private getLiveMonitoringUrl(remoteUrl?: string, appToken?: string): string | null {
    if (!remoteUrl || !appToken) {
      return null;
    }

    try {
      const parsedUrl = new URL(remoteUrl);
      let protocol = parsedUrl.protocol;

      if (protocol === 'ws:') {
        protocol = 'http:';
      } else if (protocol === 'wss:') {
        protocol = 'https:';
      }

      const origin = `${protocol}//${parsedUrl.host}`;
      return new URL(`/live/${appToken}`, origin).toString();
    } catch (error) {
      let normalized = remoteUrl.replace(/^ws:\/\//, 'http://').replace(/^wss:\/\//, 'https://');

      if (!/^https?:\/\//.test(normalized)) {
        normalized = `https://${normalized.replace(/^\/+/, '')}`;
      }

      const trimmed = normalized.replace(/\/+$/, '');
      return `${trimmed}/live/${appToken}`;
    }
  }
}