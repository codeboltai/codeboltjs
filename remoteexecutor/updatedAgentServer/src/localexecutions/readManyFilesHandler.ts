import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../main/core/connectionManagers/connectionManager.js";
// Remove SendMessageToRemote import as it's no longer needed
import { FileServices, createFileServices } from "../../main/services/FileServices";
import { DefaultFileSystem } from "../utils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../utils/DefaultWorkspaceContext";
import { logger } from "../main/utils/logger";
import { PermissionManager, PermissionUtils } from "./PermissionManager";
// Add imports for the new approval system
import { ApprovalService, NotificationService, ClientResolver, type TargetClient } from "../shared";

import type {
  FileReadConfirmation,
  FileReadSuccess,
} from "@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas";
// Remove GrepSearchErrorResponse import as it's not used

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
  targetClient?: TargetClient; // Use TargetClient type
};

export interface ReadManyFilesConfirmation {
  type: "confirmationResponse";
  messageId: string;
  userMessage: string;
}

export class ReadManyFilesHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  // Remove sendMessageToRemote as it's no longer needed
  private readonly fileServices: FileServices;
  private readonly permissionManager: PermissionManager;
  // Add new services
  private approvalService = new ApprovalService();
  private notificationService = NotificationService.getInstance();
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

  async handleReadManyFiles(agent: ClientConnection, event: ReadManyFilesEvent): Promise<void> {
    const { requestId, message } = event;
    const { paths } = message;

    // Use the new client resolver
    const targetClient = this.clientResolver.resolveParent(agent);

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

    // Use the new approval service
    this.approvalService.requestReadManyFilesApproval({
      agent,
      targetClient,
      messageId,
      requestId,
      paths
    });
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
      // Use the notification service for rejection
      this.notificationService.sendFileReadSuccess({
        agent,
        requestId,
        filePath: payload.paths.join(", "),
        content: message.userMessage || "Rejected",
        targetClient
      });
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
      // Use the notification service for rejection
      this.notificationService.sendFileReadSuccess({
        agent,
        requestId,
        filePath: payload.paths.join(", "),
        content: message.reason ?? "Rejected",
        targetClient
      });
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
    targetClient?: TargetClient // Use TargetClient type
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

      // Send notifications for each successful read using the notification service
      successResults.forEach(({ path, result }) => {
        this.notificationService.sendFileReadSuccess({
          agent,
          requestId,
          filePath: path,
          content: result.content || "",
          targetClient
        });
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

  // Remove the resolveParent method as it's now handled by ClientResolver

  // Remove the requestApproval method as it's now handled by ApprovalService

  // Remove the sendRejection method as it's now handled by NotificationService

  // Remove the sendApprovalNotification method as it's now handled by NotificationService

  // Remove the notifyClients method as it's now handled by NotificationService
}