import WebSocket, { WebSocketServer as WSServer } from 'ws';
import { Server } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { 
  formatLogMessage, 
  isMessageWithType, 
  createErrorResponse, 
  Message,
  ProjectInfo 
} from './../types';

import { ConnectionManager } from './connectionManager';
import { NotificationService } from './../services/NotificationService';
import { AppMessageRouter } from '../handlers/appMessaging/routerforMessagesReceivedFromApp';
import { AgentMessageRouter } from '../handlers/agentMessaging/routerforMessageReceivedFromAgent';

// Import types and constants
import { 
  ConnectionParams,
  RegistrationResult,
  ConnectionRegistrationResult,
  RegistrationType,
  HealthStatus,
  RegistrationMessage
} from '../types';
import { WEBSOCKET_CONSTANTS } from '../constants';

/**
 * WebSocket server management
 */
export class WebSocketServer {
  private wss: WSServer;
  private connectionManager: ConnectionManager;
  private notificationService: NotificationService;
  private appMessageRouter: AppMessageRouter;
  private agentMessageRouter: AgentMessageRouter;

  constructor(server: Server) {
    this.wss = new WSServer({ server });
    this.connectionManager = ConnectionManager.getInstance();
    this.notificationService = NotificationService.getInstance();
    this.appMessageRouter = new AppMessageRouter();
    this.agentMessageRouter = new AgentMessageRouter();
    this.setupWebSocket();
  }

  /**
   * Setup WebSocket event handlers
   */
  private setupWebSocket(): void {
    this.wss.on(WEBSOCKET_CONSTANTS.EVENTS.CONNECTION, (ws: WebSocket, request) => {
      const initialClientId = uuidv4();
      let actualClientId = initialClientId;
      
      console.log(formatLogMessage('info', 'WebSocketServer', `New WebSocket connection: ${initialClientId}`));

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
      return this.handleMessage(clientId, ws, message);
    } catch (error) {
      console.error(formatLogMessage('error', 'WebSocketServer', `Error parsing message: ${error}`));
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
    console.log(formatLogMessage('info', 'WebSocketServer', `Connection closed: ${clientId}`));
  }

  /**
   * Handle connection error event
   */
  private handleConnectionError(clientId: string, error: Error): void {
    console.error(formatLogMessage('error', 'WebSocketServer', 
      `WebSocket error for client ${clientId}: ${error.message}`));
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
      projectType: queryParams.get('projectType') || undefined
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
    const projectInfo = this.createProjectInfo(params);
    const instanceId = fallbackClientId;

    // Priority 1: Auto-register agent if agentId and parentId are provided
    if (params.agentId && params.parentId) {
      this.registerAgent(ws, params.agentId, params.parentId, 'auto', projectInfo, instanceId);
      return { clientId: params.agentId };
    }
    
    // Priority 2: Auto-register app if clientType is 'app'
    if (params.clientType === WEBSOCKET_CONSTANTS.CLIENT_TYPES.APP) {
      const connectionId = params.appId || fallbackClientId;
      this.registerApp(ws, connectionId, 'auto', projectInfo, instanceId);
      return { clientId: connectionId };
    }
    
    // Default: Register as app if no specific parameters provided
    this.registerApp(ws, fallbackClientId, 'auto', projectInfo, instanceId);
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
    projectInfo?: ProjectInfo,
    agentInstanceId?: string
  ): void {
    console.log(formatLogMessage('info', 'WebSocketServer', 
      `${registrationType === 'auto' ? 'Auto' : 'Manual'}-registering agent: ${agentId}${parentId ? ` with parent: ${parentId}` : ''}${projectInfo ? ` and project: ${projectInfo.path}` : ''}${agentInstanceId ? ` with agentInstanceId: ${agentInstanceId}` : ''}`));
    
    this.connectionManager.registerConnection(
      agentId, 
      ws, 
      WEBSOCKET_CONSTANTS.CLIENT_TYPES.AGENT, 
      parentId,
      projectInfo,
      agentInstanceId
    );
    
    this.sendRegistrationConfirmation(
      ws, 
      agentId, 
      WEBSOCKET_CONSTANTS.CLIENT_TYPES.AGENT, 
      parentId, 
      registrationType,
      projectInfo,
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
    projectInfo?: ProjectInfo,
    appInstanceId?: string
  ): void {
    console.log(formatLogMessage('info', 'WebSocketServer', 
      `${registrationType === 'auto' ? 'Auto' : 'Manual'}-registering app: ${appId}${projectInfo ? ` with project: ${projectInfo.path}` : ''}${appInstanceId ? ` with appInstanceId: ${appInstanceId}` : ''}`));
    
    this.connectionManager.registerConnection(appId, ws, WEBSOCKET_CONSTANTS.CLIENT_TYPES.APP, undefined, projectInfo, appInstanceId);
    this.sendRegistrationConfirmation(ws, appId, WEBSOCKET_CONSTANTS.CLIENT_TYPES.APP, undefined, registrationType, projectInfo, { appInstanceId });
  }

  /**
   * Send registration confirmation message
   */
  private sendRegistrationConfirmation(
    ws: WebSocket, 
    connectionId: string, 
    connectionType: string, 
    parentId?: string,
    registrationType: RegistrationType = 'auto',
    projectInfo?: ProjectInfo,
    instanceIds?: { agentInstanceId?: string; appInstanceId?: string }
  ): void {
    const message = {
      type: WEBSOCKET_CONSTANTS.MESSAGE_TYPES.REGISTERED,
      connectionId,
      connectionType,
      message: registrationType === 'auto' ? 
        WEBSOCKET_CONSTANTS.MESSAGES.AUTO_REGISTRATION_SUCCESS : 
        WEBSOCKET_CONSTANTS.MESSAGES.REGISTRATION_SUCCESS,
      registrationType,
      ...(parentId && { parentId }),
      ...(projectInfo && { currentProject: projectInfo }),
      ...(instanceIds?.agentInstanceId && { agentInstanceId: instanceIds.agentInstanceId }),
      ...(instanceIds?.appInstanceId && { appInstanceId: instanceIds.appInstanceId })
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
      console.error(formatLogMessage('error', 'WebSocketServer', 
        `Error sending message: ${error}`));
    }
  }

  /**
   * Handle incoming message and route appropriately
   */
  private handleMessage(clientId: string, ws: WebSocket, message: unknown): RegistrationResult {
    console.log(formatLogMessage('info', 'WebSocketServer', 
      `Processing message from ${clientId}: ${JSON.stringify(message)}`));

    const connection = this.connectionManager.getConnection(clientId);
    if (!connection) {
      this.sendError(ws, WEBSOCKET_CONSTANTS.MESSAGES.CONNECTION_NOT_REGISTERED);
      return;
    }

    const messageWithConnection = this.enrichMessageWithConnection(message, clientId);
    this.routeMessage(connection, messageWithConnection);
  }

  /**
   * Enrich message with connection information
   */
  private enrichMessageWithConnection(message: unknown, clientId: string): Message & { connectionId: string } {
    const enrichedMessage = message as Message & { connectionId: string };
    enrichedMessage.connectionId = clientId;
    return enrichedMessage;
  }

  /**
   * Route message to appropriate handler based on connection type
   */
  private routeMessage(connection: any, message: Message & { connectionId: string }): void {
    try {
      switch (connection.type) {
        case WEBSOCKET_CONSTANTS.CLIENT_TYPES.AGENT:
          this.agentMessageRouter.handleAgentRequestMessage(connection, message);
          break;
        case WEBSOCKET_CONSTANTS.CLIENT_TYPES.APP:
          this.appMessageRouter.handleAppResponse(connection, message);
          break;
        default:
          console.warn(formatLogMessage('warn', 'WebSocketServer', 
            `Unknown connection type: ${connection.type} for ${connection.id}`));
      }
    } catch (error) {
      console.error(formatLogMessage('error', 'WebSocketServer', 
        `Error routing message for ${connection.id}: ${error}`));
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
        console.log(formatLogMessage('info', 'WebSocketServer', 'WebSocket server closed gracefully'));
      });
    } catch (error) {
      console.error(formatLogMessage('error', 'WebSocketServer', `Error closing WebSocket server: ${error}`));
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
      console.warn(formatLogMessage('warn', 'WebSocketServer', 'No clients connected for broadcast'));
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
          console.error(formatLogMessage('error', 'WebSocketServer', 
            `Error broadcasting message to client: ${error}`));
        }
      }
    });

    console.log(formatLogMessage('info', 'WebSocketServer', 
      `Broadcast completed: ${successCount} successful, ${errorCount} failed`));
  }
}