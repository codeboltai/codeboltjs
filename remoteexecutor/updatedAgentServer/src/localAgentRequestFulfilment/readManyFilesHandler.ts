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

import type {
  FileReadConfirmation,
  FileReadSuccess,
} from "@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas";
import type { GrepSearchErrorResponse } from "@codebolt/types/app-to-agent-ws-types";

export interface ReadManyFilesEvent {
  type: "fsEvent";
  action: "readManyFiles";
  requestId: string;
  message: {
    paths: string[];
  };
}

type PendingRequest = {
  agent: ClientConnection;
  request: ReadManyFilesEvent;
  targetClient?: { id: string; type: "app" | "tui" };
};

export interface ReadManyFilesConfirmation {
  type: "confirmationResponse";
  messageId: string;
  userMessage: string;
}

export class ReadManyFilesHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();
  private readonly fileServices: FileServices;
  private readonly permissionManager: PermissionManager;

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

  async handleReadManyFiles(agent: ClientConnection, event: ReadManyFilesEvent): Promise<void> {
    const { requestId, message } = event;
    const { paths } = message;

    const targetClient = this.resolveParent(agent);

    if (!targetClient) {
      await this.executeReadManyFiles(agent, event);
      return;
    }

    // Check if permission exists for all paths using centralized permission system
    const hasPermissionForAllPaths = paths.every(path => 
      PermissionUtils.hasPermission('read_many_files', path, 'read')
    );

    if (hasPermissionForAllPaths) {
      await this.executeReadManyFiles(agent, event, targetClient);
      return;
    }

    const messageId = uuidv4();
    this.pendingRequests.set(messageId, { agent, request: event, targetClient });

    this.requestApproval(agent, targetClient, messageId, event);
  }

  async handleConfirmation(message: ReadManyFilesConfirmation): Promise<void> {
    const record = this.pendingRequests.get(message.messageId);

    if (!record) {
      logger.warn(
        formatLogMessage(
          "warn",
          "ReadManyFilesHandler",
          `No pending read many files request for ${message.messageId}`
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
        payload.paths,
        message.userMessage || "Read many files request rejected",
        targetClient
      );
      return;
    }

    // Grant permission for all paths
    payload.paths.forEach(path => {
      PermissionUtils.grantPermission('read_many_files', path, 'read');
    });

    await this.executeReadManyFiles(agent, request, targetClient);
  }

  handleRemoteNotification(message: {
    messageId: string;
    type: string;
    state?: string;
    reason?: string;
  }): void {
    if (message.type !== "readManyFilesApproval") {
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
        payload.paths,
        message.reason ?? "Read many files request rejected",
        targetClient
      );
      return;
    }

    // Grant permission for all paths
    payload.paths.forEach(path => {
      PermissionUtils.grantPermission('read_many_files', path, 'read');
    });

    void this.executeReadManyFiles(agent, request, targetClient);
  }

  private async executeReadManyFiles(
    agent: ClientConnection,
    event: ReadManyFilesEvent,
    targetClient?: { id: string; type: "app" | "tui" }
  ): Promise<void> {
    const { requestId, message } = event;
    const { paths } = message;

    try {
      const results = await Promise.all(
        paths.map(async (path) => {
          const result = await this.fileServices.readFile(path);
          return { path, result };
        })
      );

      const successResults = results.filter(({ result }) => result.success);
      const errorResults = results.filter(({ result }) => !result.success);

      const response = {
        type: "readManyFilesResponse" as const,
        requestId,
        success: successResults.length > 0,
        results: successResults.map(({ path, result }) => ({
          path,
          content: result.content,
          isTruncated: result.isTruncated,
          linesShown: result.linesShown,
          originalLineCount: result.originalLineCount,
        })),
        errors: errorResults.map(({ path, result }) => ({
          path,
          error: result.error,
        })),
        totalRequested: paths.length,
        totalSuccessful: successResults.length,
        totalFailed: errorResults.length,
      };

      this.connectionManager.sendToConnection(agent.id, {
        ...response,
        clientId: agent.id,
      });

      // Send notifications for each successful read
      successResults.forEach(({ path, result }) => {
        this.sendApprovalNotification(agent, requestId, path, result.content || "", targetClient);
      });

    } catch (error) {
      logger.error(
        formatLogMessage("error", "ReadManyFilesHandler", `Read many files failed`),
        error
      );

      const response = {
        type: "readManyFilesResponse" as const,
        requestId,
        success: false,
        message: "Error reading multiple files",
        error: error instanceof Error ? error.message : "Unknown error",
        results: [],
        errors: paths.map(path => ({ path, error: "Failed to read file" })),
        totalRequested: paths.length,
        totalSuccessful: 0,
        totalFailed: paths.length,
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
    event: ReadManyFilesEvent
  ): void {
    const { requestId, message } = event;
    const { paths } = message;

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
        path: paths.join(", "), // Show all paths in the confirmation
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
        "ReadManyFilesHandler",
        `Requested approval for reading ${paths.length} files: ${paths.join(", ")}`
      )
    );
  }

  private sendRejection(
    agent: ClientConnection,
    requestId: string,
    paths: string[],
    reason: string,
    targetClient?: { id: string; type: "app" | "tui" }
  ): void {
    const response = {
      type: "readManyFilesResponse" as const,
      requestId,
      success: false,
      message: reason || "Read many files request rejected",
      error: reason || "Rejected by user",
      results: [],
      errors: paths.map(path => ({ path, error: reason })),
      totalRequested: paths.length,
      totalSuccessful: 0,
      totalFailed: paths.length,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    // Send rejection notifications for each path
    paths.forEach(path => {
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
          path,
          content: reason || "Rejected",
          stateEvent: "FILE_READ" as const,
        },
      };

      this.notifyClients(notification, targetClient);
      this.sendMessageToRemote.forwardAgentMessage(agent, notification);
    });
  }

  private sendApprovalNotification(
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

    this.notifyClients(notification, targetClient);
    this.sendMessageToRemote.forwardAgentMessage(agent, notification);
  }

  private notifyClients(
    notification: FileReadSuccess,
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