import { ClientConnection, Message, ReadFileMessage, WriteFileMessage, AskAIMessage, ResponseMessage, formatLogMessage } from '@codebolt/types/remote';

import { ConnectionManager } from '../core/connectionManager';


/**
 * Routes messages with explicit workflow visibility
 * Shows the complete message flow and notifications
 */
export class SendMessageToAgent {

  private connectionManager: ConnectionManager;

  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
  }
  /**
   * Send app response back to agent
   */
   sendResponseToAgent(app: ClientConnection, message: ResponseMessage): void {
    console.log(formatLogMessage('info', 'MessageRouter', `Sending response from app ${app.id} to agent`));
    
    // First try to find the agent using cached message ID
    let targetAgentId: string | undefined;
    
    if (message.id) {
      targetAgentId = this.connectionManager.getAndRemoveAgentForMessage(message.id);
    }
    
    // Fallback to agentId if present in message
    if (!targetAgentId && 'agentId' in message && typeof (message as Record<string, unknown>).agentId === 'string') {
      targetAgentId = (message as Record<string, unknown>).agentId as string;
    }
    
    if (targetAgentId) {
      this.connectionManager.sendToSpecificAgent(targetAgentId,app.id, message).then((success) => {
        if (!success) {
          console.warn(formatLogMessage('warn', 'MessageRouter', `Failed to send response to agent ${targetAgentId}`));
          // Fallback to any available agent
          this.connectionManager.sendToAgent(message);
        }
      }).catch((error) => {
        console.error(formatLogMessage('error', 'MessageRouter', `Error sending response to agent ${targetAgentId}: ${error}`));
        // Fallback to any available agent
        this.connectionManager.sendToAgent(message);
      });
    } else {
      console.warn(formatLogMessage('warn', 'MessageRouter', `App response without valid agent identifier - using fallback`));
      // Fallback to any available agent
      const success = this.connectionManager.sendToAgent(message);
      if (!success) {
        console.warn(formatLogMessage('warn', 'MessageRouter', `No agents available for app response`));
      }
    }
  }


}