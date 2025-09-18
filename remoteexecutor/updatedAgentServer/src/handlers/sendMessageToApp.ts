import { ClientConnection, Message, ReadFileMessage, WriteFileMessage, AskAIMessage, ResponseMessage, formatLogMessage } from '@codebolt/shared-types';
import { ReadFileHandler, WriteFileHandler, AskAIHandler, ResponseHandler } from './appMessageHandlers';
import { ConnectionManager } from '../core/connectionManager';
import { NotificationService } from '../services/NotificationService';

/**
 * Routes messages with explicit workflow visibility
 * Shows the complete message flow and notifications
 */
export class SendMessageToApp {
  private connectionManager: ConnectionManager;
  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
  }
  /**
   * Forward agent request to app
   */
   forwardToApp(agent: ClientConnection, message: Message): void {
    console.log(formatLogMessage('info', 'MessageRouter', `Forwarding request from agent ${agent.id} to app`));
    
    // Cache the message ID -> agent ID mapping for response routing
    if (message.id) {
      this.connectionManager.cacheMessageToAgent(message.id, agent.id);
    }
    
    // Add agentId and agentInstanceId to the message so app knows where to send response back
    const messageWithAgentId = { 
      ...message, 
      agentId: agent.id,
      agentInstanceId: agent.instanceId 
    };
    
    const apps = this.connectionManager.getAllApps();
    if (apps.length === 0) {
      this.connectionManager.sendError(agent.id, 'No apps available to handle the request', message.id);
      return;
    }

    // Send to first available app
    const app = apps[0];
    const success = this.connectionManager.sendToApp(app.id, messageWithAgentId);
    if (!success) {
      this.connectionManager.sendError(agent.id, 'Failed to forward request to app', message.id);
    }
  }



}