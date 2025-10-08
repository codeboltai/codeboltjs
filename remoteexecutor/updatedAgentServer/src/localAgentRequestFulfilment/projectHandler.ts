import {
  ClientConnection,
  formatLogMessage
} from './../../types';
import { NotificationService } from '../../services/NotificationService';
import type { ProjectEvent, SystemNotificationBase } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../../core/connectionManagers/connectionManager';
import { SendMessageToApp } from '../appMessaging/sendMessageToApp';

/**
 * Handles project events with notifications
 */
export class ProjectHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;
  private sendMessageToApp: SendMessageToApp;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToApp = new SendMessageToApp();
  }

  /**
   * Handle project events with proper typing
   */
  async handleProjectEvent(agent: ClientConnection, projectEvent: ProjectEvent) {
    const { requestId } = projectEvent;
    const eventAction = (projectEvent as any).action || projectEvent.type || 'unknown';
    console.log(formatLogMessage('info', 'ProjectHandler', `Handling project event: ${eventAction} from ${agent.id}`));
    
    // Send properly typed request notification to app (using SystemNotificationBase for project events)
    // const requestNotification: SystemNotificationBase = {
    //   requestId: requestId,
    //   toolUseId: requestId,
    //   type: 'chatnotify', // Note: systemNotificationBaseSchema uses 'chatnotify' type
    //   action: `${eventAction}Request`,
    //   agentId: agent.id
    // };

   let data= await this.notificationService.sendToAppRelatedToAgentId(agent.id, projectEvent as any,true);
    this.connectionManager.sendToConnection(agent.id, { ...data, clientId: agent.id });

    console.log(formatLogMessage('info', 'ProjectHandler', `Sent project request notification: ${eventAction}`));

    // Forward to app for processing
    // this.sendMessageToApp.forwardToApp(agent, projectEvent as any);
  }
}
