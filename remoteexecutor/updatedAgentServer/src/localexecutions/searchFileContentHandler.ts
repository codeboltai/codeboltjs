import { v4 as uuidv4 } from "uuid";

import type { ClientConnection } from "../types";
import { formatLogMessage } from "../types/utils";
import { ConnectionManager } from "../main/core/connectionManagers/connectionManager.js";
// Remove SendMessageToRemote import as it's no longer needed
import { DefaultFileSystem } from "../utils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../utils/DefaultWorkspaceContext";
import { logger } from "../main/utils/logger";
import { PermissionManager, PermissionUtils } from "./PermissionManager";
import { createSearchService } from "../services/SearchService";
// Add imports for the new approval system
import { ApprovalService, NotificationService, ClientResolver, type TargetClient } from "../shared";

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
  targetClient?: TargetClient; // Use TargetClient type
};

export interface SearchFileContentConfirmation {
  type: "confirmationResponse";
  messageId: string;
  userMessage: string;
}

export class SearchFileContentHandler {
  private connectionManager = ConnectionManager.getInstance();
  // Remove sendMessageToRemote as it's no longer needed
  private searchService: any;
  private permissionManager: PermissionManager;
  // Add new services
  private approvalService = new ApprovalService();
  private notificationService = NotificationService.getInstance();
  private clientResolver = new ClientResolver();

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

    const targetClient = this.clientResolver.resolveParent(agent);

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

    // Use the new approval service
    this.approvalService.requestSearchFileContentApproval({
      agent,
      targetClient,
      messageId,
      requestId,
      pattern,
      path
    });
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
      // Use the notification service for rejection
      this.notificationService.sendSearchRejection({
        agent,
        requestId,
        query: payload.pattern,
        path: payload.path || '*',
        reason: message.userMessage || "Search file content request rejected",
        targetClient
      });
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
      // Use the notification service for rejection
      this.notificationService.sendSearchRejection({
        agent,
        requestId,
        query: payload.pattern,
        path: payload.path || '*',
        reason: message.reason ?? "Search file content request rejected",
        targetClient
      });
      return;
    }

    const searchPath = payload.path || '*';
    PermissionUtils.grantPermission('search_file_content', searchPath, 'read');
    void this.executeSearchFileContent(agent, request, targetClient);
  }

  private async executeSearchFileContent(
    agent: ClientConnection,
    event: SearchFileContentEvent,
    targetClient?: TargetClient // Use TargetClient type
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

        // Use the notification service for success
        this.notificationService.sendSearchSuccess({
          agent,
          requestId,
          query: pattern,
          path: path || '*',
          results: result.matches || [],
          targetClient
        });
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

  // Remove the resolveParent method as it's now handled by ClientResolver

  // Remove the requestApproval method as it's now handled by ApprovalService

  // Remove the sendRejection method as it's now handled by NotificationService

  // Remove the sendApprovalNotification method as it's now handled by NotificationService

  // Remove the notifyClients method as it's now handled by NotificationService
}