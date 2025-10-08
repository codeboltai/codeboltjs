import fs from 'fs';
import {
  ClientConnection,
  formatLogMessage,
  isValidFilePath
} from '../types';
import { NotificationService } from '../services/NotificationService';
import type { DeleteFolderEvent, FolderDeleteRequestNotification, FolderDeleteResponseNotification } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../core/connectionManagers/connectionManager';

/**
 * Handles delete folder messages with notifications
 */
export class DeleteFolderHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
  }

  /**
   * Handle the actual folder delete operation
   */
  handleDeleteFolder(agent: ClientConnection, deleteFolderEvent: DeleteFolderEvent): void {
    const { requestId, message } = deleteFolderEvent;
    const { foldername, folderpath } = message;

    // Send request notification to app
    const requestNotification: FolderDeleteRequestNotification = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'fsnotify',
      action: 'deleteFolderRequest',
      data: {
        folderName: foldername,
        folderPath: folderpath
      }
    };

    this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    console.log(formatLogMessage('info', 'AgentMessageRouter', `Sent delete folder request notification for: ${folderpath}`));

    try {
      // Security check
      if (!isValidFilePath(folderpath)) {
        const errorResponse = {
          success: false,
          error: 'Invalid folder path. Only absolute paths without .. are allowed.',
          type: 'deleteFolderResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Check if folder exists
      if (!fs.existsSync(folderpath)) {
        const errorResponse = {
          success: false,
          error: `Folder does not exist: ${folderpath}`,
          type: 'deleteFolderResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Check if it's actually a directory
      const stats = fs.statSync(folderpath);
      if (!stats.isDirectory()) {
        const errorResponse = {
          success: false,
          error: `Path is not a directory: ${folderpath}`,
          type: 'deleteFolderResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Delete the folder recursively
      fs.rmSync(folderpath, { recursive: true, force: true });
      
      const response = {
        success: true,
        message: `Folder deleted successfully: ${folderpath}`,
        type: 'deleteFolderResponse',
        id: requestId,
        folderPath: folderpath
      };

      this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

      // Send response notification to app
      const responseNotification: FolderDeleteResponseNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'fsnotify',
        action: 'deleteFolderResult',
        content: {
          folderName: foldername,
          folderPath: folderpath
        },
        isError: false
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
      console.log(formatLogMessage('info', 'AgentMessageRouter', `Sent delete folder response notification for: ${folderpath}`));

    } catch (error) {
      const errorResponse = {
        success: false,
        error: `Failed to delete folder: ${error}`,
        type: 'deleteFolderResponse',
        id: requestId
      };

      this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

      // Send error notification using FolderDeleteResponseNotification with isError flag
      const errorNotification: FolderDeleteResponseNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'fsnotify',
        action: 'deleteFolderResult',
        content: {
          folderName: foldername,
          folderPath: `Error deleting folder: ${error}`
        },
        isError: true
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
    }
  }
}
