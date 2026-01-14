import type { ClientConnection } from "../../types";
import type { TargetClient } from "../../shared/utils/ClientResolver";
import { BaseNotificationService } from "./BaseNotificationService";
import type {
  UserMessageRequestNotification
} from "@codebolt/types/wstypes/agent-to-app-ws/notification/chatNotificationSchemas";
import type {
  WriteTodosRequestNotification,
  WriteTodosResponseNotification
} from '@codebolt/types/wstypes/agent-to-app-ws/notification/writeTodosNotificationSchemas';

/**
 * Service for handling chat and todos notifications
 */
export class ChatNotificationService extends BaseNotificationService {
  /**
   * Send chat message notification
   */
  sendChatMessageNotification(params: {
    agent: ClientConnection;
    messageId: string;
    agentId: string;
    threadId: string;
    agentInstanceId: string;
    parentAgentInstanceId: string;
    message: string;
    parentId: string;
    requestId: string;
    targetClient?: TargetClient;
  }): void {
    const { agent,
      messageId,
      agentId,
      threadId,
      agentInstanceId,
      parentAgentInstanceId,
      message,
      parentId,
      requestId,
      targetClient } = params;

    const notification: UserMessageRequestNotification = {
      action: "sendMessageRequest",
      data: {
        message: message,
        payload: {
          text: message
        }
      },
      type: "chatnotify",
      requestId: requestId,
      toolUseId: messageId,
      threadId: threadId,
      agentId: agentId,
      agentInstanceId: agentInstanceId,
      parentAgentInstanceId: parentAgentInstanceId,
      parentId: parentId
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send write todos request notification
   */
  sendWriteTodosRequest(params: {
    agent: ClientConnection;
    requestId: string;
    todos: Array<{
      id: string;
      title: string;
      status: string;
      priority?: string;
      tags?: string[];
    }>;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, todos, targetClient } = params;

    const notification: WriteTodosRequestNotification = {
      action: "writeTodosRequest",
      data: {
        todos: todos.map(todo => ({
          id: todo.id,
          title: todo.title,
          status: todo.status,
          priority: todo.priority,
          tags: todo.tags
        }))
      },
      type: "writetodosnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: agent.threadId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send write todos response notification
   */
  sendWriteTodosResponse(params: {
    agent: ClientConnection;
    requestId: string;
    content: string | any;
    isError?: boolean;
    targetClient?: TargetClient;
  }): void {
    const { agent, requestId, content, isError, targetClient } = params;

    const notification: WriteTodosResponseNotification = {
      action: "writeTodosResult",
      content: content,
      type: "writetodosnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: agent.threadId,
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      isError: isError || false
    };

    this.notifyClients(agent, notification, targetClient);
  }
}
