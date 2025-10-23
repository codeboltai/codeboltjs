import type { ClientConnection } from "../types";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
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

export class SearchFileContentHandler {
  private connectionManager = ConnectionManager.getInstance();
  private searchService: any;
  private permissionManager: PermissionManager;

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

  /**
   * Handle search_file_content tool with confirmation
   */
  async handleSearchFileContentTool(agent: ClientConnection, event: {
    type: string;
    action: string;
    requestId: string;
    toolName: string;
    params: any;
    messageId?: string;
    threadId?: string;
    agentInstanceId?: string;
    agentId?: string;
    parentAgentInstanceId?: string;
    parentId?: string;
  }): Promise<void> {
    try {
      const { pattern, path, include } = event.params;
      
      // Create confirmation message
      const messageData: SearchConfirmation = {
        type: "message",
        actionType: "FILESEARCH",
        sender: "agent",
        messageId: event.messageId || event.requestId,
        threadId: event.threadId || event.requestId,
        templateType: "FILESEARCH",
        timestamp: new Date().toISOString(),
        payload: {
          type: "search",
          query: pattern,
          path: path,
          results: [],
          stateEvent: "ASK_FOR_CONFIRMATION"
        },
        agentInstanceId: event.agentInstanceId || agent.instanceId,
        agentId: event.agentId || agent.id,
        parentAgentInstanceId: event.parentAgentInstanceId,
        parentId: event.parentId
      };

      // Check permission using centralized system
      if (!PermissionUtils.hasPermission('search_file_content', path || '*', 'read')) {
        // Request permission through confirmation flow
        this.requestToolPermission(agent, event, 'search_file_content', path || '*', 'read');
        return;
      }

      // Execute search operation
      const result = await this.searchService.grepSearch(pattern, { path, include });
      
      if (result.success) {
        // Send success response
        const successResponse: SearchSuccess = {
          ...messageData,
          payload: {
            ...messageData.payload,
            results: result.matches || [],
            stateEvent: "FILE_READ"
          }
        };

        // Grant permission for future requests
        PermissionUtils.grantPermission('search_file_content', path || '*', 'read');

        this.connectionManager.sendToConnection(agent.id, {
          type: 'toolResponse',
          requestId: event.requestId,
          success: true,
          toolName: 'search_file_content',
          result: result.matches || [],
        });
      } else {
        // Send error response
        const errorResponse: SearchError = {
          ...messageData,
          payload: {
            ...messageData.payload,
            stateEvent: "FILE_READ_ERROR"
          }
        };

        this.connectionManager.sendToConnection(agent.id, {
          type: 'toolResponse',
          requestId: event.requestId,
          success: false,
          toolName: 'search_file_content',
          error: result.error || "Error searching file content",
        });
      }
    } catch (error) {
      logger.error(`Error handling search_file_content tool: ${error}`);
      this.connectionManager.sendToConnection(agent.id, {
        type: 'toolResponse',
        requestId: event.requestId,
        success: false,
        toolName: 'search_file_content',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Request permission for a tool operation
   */
  private requestToolPermission(
    agent: ClientConnection,
    event: any,
    toolName: string,
    resourcePath: string,
    permissionType: 'read' | 'write' | 'execute' | 'all'
  ): void {
    // For now, auto-grant permissions (can be made configurable)
    // In a real implementation, this would send a confirmation request to the UI
    PermissionUtils.grantPermission(toolName, resourcePath, permissionType);
    
    logger.info(`Auto-granted permission for ${toolName}:${resourcePath}:${permissionType}`);
    
    // Re-execute the tool with granted permission
    this.handleSearchFileContentTool(agent, event);
  }
}
