import { ClientConnection, Message, ResponseMessage, formatLogMessage } from '../../types';
import { ConnectionManager } from '../../core/connectionManagers/connectionManager';
import { NotificationService } from '../../services/NotificationService';
import { SendMessageToAgent } from '../agentMessaging/sendMessageToAgent';
import { WranglerProxyClient } from '../../core/remote/wranglerProxyClient';

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

  handleAppMessage(app: ClientConnection, message: Message): void {
    console.log(formatLogMessage('info', 'MessageRouter', `Handling app message: ${message.type} from ${app.id}`));

    this.handleAppResponse(app, message);
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

  handleInitialUserMessage(app: ClientConnection, message: Message): void {
    console.log(formatLogMessage('info', 'MessageRouter', `Handling initial user message: ${message.type} from ${app.id}`));

    this.sendMessageToAgent.sendInitialMessage(app, message);
  }






  /**
   * Forward agent request to app
   */
  private forwardToApp(agent: ClientConnection, message: Message): void {
    console.log(formatLogMessage('info', 'MessageRouter', `Forwarding request from agent ${agent.id} to app`));
    
    // Cache the message ID -> agent ID mapping for response routing
    const agentManager = this.connectionManager.getAgentConnectionManager();
    const appManager = this.connectionManager.getAppConnectionManager();
    if (message.id) {
      agentManager.cacheMessageToAgent(message.id, agent.id);
    }
    
    // Add agentId to the message so app knows where to send response back
    const messageWithAgentId = { ...message, agentId: agent.id };
    
    const apps = appManager.getAllApps();
    if (apps.length === 0) {
      const remoteClient = WranglerProxyClient.getInstance();
      if (remoteClient) {
        console.log(formatLogMessage('info', 'MessageRouter', 'No local apps available, forwarding via remote proxy'));
        remoteClient.forwardAgentMessage(agent.id, messageWithAgentId);
        return;
      }

      this.connectionManager.sendError(agent.id, 'No apps available to handle the request', message.id);
      return;
    }

    // Send to first available app
    const app = apps[0];
    const success = appManager.sendToApp(app.id, messageWithAgentId);
    if (!success) {
      const remoteClient = WranglerProxyClient.getInstance();
      if (remoteClient) {
        console.log(
          formatLogMessage('warn', 'MessageRouter', 'Failed to reach local app, forwarding via remote proxy')
        );
        remoteClient.forwardAgentMessage(agent.id, messageWithAgentId);
        return;
      }

      this.connectionManager.sendError(agent.id, 'Failed to forward request to app', message.id);
    }
  }



}