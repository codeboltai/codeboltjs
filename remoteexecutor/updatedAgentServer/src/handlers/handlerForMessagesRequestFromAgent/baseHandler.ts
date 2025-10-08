import {
  ClientConnection,
  Message,
  formatLogMessage
} from './../../types';
import { ConnectionManager } from '../../core/connectionManagers/connectionManager';
import { WranglerProxyClient } from '../../core/remote/wranglerProxyClient';

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
    const agentManager = this.connectionManager.getAgentConnectionManager();
    const success = agentManager.sendToAgent(message);
    
    if (!success) {
      const remoteClient = WranglerProxyClient.getInstance();
      if (remoteClient) {
        console.log(
          formatLogMessage('warn', 'BaseHandler', 'No local agents available, forwarding request via remote proxy')
        );
        remoteClient.forwardAppMessage(client.id, message);
        return;
      }

      this.sendError(client.id, 'No agents available to handle the request', message.id);
      return;
    }

    WranglerProxyClient.getInstance()?.forwardAppMessage(client.id, message);
  }

  /**
   * Forward message to client(s)
   */
  protected forwardToClient(agent: ClientConnection, message: unknown): void {
    const messageWithClientId = message as { clientId?: string };
    const appManager = this.connectionManager.getAppConnectionManager();
    
    // If the message specifies a clientId, forward to that specific client
    if (messageWithClientId.clientId) {
      const delivered = appManager.sendToApp(messageWithClientId.clientId, message);
      if (!delivered) {
        const remoteClient = WranglerProxyClient.getInstance();
        if (remoteClient) {
          console.log(
            formatLogMessage('warn', 'BaseHandler', 'Failed to reach client locally, forwarding via remote proxy')
          );
          remoteClient.forwardAgentMessage(agent.id, message);
          return;
        }
      } else {
        WranglerProxyClient.getInstance()?.forwardAgentMessage(agent.id, message);
      }
    } else {
      // Broadcast to all clients if no specific client is mentioned
      appManager.broadcast(message);
      WranglerProxyClient.getInstance()?.forwardAgentMessage(agent.id, message);
    }
  }
}