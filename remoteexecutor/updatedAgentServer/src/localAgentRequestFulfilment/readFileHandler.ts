import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";
import { ReadFileService } from "./readFileService.js";

import type { FileReadConfirmation, FileReadSuccess } from "@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas";

export interface ReadFileEvent {
  type: "fsEvent";
  action: "readFile";
  requestId: string;
  message: {
    filePath: string;
  };
}

interface PendingRequest {
  agent: ClientConnection;
  request: ReadFileEvent;
  targetClient?: { id: string; type: "app" | "tui" };
}

export interface ReadFileConfirmation {
  type: "confirmationResponse";
  messageId: string;
  userMessage: string;
}

export class ReadFileHandler {
  private connectionManager = ConnectionManager.getInstance();
  private sendMessageToRemote = new SendMessageToRemote();
  private readFileService = ReadFileService.getInstance();

  private pendingRequests = new Map<string, PendingRequest>();
  private grantedPermissions = new Set<string>();

  async handleReadFile(
    agent: ClientConnection,
    event: ReadFileEvent
  ): Promise<void> {
    const { requestId, message } = event;
    const { filePath } = message;
    const targetClient = this.resolveParent(agent);
    logger.info("Handling ReadFile for ", targetClient)

    if (!targetClient) {
      await this.readFileService.performRead(agent, requestId, filePath);
      return;
    }

    if (this.hasPermission(agent.id, filePath)) {
      await this.readFileService.performRead(
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

  async handleConfirmation(message: ReadFileConfirmation): Promise<void> {
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
    const { requestId, message: requestMessage } = request;
    const { filePath } = requestMessage;

    if (message.userMessage?.toLowerCase() !== "approve") {
      this.sendRejection(
        agent,
        requestId,
        targetClient,
        filePath,
        message.userMessage
      );
      return;
    }

    this.grantPermission(agent.id, filePath);
    await this.readFileService.performRead(
      agent,
      requestId,
      filePath,
      targetClient
    );
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
    const { requestId, message: requestMessage } = request;
    const { filePath } = requestMessage;

    if (message.state !== "approved") {
      this.sendRejection(
        agent,
        requestId,
        targetClient,
        filePath,
        message.reason ?? "Rejected"
      );
      return;
    }

    this.grantPermission(agent.id, filePath);
    void this.readFileService.performRead(
      agent,
      requestId,
      filePath,
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
        path: filePath,
        content: "",
        stateEvent: "ASK_FOR_CONFIRMATION" as const,
      },
    };
    logger.info("sending readFile for approval", payload)

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
    logger.info(
      formatLogMessage(
        "info",
        "ReadFileHandler",
        `Requested approval for reading file ${filePath}`
      )
    );
  }

  private sendRejection(
    agent: ClientConnection,
    requestId: string,
    targetClient: { id: string; type: "app" | "tui" } | undefined,
    filePath: string,
    userMessage: string
  ): void {
    const response = {
      type: "readFileResponse",
      requestId,
      success: false,
      message: userMessage || "Read file request rejected",
      error: userMessage || "Rejected by user",
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

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
        content: userMessage || "Rejected",
        stateEvent: "FILE_READ" as const,
      },
    };

    const appManager = this.connectionManager.getAppConnectionManager();
    const tuiManager = this.connectionManager.getTuiConnectionManager();

    if (!targetClient) {
      appManager.broadcast(notification);
      tuiManager.broadcast(notification);
    } else if (targetClient.type === "app") {
      appManager.sendToApp(targetClient.id, notification);
    } else {
      tuiManager.sendToTui(targetClient.id, notification);
    }

    this.sendMessageToRemote.forwardAgentMessage(agent, notification);
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
