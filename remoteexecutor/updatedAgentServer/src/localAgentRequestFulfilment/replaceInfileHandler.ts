import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";
import { getErrorMessage } from "../utils/errors";
import { FileServices, createFileServices } from "../services/FileServices";
import { DefaultFileSystem } from "../fsutils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../fsutils/DefaultWorkspaceContext";

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
  targetClient?: { id: string; type: "app" | "tui" };
}

export interface ReplaceInFileConfirmation {
  type: "confirmationResponse";
  messageId: string;
  userMessage: string;
}

type ReplaceResult = Awaited<ReturnType<FileServices["replaceInFile"]>>;

export class ReplaceInFileHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();
  private readonly fileServices: FileServices;

  private readonly pendingRequests = new Map<string, PendingRequest>();
  private readonly grantedPermissions = new Set<string>();

  constructor() {
    const config = {
      targetDir: process.cwd(),
      workspaceContext: new DefaultWorkspaceContext(),
      fileSystemService: new DefaultFileSystem(),
    };
    this.fileServices = createFileServices(config);
  }

  async handleReplaceInFile(agent: ClientConnection, event: ReplaceInFileEvent): Promise<void> {
    const targetClient = this.resolveParent(agent);

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

    this.requestApproval(agent, targetClient, messageId, event);
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
      this.sendRejection(
        agent,
        request.requestId,
        request.message.filePath,
        message.userMessage || "Replace in file request rejected",
        targetClient,
      );
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
      this.sendRejection(
        agent,
        request.requestId,
        request.message.filePath,
        message.reason ?? "Replace in file request rejected",
        targetClient,
      );
      return;
    }

    this.grantPermission(agent.id, request.message.filePath);
    void this.executeReplace(agent, request, targetClient);
  }

  private async executeReplace(
    agent: ClientConnection,
    event: ReplaceInFileEvent,
    targetClient?: { id: string; type: "app" | "tui" },
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
    targetClient?: { id: string; type: "app" | "tui" },
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
          path: filePath,
          content: result.newContent ?? (instructions.length > 0 ? instructions[instructions.length - 1].newString : "") ?? "",
          originalContent: result.originalContent ?? (instructions.length > 0 ? instructions[0].oldString : "") ?? "",
          diff: result.diff,
          stateEvent: "fileWrite",
        },
      };

      this.notifyClients(notification, targetClient);
      this.sendMessageToRemote.forwardAgentMessage(agent, notification);
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
        path: filePath,
        content: errorMessage,
        originalContent: result.originalContent ?? (instructions.length > 0 ? instructions[0].oldString : "") ?? "",
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
    event: ReplaceInFileEvent,
  ): void {
    const { requestId, message } = event;
    const previewReplacement = this.resolveInstructions(message)[0];

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
        content: previewReplacement?.newString ?? "",
        originalContent: previewReplacement?.oldString ?? "",
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
        "ReplaceInfileHandler",
        `Requested approval for replaceInFile on ${message.filePath}`,
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
      type: "replaceInFileResponse" as const,
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
    return this.grantedPermissions.has(this.permissionKey(agentId, filePath));
  }

  private grantPermission(agentId: string, filePath: string): void {
    this.grantedPermissions.add(this.permissionKey(agentId, filePath));
  }

  private permissionKey(agentId: string, filePath: string): string {
    return `${agentId}:${filePath}`;
  }
}
