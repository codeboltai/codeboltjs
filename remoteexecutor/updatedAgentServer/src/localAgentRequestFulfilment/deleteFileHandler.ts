import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { DeleteFile } from "../fsutils/DeleteFile.js";
import { logger } from "../utils/logger";

import type {
  FileDeleteConfirmation,
  FileDeleteSuccess,
} from "@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas";

export interface DeleteFileEvent {
  type: "fsEvent";
  action: "deleteFile";
  requestId: string;
  message: {
    filePath: string;
  };
}

interface PendingRequest {
  agent: ClientConnection;
  request: DeleteFileEvent;
  targetClient?: { id: string; type: "app" | "tui" };
}

export interface DeleteFileConfirmation {
  type: "confirmationResponse";
  messageId: string;
  userMessage: string;
}

export class DeleteFileHandler {
  private connectionManager = ConnectionManager.getInstance();

  private sendMessageToRemote = new SendMessageToRemote();

  private deleteFileService = DeleteFile.getInstance();

  private pendingRequests = new Map<string, PendingRequest>();

  private grantedPermissions = new Set<string>();

  async handleDeleteFile(
    agent: ClientConnection,
    event: DeleteFileEvent
  ): Promise<void> {
    const { requestId, message } = event;
    const { filePath } = message;

    const targetClient = this.resolveParent(agent);

    if (!targetClient) {
      await this.deleteFileService.performDelete(agent, requestId, filePath);
      return;
    }

    if (this.hasPermission(agent.id, filePath)) {
      await this.deleteFileService.performDelete(
        agent,
        requestId,
        filePath,
        targetClient
      );
      return;
    }

    const messageId = uuidv4();

    this.pendingRequests.set(messageId, {
      agent,
      request: event,
      targetClient,
    });

    this.requestApproval(agent, targetClient, messageId, filePath, requestId);
  }

  async handleConfirmation(message: DeleteFileConfirmation): Promise<void> {
    const record = this.pendingRequests.get(message.messageId);

    if (!record) {
      logger.warn(
        `DeleteFileHandler: No pending delete file request for ${message.messageId}`
      );
      return;
    }

    this.pendingRequests.delete(message.messageId);

    const { agent, request, targetClient } = record;
    const { requestId, message: payload } = request;

    if (message.userMessage?.toLowerCase() !== "approve") {
      this.deleteFileService.sendRejection(
        agent,
        requestId,
        payload.filePath,
        message.userMessage || "Delete file request rejected",
        targetClient
      );
      return;
    }

    this.grantPermission(agent.id, payload.filePath);
    await this.deleteFileService.performDelete(
      agent,
      requestId,
      payload.filePath,
      targetClient
    );
  }

  handleRemoteNotification(message: {
    messageId: string;
    type: string;
    state?: string;
    reason?: string;
  }): void {
    if (message.type !== "deleteFileApproval") {
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
      this.deleteFileService.sendRejection(
        agent,
        requestId,
        payload.filePath,
        message.reason ?? "Delete file request rejected",
        targetClient
      );
      return;
    }

    this.grantPermission(agent.id, payload.filePath);
    void this.deleteFileService.performDelete(
      agent,
      requestId,
      payload.filePath,
      targetClient
    );
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
    requestId: string
  ): void {
    const payload: FileDeleteConfirmation = {
      type: "message",
      actionType: "DELETEFILE",
      templateType: "DELETEFILE",
      sender: "agent",
      messageId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "file",
        path: filePath,
        content: "",
        stateEvent: "ASK_FOR_CONFIRMATION",
      },
    };

    if (targetClient.type === "app") {
      this.connectionManager
        .getAppConnectionManager()
        .sendToApp(targetClient.id, payload);
    } else {
      this.connectionManager
        .getTuiConnectionManager()
        .sendToTui(targetClient.id, payload);
    }

    this.sendMessageToRemote.forwardAgentMessage(agent, payload);
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
}
