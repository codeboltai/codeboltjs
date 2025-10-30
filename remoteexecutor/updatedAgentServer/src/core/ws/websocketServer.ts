import WebSocket, { WebSocketServer as WSServer } from 'ws';
import { Server } from 'http';
import { v4 as uuidv4 } from 'uuid';
import {
  formatLogMessage,
  isMessageWithType,
  createErrorResponse,
  ProjectInfo
} from '../../types';

import { ConnectionManager } from '../connectionManagers/connectionManager';
import { NotificationService } from '../../services/NotificationService';
import { AppMessageRouter } from '../../handlers/appMessaging/routerforMessagesReceivedFromApp';
import { AgentMessageRouter } from '../../handlers/agentMessaging/routerforMessageReceivedFromAgent';
import { TuiMessageRouter } from '../../handlers/tuiMessaging/routerforMessageReceivedFromTui';

// Import types and constants
import {
  ConnectionParams,
  RegistrationResult,
  ConnectionRegistrationResult,
  RegistrationType,
  HealthStatus,
} from '../../types';
import { WEBSOCKET_CONSTANTS } from '../../constants';
import { logger } from '../../utils/logger';
import { threadId } from 'worker_threads';

/**
 * WebSocket server management
 */
export class WebSocketServer {
  private wss: WSServer;
  private connectionManager: ConnectionManager;
  private notificationService: NotificationService;
  private appMessageRouter: AppMessageRouter;
  private agentMessageRouter: AgentMessageRouter;
  private tuiMessageRouter: TuiMessageRouter;

  constructor(server: Server) {
    this.wss = new WSServer({ server });
    this.connectionManager = ConnectionManager.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.appMessageRouter = new AppMessageRouter();
    this.agentMessageRouter = new AgentMessageRouter();
    this.tuiMessageRouter = new TuiMessageRouter();
    this.setupWebSocket();
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupWebSocket(): void {
    this.wss.on(WEBSOCKET_CONSTANTS.EVENTS.CONNECTION, (ws: WebSocket, request) => {
      const initialClientId = uuidv4();
      let actualClientId = initialClientId;

      logger.info(formatLogMessage('info', 'WebSocketServer', `New WebSocket connection: ${initialClientId}`));

      const connectionParams = this.parseConnectionParams(request);
      const registrationResult = this.handleConnectionRegistration(ws, connectionParams, initialClientId);

      // All connections are now registered during connection establishment
      actualClientId = registrationResult.clientId;

      ws.on(WEBSOCKET_CONSTANTS.EVENTS.MESSAGE, (data: WebSocket.Data) => {
        const result = this.processIncomingMessage(ws, data, actualClientId);
        if (result?.newClientId) {
          actualClientId = result.newClientId;
        }
      });

      ws.on(WEBSOCKET_CONSTANTS.EVENTS.CLOSE, () => {
        this.handleConnectionClose(actualClientId);
      });

      ws.on(WEBSOCKET_CONSTANTS.EVENTS.ERROR, (error: Error) => {
        this.handleConnectionError(actualClientId, error);
      });
    });
  }

  /**
   * Process incoming WebSocket message
   */
  private processIncomingMessage(
    ws: WebSocket,
    data: WebSocket.Data,
    clientId: string
  ): RegistrationResult {
    try {
      const message: unknown = JSON.parse(data.toString());

      if (!isMessageWithType(message)) {
        this.sendError(ws, WEBSOCKET_CONSTANTS.MESSAGES.MISSING_TYPE_FIELD);
        return;
      }

      // All registration happens on connection, so just handle the message normally

      const connection = this.connectionManager.getConnection(clientId);
      logger.logWebSocketMessage('incoming', connection?.type || 'unknown', message);

      if (!connection) {
        this.sendError(ws, WEBSOCKET_CONSTANTS.MESSAGES.CONNECTION_NOT_REGISTERED);
        return;
      }

      try {
        switch (connection.type) {
          case WEBSOCKET_CONSTANTS.CLIENT_TYPES.AGENT:
            this.agentMessageRouter.handleAgentRequestMessage(connection, message as any);
            break;
          case WEBSOCKET_CONSTANTS.CLIENT_TYPES.APP:
            this.appMessageRouter.handleAppResponse(connection, message as any);
            break;
          case WEBSOCKET_CONSTANTS.CLIENT_TYPES.TUI:
            this.tuiMessageRouter.handleTuiMessage(connection, message as any);
            break;
          default:
            logger.warn(`Unknown connection type: ${connection.type} for ${connection.id}`);
        }
      } catch (error) {
        logger.logError(error as Error, `Error routing message for ${connection.id}`);
      }
    } catch (error) {
      logger.logError(error as Error, 'Error parsing message');
      this.sendError(ws, WEBSOCKET_CONSTANTS.MESSAGES.INVALID_MESSAGE_FORMAT);
    }
  }

  /**
   * Handle connection close event
   */
  private handleConnectionClose(clientId: string): void {
    const connection = this.connectionManager.getConnection(clientId);
    if (connection) {
      this.notificationService.broadcast({
        type: WEBSOCKET_CONSTANTS.MESSAGE_TYPES.NOTIFICATION,
        action: `${connection.type}-disconnected`,
        data: { clientId, connectionType: connection.type },
        timestamp: Date.now()
      });
    }
    this.connectionManager.removeConnection(clientId);
    logger.logConnection('client', 'disconnected', { clientId });
  }

  /**
   * Handle connection error event
   */
  private handleConnectionError(clientId: string, error: Error): void {
    logger.logError(error, `WebSocket error for client ${clientId}`);
    this.connectionManager.removeConnection(clientId);
  }

  /**
   * Parse connection parameters from WebSocket request
   */
  private parseConnectionParams(request: any): ConnectionParams {
    const url = new URL(request.url || '', `http://${request.headers.host}`);
    const queryParams = url.searchParams;

    return {
      agentId: queryParams.get('agentId') || undefined,
      parentId: queryParams.get('parentId') || undefined,
      clientType: queryParams.get('clientType') || undefined,
      appId: queryParams.get('appId') || undefined,
      currentProject: queryParams.get('currentProject') || undefined,
      projectName: queryParams.get('projectName') || undefined,
      threadId:queryParams.get('threadId') || undefined,
      projectType: queryParams.get('projectType') || undefined,
      connectionId: queryParams.get('connectionId') || undefined
    };
  }

  /**
   * Create ProjectInfo from connection parameters
   */
  private createProjectInfo(params: ConnectionParams): ProjectInfo | undefined {
    if (!params.currentProject) {
      return undefined;
    }

    return {
      path: params.currentProject,
      name: params.projectName,
      type: params.projectType,
      metadata: {}
    };
  }

  /**
   * Handle registration during connection establishment
   * ALL connections are registered - no connection is left unregistered
   */
  private handleConnectionRegistration(
    ws: WebSocket,
    params: ConnectionParams,
    fallbackClientId: string
  ): ConnectionRegistrationResult {
    const instanceId = fallbackClientId;

    // Priority 1: Auto-register agent if agentId and parentId are provided
    if (params.agentId && params.parentId) {
      // Get project info from parent app connection instead of params
      const parentConnection = this.connectionManager.getConnection(params.parentId);
      const projectInfo = parentConnection?.currentProject;
      
      let message = {
        type: 'agentStarted',
        agentId: params.agentId,
        parentId: params.parentId,
        instanceId,
        projectInfo
      };
      
      // Create a temporary connection object for the router
      const tempConnection: any = {
        id: params.agentId,
        ws: ws,
        type: WEBSOCKET_CONSTANTS.CLIENT_TYPES.AGENT,
        parentId: params.parentId,
        agentInstanceId: instanceId,
        connectionId: params.connectionId,
        connectedAt: new Date()
      };
      
      this.agentMessageRouter.handleAgentRequestMessage(tempConnection, message as any);

      this.registerAgent(ws, params.agentId, params.parentId, 'auto', instanceId, params.connectionId, params.threadId, projectInfo);
      return { clientId: params.agentId };
    }

    // Priority 2: Auto-register app if clientType is 'app'
    if (params.clientType === WEBSOCKET_CONSTANTS.CLIENT_TYPES.APP) {
      const connectionId = params.appId || fallbackClientId;
      this.registerApp(ws, connectionId, 'auto', undefined, instanceId, this.createProjectInfo(params));
      return { clientId: connectionId };
    }

    // Priority 3: Auto-register TUI if clientType is 'tui'
    if (params.clientType === WEBSOCKET_CONSTANTS.CLIENT_TYPES.TUI) {
      const connectionId = params.tuiId || fallbackClientId;
      this.registerTui(ws, connectionId, 'auto', undefined, instanceId, this.createProjectInfo(params));
      return { clientId: connectionId };
    }

    // Default: Register as app if no specific parameters provided
    this.registerApp(ws, fallbackClientId, 'auto', undefined, instanceId, this.createProjectInfo(params));
    return { clientId: fallbackClientId };
  }

  /**
   * Register an agent connection
   */
  private registerAgent(
    ws: WebSocket,
    agentId: string,
    parentId?: string,
    registrationType: RegistrationType = 'auto',
    agentInstanceId?: string,
    connectionId?: string,
    threadId?:string,
    projectInfo?: ProjectInfo
  ): void {
    logger.info(formatLogMessage('info', 'WebSocketServer',
      `${registrationType === 'auto' ? 'Auto' : 'Manual'}-registering agent: ${agentId}${parentId ? ` with parent: ${parentId}` : ''} : ''}${agentInstanceId ? ` with agentInstanceId: ${agentInstanceId}` : ''}`));

    this.connectionManager.registerConnection(
      agentId,
      ws,
      WEBSOCKET_CONSTANTS.CLIENT_TYPES.AGENT,
      threadId,
      parentId,
      agentInstanceId,
      connectionId,
      projectInfo
    );

    this.sendRegistrationConfirmation(
      ws,
      agentId,
      WEBSOCKET_CONSTANTS.CLIENT_TYPES.AGENT,
      threadId,
      parentId,
      registrationType,
      { agentInstanceId }
    );
  }

  /**
   * Register an app connection
   */
  private registerApp(
    ws: WebSocket,
    appId: string,
    registrationType: RegistrationType = 'auto',
    threadId?:string,
    appInstanceId?: string,
    projectInfo?: ProjectInfo
  ): void {
    logger.info(formatLogMessage('info', 'WebSocketServer',
      `${registrationType === 'auto' ? 'Auto' : 'Manual'}-registering app: ${appId} : ''}${appInstanceId ? ` with appInstanceId: ${appInstanceId}` : ''}`));

    this.connectionManager.registerConnection(appId, ws, WEBSOCKET_CONSTANTS.CLIENT_TYPES.APP, undefined, undefined, appInstanceId, undefined, projectInfo);
    this.sendRegistrationConfirmation(ws, appId, WEBSOCKET_CONSTANTS.CLIENT_TYPES.APP, threadId, undefined, registrationType, { appInstanceId });
  }

  /**
   * Register a TUI connection
   */
  private registerTui(
    ws: WebSocket,
    tuiId: string,
    registrationType: RegistrationType = 'auto',
    threadId?:string,
    tuiInstanceId?: string,
    projectInfo?: ProjectInfo
  ): void {
    logger.info(formatLogMessage('info', 'WebSocketServer',
      `${registrationType === 'auto' ? 'Auto' : 'Manual'}-registering TUI: ${tuiId} : ''}${tuiInstanceId ? ` with tuiInstanceId: ${tuiInstanceId}` : ''}`));

    this.connectionManager.registerConnection(tuiId, ws, WEBSOCKET_CONSTANTS.CLIENT_TYPES.TUI, undefined, undefined, tuiInstanceId, undefined, projectInfo);
    this.sendRegistrationConfirmation(ws, tuiId, WEBSOCKET_CONSTANTS.CLIENT_TYPES.TUI, threadId, undefined, registrationType, { tuiInstanceId });
  }

  /**
   * Send registration confirmation message
   */
  private sendRegistrationConfirmation(
    ws: WebSocket,
    connectionId: string,
    connectionType: string,
    threadId?:string,
    parentId?: string,
    registrationType: RegistrationType = 'auto',
    // projectInfo?: ProjectInfo,
    instanceIds?: { agentInstanceId?: string; appInstanceId?: string; tuiInstanceId?: string }
  ): void {
    const message = {
      type: WEBSOCKET_CONSTANTS.MESSAGE_TYPES.REGISTERED,
      connectionId,
      connectionType,
      threadId,
      message: registrationType === 'auto' ?
        WEBSOCKET_CONSTANTS.MESSAGES.AUTO_REGISTRATION_SUCCESS :
        WEBSOCKET_CONSTANTS.MESSAGES.REGISTRATION_SUCCESS,
      registrationType,
      ...(parentId && { parentId }),
      // ...(projectInfo && { currentProject: projectInfo }),
      ...(instanceIds?.agentInstanceId && { agentInstanceId: instanceIds.agentInstanceId }),
      ...(instanceIds?.appInstanceId && { appInstanceId: instanceIds.appInstanceId }),
      ...(instanceIds?.tuiInstanceId && { tuiInstanceId: instanceIds.tuiInstanceId })
    };

    this.sendMessage(ws, message);
  }

  /**
   * Safely send message to WebSocket
   */
  private sendMessage(ws: WebSocket, message: any): void {
    try {
      ws.send(JSON.stringify(message));
    } catch (error) {
      logger.error(formatLogMessage('error', 'WebSocketServer',
        `Error sending message: ${error}`));
    }
  }

  

  /**
   * Send error message to WebSocket
   */
  private sendError(ws: WebSocket, errorMessage: string, messageId?: string): void {
    const error = createErrorResponse(messageId || uuidv4(), errorMessage);
    this.sendMessage(ws, error);
  }

  /**
   * Gracefully close the WebSocket server
   */
  public close(): void {
    try {
      this.wss.close(() => {
        logger.info(formatLogMessage('info', 'WebSocketServer', 'WebSocket server closed gracefully'));
      });
    } catch (error) {
      logger.error(formatLogMessage('error', 'WebSocketServer', `Error closing WebSocket server: ${error}`));
    }
  }

  /**
   * Get current connection count
   */
  public getConnectionCount(): number {
    return this.wss.clients.size;
  }

  /**
   * Get server health status
   */
  public getHealthStatus(): HealthStatus {
    return {
      status: this.wss.clients.size >= 0 ? 'healthy' : 'unhealthy',
      connections: this.wss.clients.size,
      uptime: process.uptime()
    };
  }

  /**
   * Broadcast message to all connected clients
   */
  public broadcast(message: unknown): void {
    if (this.wss.clients.size === 0) {
      logger.warn(formatLogMessage('warn', 'WebSocketServer', 'No clients connected for broadcast'));
      return;
    }

    const messageStr = JSON.stringify(message);
    let successCount = 0;
    let errorCount = 0;

    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr);
          successCount++;
        } catch (error) {
          errorCount++;
          logger.error(formatLogMessage('error', 'WebSocketServer',
            `Error broadcasting message to client: ${error}`));
        }
      }
    });

    logger.info(formatLogMessage('info', 'WebSocketServer',
      `Broadcast completed: ${successCount} successful, ${errorCount} failed`));
  }
}