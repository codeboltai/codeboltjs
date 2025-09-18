import { ClientConnection, Message, ReadFileMessage, WriteFileMessage, AskAIMessage, ResponseMessage, formatLogMessage } from '@codebolt/shared-types';
import { ReadFileHandler, WriteFileHandler, AskAIHandler, ResponseHandler } from './appMessageHandlers';
import { ConnectionManager } from '../core/connectionManager';
import { NotificationService } from '../services/NotificationService';
import { SendMessageToAgent } from './sendMessageToAgent';

/**
 * Routes messages with explicit workflow visibility
 * Shows the complete message flow and notifications
 */
export class AppMessageRouter {

  private connectionManager: ConnectionManager;
  private sendMessageToAgent:SendMessageToAgent;
  private notificationService: NotificationService;

  constructor() {

    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToAgent= new SendMessageToAgent();
    this.notificationService = NotificationService.getInstance();
  }
  /**
   * Handle responses from apps (responding back to agent requests)
   */
   handleAppResponse(app: ClientConnection, message: Message): void {
    console.log(formatLogMessage('info', 'MessageRouter', `Handling app response: ${message.type} from ${app.id}`));

    // Check if this message has a requestId and could be a response to a pending request
    // const messageWithRequestId = message as Message & { requestId?: string };
    // if (messageWithRequestId.requestId) {
    //   // Try to resolve any pending request first
    //   this.notificationService.handleResponse(messageWithRequestId.requestId, message);
    //   return
    // }

    this.sendMessageToAgent.sendResponseToAgent(app, message as ResponseMessage);
   
  }






  /**
   * Forward agent request to app
   */
  private forwardToApp(agent: ClientConnection, message: Message): void {
    console.log(formatLogMessage('info', 'MessageRouter', `Forwarding request from agent ${agent.id} to app`));
    
    // Cache the message ID -> agent ID mapping for response routing
    if (message.id) {
      this.connectionManager.cacheMessageToAgent(message.id, agent.id);
    }
    
    // Add agentId to the message so app knows where to send response back
    const messageWithAgentId = { ...message, agentId: agent.id };
    
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