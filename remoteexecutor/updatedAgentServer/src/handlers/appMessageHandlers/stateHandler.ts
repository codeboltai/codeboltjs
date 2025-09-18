import {
  ClientConnection,
  formatLogMessage
} from '@codebolt/shared-types';
import { NotificationService } from '../../services/NotificationService';
import type { StateEvent, SystemNotificationBase } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../../core/connectionManager';
import { SendMessageToApp } from '../sendMessageToApp';

/**
 * Handles state events with notifications
 */
export class StateHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;
  private sendMessageToApp: SendMessageToApp;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToApp = new SendMessageToApp();
  }

  /**
   * Handle state events with proper typing
   */
  handleStateEvent(agent: ClientConnection, stateEvent: StateEvent): void {
    const { requestId, action } = stateEvent;
    console.log(formatLogMessage('info', 'StateHandler', `Handling state event: ${action} from ${agent.id}`));
    
    // Send properly typed request notification to app (using SystemNotificationBase for state events)
    const requestNotification: SystemNotificationBase = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'chatnotify', // Note: systemNotificationBaseSchema uses 'chatnotify' type
      action: `${action}Request`,
      agentId: agent.id
    };

    this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    console.log(formatLogMessage('info', 'StateHandler', `Sent state request notification: ${action}`));

    // Forward to app for processing
    this.sendMessageToApp.forwardToApp(agent, stateEvent as any);
  }
}
