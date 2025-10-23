import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
// Import FileServices instead of the missing ReadFileService
import { FileServices, createFileServices } from "../services/FileServices";
import { DefaultFileSystem } from "../utils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../utils/DefaultWorkspaceContext";
import { logger } from "../utils/logger";
import { PermissionManager, PermissionUtils } from "./PermissionManager";

import type {
  FileReadConfirmation,
  FileReadSuccess,
} from "@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas";
import { WriteFileConfirmation } from "./writeFileHandler";

export interface ReadFileEvent {
  type: "fsEvent";
  action: "readFile";
  requestId: string;
  message: {
    relPath: string;
    offset?: number;
    limit?: number;
  };
}

type PendingRequest = {
  agent: ClientConnection;
  request: ReadFileEvent;
  targetClient?: { id: string; type: "app" | "tui" };
};

export interface ReadFileConfirmation {
  type: "confirmationResponse";
  messageId: string;
  userMessage: string;
}

export class ReadFileHandler {
  private connectionManager = ConnectionManager.getInstance();
  private sendMessageToRemote = new SendMessageToRemote();
  // Use FileServices instead of the missing ReadFileService
  private fileServices: FileServices;
  private permissionManager: PermissionManager;

  private pendingRequests = new Map<string, PendingRequest>();

  constructor() {
    // Initialize FileServices with default configuration
    const config = {
      targetDir: process.cwd(), // Use current working directory as target
      workspaceContext: new DefaultWorkspaceContext(),
      fileSystemService: new DefaultFileSystem(),
    };
    this.fileServices = createFileServices(config);
    
    // Initialize PermissionManager
    this.permissionManager = PermissionManager.getInstance();
    this.permissionManager.initialize();
  }

  async handleReadFile(agent: ClientConnection, event: ReadFileEvent): Promise<void> {
    const { requestId, message } = event;
    const { relPath, offset, limit } = message;

    const targetClient = this.resolveParent(agent);

    if (!targetClient) {
      // Use FileServices to read the file instead of the missing performRead method
      const result = await this.fileServices.readFile(relPath, { offset, limit });
      this.sendReadResponse(agent, requestId, relPath, result);
      return;
    }

    // Check if permission exists using centralized permission system
    if (PermissionUtils.hasPermission('read_file', relPath, 'read')) {
      // Use FileServices to read the file instead of the missing performRead method
      const result = await this.fileServices.readFile(relPath, { offset, limit });
      this.sendReadResponse(agent, requestId, relPath, result);
      return;
    }

    const messageId = uuidv4();

    this.pendingRequests.set(messageId, {
      agent,
      request: event,
      targetClient,
    });

    if (targetClient) {
      this.requestApproval(agent, targetClient, messageId, relPath, requestId, offset, limit);
    } else {
      logger.warn("No target client found for approval request");
    }
  }

  async handleConfirmation(message: ReadFileConfirmation|WriteFileConfirmation): Promise<void> {
    const record = this.pendingRequests.get(message.messageId);

    if (!record) {
      logger.warn(
        formatLogMessage(
          "warn",
          "ReadFileHandler",
          `No pending read file request for ${message.messageId}`
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
        message.userMessage || "Read file request rejected",
        targetClient
      );
      return;
    }

    PermissionUtils.grantPermission('read_file', payload.relPath, 'read');
    // Use FileServices to read the file instead of the missing performRead method
    const result = await this.fileServices.readFile(payload.relPath, { 
      offset: payload.offset, 
      limit: payload.limit 
    });
    this.sendReadResponse(agent, requestId, payload.relPath, result);
  }

  handleRemoteNotification(message: {
    messageId: string;
    type: string;
    state?: string;
    reason?: string;
  }): void {
    if (message.type !== "readFileApproval") {
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
        message.reason ?? "Read file request rejected",
        targetClient
      );
      return;
    }

    PermissionUtils.grantPermission('read_file', payload.relPath, 'read');
    // Use FileServices to read the file instead of the missing performRead method
    this.fileServices.readFile(payload.relPath, { 
      offset: payload.offset, 
      limit: payload.limit 
    }).then(result => {
      this.sendReadResponse(agent, requestId, payload.relPath, result);
    }).catch(error => {
      logger.error("Error reading file:", error);
    });
  }

  // New method to send read response
  private sendReadResponse(
    agent: ClientConnection,
    requestId: string,
    filePath: string,
    result: any
  ): void {
    if (result.success) {
      // Send success response
      const response = {
        type: "readFileResponse",
        requestId,
        success: true,
        content: result.content,
        isTruncated: result.isTruncated,
        linesShown: result.linesShown,
        originalLineCount: result.originalLineCount,
      };

      this.connectionManager.sendToConnection(agent.id, {
        ...response,
        clientId: agent.id,
      });

      this.sendApprovalNotification(agent, requestId, filePath, result.content);
    } else {
      // Send error response
      const response = {
        type: "readFileResponse",
        requestId,
        success: false,
        message: result.error || "Error reading file",
        error: result.error || "Error reading file",
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
    requestId: string,
    offset?: number,
    limit?: number
  ): void {
    const payload: FileReadConfirmation = {
      type: "message" as const,
      actionType: "READFILE" as const,
      templateType: "READFILE" as const,
      sender: "agent" as const,
      messageId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "file" as const,
        path: filePath,
        offset,
        limit,
        content: "",
        stateEvent: "ASK_FOR_CONFIRMATION" as const,
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
        "ReadFileHandler",
        `Requested approval for reading file ${filePath}`
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
      type: "readFileResponse",
      requestId,
      success: false,
      message: userMessage || "Read file request rejected",
      error: userMessage || "Rejected by user",
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    const notification: FileReadSuccess = {
      type: "message" as const,
      actionType: "READFILE" as const,
      templateType: "READFILE" as const,
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
        stateEvent: "FILE_READ" as const,
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

  sendApprovalNotification(
    agent: ClientConnection,
    requestId: string,
    filePath: string,
    content: string,
    targetClient?: { id: string; type: "app" | "tui" }
  ): void {
    const notification: FileReadSuccess = {
      type: "message" as const,
      actionType: "READFILE" as const,
      templateType: "READFILE" as const,
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
        stateEvent: "FILE_READ" as const,
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