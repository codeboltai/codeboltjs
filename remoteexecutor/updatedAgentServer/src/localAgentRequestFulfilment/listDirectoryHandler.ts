import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { FileServices, createFileServices } from "../services/FileServices";
import { DefaultFileSystem } from "../utils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../utils/DefaultWorkspaceContext";
import { logger } from "../utils/logger";
import { PermissionManager, PermissionUtils } from "./PermissionManager";

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
  targetClient?: { id: string; type: "app" | "tui" };
};

export interface ListDirectoryConfirmation {
  type: "confirmationResponse";
  messageId: string;
  userMessage: string;
}

export class ListDirectoryHandler {
  private connectionManager = ConnectionManager.getInstance();
  private sendMessageToRemote = new SendMessageToRemote();
  private fileServices: FileServices;
  private permissionManager: PermissionManager;

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

    const targetClient = this.resolveParent(agent);

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

    this.requestApproval(agent, targetClient, messageId, event);
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
      this.sendRejection(
        agent,
        requestId,
        payload.path,
        message.userMessage || "List directory request rejected",
        targetClient
      );
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
      this.sendRejection(
        agent,
        requestId,
        payload.path,
        message.reason ?? "List directory request rejected",
        targetClient
      );
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

        this.sendApprovalNotification(agent, requestId, path, result.entries || [], targetClient);
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
    event: ListDirectoryEvent
  ): void {
    const { requestId, message } = event;
    const { path } = message;

    const payload: FolderReadConfirmation = {
      type: "message" as const,
      actionType: "FOLDERREAD" as const,
      templateType: "FOLDERREAD" as const,
      sender: "agent" as const,
      messageId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "folder" as const,
        path,
        content: [],
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
        "ListDirectoryHandler",
        `Requested approval for listing directory ${path}`
      )
    );
  }

  private sendRejection(
    agent: ClientConnection,
    requestId: string,
    path: string,
    reason: string,
    targetClient?: { id: string; type: "app" | "tui" }
  ): void {
    const response = {
      type: "listDirectoryResponse" as const,
      requestId,
      success: false,
      path,
      message: reason || "List directory request rejected",
      error: reason || "Rejected by user",
      entries: [],
      totalCount: 0,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    const notification: FolderReadRejected = {
      type: "message" as const,
      actionType: "FOLDERREAD" as const,
      templateType: "FOLDERREAD" as const,
      sender: "agent" as const,
      messageId: requestId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "folder" as const,
        path,
        content: [],
        stateEvent: "REJECTED" as const,
      },
    };

    this.notifyClients(notification, targetClient);
    this.sendMessageToRemote.forwardAgentMessage(agent, notification);
  }

  private sendApprovalNotification(
    agent: ClientConnection,
    requestId: string,
    path: string,
    entries: any[],
    targetClient?: { id: string; type: "app" | "tui" }
  ): void {
    const notification: FolderReadSuccess = {
      type: "message" as const,
      actionType: "FOLDERREAD" as const,
      templateType: "FOLDERREAD" as const,
      sender: "agent" as const,
      messageId: requestId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "folder" as const,
        path,
        content: entries.map(entry => entry.name),
        stateEvent: "FILE_READ" as const,
      },
    };

    this.notifyClients(notification, targetClient);
    this.sendMessageToRemote.forwardAgentMessage(agent, notification);
  }

  private notifyClients(
    notification: FolderReadSuccess | FolderReadError | FolderReadRejected,
    targetClient?: { id: string; type: "app" | "tui" }
  ): void {
    const appManager = this.connectionManager.getAppConnectionManager();
    const tuiManager = this.connectionManager.getTuiConnectionManager();

    if (!targetClient) {
      appManager.broadcast(notification);
      tuiManager.broadcast(notification);
      return;
    }

    if (targetClient.type === "app") {
      appManager.sendToApp(targetClient.id, notification);
    } else {
      tuiManager.sendToTui(targetClient.id, notification);
    }
  }
}
