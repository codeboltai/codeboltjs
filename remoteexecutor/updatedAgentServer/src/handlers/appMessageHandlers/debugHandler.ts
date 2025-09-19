import {
  ClientConnection,
  formatLogMessage
} from './../../types';
import { NotificationService } from '../../services/NotificationService';
import type { DebugEvent, SystemNotificationBase } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../../core/connectionManager';
import { SendMessageToApp } from '../sendMessageToApp';

/**
 * Handles debug events with notifications
 */
export class DebugHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;
  private sendMessageToApp: SendMessageToApp;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToApp = new SendMessageToApp();
  }

  /**
   * Handle debug events with proper typing
   */
  handleDebugEvent(agent: ClientConnection, debugEvent: DebugEvent): void {
    const { requestId, action } = debugEvent;
    console.log(formatLogMessage('info', 'DebugHandler', `Handling debug event: ${action} from ${agent.id}`));
    
    // Send properly typed request notification to app
    const requestNotification: SystemNotificationBase = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'chatnotify', // Note: systemNotificationBaseSchema uses 'chatnotify' type
      action: `${action}Request`,
      agentId: agent.id
    };

    this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    console.log(formatLogMessage('info', 'DebugHandler', `Sent debug request notification: ${action}`));

    // Forward to app for processing
    this.sendMessageToApp.forwardToApp(agent, debugEvent as any);
  }
}
