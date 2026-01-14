import type { ClientConnection } from "../../types";
import type { TargetClient } from "../../shared/utils/ClientResolver";
import { BaseNotificationService } from "./BaseNotificationService";
import type {
  LlmRequestNotification,
  LlmResponseNotification
} from "@codebolt/types/wstypes/agent-to-app-ws/notification/llmNotificationSchemas";

/**
 * Service for handling AI/LLM notifications
 */
export class AiNotificationService extends BaseNotificationService {
  /**
   * Send Ai Request Notification
   */
  sendAiRequestNotification(params: {
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

    const notification: LlmRequestNotification = {
      action: "inferenceRequest",
      data: {
        messages: [],
        prompt: message
      },
      type: "llmnotify",
      messageId: messageId,
      requestId: requestId,
      toolUseId: requestId,
      threadId: threadId,
      agentId: agentId,
      agentInstanceId: agentInstanceId,
      parentAgentInstanceId: parentAgentInstanceId,
      parentId: parentId
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send Ai Request Error Notification
   */
  sendAiRequestErrorNotification(params: {
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

    const notification: LlmResponseNotification = {
      action: "inferenceResult",
      content: message,
      messageId: messageId,
      type: "llmnotify",
      requestId: requestId,
      toolUseId: requestId,
      threadId: threadId,
      agentId: agentId,
      agentInstanceId: agentInstanceId,
      parentAgentInstanceId: parentAgentInstanceId,
      parentId: parentId,
      isError: true
    };

    this.notifyClients(agent, notification, targetClient);
  }

  /**
   * Send Ai Request Success Notification
   */
  sendAiRequestSuccessNotification(params: {
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

    const notification: LlmResponseNotification = {
      action: "inferenceResult",
      content: message,
      type: "llmnotify",
      requestId: requestId,
      messageId: messageId,
      toolUseId: requestId,
      threadId: threadId,
      agentId: agentId,
      agentInstanceId: agentInstanceId,
      parentAgentInstanceId: parentAgentInstanceId,
      parentId: parentId,
      isError: false
    };

    this.notifyClients(agent, notification, targetClient);
  }
}
