import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { logger } from "../utils/logger";
import { getErrorMessage } from "../utils/errors";
import { FileServices, createFileServices } from "../services/FileServices";
import { DefaultFileSystem } from "../utils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../utils/DefaultWorkspaceContext";
import { PermissionManager, PermissionUtils } from "./PermissionManager";
import { ApprovalService, NotificationService, ClientResolver, type TargetClient } from "../shared";

import type {
  FileWriteConfirmation,
  FileWriteSuccess,
  FileWriteError,
  FileWriteRejected,
} from "@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas";

export interface SmartEditEvent {
  type: "fsEvent";
  action: "smartEdit";
  requestId: string;
  message: {
    filePath: string;
    prompt: string;
    oldString: string;
    newString: string;
    expectedReplacements?: number;
  };
}

interface PendingRequest {
  agent: ClientConnection;
  request: SmartEditEvent;
  targetClient?: TargetClient;
}

export interface SmartEditConfirmation {
  type: "confirmationResponse";
  messageId: string;
  userMessage: string;
}

type SmartEditResult = Awaited<ReturnType<FileServices["replaceInFile"]>>;

export class SmartEditHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly fileServices: FileServices;
  private readonly permissionManager: PermissionManager;
  private approvalService = new ApprovalService();
  private notificationService = new NotificationService();
  private clientResolver = new ClientResolver();

  private readonly pendingRequests = new Map<string, PendingRequest>();

  constructor() {
    const config = {
      targetDir: process.cwd(),
      workspaceContext: new DefaultWorkspaceContext(),
      fileSystemService: new DefaultFileSystem(),
    };
    this.fileServices = createFileServices(config);
    this.permissionManager = PermissionManager.getInstance();
    this.permissionManager.initialize();
  }

  async handleSmartEdit(agent: ClientConnection, event: SmartEditEvent): Promise<void> {
    const targetClient = this.clientResolver.resolveParent(agent);

    if (!targetClient) {
      await this.executeSmartEdit(agent, event);
      return;
    }

    if (this.hasPermission(agent.id, event.message.filePath)) {
      await this.executeSmartEdit(agent, event, targetClient);
      return;
    }

    const messageId = uuidv4();
    this.pendingRequests.set(messageId, { agent, request: event, targetClient });

    this.requestApproval(agent, targetClient, messageId, event);
  }

  async handleConfirmation(message: SmartEditConfirmation): Promise<void> {
    const record = this.pendingRequests.get(message.messageId);
    if (!record) {
      logger.warn(
        formatLogMessage(
          "warn",
          "SmartEditHandler",
          `No pending smart edit request for ${message.messageId}`,
        ),
      );
      return;
    }

    this.pendingRequests.delete(message.messageId);

    const { agent, request, targetClient } = record;

    if (message.userMessage?.toLowerCase() !== "approve") {
      this.sendRejection(
        agent,
        request.requestId,
        request.message.filePath,
        message.userMessage || "Smart edit request rejected",
        targetClient,
      );
      return;
    }

    this.grantPermission(agent.id, request.message.filePath);
    await this.executeSmartEdit(agent, request, targetClient);
  }

  handleRemoteNotification(message: {
    messageId: string;
    type: string;
    state?: string;
    reason?: string;
  }): void {
    if (message.type !== "smartEditApproval") {
      return;
    }

    const record = this.pendingRequests.get(message.messageId);
    if (!record) {
      return;
    }

    this.pendingRequests.delete(message.messageId);

    const { agent, request, targetClient } = record;

    if (message.state !== "approved") {
      this.sendRejection(
        agent,
        request.requestId,
        request.message.filePath,
        message.reason ?? "Smart edit request rejected",
        targetClient,
      );
      return;
    }

    this.grantPermission(agent.id, request.message.filePath);
    void this.executeSmartEdit(agent, request, targetClient);
  }

  private async executeSmartEdit(
    agent: ClientConnection,
    event: SmartEditEvent,
    targetClient?: { id: string; type: "app" | "tui" },
  ): Promise<void> {
    const { requestId, message } = event;

    try {
      const result = await this.fileServices.replaceInFile(
        message.filePath,
        message.oldString,
        message.newString,
        message.expectedReplacements,
      );
      await this.sendEditResponse(agent, requestId, message, result, targetClient);
    } catch (error) {
      logger.error(
        formatLogMessage("error", "SmartEditHandler", `Smart edit failed for ${message.filePath}`),
        error,
      );
      const failure: SmartEditResult = {
        success: false,
        error: getErrorMessage(error),
      };
      await this.sendEditResponse(agent, requestId, message, failure, targetClient);
    }
  }

  private async sendEditResponse(
    agent: ClientConnection,
    requestId: string,
    message: SmartEditEvent["message"],
    result: SmartEditResult,
    targetClient?: { id: string; type: "app" | "tui" },
  ): Promise<void> {
    if (result.success) {
      const response = {
        type: "smartEditResponse" as const,
        requestId,
        success: true,
        originalContent: result.originalContent,
        newContent: result.newContent,
        diff: result.diff,
        replacements: result.replacements,
      };

      this.connectionManager.sendToConnection(agent.id, {
        ...response,
        clientId: agent.id,
      });

      const notification: FileWriteSuccess = {
        type: "message",
        actionType: "WRITEFILE",
        templateType: "WRITEFILE",
        sender: "agent",
        messageId: requestId,
        threadId: requestId,
        timestamp: Date.now().toString(),
        agentId: agent.id,
        agentInstanceId: agent.instanceId,
        payload: {
          type: "file",
          path: message.filePath,
          content: result.newContent ?? message.newString,
          originalContent: result.originalContent ?? message.oldString,
          diff: result.diff,
          stateEvent: "fileWrite",
        },
      };

      this.notifyClients(notification, targetClient);
      this.sendMessageToRemote.forwardAgentMessage(agent, notification);
      return;
    }

    const errorMessage = result.error ?? "Error performing smart edit";
    const response = {
      type: "smartEditResponse" as const,
      requestId,
      success: false,
      message: errorMessage,
      error: errorMessage,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    const notification: FileWriteError = {
      type: "message",
      actionType: "WRITEFILE",
      templateType: "WRITEFILE",
      sender: "agent",
      messageId: requestId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "file",
        path: message.filePath,
        content: errorMessage,
        originalContent: result.originalContent ?? message.oldString,
        diff: result.diff,
        stateEvent: "fileWriteError",
      },
    };

    this.notifyClients(notification, targetClient);
    this.sendMessageToRemote.forwardAgentMessage(agent, notification);
  }

  private resolveParent(
    agent: ClientConnection,
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
    event: SmartEditEvent,
  ): void {
    const { requestId, message } = event;

    const payload: FileWriteConfirmation = {
      type: "message",
      actionType: "WRITEFILE",
      templateType: "WRITEFILE",
      sender: "agent",
      messageId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "file",
        path: message.filePath,
        content: message.newString,
        originalContent: message.oldString,
        stateEvent: "askForConfirmation",
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
        "SmartEditHandler",
        `Requested approval for smart edit on ${message.filePath}`,
      ),
    );
  }

  private sendRejection(
    agent: ClientConnection,
    requestId: string,
    filePath: string,
    reason: string,
    targetClient?: { id: string; type: "app" | "tui" },
  ): void {
    const response = {
      type: "smartEditResponse" as const,
      requestId,
      success: false,
      message: reason,
      error: reason,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    const notification: FileWriteRejected = {
      type: "message",
      actionType: "WRITEFILE",
      templateType: "WRITEFILE",
      sender: "agent",
      messageId: requestId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "file",
        path: filePath,
        content: reason,
        originalContent: "",
        stateEvent: "rejected",
      },
    };

    this.notifyClients(notification, targetClient);
    this.sendMessageToRemote.forwardAgentMessage(agent, notification);
  }

  private notifyClients(
    notification: FileWriteSuccess | FileWriteError | FileWriteRejected,
    targetClient?: { id: string; type: "app" | "tui" },
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

  private hasPermission(agentId: string, filePath: string): boolean {
    return PermissionUtils.hasPermission('smart_edit', filePath, 'write');
  }

  private grantPermission(agentId: string, filePath: string): void {
    PermissionUtils.grantPermission('smart_edit', filePath, 'write');
  }
}