import {
  ClientConnection,
  formatLogMessage
} from '../types';
import { NotificationService } from '../services/NotificationService';
import type { CodeUtilsEvent, CodeUtilsNotificationBase } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../core/connectionManagers/connectionManager';
import { SendMessageToApp } from '../handlers/appMessaging/sendMessageToApp';
import { logger } from '../utils/logger';

/**
 * Handles code utils events with notifications
 */
export class CodeUtilsHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;
  private sendMessageToApp: SendMessageToApp;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToApp = new SendMessageToApp();
  }

  /**
   * Handle code utils events with proper typing
   */
  handleCodeUtilsEvent(agent: ClientConnection, codeUtilsEvent: CodeUtilsEvent): void {
    const { requestId, action } = codeUtilsEvent;
    logger.info(formatLogMessage('info', 'CodeUtilsHandler', `Handling codeutils event: ${action} from ${agent.id}`));
    
    // Send properly typed request notification to app
    const requestNotification: CodeUtilsNotificationBase = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'codeutilsnotify',
      action: `${action}Request`,
      agentId: agent.id
    };

    this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    logger.info(formatLogMessage('info', 'CodeUtilsHandler', `Sent codeutils request notification: ${action}`));

    // Forward to app for processing
    this.sendMessageToApp.forwardToApp(agent, codeUtilsEvent as any);
  }
}
