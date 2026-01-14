import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  ConnectionsResponse,
  HealthCheckResponse,
  formatLogMessage
} from './../types';
import { ConnectionManager } from '../main/core/connectionManagers/connectionManager';
import { logger } from '../main/utils/logger';
import { McpRoutes } from '../routes/mcpRoutes';
import { TodoRoutes } from '../routes/todoRoutes';
import { ModelRoutes } from '../routes/modelRoutes';
import { AgentRoutes } from '../routes/agentRoutes';
import { ProviderRoutes } from '../routes/llmProviderRoutes';
import { ConversationRoutes } from '../routes/conversationRoutes';
import { EnvironmentRoutes } from '../routes/EnvironmentRoutes';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Handles HTTP endpoints for the server
 */
export class HttpHandler {
  private startTime: Date;
  private connectionManager: ConnectionManager;
  private mcpRoutes: McpRoutes;
  private todoRoutes: TodoRoutes;
  private modelRoutes: ModelRoutes;
  private agentRoutes: AgentRoutes;
  private providerRoutes: ProviderRoutes;
  private conversationRoutes: ConversationRoutes;
  private environmentRoutes: EnvironmentRoutes;

  constructor(private app: express.Application) {
    this.startTime = new Date();
    this.connectionManager = ConnectionManager.getInstance();
    this.mcpRoutes = new McpRoutes();
    this.todoRoutes = new TodoRoutes();
    this.modelRoutes = new ModelRoutes();
    this.agentRoutes = new AgentRoutes();
    this.providerRoutes = new ProviderRoutes();
    this.conversationRoutes = new ConversationRoutes();
    this.environmentRoutes = new EnvironmentRoutes();
    this.setupRoutes();
  }

  /**
   * Setup Express routes
   */
  private setupRoutes(): void {
    this.app.use(express.json());

    // Mount MCP routes
    this.app.use('/mcp', this.mcpRoutes.router);

    // Mount Todo routes
    this.app.use('/todos', this.todoRoutes.router);

    // Mount Model routes
    this.app.use('/models', this.modelRoutes.router);

    // Mount Agent routes
    this.app.use('/agents', this.agentRoutes.router);

    // Mount Conversation routes
    this.app.use('/conversations', this.conversationRoutes.router);

    // Mount Provider routes
    this.app.use('/providers', this.providerRoutes.router);

    // Mount Environment routes
    this.app.use('/environments', this.environmentRoutes.router);

    // Health check endpoint
    this.app.get('/health', this.handleHealthCheck.bind(this));

    // Get connected clients info
    this.app.get('/connections', this.handleConnections.bind(this));

    // Server info endpoint
    this.app.get('/info', this.handleServerInfo.bind(this));

    // Bundle download endpoint
    this.app.get('/download/sampleagent', this.handleBundleDownload.bind(this));

    // Basic root endpoint
    this.app.get('/', this.handleRoot.bind(this));
  }

  /**
   * Handle health check requests
   */
  private handleHealthCheck(req: Request, res: Response): void {
    const uptime = Date.now() - this.startTime.getTime();
    const connectionCounts = this.connectionManager.getConnectionCounts();

    const response: HealthCheckResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      connections: {
        apps: connectionCounts.apps,
        agents: connectionCounts.agents,
        totalConnections: connectionCounts.apps + connectionCounts.agents,
        uptime: uptime
      },
      version: process.env.npm_package_version || '1.0.0'
    };

    res.json(response);
    logger.info(formatLogMessage('info', 'HttpHandler', `Health check requested from ${req.ip}`));
  }

  /**
   * Handle connections info requests
   */
  private handleConnections(req: Request, res: Response): void {
    const appManager = this.connectionManager.getAppConnectionManager();
    const agentManager = this.connectionManager.getAgentConnectionManager();
    const apps = appManager.getAllApps();
    const agents = agentManager.getAllAgents();

    const appList = apps.map((app) => ({
      id: app.id,
      type: app.type,
      connectedAt: app.connectedAt
    }));

    const agentList = agents.map((agent) => ({
      id: agent.id,
      type: agent.type,
      connectedAt: agent.connectedAt
    }));

    const response: ConnectionsResponse = {
      apps: appList,
      agents: agentList,
      total: appList.length + agentList.length
    };

    res.json(response);
    logger.info(formatLogMessage('info', 'HttpHandler', `Connections info requested from ${req.ip}`));
  }

  /**
   * Handle server info requests
   */
  private handleServerInfo(req: Request, res: Response): void {
    const uptime = Date.now() - this.startTime.getTime();
    const connectionCounts = this.connectionManager.getConnectionCounts();

    res.json({
      name: 'Codebolt Agent Server',
      version: process.env.npm_package_version || '1.0.0',
      startTime: this.startTime.toISOString(),
      uptime: uptime,
      nodeVersion: process.version,
      platform: process.platform,
      environment: process.env.NODE_ENV || 'development',
      connections: {
        apps: connectionCounts.apps,
        agents: connectionCounts.agents,
        total: connectionCounts.apps + connectionCounts.agents
      }
    });
  }

  /**
   * Handle bundle download requests
   */
  private handleBundleDownload(req: Request, res: Response): void {
    const bundleFile = path.join(__dirname, '../../../sampleagent/dist/bundle/sampleclient.js');

    res.download(bundleFile, 'sampleagent.js', (err) => {
      if (err) {
        logger.error(formatLogMessage('error', 'HttpHandler', `Error downloading bundle: ${err}`));
        res.status(404).json({ error: 'Bundle not found. Make sure sampleagent is built.' });
      } else {
        logger.info(formatLogMessage('info', 'HttpHandler', `Bundle downloaded by ${req.ip}`));
      }
    });
  }

  /**
   * Handle root requests
   */
  private handleRoot(req: Request, res: Response): void {
    res.json({
      message: 'Codebolt Docker Server is running',
      endpoints: {
        health: '/health',
        connections: '/connections',
        info: '/info',
        models: '/models',
        agents: '/agents',
        providers: '/providers',
        conversations: '/conversations',
        bundle: '/bundle/',
        download: '/download/sampleagent',
        mcp: '/mcp/',
        todos: '/todos/'
      },
      websocket: 'ws://localhost:3001',
      documentation: 'See README.md for API documentation'
    });
  }
}