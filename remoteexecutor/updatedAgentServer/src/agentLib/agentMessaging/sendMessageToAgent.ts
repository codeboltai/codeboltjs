import { ClientConnection, ResponseMessage, formatLogMessage } from '../../types';

import { ConnectionManager } from '../../main/core/connectionManagers/connectionManager';
import { WebSocketServer } from '../../core/ws/websocketServer';
import { SendMessageToRemote } from '../../communication/handlers/remoteMessaging/sendMessageToRemote';
import { UserMessage, BaseApplicationResponse } from '@codebolt/types/sdk';
import { ChildAgentProcessManager } from '@/agentLib/childAgentManager/childAgentProcessManager';
import { AgentTypeEnum } from '@/types/cli';
import { logger } from '../../main/utils/logger';
import { threadId } from 'worker_threads';

/**
 * Routes messages with explicit workflow visibility
 * Shows the complete message flow and notifications
 */
export class SendMessageToAgent {

  private connectionManager: ConnectionManager;
  private websocketServer?: WebSocketServer;
  private readonly sendMessageToRemote = new SendMessageToRemote();
  private childAgentProcessManager: ChildAgentProcessManager;

  constructor(websocketServer?: WebSocketServer) {
    this.connectionManager = ConnectionManager.getInstance();
    this.websocketServer = websocketServer;
    this.childAgentProcessManager = new ChildAgentProcessManager();

  }
  /**
   * Send app response back to agent
   */
  sendResponseToAgent(app: ClientConnection, message: BaseApplicationResponse): void {
    logger.info(formatLogMessage('info', 'MessageRouter', `Sending response from app ${app.id} to agent`));

    // First try to find the agent using cached message ID
    const targetAgentId = message?.data?.agentId ;
    const agentManager = this.connectionManager.getAgentConnectionManager();

    if (targetAgentId) {
      agentManager.sendToSpecificAgent(targetAgentId, app.id, message).then((success) => {
        if (!success) {
          logger.warn(formatLogMessage('warn', 'MessageRouter', `Failed to send response to agent ${targetAgentId}`));
          // Fallback to any available agent
          const fallbackSuccess = agentManager.sendToAgent(message);
          if (!fallbackSuccess) {
            logger.info(
              formatLogMessage('info', 'MessageRouter', 'Forwarding app response via remote proxy after local delivery failure')
            );
            this.sendMessageToRemote.forwardAppMessage(app.id, message, { requireRemote: true });
          }
        }
      }).catch((error) => {
        logger.error(formatLogMessage('error', 'MessageRouter', `Error sending response to agent ${targetAgentId}: ${error}`));
        // Fallback to any available agent
        const fallbackSuccess = agentManager.sendToAgent(message);
        if (!fallbackSuccess) {
          logger.info(
            formatLogMessage('info', 'MessageRouter', 'Forwarding app response via remote proxy after local delivery error')
          );
          this.sendMessageToRemote.forwardAppMessage(app.id, message, { requireRemote: true });
        }
      });
    }
    else{
      logger.warn(formatLogMessage('warn', 'MessageRouter', `App response without valid agent identifier - ignoring`));

    }
    //  else {
    //   logger.warn(formatLogMessage('warn', 'MessageRouter', `App response without valid agent identifier - using fallback`));
    //   // Fallback to any available agent
    //   const success = agentManager.sendToAgent(message);
    //   if (!success) {
    //     logger.warn(formatLogMessage('warn', 'MessageRouter', `No agents available for app response`));
    //     logger.info(
    //       formatLogMessage('info', 'MessageRouter', 'No local agents available, forwarding app response via remote proxy')
    //     );
    //     this.sendMessageToRemote.forwardAppMessage(app.id, message, { requireRemote: true });
    //   }
    // }
  }

  /**
   * Send initial prompt to all connected agents
   */
  async sendInitialMessage( message: UserMessage,parentId?:string): Promise<void> {
    try {
      logger.info(formatLogMessage('info', 'SendMessageToAgent', `Sending initial prompt to agent: `));
      // logger.info(`Starting agent: type=${agentType}, detail=${agentDetail}`);
    
      if(!message.message.selectedAgent.agentType){
        message.message.selectedAgent.agentType=AgentTypeEnum.marketplace;
        message.message.selectedAgent.agentDetails=message.message.selectedAgent.id;
      }
      const success = await this.childAgentProcessManager.startAgentByType(
        message.message.selectedAgent.agentType!,
        (message.message.selectedAgent.agentDetails) as string,
        parentId ||'codebolt-server',
        message.threadId
      );
      if (!success) {
        logger.error(formatLogMessage('error', 'SendMessageToAgent', 'Failed to start agent'));
        return;
      }
      logger.info(formatLogMessage('info', 'SendMessageToAgent', 'Agent started successfully'));
       const agentManager = this.connectionManager.getAgentConnectionManager();
         setTimeout(() => {
                   const messageSuccess = agentManager.sendToAgent(message);
          }, 5000);
      logger.info(formatLogMessage('info', 'SendMessageToAgent', 'Message sent to agent'));
     

    } catch (error) {
      logger.error(formatLogMessage('error', 'SendMessageToAgent', `Failed to send initial prompt: ${error}`));
    }
  }

}