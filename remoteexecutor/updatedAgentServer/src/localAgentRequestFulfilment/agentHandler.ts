import {
  ClientConnection,
  formatLogMessage
} from './../../types';
import { NotificationService } from '../../services/NotificationService';
import type { AgentEvent, AgentNotificationBase } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../../core/connectionManagers/connectionManager';
import { SendMessageToApp } from '../appMessaging/sendMessageToApp';

/**
 * Handles agent events with notifications
 */
export class AgentHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;
  private sendMessageToApp: SendMessageToApp;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToApp = new SendMessageToApp();
  }

  /**
   * Handle agent events with proper typing
   */
  handleAgentEvent(agent: ClientConnection, agentEvent: AgentEvent): void {
    const { requestId, action } = agentEvent;
    console.log(formatLogMessage('info', 'AgentHandler', `Handling agent event: ${action} from ${agent.id}`));
    
    // Send properly typed request notification to app
    const requestNotification: AgentNotificationBase = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'agentnotify',
      action: `${action}Request`,
      agentId: agent.id
    };

    this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    console.log(formatLogMessage('info', 'AgentHandler', `Sent agent request notification: ${action}`));

    // Forward to app for processing
    this.sendMessageToApp.forwardToApp(agent, agentEvent as any);
  }
}
