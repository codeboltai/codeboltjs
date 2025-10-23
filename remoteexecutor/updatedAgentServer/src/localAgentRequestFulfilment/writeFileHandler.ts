import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
// Import FileServices instead of the missing WriteFileService
import { FileServices, createFileServices } from "../services/FileServices";
import { DefaultFileSystem } from "../utils/fsutils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../utils/fsutils/DefaultWorkspaceContext";
import { logger } from "../utils/logger";

import type {
  FileWriteConfirmation,
  FileWriteSuccess,
} from "@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas";

export interface WriteFileEvent {
  type: "fsEvent";
  action: "writeToFile";
  requestId: string;
  message: {
    relPath: string;
    newContent: string;
  };
}

type PendingRequest = {
  agent: ClientConnection;
  request: WriteFileEvent;
  targetClient?: { id: string; type: "app" | "tui" };
};

export interface WriteFileConfirmation {
  type: "confirmationResponse";
  messageId: string;
  userMessage: string;
}

export class WriteFileHandler {
  private connectionManager = ConnectionManager.getInstance();
  private sendMessageToRemote = new SendMessageToRemote();
  // Use FileServices instead of the missing WriteFileService
  private fileServices: FileServices;

  private pendingRequests = new Map<string, PendingRequest>();
  private grantedPermissions = new Set<string>();

  constructor() {
    // Initialize FileServices with default configuration
    const config = {
      targetDir: process.cwd(), // Use current working directory as target
      workspaceContext: new DefaultWorkspaceContext(),
      fileSystemService: new DefaultFileSystem(),
    };
    this.fileServices = createFileServices(config);
  }

  async handleWriteFile(agent: ClientConnection, event: WriteFileEvent): Promise<void> {
    const { requestId, message } = event;
    const { relPath, newContent } = message;

    const targetClient = this.resolveParent(agent);

    if (!targetClient) {
      // Use FileServices to write the file instead of the missing performWrite method
      const result = await this.fileServices.writeFile(relPath, newContent);
      this.sendWriteResponse(agent, requestId, relPath, newContent, result);
      return;
    }

    if (this.hasPermission(agent.id, relPath)) {
      // Use FileServices to write the file instead of the missing performWrite method
      const result = await this.fileServices.writeFile(relPath, newContent);
      this.sendWriteResponse(agent, requestId, relPath, newContent, result);
      return;
    }

    const messageId = uuidv4();

    this.pendingRequests.set(messageId, {
      agent,
      request: event,
      targetClient,
    });

    if (targetClient) {
      this.requestApproval(agent, targetClient, messageId, relPath, newContent, requestId);
    } else {
      logger.warn("No target client found for approval request");
    }
  }

  async handleConfirmation(message: WriteFileConfirmation): Promise<void> {
    const record = this.pendingRequests.get(message.messageId);

    if (!record) {
      logger.warn(
        formatLogMessage(
          "warn",
          "WriteFileHandler",
          `No pending write file request for ${message.messageId}`
        )
      );
      return;
    }

    this.pendingRequests.delete(message.messageId);

    const { agent, request, targetClient } = record;
    const { requestId, message: payload } = request;

    if (message.userMessage?.toLowerCase() !== "approve") {
      this.sendRejection(
        agent,
        requestId,
        payload.relPath,
        message.userMessage || "Write file request rejected",
        targetClient
      );
      return;
    }

    this.grantPermission(agent.id, payload.relPath);
    // Use FileServices to write the file instead of the missing performWrite method
    const result = await this.fileServices.writeFile(payload.relPath, payload.newContent);
    this.sendWriteResponse(agent, requestId, payload.relPath, payload.newContent, result);
  }

  handleRemoteNotification(message: {
    messageId: string;
    type: string;
    state?: string;
    reason?: string;
  }): void {
    if (message.type !== "writeFileApproval") {
      return;
    }

    const record = this.pendingRequests.get(message.messageId);
    if (!record) {
      return;
    }

    this.pendingRequests.delete(message.messageId);

    const { agent, request, targetClient } = record;
    const { requestId, message: payload } = request;

    if (message.state !== "approved") {
      this.sendRejection(
        agent,
        requestId,
        payload.relPath,
        message.reason ?? "Write file request rejected",
        targetClient
      );
      return;
    }

    this.grantPermission(agent.id, payload.relPath);
    // Use FileServices to write the file instead of the missing performWrite method
    this.fileServices.writeFile(payload.relPath, payload.newContent).then(result => {
      this.sendWriteResponse(agent, requestId, payload.relPath, payload.newContent, result);
    }).catch(error => {
      logger.error("Error writing file:", error);
    });
  }

  // New method to send write response
  private sendWriteResponse(
    agent: ClientConnection,
    requestId: string,
    filePath: string,
    content: string,
    result: any
  ): void {
    if (result.success) {
      // Send success response
      const response = {
        type: "writeFileResponse",
        requestId,
        success: true,
        originalContent: result.originalContent,
        newContent: result.newContent,
        diff: result.diff,
        isNewFile: result.isNewFile,
      };

      this.connectionManager.sendToConnection(agent.id, {
        ...response,
        clientId: agent.id,
      });

      this.sendApprovalNotification(agent, requestId, filePath, content);
    } else {
      // Send error response
      const response = {
        type: "writeFileResponse",
        requestId,
        success: false,
        message: result.error || "Error writing file",
        error: result.error || "Error writing file",
      };

      this.connectionManager.sendToConnection(agent.id, {
        ...response,
        clientId: agent.id,
      });
    }
  }

  private resolveParent(
    agent: ClientConnection
  ): { id: string; type: "app" | "tui" } | undefined {
    const agentManager = this.connectionManager.getAgentConnectionManager();
    const appManager = this.connectionManager.getAppConnectionManager();
    const tuiManager = this.connectionManager.getTuiConnectionManager();

    const parentId = agentManager.getParentByAgent(agent.id);
    if (!parentId) {
      return undefined;
    }

    if (appManager.getApp(parentId)) {
      return { id: parentId, type: "app" };
    }

    if (tuiManager.getTui(parentId)) {
      return { id: parentId, type: "tui" };
    }

    return undefined;
  }

  private requestApproval(
    agent: ClientConnection,
    targetClient: { id: string; type: "app" | "tui" },
    messageId: string,
    filePath: string,
    newContent: string,
    requestId: string
  ): void {
    const payload: FileWriteConfirmation = {
      type: "message" as const,
      actionType: "WRITEFILE" as const,
      templateType: "WRITEFILE" as const,
      sender: "agent" as const,
      messageId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "file" as const,
        path: filePath,
        content: newContent,
        originalContent: "",
        stateEvent: "askForConfirmation" as const,
      },
    };

    if (targetClient.type === "app") {
      this.connectionManager.getAppConnectionManager().sendToApp(targetClient.id, payload);
    } else {
      this.connectionManager.getTuiConnectionManager().sendToTui(targetClient.id, payload);
    }

    this.sendMessageToRemote.forwardAgentMessage(agent, payload);

    logger.info(
      formatLogMessage(
        "info",
        "WriteFileHandler",
        `Requested approval for writing file ${filePath}`
      )
    );
  }

  private sendRejection(
    agent: ClientConnection,
    requestId: string,
    filePath: string,
    userMessage: string,
    targetClient: { id: string; type: "app" | "tui" } | undefined
  ): void {
    const response = {
      type: "writeFileResponse",
      requestId,
      success: false,
      message: userMessage || "Write file request rejected",
      error: userMessage || "Rejected by user",
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    const notification: FileWriteSuccess = {
      type: "message" as const,
      actionType: "WRITEFILE" as const,
      templateType: "WRITEFILE" as const,
      sender: "agent" as const,
      messageId: requestId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "file" as const,
        path: filePath,
        content: userMessage || "Rejected",
        stateEvent: "fileWrite" as const,
      },
    };

    const appManager = this.connectionManager.getAppConnectionManager();
    const tuiManager = this.connectionManager.getTuiConnectionManager();

    if (!targetClient) {
      appManager.broadcast(notification);
      tuiManager.broadcast(notification);
    } else if (targetClient?.type === "app") {
      appManager.sendToApp(targetClient.id, notification);
    } else if (targetClient?.type === "tui") {
      tuiManager.sendToTui(targetClient.id, notification);
    }

    this.sendMessageToRemote.forwardAgentMessage(agent, notification);
  }

  private hasPermission(agentId: string, filePath: string): boolean {
    return this.grantedPermissions.has(this.permissionKey(agentId, filePath));
  }

  private grantPermission(agentId: string, filePath: string): void {
    this.grantedPermissions.add(this.permissionKey(agentId, filePath));
  }

  private permissionKey(agentId: string, filePath: string): string {
    return `${agentId}:${filePath}`;
  }

  sendApprovalNotification(
    agent: ClientConnection,
    requestId: string,
    filePath: string,
    content: string,
    targetClient?: { id: string; type: "app" | "tui" }
  ): void {
    const notification: FileWriteSuccess = {
      type: "message" as const,
      actionType: "WRITEFILE" as const,
      templateType: "WRITEFILE" as const,
      sender: "agent" as const,
      messageId: requestId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "file" as const,
        path: filePath,
        content,
        stateEvent: "fileWrite" as const,
      },
    };

    const appManager = this.connectionManager.getAppConnectionManager();
    const tuiManager = this.connectionManager.getTuiConnectionManager();

    if (!targetClient) {
      appManager.broadcast(notification);
      tuiManager.broadcast(notification);
    } else if (targetClient.type === "app") {
      appManager.sendToApp(targetClient.id, notification);
    } else {
      tuiManager.sendToTui(targetClient.id, notification);
    }

    this.sendMessageToRemote.forwardAgentMessage(agent, notification);
  }
}