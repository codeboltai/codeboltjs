import {
  ClientConnection,
  formatLogMessage
} from '../types';
import { NotificationService } from '../services/NotificationService';
import type { ChatEvent, ChatNotification } from '@codebolt/types/agent-to-app-ws-types';
import type { 
  ChatNotificationBase,
  UserMessageRequestNotification,
  AgentTextResponseNotification
} from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../core/connectionManagers/connectionManager';
import { SendMessageToApp } from '../handlers/appMessaging/sendMessageToApp';

/**
 * Handles chat events with notifications
 */
export class ChatHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;
  private sendMessageToApp: SendMessageToApp;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToApp = new SendMessageToApp();
  }

  /**
   * Handle chat events with proper typing
   */
  handleChatEvent(agent: ClientConnection, chatEvent: ChatEvent): void {
    const { requestId } = chatEvent;
    const eventAction = chatEvent.type || 'unknown';
    console.log(formatLogMessage('info', 'ChatHandler', `Handling chat event: ${eventAction} from ${agent.id}`));
    
    // Handle specific chat event types
    switch (eventAction) {
      case 'sendMessage':
        // For sendMessage events, create a user message request notification
        const messageData = (chatEvent as any).data;
        this.notificationService.sendUserMessageRequest(
          agent.id, 
          requestId, 
          messageData?.message || '', 
          messageData
        );
        break;
        
      default:
        // For other events, create a generic chat notification with proper typing
        const requestNotification = {
          requestId: requestId,
          toolUseId: requestId,
          type: 'chatnotify' as const,
          action: 'sendMessageRequest' as const, // Use a valid action type
          agentId: agent.id,
          data: {
            message: `${eventAction}Request`,
            payload: chatEvent
          }
        };

        this.notificationService.sendChatNotification(agent.id, requestNotification);
        break;
    }

    console.log(formatLogMessage('info', 'ChatHandler', `Sent chat request notification: ${eventAction}`));

    // Forward to app for processing
    this.sendMessageToApp.forwardToApp(agent, chatEvent as any);
  }

  /**
   * Send agent text response notification
   */
  sendAgentResponse(agentId: string, requestId: string, message: string, conversationId?: string): void {
    console.log(formatLogMessage('info', 'ChatHandler', `Sending agent text response from ${agentId}`));
    this.notificationService.sendAgentTextResponse(agentId, requestId, message, conversationId);
  }

  /**
   * Send user message request notification
   */
  sendUserMessageRequest(agentId: string, requestId: string, message: string, payload?: any): void {
    console.log(formatLogMessage('info', 'ChatHandler', `Sending user message request to ${agentId}`));
    this.notificationService.sendUserMessageRequest(agentId, requestId, message, payload);
  }

  /**
   * Example usage of different chat notification types
   */
  exampleUsage(agentId: string): void {
    const requestId = 'example-request-' + Date.now();
    const conversationId = 'conv-123';

    // Send a user message request
    this.sendUserMessageRequest(agentId, requestId, "Hello, can you help me?", { context: "demo" });

    // Send an agent text response
    this.sendAgentResponse(agentId, requestId, "Sure! I'd be happy to help you.", conversationId);

    // Send a generic chat notification
    const customNotification: ChatNotification = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'chatnotify' as const,
      action: 'getChatHistoryRequest' as const,
      agentId: agentId,
      data: {
        sessionId: conversationId
      }
    };
    this.notificationService.sendChatNotification(agentId, customNotification);
  }
}
