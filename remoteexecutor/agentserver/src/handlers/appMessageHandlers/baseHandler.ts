import {
  ClientConnection,
  Message
} from '@codebolt/shared-types';
import { ConnectionManager } from '../../core/connectionManager';

/**
 * Base handler interface that all message handlers implement
 */
export interface IMessageHandler {
  handle(client: ClientConnection, message: Message): void;
}

/**
 * Base class with common functionality for all message handlers
 */
export abstract class BaseHandler implements IMessageHandler {
  protected connectionManager: ConnectionManager;

  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
  }

  abstract handle(client: ClientConnection, message: Message): void;

  /**
   * Send error message to client
   */
  protected sendError(clientId: string, errorMessage: string, messageId?: string): void {
    this.connectionManager.sendError(clientId, errorMessage, messageId);
  }

  /**
   * Forward message to available agent
   */
  protected forwardToAgent(client: ClientConnection, message: Message): void {
    const success = this.connectionManager.sendToAgent(message);
    
    if (!success) {
      this.sendError(client.id, 'No agents available to handle the request', message.id);
    }
  }

  /**
   * Forward message to client(s)
   */
  protected forwardToClient(agent: ClientConnection, message: unknown): void {
    const messageWithClientId = message as { clientId?: string };
    
    // If the message specifies a clientId, forward to that specific client
    if (messageWithClientId.clientId) {
      this.connectionManager.sendToApp(messageWithClientId.clientId, message);
    } else {
      // Broadcast to all clients if no specific client is mentioned
      this.connectionManager.broadcastToApps(message);
    }
  }
}