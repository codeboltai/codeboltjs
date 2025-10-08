import {
  ClientConnection,
  formatLogMessage
} from '../types';
import { NotificationService } from '../services/NotificationService';
import type { TokenizerEvent, SystemNotificationBase } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../core/connectionManagers/connectionManager';
import { SendMessageToApp } from '../handlers/appMessaging/sendMessageToApp';

/**
 * Handles tokenizer events with notifications
 */
export class TokenizerHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;
  private sendMessageToApp: SendMessageToApp;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToApp = new SendMessageToApp();
  }

  /**
   * Handle tokenizer events with proper typing
   */
  handleTokenizerEvent(agent: ClientConnection, tokenizerEvent: TokenizerEvent): void {
    const { requestId, action } = tokenizerEvent;
    console.log(formatLogMessage('info', 'TokenizerHandler', `Handling tokenizer event: ${action} from ${agent.id}`));
    
    // Send properly typed request notification to app (using SystemNotificationBase for tokenizer events)
    const requestNotification: SystemNotificationBase = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'chatnotify', // Note: systemNotificationBaseSchema uses 'chatnotify' type
      action: `${action}Request`,
      agentId: agent.id
    };

    this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    console.log(formatLogMessage('info', 'TokenizerHandler', `Sent tokenizer request notification: ${action}`));

    // Forward to app for processing
    this.sendMessageToApp.forwardToApp(agent, tokenizerEvent as any);
  }
}
