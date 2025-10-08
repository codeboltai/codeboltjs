import { ClientConnection, ResponseMessage, formatLogMessage } from '../../types';

import { ConnectionManager } from '../../core/connectionManagers/connectionManager';
import { WebSocketServer } from '../../core/ws/websocketServer';
import { WranglerProxyClient } from '../../core/remote/wranglerProxyClient';


/**
 * Routes messages with explicit workflow visibility
 * Shows the complete message flow and notifications
 */
export class SendMessageToAgent {

  private connectionManager: ConnectionManager;
  private websocketServer?: WebSocketServer;

  constructor(websocketServer?: WebSocketServer) {
    this.connectionManager = ConnectionManager.getInstance();
    this.websocketServer = websocketServer;
  }
  /**
   * Send app response back to agent
   */
   sendResponseToAgent(app: ClientConnection, message: ResponseMessage): void {
    console.log(formatLogMessage('info', 'MessageRouter', `Sending response from app ${app.id} to agent`));
    
    // First try to find the agent using cached message ID
     const targetAgentId = message?.data?.agentId || 'c4d3fdb9-cf9e-4f82-8a1d-0160bbfc9ae9';
    const agentManager = this.connectionManager.getAgentConnectionManager();
    
    const remoteClient = WranglerProxyClient.getInstance();

    if (targetAgentId) {
      agentManager.sendToSpecificAgent(targetAgentId,app.id, message).then((success) => {
        if (!success) {
          console.warn(formatLogMessage('warn', 'MessageRouter', `Failed to send response to agent ${targetAgentId}`));
          // Fallback to any available agent
          const fallbackSuccess = agentManager.sendToAgent(message);
          if (!fallbackSuccess && remoteClient) {
            console.log(
              formatLogMessage('info', 'MessageRouter', 'Forwarding app response via remote proxy after local delivery failure')
            );
            remoteClient.forwardAppMessage(app.id, message);
          }
        }
      }).catch((error) => {
        console.error(formatLogMessage('error', 'MessageRouter', `Error sending response to agent ${targetAgentId}: ${error}`));
        // Fallback to any available agent
        const fallbackSuccess = agentManager.sendToAgent(message);
        if (!fallbackSuccess && remoteClient) {
          console.log(
            formatLogMessage('info', 'MessageRouter', 'Forwarding app response via remote proxy after local delivery error')
          );
          remoteClient.forwardAppMessage(app.id, message);
        }
      });
    } else {
      console.warn(formatLogMessage('warn', 'MessageRouter', `App response without valid agent identifier - using fallback`));
      // Fallback to any available agent
      const success = agentManager.sendToAgent(message);
      if (!success) {
        console.warn(formatLogMessage('warn', 'MessageRouter', `No agents available for app response`));
        if (remoteClient) {
          console.log(
            formatLogMessage('info', 'MessageRouter', 'No local agents available, forwarding app response via remote proxy')
          );
          remoteClient.forwardAppMessage(app.id, message);
        }
      }
    }
  }

  /**
   * Send initial prompt to all connected agents
   */
  sendInitialMessage(prompt: string): void {
    try {
      console.log(formatLogMessage('info', 'SendMessageToAgent', `Sending initial prompt to agent: ${prompt}`));
      
      // Create a message to send to the agent
      const message = {
        type: 'prompt',
        data: {
          prompt: prompt,
          timestamp: new Date().toISOString()
        }
      };
      
      // Broadcast the message to all connected agents
      if (this.websocketServer) {
        this.websocketServer.broadcast(message);
      } else {
        // Fallback to connection manager
        const agentManager = this.connectionManager.getAgentConnectionManager();
        agentManager.sendToAgent(message);
      }
      
      console.log(formatLogMessage('info', 'SendMessageToAgent', 'Initial prompt sent successfully'));
    } catch (error) {
      console.error(formatLogMessage('error', 'SendMessageToAgent', `Failed to send initial prompt: ${error}`));
    }
  }


}