import {
  ClientConnection,
  formatLogMessage
} from '../types';
import { NotificationService } from '../services/NotificationService';
import type { UtilsEvent, SystemNotificationBase } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../core/connectionManagers/connectionManager';
import { SendMessageToApp } from '../handlers/appMessaging/sendMessageToApp';

/**
 * Handles utils events with notifications
 */
export class UtilsHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;
  private sendMessageToApp: SendMessageToApp;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToApp = new SendMessageToApp();
  }

  /**
   * Handle utils events with proper typing
   */
  handleUtilsEvent(agent: ClientConnection, utilsEvent: UtilsEvent): void {
    const { requestId, action } = utilsEvent;
    console.log(formatLogMessage('info', 'UtilsHandler', `Handling utils event: ${action} from ${agent.id}`));
    
    // Send properly typed request notification to app (using SystemNotificationBase for utils events)
    const requestNotification: SystemNotificationBase = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'chatnotify', // Note: systemNotificationBaseSchema uses 'chatnotify' type
      action: `${action}Request`,
      agentId: agent.id
    };

    this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    console.log(formatLogMessage('info', 'UtilsHandler', `Sent utils request notification: ${action}`));

    // Forward to app for processing
    this.sendMessageToApp.forwardToApp(agent, utilsEvent as any);
  }
}
