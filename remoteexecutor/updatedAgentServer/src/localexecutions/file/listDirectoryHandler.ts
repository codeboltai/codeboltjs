import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../../types";
import { formatLogMessage } from "../../types/utils";
import { ConnectionManager } from "../../main/core/connectionManagers/connectionManager.js";
import { FileServices, createFileServices } from "../../main/services/FileServices";
import { DefaultFileSystem } from "../../utils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../../utils/DefaultWorkspaceContext";
import { logger } from "../../main/utils/logger";
import { PermissionManager, PermissionUtils } from "../PermissionManager";
import { ApprovalService, NotificationService, ClientResolver, type TargetClient } from "../../shared";

import {
  FolderReadConfirmation,
  FolderReadSuccess,
  FolderReadError,
  FolderReadRejected,
} from "@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas";

export interface ListDirectoryEvent {
  type: "fsEvent";
  action: "listDirectory";
  requestId: string;
  message: {
    path: string;
  };
}

type PendingRequest = {
  agent: ClientConnection;
  request: ListDirectoryEvent;
  targetClient?: TargetClient;
};

export interface ListDirectoryConfirmation {
  type: "confirmationResponse";
  messageId: string;
  userMessage: string;
}

export class ListDirectoryHandler {
  private connectionManager = ConnectionManager.getInstance();
  private fileServices: FileServices;
  private permissionManager: PermissionManager;
  private approvalService = new ApprovalService();
  private notificationService = NotificationService.getInstance();
  private clientResolver = new ClientResolver();

  private pendingRequests = new Map<string, PendingRequest>();

  constructor() {
    // Initialize FileServices with default configuration
    const config = {
      targetDir: process.cwd(),
      workspaceContext: new DefaultWorkspaceContext(),
      fileSystemService: new DefaultFileSystem(),
    };
    this.fileServices = createFileServices(config);
    
    // Initialize PermissionManager
    this.permissionManager = PermissionManager.getInstance();
    this.permissionManager.initialize();
  }

  async handleListDirectory(agent: ClientConnection, event: ListDirectoryEvent): Promise<void> {
    const { requestId, message } = event;
    const { path } = message;

    const targetClient = this.clientResolver.resolveParent(agent);

    if (!targetClient) {
      await this.executeListDirectory(agent, event);
      return;
    }

    // Check if permission exists using centralized permission system
    if (PermissionUtils.hasPermission('list_directory', path, 'read')) {
      await this.executeListDirectory(agent, event, targetClient);
      return;
    }

    const messageId = uuidv4();
    this.pendingRequests.set(messageId, { agent, request: event, targetClient });

    this.approvalService.requestFolderReadApproval({
      agent,
      targetClient,
      messageId,
      requestId,
      path
    });
  }

  async handleConfirmation(message: ListDirectoryConfirmation): Promise<void> {
    const record = this.pendingRequests.get(message.messageId);

    if (!record) {
      logger.warn(
        formatLogMessage(
          "warn",
          "ListDirectoryHandler",
          `No pending list directory request for ${message.messageId}`
        )
      );
      return;
    }

    this.pendingRequests.delete(message.messageId);

    const { agent, request, targetClient } = record;
    const { requestId, message: payload } = request;

    if (message.userMessage?.toLowerCase() !== "approve") {
      const response = {
        type: "listDirectoryResponse" as const,
        requestId,
        success: false,
        path: payload.path,
        message: message.userMessage || "List directory request rejected",
        error: message.userMessage || "Rejected by user",
        entries: [],
        totalCount: 0,
      };

      this.connectionManager.sendToConnection(agent.id, {
        ...response,
        clientId: agent.id,
      });

      this.notificationService.sendFolderReadRejection({
        agent,
        requestId,
        path: payload.path,
        reason: message.userMessage || "List directory request rejected",
        targetClient
      });
      return;
    }

    PermissionUtils.grantPermission('list_directory', payload.path, 'read');
    await this.executeListDirectory(agent, request, targetClient);
  }

  handleRemoteNotification(message: {
    messageId: string;
    type: string;
    state?: string;
    reason?: string;
  }): void {
    if (message.type !== "listDirectoryApproval") {
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
        type: "listDirectoryResponse" as const,
        requestId,
        success: false,
        path: payload.path,
        message: message.reason || "List directory request rejected",
        error: message.reason || "Rejected by user",
        entries: [],
        totalCount: 0,
      };

      this.connectionManager.sendToConnection(agent.id, {
        ...response,
        clientId: agent.id,
      });

      this.notificationService.sendFolderReadRejection({
        agent,
        requestId,
        path: payload.path,
        reason: message.reason ?? "List directory request rejected",
        targetClient
      });
      return;
    }

    PermissionUtils.grantPermission('list_directory', payload.path, 'read');
    void this.executeListDirectory(agent, request, targetClient);
  }

  private async executeListDirectory(
    agent: ClientConnection,
    event: ListDirectoryEvent,
    targetClient?: { id: string; type: "app" | "tui" }
  ): Promise<void> {
    const { requestId, message } = event;
    const { path } = message;

    try {
      const result = await this.fileServices.listDirectory(path);
      
      if (result.success) {
        const response = {
          type: "listDirectoryResponse" as const,
          requestId,
          success: true,
          path,
          entries: result.entries || [],
          totalCount: result.entries?.length || 0,
        };

        this.connectionManager.sendToConnection(agent.id, {
          ...response,
          clientId: agent.id,
        });

        this.notificationService.sendFolderReadSuccess({
          agent,
          requestId,
          path,
          entries: (result.entries || []).map(entry => entry.name),
          targetClient
        });
      } else {
        const response = {
          type: "listDirectoryResponse" as const,
          requestId,
          success: false,
          path,
          message: result.error || "Error listing directory",
          error: result.error || "Error listing directory",
          entries: [],
          totalCount: 0,
        };

        this.connectionManager.sendToConnection(agent.id, {
          ...response,
          clientId: agent.id,
        });
      }
    } catch (error) {
      logger.error(
        formatLogMessage("error", "ListDirectoryHandler", `List directory failed for ${path}`),
        error
      );

      const response = {
        type: "listDirectoryResponse" as const,
        requestId,
        success: false,
        path,
        message: "Error listing directory",
        error: error instanceof Error ? error.message : "Unknown error",
        entries: [],
        totalCount: 0,
      };

      this.connectionManager.sendToConnection(agent.id, {
        ...response,
        clientId: agent.id,
      });
    }
  }

}
