import fs from "fs";

import type { ClientConnection } from "../types";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { SendMessageToApp } from "../handlers/appMessaging/sendMessageToApp.js";
import { SendMessageToTui } from "../handlers/tuiMessaging/sendMessageToTui.js";
import { formatLogMessage, isValidFilePath } from "../types/utils";
import { logger } from "../utils/logger";

type NotificationState = "fileWrite" | "fileWriteError" | "rejected";

interface WriteFilePayload {
  path: string;
  content: string;
  originalContent?: string;
  diff?: string;
  language?: string;
  size?: number;
  encoding?: string;
  stateEvent: NotificationState;
}

interface WriteFileResult {
  success: boolean;
  message: string;
  error?: string;
}

export class WriteFileService {
  private static instance: WriteFileService;

  private connectionManager = ConnectionManager.getInstance();
  private sendMessageToRemote = new SendMessageToRemote();
  private sendMessageToApp = new SendMessageToApp();
  private sendMessageToTui = new SendMessageToTui();

  static getInstance(): WriteFileService {
    if (!WriteFileService.instance) {
      WriteFileService.instance = new WriteFileService();
    }

    return WriteFileService.instance;
  }

  async performWrite(
    agent: ClientConnection,
    requestId: string,
    filePath: string,
    content: string,
    context?: { id: string; type: "app" | "tui" }
  ): Promise<void> {
    const result = this.writeFile(filePath, content);

    const message = {
      type: "writeToFileResponse" as const,
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
      type: "writeToFileResponse" as const,
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

  private writeFile(filePath: string, content: string): WriteFileResult {
    if (!isValidFilePath(filePath)) {
      return {
        success: false,
        message: "Invalid file path",
        error: "Invalid file path. Only absolute paths without .. are allowed.",
      };
    }

    try {
      fs.writeFileSync(filePath, content, "utf8");
      return {
        success: true,
        message: "File written successfully",
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      logger.error(
        formatLogMessage(
          "error",
          "WriteFileService",
          `Failed to write file ${filePath}: ${message}`
        )
      );

      return {
        success: false,
        message: "Failed to write file",
        error: message,
      };
    }
  }

  private sendUiNotification(
    agent: ClientConnection,
    context: { id: string; type: "app" | "tui" },
    filePath: string,
    result: WriteFileResult,
    requestId: string
  ): void {
    const state: NotificationState = result.success ? "fileWrite" : "fileWriteError";
    this.sendContextNotification(agent, context, filePath, result, requestId, state);
  }

  private sendContextNotification(
    agent: ClientConnection,
    context: { id: string; type: "app" | "tui" } | undefined,
    filePath: string,
    result: WriteFileResult,
    requestId: string,
    state: NotificationState
  ): void {
    if (!context) {
      return;
    }

    const payload: WriteFilePayload = {
      path: filePath,
      content: result.success ? result.message : result.error ?? result.message,
      stateEvent: state,
    };

    const notification = {
      type: "message" as const,
      actionType: "WRITEFILE" as const,
      templateType: "WRITEFILE" as const,
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
    result: WriteFileResult | WriteFileResult & { message: string; error?: string },
    requestId: string,
    stateOverride?: NotificationState
  ): void {
    const state: NotificationState = stateOverride
      ? stateOverride
      : result.success
      ? "fileWrite"
      : "fileWriteError";

    const payload: WriteFilePayload = {
      path: filePath,
      content: result.success ? result.message : result.error ?? result.message,
      stateEvent: state,
    };

    const message = {
      type: "message" as const,
      actionType: "WRITEFILE" as const,
      templateType: "WRITEFILE" as const,
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
