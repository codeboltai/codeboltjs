import { ClientConnection, formatLogMessage } from "../../types";

import { UserMessage, BaseApplicationResponse } from "@codebolt/types/sdk";

import { ConnectionManager } from "../../core/connectionManagers/connectionManager";
import { NotificationService } from "../../services/NotificationService";
import { SendMessageToAgent } from "../../agentLib/agentMessaging/sendMessageToAgent";
import { SendMessageToRemote } from "../../communication/handlers/remoteMessaging/sendMessageToRemote";
import { logger } from "../../main/utils/logger";
import {
  ReadFileHandler,
  type ReadFileConfirmation,
} from "../../localAgentRequestFulfilment/readFileHandler";

import {
  WriteFileHandler,
  type WriteFileConfirmation,
} from "../../localAgentRequestFulfilment/writeFileHandler";

import { AgentTypeEnum } from "@/types/cli";

/**
 * Routes messages with explicit workflow visibility
 * Shows the complete message flow and notifications
 */
export class AppMessageRouter {
  private connectionManager: ConnectionManager;
  private sendMessageToAgent: SendMessageToAgent;
  private notificationService: NotificationService;
  private sendMessageToRemote: SendMessageToRemote;
  private readFileHandler: ReadFileHandler;
  private writeFileHandler: WriteFileHandler;

  constructor() {
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToAgent = new SendMessageToAgent();
    this.sendMessageToRemote = new SendMessageToRemote();
    this.notificationService = NotificationService.getInstance();
    this.readFileHandler = new ReadFileHandler();
    this.writeFileHandler = new WriteFileHandler();
  }

  /**
   * Handle responses from apps (responding back to agent requests)
   */
  handleAppResponse(
    app: ClientConnection,
    message: UserMessage | BaseApplicationResponse
  ): void {
    logger.info(
      formatLogMessage(
        "info",
        "MessageRouter",
        `Handling app response: ${message.type} from ${app.id}`
      )
    );

    // Handle confirmation responses
    if (message.type === "confirmationResponse") {
      // Create proper confirmation objects that match the expected interface
      // We need to map the incoming message to the expected format
      const confirmationMessage = {
        type: "confirmationResponse",
        messageId: (message as any).messageId || (message as any).requestId || "",
        userMessage: (message as any).userMessage || (message as any).message || "approve"
      };

      // Route the confirmation to the appropriate handler based on the message content
      // For now, we'll try both handlers as we don't have a way to distinguish between them
      // In a real implementation, we would need to track which handler created the pending request
      this.readFileHandler.handleConfirmation(confirmationMessage as ReadFileConfirmation);
      this.writeFileHandler.handleConfirmation(confirmationMessage as WriteFileConfirmation);
      return;
    }

    if (message.type == "messageResponse") {
      this.handleInitialUserMessage(app, message as UserMessage);
    } else {
      this.sendMessageToAgent.sendResponseToAgent(
        app,
        message as BaseApplicationResponse
      );
    }

    this.sendMessageToRemote.forwardAppMessage(
      app.id,
      message as BaseApplicationResponse
    );
  }

  handleInitialUserMessage(app: ClientConnection, message: UserMessage): void {
    logger.info(
      formatLogMessage(
        "info",
        "MessageRouter",
        `Handling initial user message: ${message.type} from ${app.id}`
      )
    );

    message.message.selectedAgent = {
      "agentDetails": "./../../../agents/geminiAgentTest/dist",
      "agentType": AgentTypeEnum.localPath,
      "id": "cli-agent",
      "name": "Ask Agent"
    };

    this.sendMessageToAgent.sendInitialMessage(message, app.id);
  }
}