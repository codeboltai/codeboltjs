import fs from "fs";

import type { ClientConnection } from "../types";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { SendMessageToApp } from "../handlers/appMessaging/sendMessageToApp.js";
import { SendMessageToTui } from "../handlers/tuiMessaging/sendMessageToTui.js";
import { formatLogMessage, isValidFilePath } from "../types/utils";
import { logger } from "../utils/logger";

type NotificationState = "fileDelete" | "fileDeleteError" | "rejected";

interface DeleteFileResult {
  success: boolean;
  message: string;
  error?: string;
}

interface DeleteFilePayload {
  path: string;
  content: string;
  originalContent?: string;
  diff?: string;
  language?: string;
  size?: number;
  encoding?: string;
  stateEvent: NotificationState;
}

export class DeleteFile {
  private static instance: DeleteFile;

  private connectionManager = ConnectionManager.getInstance();

  private sendMessageToRemote = new SendMessageToRemote();

  private sendMessageToApp = new SendMessageToApp();

  private sendMessageToTui = new SendMessageToTui();

  static getInstance(): DeleteFile {
    if (!DeleteFile.instance) {
      DeleteFile.instance = new DeleteFile();
    }

    return DeleteFile.instance;
  }

  async performDelete(
    agent: ClientConnection,
    requestId: string,
    filePath: string,
    context?: { id: string; type: "app" | "tui" }
  ): Promise<void> {
    const result = this.deleteFile(filePath);

    const message = {
      type: "deleteFileResponse" as const,
      requestId,
      success: result.success,
      message: result.message,
      error: result.error,
      data: {
        path: filePath,
      },
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...message,
      clientId: agent.id,
    });

    if (context) {
      this.sendUiNotification(agent, context, filePath, result, requestId);
    }

    this.sendRemoteNotification(agent, filePath, result, requestId);
  }

  sendRejection(
    agent: ClientConnection,
    requestId: string,
    filePath: string,
    reason: string,
    context?: { id: string; type: "app" | "tui" }
  ): void {
    const response = {
      type: "deleteFileResponse" as const,
      requestId,
      success: false,
      message: reason,
      error: reason,
      data: {
        path: filePath,
      },
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    this.sendContextNotification(
      agent,
      context,
      filePath,
      {
        success: false,
        message: reason,
        error: reason,
      },
      requestId,
      "rejected"
    );

    this.sendRemoteNotification(agent, filePath, response, requestId, "rejected");
  }

  private deleteFile(filePath: string): DeleteFileResult {
    if (!isValidFilePath(filePath)) {
      return {
        success: false,
        message: "Invalid file path",
        error: "Invalid file path. Only absolute paths without .. are allowed.",
      };
    }

    try {
      if (!fs.existsSync(filePath)) {
        return {
          success: false,
          message: "File does not exist",
          error: "File not found",
        };
      }

      fs.unlinkSync(filePath);
      return {
        success: true,
        message: "File deleted successfully",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(
        formatLogMessage(
          "error",
          "DeleteFile",
          `Failed to delete file ${filePath}: ${message}`
        )
      );

      return {
        success: false,
        message: "Failed to delete file",
        error: message,
      };
    }
  }

  private sendUiNotification(
    agent: ClientConnection,
    context: { id: string; type: "app" | "tui" },
    filePath: string,
    result: DeleteFileResult,
    requestId: string
  ): void {
    const state: NotificationState = result.success ? "fileDelete" : "fileDeleteError";
    this.sendContextNotification(agent, context, filePath, result, requestId, state);
  }

  private sendContextNotification(
    agent: ClientConnection,
    context: { id: string; type: "app" | "tui" } | undefined,
    filePath: string,
    result: DeleteFileResult,
    requestId: string,
    state: NotificationState
  ): void {
    if (!context) {
      return;
    }

    const payload: DeleteFilePayload = {
      path: filePath,
      content: result.success ? result.message : result.error ?? result.message,
      stateEvent: state,
    };

    const notification = {
      type: "message" as const,
      actionType: "DELETEFILE" as const,
      templateType: "DELETEFILE" as const,
      sender: "agent" as const,
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
    result: DeleteFileResult | (DeleteFileResult & { message: string; error?: string }),
    requestId: string,
    stateOverride?: NotificationState
  ): void {
    const state: NotificationState = stateOverride
      ? stateOverride
      : result.success
      ? "fileDelete"
      : "fileDeleteError";

    const payload: DeleteFilePayload = {
      path: filePath,
      content: result.success ? result.message : result.error ?? result.message,
      stateEvent: state,
    };

    const message = {
      type: "message" as const,
      actionType: "DELETEFILE" as const,
      templateType: "DELETEFILE" as const,
      sender: "agent" as const,
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
