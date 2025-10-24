import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
// Import FileServices instead of the missing WriteFileService
import { FileServices, createFileServices } from "../services/FileServices";
import { DefaultFileSystem } from "../utils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../utils/DefaultWorkspaceContext";
import { logger } from "../utils/logger";
import { PermissionManager, PermissionUtils } from "./PermissionManager";
import { ApprovalService, NotificationService, ClientResolver, type TargetClient } from "../shared";

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
  targetClient?: TargetClient;
};

export interface WriteFileConfirmation {
  type: "confirmationResponse";
  messageId: string;
  userMessage: string;
}

export class WriteFileHandler {
  private connectionManager = ConnectionManager.getInstance();
  // Use FileServices instead of the missing WriteFileService
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

  async handleWriteFile(agent: ClientConnection, event: WriteFileEvent): Promise<void> {
    const { requestId, message } = event;
    const { relPath, newContent } = message;

    const targetClient = this.clientResolver.resolveParent(agent);

    if (!targetClient) {
      // Use FileServices to write the file instead of the missing performWrite method
      const result = await this.fileServices.writeFile(relPath, newContent);
      this.sendWriteResponse(agent, requestId, relPath, newContent, result);
      return;
    }

    // Check if permission exists using centralized permission system
    if (PermissionUtils.hasPermission('write_file', relPath, 'write')) {
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
      this.approvalService.requestWriteFileApproval({
        agent,
        targetClient,
        messageId,
        requestId,
        filePath: relPath,
        newContent
      });
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
      const response = {
        type: "writeFileResponse",
        requestId,
        success: false,
        message: message.userMessage || "Write file request rejected",
        error: message.userMessage || "Rejected by user",
      };

      this.connectionManager.sendToConnection(agent.id, {
        ...response,
        clientId: agent.id,
      });

      this.notificationService.sendFileWriteRejection({
        agent,
        requestId,
        filePath: payload.relPath,
        reason: message.userMessage || "Write file request rejected",
        targetClient
      });
      return;
    }

    PermissionUtils.grantPermission('write_file', payload.relPath, 'write');
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
      const response = {
        type: "writeFileResponse",
        requestId,
        success: false,
        message: message.reason || "Write file request rejected",
        error: message.reason || "Rejected by user",
      };

      this.connectionManager.sendToConnection(agent.id, {
        ...response,
        clientId: agent.id,
      });

      this.notificationService.sendFileWriteRejection({
        agent,
        requestId,
        filePath: payload.relPath,
        reason: message.reason ?? "Write file request rejected",
        targetClient
      });
      return;
    }

    PermissionUtils.grantPermission('write_file', payload.relPath, 'write');
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

      this.notificationService.sendFileWriteSuccess({
        agent,
        requestId,
        filePath,
        content,
        originalContent: result.originalContent,
        diff: result.diff,
        targetClient
      });
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

}
