/**
 * Notification service for broadcasting events to clients
 */

import { ConnectionManager } from '../core/connectionManagers/connectionManager';
import { formatLogMessage } from './../types';
import type { 
  ChatNotification,
  AgentTextResponseNotification,
  UserMessageRequestNotification
} from '@codebolt/types/agent-to-app-ws-types';

// Legacy interface for backward compatibility
export interface NotificationMessage {
  type: string;
  action: string;
  data?: any;
  timestamp: number;
}
export class NotificationService {
  private static instance: NotificationService;
  private connectionManager: ConnectionManager;
  private pendingRequests: Map<string, { resolve: (value: any) => void; reject: (error: any) => void }> = new Map();

  private constructor() {
    this.connectionManager = ConnectionManager.getInstance();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Broadcast notification to all apps (not agents)
   */
  broadcast(notification: NotificationMessage): void {
    console.log(formatLogMessage('info', 'NotificationService', `Broadcasting notification: ${notification.action}`));
    
    const connections = this.connectionManager.getAllConnections();
    const apps = connections.filter(conn => conn.type === 'app');

    apps.forEach(app => {
      try {
        app.ws.send(JSON.stringify(notification));
      } catch (error) {
        console.error(formatLogMessage('error', 'NotificationService', `Failed to send notification to ${app.id}: ${error}`));
      }
    });
  }

  /**
   * Send notification to the specific app that started this agent
   */
  sendToAppRelatedToAgentId(agentId: string, notification: NotificationMessage, waitForResponse?: boolean): Promise<any> | void {
    console.log(formatLogMessage('info', 'NotificationService', `Sending notification to app related to agent: ${agentId}`));
    
    // Get the parent app ID for this agent
    const agentManager = this.connectionManager.getAgentConnectionManager();
    const parentId = agentManager.getParentByAgent(agentId);
    if (!parentId) {
      console.warn(formatLogMessage('warn', 'NotificationService', `No parent app found for agent ${agentId}, falling back to broadcast`));
      this.broadcast(notification);
      if (waitForResponse) {
        return Promise.reject(new Error(`No parent app found for agent ${agentId}`));
      }
      return;
    }

    // Get the parent app connection
    const parentConnection = this.connectionManager.getConnection(parentId);
    if (!parentConnection) {
      console.warn(formatLogMessage('warn', 'NotificationService', `Parent app ${parentId} not found for agent ${agentId}`));
      if (waitForResponse) {
        return Promise.reject(new Error(`Parent app ${parentId} not found for agent ${agentId}`));
      }
      return;
    }

    if (parentConnection.type !== 'app') {
      console.warn(formatLogMessage('warn', 'NotificationService', `Parent ${parentId} is not an app connection, type: ${parentConnection.type}`));
      if (waitForResponse) {
        return Promise.reject(new Error(`Parent ${parentId} is not an app connection`));
      }
      return;
    }

    try {
      parentConnection.ws.send(JSON.stringify(notification));
      console.log(formatLogMessage('info', 'NotificationService', `Notification sent to parent app ${parentId} for agent ${agentId}`));
      
      // If waiting for response and notification has a requestId, create a promise
      if (waitForResponse && (notification as any).requestId) {
        return this.createPendingRequest((notification as any).requestId);
      }
    } catch (error) {
      console.error(formatLogMessage('error', 'NotificationService', `Failed to send notification to parent app ${parentId}: ${error}`));
      if (waitForResponse) {
        return Promise.reject(error);
      }
    }
  }

  /**
   * Send notification to specific app
   */
  sendToApp(appId: string, notification: NotificationMessage): void {
    const connection = this.connectionManager.getConnection(appId);
    if (!connection) {
      console.warn(formatLogMessage('warn', 'NotificationService', `App ${appId} not found`));
      return;
    }

    if (connection.type === 'agent') {
      console.warn(formatLogMessage('warn', 'NotificationService', `Cannot send notification to agent ${appId}`));
      return;
    }

    try {
      connection.ws.send(JSON.stringify(notification));
    } catch (error) {
      console.error(formatLogMessage('error', 'NotificationService', `Failed to send notification to ${appId}: ${error}`));
    }
  }

  /**
   * Notify about file operations
   */
  notifyFileOperation(operation: 'readFileResult' | 'write' |'readFileRequest', filepath: string, success: boolean, error?: string): void {
    this.broadcast({
      type: 'fsnotify',
      action: `${operation}`,
      data: { filePath:filepath, success, error },
      timestamp: Date.now()
    });
  }

  /**
   * Notify about AI operations
   */
  notifyAIOperation(operation: 'request' | 'response', prompt?: string, response?: string, error?: string): void {
    this.broadcast({
      type: 'notification',
      action: `ai-${operation}`,
      data: { prompt, response, error },
      timestamp: Date.now()
    });
  }

  /**
   * Notify about agent activity
   */
  notifyAgentActivity(agentId: string, activity: string, data?: any): void {
    this.broadcast({
      type: 'notification',
      action: 'agent-activity',
      data: { agentId, activity, ...data },
      timestamp: Date.now()
    });
  }

  /**
   * Send typed chat notification to app
   */
  sendChatNotification(agentId: string, notification: ChatNotification): void {
    console.log(formatLogMessage('info', 'NotificationService', `Sending chat notification: ${notification.action} from agent ${agentId}`));
    this.sendToAppRelatedToAgentId(agentId, notification as any);
  }

  /**
   * Send agent text response to app
   */
  sendAgentTextResponse(agentId: string, requestId: string, message: string, conversationId?: string): void {
    const notification: AgentTextResponseNotification = {
      requestId,
      toolUseId: requestId,
      type: 'chatnotify',
      action: 'agentTextResponse',
      content: message,
      agentId,
      data: {
        message,
        timestamp: new Date().toISOString(),
        agentId,
        conversationId
      }
    };

    this.sendChatNotification(agentId, notification);
  }

  /**
   * Send user message request notification
   */
  sendUserMessageRequest(agentId: string, requestId: string, message: string, payload?: any): void {
    const notification: UserMessageRequestNotification = {
      requestId,
      toolUseId: requestId,
      type: 'chatnotify',
      action: 'sendMessageRequest',
      agentId,
      data: {
        message,
        payload
      }
    };

    this.sendChatNotification(agentId, notification);
  }

  /**
   * Send typed notification (replaces legacy methods)
   */
  sendTypedNotification(agentId: string, notification: unknown): void {
    const action = (notification as any)?.action ?? 'unknown';
    console.log(formatLogMessage('info', 'NotificationService', `Sending typed notification: ${action} from agent ${agentId}`));
    this.sendToAppRelatedToAgentId(agentId, notification as any);
  }

  /**
   * Create a pending request that waits for a response
   */
  private createPendingRequest(requestId: string): Promise<any> {
    return new Promise((resolve, reject) => {
      // Store the pending request
      this.pendingRequests.set(requestId, {
        resolve,
        reject
      });

      console.log(formatLogMessage('info', 'NotificationService', `Created pending request ${requestId}`));
    });
  }

  /**
   * Handle incoming response from app socket
   * This should be called when a response message is received from the app
   */
  handleResponse(requestId: string, response: any): void {
    const pendingRequest = this.pendingRequests.get(requestId);
    if (!pendingRequest) {
      console.warn(formatLogMessage('warn', 'NotificationService', `No pending request found for requestId: ${requestId}`));
      return;
    }

    // Remove from pending requests
    this.pendingRequests.delete(requestId);

    // Resolve the promise
    pendingRequest.resolve(response);
    console.log(formatLogMessage('info', 'NotificationService', `Resolved pending request ${requestId}`));
  }

  /**
   * Handle error for a pending request
   */
  handleRequestError(requestId: string, error: any): void {
    const pendingRequest = this.pendingRequests.get(requestId);
    if (!pendingRequest) {
      console.warn(formatLogMessage('warn', 'NotificationService', `No pending request found for requestId: ${requestId}`));
      return;
    }

    // Remove from pending requests
    this.pendingRequests.delete(requestId);

    // Reject the promise
    pendingRequest.reject(error);
    console.log(formatLogMessage('error', 'NotificationService', `Rejected pending request ${requestId}: ${error}`));
  }

  /**
   * Get count of pending requests (for debugging)
   */
  getPendingRequestCount(): number {
    return this.pendingRequests.size;
  }

  /**
   * Clean up all pending requests (useful for shutdown)
   */
  cleanup(): void {
    for (const [requestId, pendingRequest] of this.pendingRequests) {
      pendingRequest.reject(new Error('NotificationService is shutting down'));
    }
    this.pendingRequests.clear();
    console.log(formatLogMessage('info', 'NotificationService', 'Cleaned up all pending requests'));
  }
}
