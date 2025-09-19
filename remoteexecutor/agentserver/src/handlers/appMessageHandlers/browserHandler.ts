import {
  ClientConnection,
  formatLogMessage
} from '@codebolt/types/remote';
import { NotificationService } from '../../services/NotificationService';
import type { BrowserEvent, BrowserNotificationBase } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../../core/connectionManager';
import { SendMessageToApp } from '../sendMessageToApp';

/**
 * Handles browser events with notifications
 */
export class BrowserHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;
  private sendMessageToApp: SendMessageToApp;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToApp = new SendMessageToApp();
  }

  /**
   * Handle browser events with proper typing
   */
  handleBrowserEvent(agent: ClientConnection, browserEvent: BrowserEvent): void {
    const { requestId, action } = browserEvent;
    console.log(formatLogMessage('info', 'BrowserHandler', `Handling browser event: ${action} from ${agent.id}`));
    
    // Send properly typed request notification to app
    const requestNotification: BrowserNotificationBase = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'browsernotify',
      action: `${action}Request`,
      agentId: agent.id
    };

    this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    console.log(formatLogMessage('info', 'BrowserHandler', `Sent browser request notification: ${action}`));

    // Forward to app for processing
    this.sendMessageToApp.forwardToApp(agent, browserEvent as any);
  }
}
