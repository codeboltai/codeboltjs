import {
  ClientConnection,
  formatLogMessage
} from './../../types';
import { NotificationService } from '../../services/NotificationService';
import type { LLMEvent, LlmNotificationBase } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../../core/connectionManager';
import { SendMessageToApp } from '../appMessaging/sendMessageToApp';

/**
 * Handles LLM events with notifications
 */
export class LlmHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;
  private sendMessageToApp: SendMessageToApp;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToApp = new SendMessageToApp();
  }

  /**
   * Handle LLM events with proper typing
   */
  async handleLlmEvent(agent: ClientConnection, llmEvent: LLMEvent) {
    const { requestId } = llmEvent;
    const eventAction = llmEvent.type || 'unknown';
    console.log(formatLogMessage('info', 'LlmHandler', `Handling llm event: ${eventAction} from ${agent.id}`));
    
    // Send properly typed request notification to app
    const requestNotification: LlmNotificationBase = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'llmnotify',
      action: `${eventAction}Request`,
      agentId: agent.id
    };

   let data= await this.notificationService.sendToAppRelatedToAgentId(agent.id, llmEvent as any,true);
   this.connectionManager.sendToConnection(agent.id, { ...data, clientId: agent.id });

    console.log(formatLogMessage('info', 'LlmHandler', `Sent llm request notification: ${eventAction}`));

    // Forward to app for processing
    // this.sendMessageToApp.forwardToApp(agent, llmEvent as any);
  }
}
