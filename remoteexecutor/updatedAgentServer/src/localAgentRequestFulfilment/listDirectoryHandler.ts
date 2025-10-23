import type { ClientConnection } from "../types";
import { ConnectionManager } from "../core/connectionManagers/connectionManager.js";
import { FileServices, createFileServices } from "../services/FileServices";
import { DefaultFileSystem } from "../utils/DefaultFileSystem";
import { DefaultWorkspaceContext } from "../utils/DefaultWorkspaceContext";
import { logger } from "../utils/logger";
import { PermissionManager, PermissionUtils } from "./PermissionManager";

import {
  FolderReadConfirmation,
  FolderReadSuccess,
  FolderReadError,
  FolderReadRejected,
} from "@codebolt/types/wstypes/app-to-ui-ws/fileMessageSchemas";

export class ListDirectoryHandler {
  private connectionManager = ConnectionManager.getInstance();
  private fileServices: FileServices;
  private permissionManager: PermissionManager;

  constructor() {
    // Initialize FileServices with default configuration
    const config = {
      targetDir: process.cwd(),
      workspaceContext: new DefaultWorkspaceContext(),
      fileSystemService: new DefaultFileSystem(),
    };
    this.fileServices = createFileServices(config);
    
    // Initialize PermissionManager
    this.permissionManager = PermissionManager.getInstance();
    this.permissionManager.initialize();
  }

  /**
   * Handle list_directory tool with confirmation
   */
  async handleListDirectoryTool(agent: ClientConnection, event: {
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
      const { path } = event.params;
      
      // Create confirmation message
      const messageData: FolderReadConfirmation = {
        type: "message",
        actionType: "FOLDERREAD",
        sender: "agent",
        messageId: event.messageId || event.requestId,
        threadId: event.threadId || event.requestId,
        templateType: "FOLDERREAD",
        timestamp: new Date().toISOString(),
        payload: {
          type: "folder",
          path: path,
          content: [],
          stateEvent: "ASK_FOR_CONFIRMATION"
        },
        agentInstanceId: event.agentInstanceId || agent.instanceId,
        agentId: event.agentId || agent.id,
        parentAgentInstanceId: event.parentAgentInstanceId,
        parentId: event.parentId
      };

      // Check permission using centralized system
      if (!PermissionUtils.hasPermission('list_directory', path, 'read')) {
        // Request permission through confirmation flow
        this.requestToolPermission(agent, event, 'list_directory', path, 'read');
        return;
      }

      // Execute directory listing
      const result = await this.fileServices.listDirectory(path);
      
      if (result.success) {
        // Send success response
        const successResponse: FolderReadSuccess = {
          ...messageData,
          payload: {
            ...messageData.payload,
            content: (result.entries || []).map(entry => entry.name),
            stateEvent: "FILE_READ"
          }
        };

        // Grant permission for future requests
        PermissionUtils.grantPermission('list_directory', path, 'read');

        this.connectionManager.sendToConnection(agent.id, {
          type: 'toolResponse',
          requestId: event.requestId,
          success: true,
          toolName: 'list_directory',
          result: result.entries || [],
        });
      } else {
        // Send error response
        const errorResponse: FolderReadError = {
          ...messageData,
          payload: {
            ...messageData.payload,
            content: [],
            stateEvent: "FILE_READ_ERROR"
          }
        };

        this.connectionManager.sendToConnection(agent.id, {
          type: 'toolResponse',
          requestId: event.requestId,
          success: false,
          toolName: 'list_directory',
          error: result.error || "Error listing directory",
        });
      }
    } catch (error) {
      logger.error(`Error handling list_directory tool: ${error}`);
      this.connectionManager.sendToConnection(agent.id, {
        type: 'toolResponse',
        requestId: event.requestId,
        success: false,
        toolName: 'list_directory',
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
    this.handleListDirectoryTool(agent, event);
  }
}
