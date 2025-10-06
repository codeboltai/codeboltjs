import {
  ClientConnection,
  formatLogMessage
} from './../../types';
import { NotificationService } from '../../services/NotificationService';
import type { HistoryEvent, HistoryNotificationBase } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../../core/connectionManager';
import { SendMessageToApp } from '../appMessaging/sendMessageToApp';

/**
 * Handles history events with notifications
 */
export class HistoryHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;
  private sendMessageToApp: SendMessageToApp;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToApp = new SendMessageToApp();
  }

  /**
   * Handle history events with proper typing
   */
  handleHistoryEvent(agent: ClientConnection, historyEvent: HistoryEvent): void {
    const { requestId, action } = historyEvent;
    console.log(formatLogMessage('info', 'HistoryHandler', `Handling history event: ${action} from ${agent.id}`));
    
    // Send properly typed request notification to app
    const requestNotification: HistoryNotificationBase = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'historynotify',
      action: `${action}Request`,
      agentId: agent.id
    };

    this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    console.log(formatLogMessage('info', 'HistoryHandler', `Sent history request notification: ${action}`));

    // Forward to app for processing
    this.sendMessageToApp.forwardToApp(agent, historyEvent as any);
  }
}
