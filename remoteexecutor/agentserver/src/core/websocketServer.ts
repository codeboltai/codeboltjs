import WebSocket, { WebSocketServer as WSServer } from 'ws';
import { Server } from 'http';
import { v4 as uuidv4 } from 'uuid';
import { formatLogMessage, isMessageWithType, Message } from '@codebolt/types/remote';

import { ConnectionManager } from './connectionManager';
import { NotificationService } from '../services/NotificationService';
import { AppMessageRouter } from '../handlers/appMessageRouter';
import { AgentMessageRouter } from '../handlers/agentMessageRouter';

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
    this.wss.on('connection', (ws: WebSocket, request) => {
      const initialClientId = uuidv4();
      let actualClientId = initialClientId; // Will be updated after registration if agent provides custom ID
      console.log(formatLogMessage('info', 'WebSocketServer', `New WebSocket connection: ${initialClientId}`));

      // Parse query parameters from connection URL
      const url = new URL(request.url || '', `http://${request.headers.host}`);
      const queryParams = url.searchParams;
      const agentId = queryParams.get('agentId');
      const parentId = queryParams.get('parentId');
      const clientType = queryParams.get('clientType');

      // Auto-register if connection parameters are provided
      let autoRegistered = false;
      if (agentId && parentId  ) {
        actualClientId = agentId;
        console.log(formatLogMessage('info', 'WebSocketServer', `Auto-registering agent from connection params: ${agentId}${parentId ? ` with parent: ${parentId}` : ''}`));
        
        this.connectionManager.registerConnection(agentId, ws, 'agent', parentId || undefined);
        autoRegistered = true;
        
        // Send registration confirmation
        ws.send(JSON.stringify({
          type: 'registered',
          connectionId: agentId,
          connectionType: 'agent',
          message: 'Successfully auto-registered as agent from connection parameters',
          parentId: parentId || undefined
        }));
      } else if (clientType === 'app') {
        const connectionId = queryParams.get('appId') || initialClientId;
        actualClientId = connectionId;
        console.log(formatLogMessage('info', 'WebSocketServer', `Auto-registering app from connection params: ${connectionId}`));
        
        this.connectionManager.registerConnection(connectionId, ws, 'app');
        autoRegistered = true;
        
        // Send registration confirmation
        ws.send(JSON.stringify({
          type: 'registered',
          connectionId: connectionId,
          connectionType: 'app',
          message: 'Successfully auto-registered as app from connection parameters'
        }));
      }

      // Send initial connection message (only if not auto-registered)
      if (!autoRegistered) {
        ws.send(JSON.stringify({
          type: 'connection',
          clientId: initialClientId,
          message: 'Connected to Docker Server'
        }));
      }

      ws.on('message', (data: WebSocket.Data) => {
        try {
          const message: unknown = JSON.parse(data.toString());

          // Type check the message
          if (!isMessageWithType(message)) {
            this.sendError(ws, 'Invalid message format: missing type field', undefined);
            return;
          }

          // Handle connection type registration (only if not auto-registered)
          if (message.type === 'register') {
            // Check if already registered from connection parameters
            const existingConnection = this.connectionManager.getConnection(actualClientId);
            if (existingConnection) {
              console.log(formatLogMessage('info', 'WebSocketServer', `Connection ${actualClientId} already registered, skipping manual registration`));
              ws.send(JSON.stringify({
                type: 'registered',
                connectionId: actualClientId,
                connectionType: existingConnection.type,
                message: 'Already registered from connection parameters'
              }));
              return;
            }

            const isAgent = message.clientType === 'agent';
            // For agents, use provided agentId if available
            let connectionId = actualClientId;
            let parentId: string | undefined;
            
            if (isAgent && 'agentId' in message && typeof message.agentId === 'string') {
              connectionId = message.agentId;
              console.log(formatLogMessage('info', 'WebSocketServer', `Agent registering with custom ID: ${connectionId}`));
            }

            // Extract parentId for agents
            if (isAgent && 'parentId' in message && typeof message.parentId === 'string') {
              parentId = message.parentId;
              console.log(formatLogMessage('info', 'WebSocketServer', `Agent ${connectionId} registering with parent: ${parentId}`));
            }

            this.connectionManager.registerConnection(connectionId, ws, isAgent ? 'agent' : 'app', parentId);
            // Return the new connection ID if it changed
            if (connectionId !== actualClientId) {
              return { newClientId: connectionId };
            }
            return;
          }

          const result = this.handleMessage(actualClientId, ws, message);
          // Update the actual client ID if registration provided a new one
          if (result && result.newClientId) {
            actualClientId = result.newClientId;
          }
        } catch (error) {
          console.error(formatLogMessage('error', 'WebSocketServer', `Error parsing message: ${error}`));
          this.sendError(ws, 'Invalid message format', undefined);
        }
      });

      ws.on('close', () => {
        const connection = this.connectionManager.getConnection(actualClientId);
        if (connection) {
          // Send notification about disconnection
          this.notificationService.broadcast({
            type: 'notification',
            action: `${connection.type}-disconnected`,
            data: { clientId: actualClientId, connectionType: connection.type },
            timestamp: Date.now()
          });
        }
        this.connectionManager.removeConnection(actualClientId);
      });

      ws.on('error', (error: Error) => {
        console.error(formatLogMessage('error', 'WebSocketServer', `WebSocket error for client ${actualClientId}: ${error}`));
        this.connectionManager.removeConnection(actualClientId);
      });
    });
  }

  /**
   * Handle incoming message and route appropriately
   */
  private handleMessage(clientId: string, ws: WebSocket, message: unknown): { newClientId?: string } | void {
    console.log(formatLogMessage('info', 'WebSocketServer', `Received message from ${clientId}: ${JSON.stringify(message)}`));

    // Ensure connection is registered before processing other messages
    const connection = this.connectionManager.getConnection(clientId);
    if (!connection) {
      this.sendError(ws, 'Connection not registered. Please send register message first.');
      return;
    }

    // Pass to message handler for routing (only clientId, no ws)
    // this.messageHandler.handleMessage(clientId, message);

    console.log(formatLogMessage('info', 'MessageHandler', `Processing message from ${clientId}: ${JSON.stringify(message)}`));

    // Add connectionId to message for tracking
    const messageWithConnection = message as Message & { connectionId?: string };
    messageWithConnection.connectionId = clientId;

    // Route message to appropriate handler
    // this.messageRouter.routeMessage(clientId, messageWithConnection);
    // Get connection from connection manager

    if (!connection) {
      console.error(formatLogMessage('error', 'MessageRouter', `Connection not found for client: ${clientId}`));
      return;
    }

    if (connection.type === 'agent') {
      this.agentMessageRouter.handleAgentRequest(connection, messageWithConnection);
    } else if (connection.type === 'app') {
      this.appMessageRouter.handleAppResponse(connection, messageWithConnection);

    } else {
      console.warn(formatLogMessage('warn', 'MessageRouter', `Unknown connection type: ${connection.type} for ${connection.id}`));
    }
  }

  /**
   * Send error message to WebSocket
   */
  private sendError(ws: WebSocket, errorMessage: string, messageId?: string): void {
    const error = {
      id: messageId || uuidv4(),
      type: 'response',
      success: false,
      error: errorMessage,
      timestamp: new Date().toISOString()
    };

    try {
      ws.send(JSON.stringify(error));
    } catch (sendError) {
      console.error(formatLogMessage('error', 'WebSocketServer', `Error sending error message: ${sendError}`));
    }
  }

  /**
   * Close the WebSocket server
   */
  close(): void {
    this.wss.close();
    console.log(formatLogMessage('info', 'WebSocketServer', 'WebSocket server closed'));
  }

  /**
   * Get connection count
   */
  getConnectionCount(): number {
    return this.wss.clients.size;
  }

  /**
   * Broadcast message to all connected clients
   */
  broadcast(message: unknown): void {
    const messageStr = JSON.stringify(message);
    this.wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        try {
          client.send(messageStr);
        } catch (error) {
          console.error(formatLogMessage('error', 'WebSocketServer', `Error broadcasting message: ${error}`));
        }
      }
    });
  }
}