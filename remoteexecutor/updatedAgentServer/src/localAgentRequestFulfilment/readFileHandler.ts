import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { FileServices, createFileServices } from "../services/FileServices";
import { DefaultFileSystem } from "../utils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../utils/DefaultWorkspaceContext";
import { logger } from "../utils/logger";
import { PermissionManager, PermissionUtils } from "./PermissionManager";
import { ApprovalService, NotificationService, ClientResolver, type TargetClient } from "../shared";

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
  targetClient?: TargetClient;
};

export interface ReadFileConfirmation {
  type: "confirmationResponse";
  messageId: string;
  userMessage: string;
}

export class ReadFileHandler {
  private connectionManager = ConnectionManager.getInstance();
  private fileServices: FileServices;
  private permissionManager: PermissionManager;
  private approvalService = new ApprovalService();
  private notificationService = new NotificationService();
  private clientResolver = new ClientResolver();

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

    const targetClient = this.clientResolver.resolveParent(agent);

    if (!targetClient) {
      // Use FileServices to read the file instead of the missing performRead method
      const result = await this.fileServices.readFile(relPath, { offset, limit });
      this.sendReadResponse(agent, requestId, relPath, result, targetClient);
      return;
    }

    // Check if permission exists using centralized permission system
    if (PermissionUtils.hasPermission('read_file', relPath, 'read')) {
      // Use FileServices to read the file instead of the missing performRead method
      const result = await this.fileServices.readFile(relPath, { offset, limit });
      this.sendReadResponse(agent, requestId, relPath, result, targetClient);
      return;
    }

    const messageId = uuidv4();

    this.pendingRequests.set(messageId, {
      agent,
      request: event,
      targetClient,
    });

    if (targetClient) {
      this.approvalService.requestReadFileApproval({
        agent,
        targetClient,
        messageId,
        requestId,
        filePath: relPath,
        offset,
        limit
      });
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
      const response = {
        type: "readFileResponse",
        requestId,
        success: false,
        message: message.userMessage || "Read file request rejected",
        error: message.userMessage || "Rejected by user",
      };

      this.connectionManager.sendToConnection(agent.id, {
        ...response,
        clientId: agent.id,
      });

      this.notificationService.sendFileReadSuccess({
        agent,
        requestId,
        filePath: payload.relPath,
        content: message.userMessage || "Rejected",
        targetClient
      });
      return;
    }

    PermissionUtils.grantPermission('read_file', payload.relPath, 'read');
    // Use FileServices to read the file instead of the missing performRead method
    const result = await this.fileServices.readFile(payload.relPath, { 
      offset: payload.offset, 
      limit: payload.limit 
    });
    this.sendReadResponse(agent, requestId, payload.relPath, result, targetClient);
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
      const response = {
        type: "readFileResponse",
        requestId,
        success: false,
        message: message.reason || "Read file request rejected",
        error: message.reason || "Rejected by user",
      };

      this.connectionManager.sendToConnection(agent.id, {
        ...response,
        clientId: agent.id,
      });

      this.notificationService.sendFileReadSuccess({
        agent,
        requestId,
        filePath: payload.relPath,
        content: message.reason ?? "Rejected",
        targetClient
      });
      return;
    }

    PermissionUtils.grantPermission('read_file', payload.relPath, 'read');
    // Use FileServices to read the file instead of the missing performRead method
    this.fileServices.readFile(payload.relPath, { 
      offset: payload.offset, 
      limit: payload.limit 
    }).then(result => {
      this.sendReadResponse(agent, requestId, payload.relPath, result, targetClient);
    }).catch(error => {
      logger.error("Error reading file:", error);
    });
  }

  // New method to send read response
  private sendReadResponse(
    agent: ClientConnection,
    requestId: string,
    filePath: string,
    result: any,
    targetClient?: TargetClient
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

      this.notificationService.sendFileReadSuccess({
        agent,
        requestId,
        filePath,
        content: result.content || "",
        targetClient
      });
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

}
