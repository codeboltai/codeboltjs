import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../main/core/connectionManagers/connectionManager.js";
// Remove SendMessageToRemote import as it's no longer needed
import { logger } from "../main/utils/logger";
import { getErrorMessage } from "../utils/errors";
import { FileServices, createFileServices } from "../services/FileServices";
import { DefaultFileSystem } from "../utils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../utils/DefaultWorkspaceContext";
import { PermissionManager, PermissionUtils } from "./PermissionManager";
// Add imports for the new approval system
import { ApprovalService, NotificationService, ClientResolver, type TargetClient } from "../shared";

import type {
  FileWriteConfirmation,
  FileWriteSuccess,
  FileWriteError,
  FileWriteRejected,
} from "@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas";

export interface ReplaceInstruction {
  oldString: string;
  newString: string;
  expectedReplacements?: number;
}

export interface ReplaceInFileEvent {
  type: "fsEvent";
  action: "replaceInFile";
  requestId: string;
  message: {
    filePath: string;
    oldString?: string;
    newString?: string;
    expectedReplacements?: number;
    replacements?: ReplaceInstruction[];
  };
}

interface PendingRequest {
  agent: ClientConnection;
  request: ReplaceInFileEvent;
  targetClient?: TargetClient; // Use TargetClient type
}

export interface ReplaceInFileConfirmation {
  type: "confirmationResponse";
  messageId: string;
  userMessage: string;
}

type ReplaceResult = Awaited<ReturnType<FileServices["replaceInFile"]>>;

export class ReplaceInFileHandler {
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

  async handleReplaceInFile(agent: ClientConnection, event: ReplaceInFileEvent): Promise<void> {
    const targetClient = this.clientResolver.resolveParent(agent);

    if (!targetClient) {
      await this.executeReplace(agent, event);
      return;
    }

    if (this.hasPermission(agent.id, event.message.filePath)) {
      await this.executeReplace(agent, event, targetClient);
      return;
    }

    const messageId = uuidv4();
    this.pendingRequests.set(messageId, { agent, request: event, targetClient });

    // Extract preview replacement for approval request
    const instructions = this.resolveInstructions(event.message);
    const previewReplacement = instructions[0];

    // Use the new approval service
    if (previewReplacement) {
      this.approvalService.requestReplaceInFileApproval({
        agent,
        targetClient,
        messageId,
        requestId: event.requestId,
        filePath: event.message.filePath,
        oldString: previewReplacement.oldString,
        newString: previewReplacement.newString,
      });
    }
  }

  async handleConfirmation(message: ReplaceInFileConfirmation): Promise<void> {
    const record = this.pendingRequests.get(message.messageId);
    if (!record) {
      logger.warn(
        formatLogMessage(
          "warn",
          "ReplaceInfileHandler",
          `No pending replace-in-file request for ${message.messageId}`,
        ),
      );
      return;
    }

    this.pendingRequests.delete(message.messageId);

    const { agent, request, targetClient } = record;

    if (message.userMessage?.toLowerCase() !== "approve") {
      // Use the notification service for rejection
      this.notificationService.sendFileWriteRejection({
        agent,
        requestId: request.requestId,
        filePath: request.message.filePath,
        reason: message.userMessage || "Replace in file request rejected",
        targetClient,
      });
      return;
    }

    this.grantPermission(agent.id, request.message.filePath);
    await this.executeReplace(agent, request, targetClient);
  }

  handleRemoteNotification(message: {
    messageId: string;
    type: string;
    state?: string;
    reason?: string;
  }): void {
    if (message.type !== "replaceInFileApproval") {
      return;
    }

    const record = this.pendingRequests.get(message.messageId);
    if (!record) {
      return;
    }

    this.pendingRequests.delete(message.messageId);

    const { agent, request, targetClient } = record;

    if (message.state !== "approved") {
      // Use the notification service for rejection
      this.notificationService.sendFileWriteRejection({
        agent,
        requestId: request.requestId,
        filePath: request.message.filePath,
        reason: message.reason ?? "Replace in file request rejected",
        targetClient,
      });
      return;
    }

    this.grantPermission(agent.id, request.message.filePath);
    void this.executeReplace(agent, request, targetClient);
  }

  private async executeReplace(
    agent: ClientConnection,
    event: ReplaceInFileEvent,
    targetClient?: TargetClient // Use TargetClient type
  ): Promise<void> {
    const { requestId, message } = event;
    const instructions = this.resolveInstructions(message);

    if (instructions.length === 0) {
      const failure: ReplaceResult = {
        success: false,
        error: "No replacements provided",
      };
      await this.sendReplaceResponse(agent, requestId, message.filePath, instructions, failure, targetClient);
      return;
    }

    let lastResult: ReplaceResult | undefined;

    try {
      for (const instruction of instructions) {
        lastResult = await this.fileServices.replaceInFile(
          message.filePath,
          instruction.oldString,
          instruction.newString,
          instruction.expectedReplacements,
        );

        if (!lastResult.success) {
          break;
        }
      }
    } catch (error) {
      logger.error(
        formatLogMessage(
          "error",
          "ReplaceInfileHandler",
          `Replace in file failed for ${message.filePath}`,
        ),
        error,
      );
      lastResult = {
        success: false,
        error: getErrorMessage(error),
      };
    }

    await this.sendReplaceResponse(
      agent,
      requestId,
      message.filePath,
      instructions,
      lastResult ?? { success: false, error: "Unknown replace result" },
      targetClient,
    );
  }

  private resolveInstructions(message: ReplaceInFileEvent["message"]): ReplaceInstruction[] {
    if (Array.isArray(message.replacements) && message.replacements.length > 0) {
      return message.replacements.filter((instruction) => instruction.oldString !== undefined && instruction.newString !== undefined);
    }

    if (message.oldString !== undefined && message.newString !== undefined) {
      return [
        {
          oldString: message.oldString,
          newString: message.newString,
          expectedReplacements: message.expectedReplacements,
        },
      ];
    }

    return [];
  }

  private async sendReplaceResponse(
    agent: ClientConnection,
    requestId: string,
    filePath: string,
    instructions: ReplaceInstruction[],
    result: ReplaceResult,
    targetClient?: TargetClient // Use TargetClient type
  ): Promise<void> {
    if (result.success) {
      const response = {
        type: "replaceInFileResponse" as const,
        requestId,
        success: true,
        originalContent: result.originalContent,
        newContent: result.newContent,
        diff: result.diff,
        replacements: result.replacements,
        operations: instructions,
      };

      this.connectionManager.sendToConnection(agent.id, {
        ...response,
        clientId: agent.id,
      });

      // Use the notification service for success
      this.notificationService.sendFileWriteSuccess({
        agent,
        requestId,
        filePath,
        content: result.newContent ?? (instructions.length > 0 ? instructions[instructions.length - 1].newString : "") ?? "",
        originalContent: result.originalContent ?? (instructions.length > 0 ? instructions[0].oldString : "") ?? "",
        diff: result.diff,
        targetClient
      });
      return;
    }

    const errorMessage = result.error ?? "Error performing replace in file";
    const response = {
      type: "replaceInFileResponse" as const,
      requestId,
      success: false,
      message: errorMessage,
      error: errorMessage,
      operations: instructions,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    // Use the notification service for error
    this.notificationService.sendFileWriteError({
      agent,
      requestId,
      filePath,
      error: errorMessage,
      originalContent: result.originalContent ?? (instructions.length > 0 ? instructions[0].oldString : "") ?? "",
      diff: result.diff,
      targetClient
    });
  }

  // Remove the resolveParent method as it's now handled by ClientResolver

  // Remove the requestApproval method as it's now handled by ApprovalService

  // Remove the sendRejection method as it's now handled by NotificationService

  // Remove the notifyClients method as it's now handled by NotificationService

  private hasPermission(agentId: string, filePath: string): boolean {
    return PermissionUtils.hasPermission('replace_in_file', filePath, 'write');
  }

  private grantPermission(agentId: string, filePath: string): void {
    PermissionUtils.grantPermission('replace_in_file', filePath, 'write');
  }
}