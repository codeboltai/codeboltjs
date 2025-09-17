import {
  ClientConnection,
  formatLogMessage
} from '@codebolt/shared-types';
import { NotificationService } from '../../services/NotificationService';
import type { CrawlerEvent, CrawlerNotificationBase } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../../core/connectionManager';
import { SendMessageToApp } from '../sendMessageToApp';

/**
 * Handles crawler events with notifications
 */
export class CrawlerHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;
  private sendMessageToApp: SendMessageToApp;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToApp = new SendMessageToApp();
  }

  /**
   * Handle crawler events with proper typing
   */
  handleCrawlerEvent(agent: ClientConnection, crawlerEvent: CrawlerEvent): void {
    const { requestId, action } = crawlerEvent;
    console.log(formatLogMessage('info', 'CrawlerHandler', `Handling crawler event: ${action} from ${agent.id}`));
    
    // Send properly typed request notification to app
    const requestNotification: CrawlerNotificationBase = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'crawlernotify',
      action: `${action}Request`,
      agentId: agent.id
    };

    this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    console.log(formatLogMessage('info', 'CrawlerHandler', `Sent crawler request notification: ${action}`));

    // Forward to app for processing
    this.sendMessageToApp.forwardToApp(agent, crawlerEvent as any);
  }
}
