import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { logger } from "../utils/logger";
// Import FileServices for smart edit functionality
import { FileServices, createFileServices } from "../services/FileServices";
import { DefaultFileSystem } from "../fsutils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../fsutils/DefaultWorkspaceContext";

import type { 
  FileWriteConfirmation, 
  FileWriteSuccess,
  FileWriteError
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
  targetClient?: { id: string; type: "app" | "tui" };
}

export interface SmartEditConfirmation {
  type: "confirmationResponse";
  messageId: string;
  userMessage: string;
}

export class SmartEditHandler {
  private readonly connectionManager = ConnectionManager.getInstance();
  private readonly sendMessageToRemote = new SendMessageToRemote();
  // Use FileServices for smart edit functionality
  private readonly fileServices: FileServices;

  private pendingRequests = new Map<string, PendingRequest>();
  private grantedPermissions = new Set<string>();

  constructor() {
    // Initialize FileServices with default configuration
    const config = {
      targetDir: process.cwd(), // Use current working directory as target
      workspaceContext: new DefaultWorkspaceContext(),
      fileSystemService: new DefaultFileSystem(),
    };
    this.fileServices = createFileServices(config);
  }

  async handleSmartEdit(agent: ClientConnection, event: SmartEditEvent): Promise<void> {
    const { requestId, message } = event;
    const { filePath, oldString, newString, expectedReplacements } = message;
    
    const targetClient = this.resolveParent(agent);

    // If no target client or already granted permission, perform the edit directly
    if (!targetClient) {
      const result = await this.fileServices.replaceInFile(
        filePath, 
        oldString, 
        newString, 
        expectedReplacements
      );
      await this.sendEditResponse(agent, requestId, filePath, oldString, newString, result);
      return;
    }

    if (this.hasPermission(agent.id, filePath)) {
      const result = await this.fileServices.replaceInFile(
        filePath, 
        oldString, 
        newString, 
        expectedReplacements
      );
      await this.sendEditResponse(agent, requestId, filePath, oldString, newString, result);
      return;
    }

    // Request approval from target client
    const messageId = uuidv4();
    this.pendingRequests.set(messageId, {
      agent,
      request: event,
      targetClient,
    });
    
    this.requestApproval(
      agent, 
      targetClient, 
      messageId, 
      filePath, 
      oldString, 
      newString, 
      requestId
    );
  }

  async handleConfirmation(message: SmartEditConfirmation): Promise<void> {
    const record = this.pendingRequests.get(message.messageId);
    if (!record) {
      logger.warn(
        formatLogMessage(
          "warn",
          "SmartEditHandler",
          `No pending smart edit request for ${message.messageId}`
        )
      );
      return;
    }

    this.pendingRequests.delete(message.messageId);

    const { agent, request, targetClient } = record;
    const { requestId, message: payload } = request;
    const { filePath, oldString, newString, expectedReplacements } = payload;

    if (message.userMessage?.toLowerCase() !== "approve") {
      this.sendRejection(
        agent,
        requestId,
        filePath,
        message.userMessage || "Smart edit request rejected",
        targetClient
      );
      return;
    }

    this.grantPermission(agent.id, filePath);
    
    // Perform the smart edit
    const result = await this.fileServices.replaceInFile(
      filePath, 
      oldString, 
      newString, 
      expectedReplacements
    );
    
    await this.sendEditResponse(agent, requestId, filePath, oldString, newString, result);
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
    const { requestId, message: payload } = request;
    const { filePath, oldString, newString, expectedReplacements } = payload;

    if (message.state !== "approved") {
      this.sendRejection(
        agent,
        requestId,
        filePath,
        message.reason ?? "Smart edit request rejected",
        targetClient
      );
      return;
    }

    this.grantPermission(agent.id, filePath);
    
    // Perform the smart edit
    this.fileServices.replaceInFile(
      filePath, 
      oldString, 
      newString, 
      expectedReplacements
    ).then(result => {
      void this.sendEditResponse(agent, requestId, filePath, oldString, newString, result);
    }).catch(error => {
      logger.error("Error performing smart edit:", error);
    });
  }

  private async sendEditResponse(
    agent: ClientConnection,
    requestId: string,
    filePath: string,
    oldString: string,
    newString: string,
    result: any
  ): Promise<void> {
    if (result.success) {
      // Send success response
      const response = {
        type: "smartEditResponse",
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

      this.sendApprovalNotification(agent, requestId, filePath, oldString, newString);
    } else {
      // Send error response
      const response = {
        type: "smartEditResponse",
        requestId,
        success: false,
        message: result.error,
        error: result.error,
      };

      this.connectionManager.sendToConnection(agent.id, {
        ...response,
        clientId: agent.id,
      });

      // Send error notification to UI
      const notification: FileWriteError = {
        type: "message" as const,
        actionType: "WRITEFILE" as const,
        templateType: "WRITEFILE" as const,
        sender: "agent" as const,
        messageId: uuidv4(),
        timestamp: Date.now().toString(),
        payload: {
          type: "file",
          path: filePath,
          content: newString,
          originalContent: oldString,
          stateEvent: "FILE_WRITE_ERROR"
        }
      };

      if (agent.type === "app") {
        this.sendMessageToRemote.sendToApp(agent.id, notification);
      } else if (agent.type === "tui") {
        this.sendMessageToRemote.sendToTui(agent.id, notification);
      }
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
    filePath: string,
    oldString: string,
    newString: string,
    requestId: string
  ): void {
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
        path: filePath,
        content: newString,
        originalContent: oldString,
        stateEvent: "ASK_FOR_CONFIRMATION"
      }
    };

    if (targetClient.type === "app") {
      this.sendMessageToRemote.sendToApp(targetClient.id, payload);
    } else {
      this.sendMessageToRemote.sendToTui(targetClient.id, payload);
    }
  }

  private sendRejection(
    agent: ClientConnection,
    requestId: string,
    filePath: string,
    reason: string,
    targetClient?: { id: string; type: "app" | "tui" }
  ): void {
    const response = {
      type: "smartEditResponse",
      requestId,
      success: false,
      message: reason,
      error: reason,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    // Send rejection notification to UI
    const notification: FileWriteError = {
      type: "message" as const,
      actionType: "WRITEFILE" as const,
      templateType: "WRITEFILE" as const,
      sender: "agent" as const,
      messageId: uuidv4(),
      timestamp: Date.now().toString(),
      payload: {
        type: "file",
        path: filePath,
        content: reason,
        originalContent: "",
        stateEvent: "REJECTED"
      }
    };

    if (agent.type === "app") {
      this.sendMessageToRemote.sendToApp(agent.id, notification);
    } else if (agent.type === "tui") {
      this.sendMessageToRemote.sendToTui(agent.id, notification);
    }
  }

  private sendApprovalNotification(
    agent: ClientConnection,
    requestId: string,
    filePath: string,
    oldString: string,
    newString: string
  ): void {
    const notification: FileWriteSuccess = {
      type: "message" as const,
      actionType: "WRITEFILE" as const,
      templateType: "WRITEFILE" as const,
      sender: "agent" as const,
      messageId: uuidv4(),
      timestamp: Date.now().toString(),
      payload: {
        type: "file",
        path: filePath,
        content: newString,
        originalContent: oldString,
        stateEvent: "FILE_WRITE"
      }
    };

    if (agent.type === "app") {
      this.sendMessageToRemote.sendToApp(agent.id, notification);
    } else if (agent.type === "tui") {
      this.sendMessageToRemote.sendToTui(agent.id, notification);
    }
  }

  private hasPermission(agentId: string, filePath: string): boolean {
    return this.grantedPermissions.has(`${agentId}:${filePath}`);
  }

  private grantPermission(agentId: string, filePath: string): void {
    this.grantedPermissions.add(`${agentId}:${filePath}`);
  }
}