import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { SendMessageToRemote } from "../handlers/remoteMessaging/sendMessageToRemote.js";
import { DefaultFileSystem } from "../utils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../utils/DefaultWorkspaceContext";
import { logger } from "../utils/logger";
import { PermissionManager, PermissionUtils } from "./PermissionManager";
import { createSearchService } from "../services/SearchService";

import {
  SearchConfirmation,
  SearchInProgress,
  SearchSuccess,
  SearchError,
  SearchRejected,
} from "@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas";

export interface SearchFileContentEvent {
  type: "fsEvent";
  action: "searchFileContent";
  requestId: string;
  message: {
    pattern: string;
    path?: string;
    include?: string[];
  };
}

type PendingRequest = {
  agent: ClientConnection;
  request: SearchFileContentEvent;
  targetClient?: { id: string; type: "app" | "tui" };
};

export interface SearchFileContentConfirmation {
  type: "confirmationResponse";
  messageId: string;
  userMessage: string;
}

export class SearchFileContentHandler {
  private connectionManager = ConnectionManager.getInstance();
  private sendMessageToRemote = new SendMessageToRemote();
  private searchService: any;
  private permissionManager: PermissionManager;

  private pendingRequests = new Map<string, PendingRequest>();

  constructor() {
    // Initialize SearchService with default configuration
    const config = {
      targetDir: process.cwd(),
      workspaceContext: new DefaultWorkspaceContext(),
      fileSystemService: new DefaultFileSystem(),
    };
    this.searchService = createSearchService(config);
    
    // Initialize PermissionManager
    this.permissionManager = PermissionManager.getInstance();
    this.permissionManager.initialize();
  }

  async handleSearchFileContent(agent: ClientConnection, event: SearchFileContentEvent): Promise<void> {
    const { requestId, message } = event;
    const { pattern, path, include } = message;

    const targetClient = this.resolveParent(agent);

    if (!targetClient) {
      await this.executeSearchFileContent(agent, event);
      return;
    }

    // Check if permission exists using centralized permission system
    const searchPath = path || '*';
    if (PermissionUtils.hasPermission('search_file_content', searchPath, 'read')) {
      await this.executeSearchFileContent(agent, event, targetClient);
      return;
    }

    const messageId = uuidv4();
    this.pendingRequests.set(messageId, { agent, request: event, targetClient });

    this.requestApproval(agent, targetClient, messageId, event);
  }

  async handleConfirmation(message: SearchFileContentConfirmation): Promise<void> {
    const record = this.pendingRequests.get(message.messageId);

    if (!record) {
      logger.warn(
        formatLogMessage(
          "warn",
          "SearchFileContentHandler",
          `No pending search file content request for ${message.messageId}`
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
        payload.pattern,
        payload.path,
        message.userMessage || "Search file content request rejected",
        targetClient
      );
      return;
    }

    const searchPath = payload.path || '*';
    PermissionUtils.grantPermission('search_file_content', searchPath, 'read');
    await this.executeSearchFileContent(agent, request, targetClient);
  }

  handleRemoteNotification(message: {
    messageId: string;
    type: string;
    state?: string;
    reason?: string;
  }): void {
    if (message.type !== "searchFileContentApproval") {
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
        payload.pattern,
        payload.path,
        message.reason ?? "Search file content request rejected",
        targetClient
      );
      return;
    }

    const searchPath = payload.path || '*';
    PermissionUtils.grantPermission('search_file_content', searchPath, 'read');
    void this.executeSearchFileContent(agent, request, targetClient);
  }

  private async executeSearchFileContent(
    agent: ClientConnection,
    event: SearchFileContentEvent,
    targetClient?: { id: string; type: "app" | "tui" }
  ): Promise<void> {
    const { requestId, message } = event;
    const { pattern, path, include } = message;

    try {
      const result = await this.searchService.grepSearch(pattern, { path, include });
      
      if (result.success) {
        const response = {
          type: "searchFileContentResponse" as const,
          requestId,
          success: true,
          pattern,
          path: path || '*',
          matches: result.matches || [],
          totalMatches: result.matches?.length || 0,
        };

        this.connectionManager.sendToConnection(agent.id, {
          ...response,
          clientId: agent.id,
        });

        this.sendApprovalNotification(agent, requestId, pattern, path || '*', result.matches || [], targetClient);
      } else {
        const response = {
          type: "searchFileContentResponse" as const,
          requestId,
          success: false,
          pattern,
          path: path || '*',
          message: result.error || "Error searching file content",
          error: result.error || "Error searching file content",
          matches: [],
          totalMatches: 0,
        };

        this.connectionManager.sendToConnection(agent.id, {
          ...response,
          clientId: agent.id,
        });
      }
    } catch (error) {
      logger.error(
        formatLogMessage("error", "SearchFileContentHandler", `Search file content failed for pattern: ${pattern}`),
        error
      );

      const response = {
        type: "searchFileContentResponse" as const,
        requestId,
        success: false,
        pattern,
        path: path || '*',
        message: "Error searching file content",
        error: error instanceof Error ? error.message : "Unknown error",
        matches: [],
        totalMatches: 0,
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
    event: SearchFileContentEvent
  ): void {
    const { requestId, message } = event;
    const { pattern, path, include } = message;

    const payload: SearchConfirmation = {
      type: "message" as const,
      actionType: "FILESEARCH" as const,
      templateType: "FILESEARCH" as const,
      sender: "agent" as const,
      messageId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "search" as const,
        query: pattern,
        path: path || '*',
        results: [],
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
        "SearchFileContentHandler",
        `Requested approval for searching file content with pattern: ${pattern} in ${path || '*'}`,
      )
    );
  }

  private sendRejection(
    agent: ClientConnection,
    requestId: string,
    pattern: string,
    path: string | undefined,
    reason: string,
    targetClient?: { id: string; type: "app" | "tui" }
  ): void {
    const response = {
      type: "searchFileContentResponse" as const,
      requestId,
      success: false,
      pattern,
      path: path || '*',
      message: reason || "Search file content request rejected",
      error: reason || "Rejected by user",
      matches: [],
      totalMatches: 0,
    };

    this.connectionManager.sendToConnection(agent.id, {
      ...response,
      clientId: agent.id,
    });

    const notification: SearchRejected = {
      type: "message" as const,
      actionType: "FILESEARCH" as const,
      templateType: "FILESEARCH" as const,
      sender: "agent" as const,
      messageId: requestId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "search" as const,
        query: pattern,
        path: path || '*',
        results: [],
        stateEvent: "REJECTED" as const,
      },
    };

    this.notifyClients(notification, targetClient);
    this.sendMessageToRemote.forwardAgentMessage(agent, notification);
  }

  private sendApprovalNotification(
    agent: ClientConnection,
    requestId: string,
    pattern: string,
    path: string,
    matches: any[],
    targetClient?: { id: string; type: "app" | "tui" }
  ): void {
    const notification: SearchSuccess = {
      type: "message" as const,
      actionType: "FILESEARCH" as const,
      templateType: "FILESEARCH" as const,
      sender: "agent" as const,
      messageId: requestId,
      threadId: requestId,
      timestamp: Date.now().toString(),
      agentId: agent.id,
      agentInstanceId: agent.instanceId,
      payload: {
        type: "search" as const,
        query: pattern,
        path,
        results: matches,
        stateEvent: "FILE_READ" as const,
      },
    };

    this.notifyClients(notification, targetClient);
    this.sendMessageToRemote.forwardAgentMessage(agent, notification);
  }

  private notifyClients(
    notification: SearchSuccess | SearchError | SearchRejected,
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
