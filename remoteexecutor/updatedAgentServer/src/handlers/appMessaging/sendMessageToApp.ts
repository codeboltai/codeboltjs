import { ClientConnection, Message, formatLogMessage } from '../../types';
import { ConnectionManager } from '../../core/connectionManagers/connectionManager';
import { SendMessageToRemote } from '../remoteMessaging/sendMessageToRemote';

/**
 * Routes messages with explicit workflow visibility
 * Shows the complete message flow and notifications
 */
export class SendMessageToApp {
  private connectionManager: ConnectionManager;
  private sendMessageToRemote: SendMessageToRemote;
  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToRemote = new SendMessageToRemote();
  }
  /**
   * Forward agent request to app
   */
   forwardToApp(agent: ClientConnection, message: Message): void {
    console.log(formatLogMessage('info', 'MessageRouter', `Forwarding request from agent ${agent.id} to app`));
    
    // Cache the message ID -> agent ID mapping for response routing
    const agentManager = this.connectionManager.getAgentConnectionManager();
    const appManager = this.connectionManager.getAppConnectionManager();
    if (message.id) {
      agentManager.cacheMessageToAgent(message.id, agent.id);
    }
    
    // Add agentId and agentInstanceId to the message so app knows where to send response back
    const messageWithAgentId = { 
      ...message, 
      agentId: agent.id,
      agentInstanceId: agent.instanceId 
    };
    
    const apps = appManager.getAllApps();
    if (apps.length === 0) {
      console.log(formatLogMessage('info', 'MessageRouter', 'No local apps available, forwarding via remote proxy'));
      this.sendMessageToRemote.forwardAgentMessage(agent, messageWithAgentId, { requireRemote: true });
      return;

      this.connectionManager.sendError(agent.id, 'No apps available to handle the request', message.id);
      return;
    }

    // Send to first available app
    const app = apps[0];
    const success = appManager.sendToApp(app.id, messageWithAgentId);
    if (!success) {
      console.log(formatLogMessage('warn', 'MessageRouter', 'Failed to reach local app, forwarding via remote proxy'));
      this.sendMessageToRemote.forwardAgentMessage(agent, messageWithAgentId, { requireRemote: true });
      return;

      this.connectionManager.sendError(agent.id, 'Failed to forward request to app', message.id);
    }
  }



}