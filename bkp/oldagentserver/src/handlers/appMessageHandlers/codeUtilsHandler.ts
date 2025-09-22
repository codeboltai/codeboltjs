import {
  ClientConnection,
  formatLogMessage
} from '@codebolt/types/remote';
import { NotificationService } from '../../services/NotificationService';
import type { CodeUtilsEvent, CodeUtilsNotificationBase } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../../core/connectionManager';
import { SendMessageToApp } from '../sendMessageToApp';

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
    console.log(formatLogMessage('info', 'CodeUtilsHandler', `Handling codeutils event: ${action} from ${agent.id}`));
    
    // Send properly typed request notification to app
    const requestNotification: CodeUtilsNotificationBase = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'codeutilsnotify',
      action: `${action}Request`,
      agentId: agent.id
    };

    this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    console.log(formatLogMessage('info', 'CodeUtilsHandler', `Sent codeutils request notification: ${action}`));

    // Forward to app for processing
    this.sendMessageToApp.forwardToApp(agent, codeUtilsEvent as any);
  }
}
