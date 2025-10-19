import fs from "fs";

import type { ClientConnection } from "../types";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { SendMessageToApp } from "../handlers/appMessaging/sendMessageToApp.js";
import { SendMessageToTui } from "../handlers/tuiMessaging/sendMessageToTui.js";
import { formatLogMessage, isValidFilePath } from "../types/utils";
import { NotificationService } from "./NotificationService"
import { logger } from "../utils/logger";
import type { FileReadResponseNotification } from "@codebolt/types/wstypes/agent-to-app-ws/notification/fsNotificationSchemas";

interface ReadFileResult {
  success: boolean;
  content?: string;
  error?: string;
}

interface ReadFilePayload {
  path: string;
  content: string;
  originalContent?: string;
  diff?: string;
  language?: string;
  size?: number;
  encoding?: string;
  stateEvent: "FILE_READ" | "FILE_READ_ERROR";
}

export class ReadFileService {
  private static instance: ReadFileService;

  private connectionManager = ConnectionManager.getInstance();
  private sendMessageToRemote = new SendMessageToRemote();
  private sendMessageToApp = new SendMessageToApp();
  private sendMessageToTui = new SendMessageToTui();
  private notificationService = NotificationService.getInstance();

  static getInstance(): ReadFileService {
    if (!ReadFileService.instance) {
      ReadFileService.instance = new ReadFileService();
    }

    return ReadFileService.instance;
  }

  async performRead(
    agent: ClientConnection,
    requestId: string,
    filePath: string,
    context?: { id: string; type: "app" | "tui" }
  ): Promise<void> {
    const result = this.readFile(filePath);
    const agentMessage = this.buildAgentResponse(requestId, result, filePath);

    this.connectionManager.sendToConnection(agent.id, {
      ...agentMessage,
      clientId: agent.id,
    });

    if (context) {
      this.sendUiNotification(agent, context, filePath, result, requestId);
    }
    
    // Create proper notification object with required toolUseId
    const notificationMessage: FileReadResponseNotification = {
      toolUseId: requestId,
      type: "fsnotify",
      action: "readFileResult",
      data: {
        filePath: filePath,
        content: result.content ?? ""
      },
      isError: !result.success,
      requestId: requestId,
      threadId: agent.threadId,
      agentId:agent.id,
      agentInstanceId:agent.instanceId || agent.id
    };
    
    this.notificationService.notifyFileOperation(notificationMessage);
    this.sendRemoteNotification(agent, filePath, result, requestId);
  }

  private readFile(filePath: string): ReadFileResult {
    if (!isValidFilePath(filePath)) {
      return {
        success: false,
        error: "Invalid file path. Only absolute paths without .. are allowed.",
      };
    }

    try {
      const content = fs.readFileSync(filePath, "utf8");

      return {
        success: true,
        content,
      };
    } catch (error) {
      logger.error(
        formatLogMessage(
          "error",
          "ReadFileService",
          `Failed to read file ${filePath}: ${String(error)}`
        )
      );

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  private buildAgentResponse(
    requestId: string,
    result: ReadFileResult,
    filePath: string
  ) {
    return {
      type: "readFileResponse",
      requestId,
      success: result.success,
      content: result.content,
      message: result.success
        ? "File read successfully"
        : "Failed to read file",
      error: result.error,
      data: {
        path: filePath,
      },
    };
  }

  private sendUiNotification(
    agent: ClientConnection,
    context: { id: string; type: "app" | "tui" },
    filePath: string,
    result: ReadFileResult,
    requestId: string
  ): void {
    const payload: ReadFilePayload = result.success
      ? {
        path: filePath,
        content: result.content ?? "",
        stateEvent: "FILE_READ",
      }
      : {
        path: filePath,
        content: result.error ?? "Failed to read file",
        stateEvent: "FILE_READ_ERROR",
      };

    const notification = {
      type: "message",
      actionType: "READFILE",
      templateType: "READFILE",
      sender: "agent",
      messageId: requestId,
      threadId: requestId,
      timestamp: Date.now(),
      payload,
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
    };

    if (context.type === "app") {
      this.sendMessageToApp.forwardToApp(agent, notification as any);
    } else {
      this.sendMessageToTui.sendToTui(context.id, notification);
    }
  }

  private sendRemoteNotification(
    agent: ClientConnection,
    filePath: string,
    result: ReadFileResult,
    requestId: string
  ): void {
    const payload: ReadFilePayload = result.success
      ? {
        path: filePath,
        content: result.content ?? "",
        stateEvent: "FILE_READ",
      }
      : {
        path: filePath,
        content: result.error ?? "Failed to read file",
        stateEvent: "FILE_READ_ERROR",
      };

    const message = {
      type: "message",
      actionType: "READFILE",
      templateType: "READFILE",
      sender: "agent",
      messageId: requestId,
      threadId: requestId,
      timestamp: Date.now(),
      payload,
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
    };

    this.sendMessageToRemote.forwardAgentMessage(agent, message as any);
  }
}
