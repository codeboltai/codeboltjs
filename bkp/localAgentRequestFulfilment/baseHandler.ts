import {
  ClientConnection,
  Message,
  formatLogMessage
} from '../types';
import { ConnectionManager } from '../core/connectionManagers/connectionManager';
import { SendMessageToRemote } from '../handlers/remoteMessaging/sendMessageToRemote';
import { SendMessageToTui } from '../handlers/tuiMessaging/sendMessageToTui';
import { logger } from '../utils/logger';

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
  protected sendMessageToTui: SendMessageToTui;
  protected sendMessageToRemote: SendMessageToRemote;

  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToTui = new SendMessageToTui();
    this.sendMessageToRemote = new SendMessageToRemote();
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
    const agentManager = this.connectionManager.getAgentConnectionManager();
    const success = agentManager.sendToAgent(message);

    if (!success) {
      logger.info(
        formatLogMessage('warn', 'BaseHandler', 'No local agents available, forwarding request via remote proxy')
      );
      this.sendMessageToRemote.forwardAppMessage(client.id, message, { requireRemote: true });
      return;
    }

    this.sendMessageToRemote.forwardAppMessage(client.id, message);
  }

  /**
   * Forward message to client(s)
   */
  protected forwardToClient(agent: ClientConnection, message: unknown): void {
    const messageWithClientId = message as { clientId?: string };
    const appManager = this.connectionManager.getAppConnectionManager();
    
    // If the message specifies a clientId, forward to that specific client
    if (messageWithClientId.clientId) {
      const deliveredToApp = appManager.sendToApp(messageWithClientId.clientId, message);
      const deliveredToTui = this.sendMessageToTui.sendToTui(messageWithClientId.clientId, message);

      if (!deliveredToApp && !deliveredToTui) {
        logger.info(
          formatLogMessage('warn', 'BaseHandler', 'Failed to reach client locally, forwarding via remote proxy')
        );
        this.sendMessageToRemote.forwardAgentMessage(agent, message as Message, { requireRemote: true });
      } else {
        this.sendMessageToRemote.forwardAgentMessage(agent, message as Message);
      }
    } else {
      // Broadcast to all clients if no specific client is mentioned
      appManager.broadcast(message);
      this.sendMessageToTui.broadcast(message);
      this.sendMessageToRemote.forwardAgentMessage(agent, message as Message);
    }
  }
}