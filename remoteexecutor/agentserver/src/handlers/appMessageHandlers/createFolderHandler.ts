import fs from 'fs';
import {
  ClientConnection,
  formatLogMessage,
  isValidFilePath
} from '@codebolt/types/remote';
import { NotificationService } from '../../services/NotificationService';
import type { CreateFolderEvent, FolderCreateRequestNotification, FolderCreateResponseNotification } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../../core/connectionManager';

/**
 * Handles create folder messages with notifications
 */
export class CreateFolderHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
  }

  /**
   * Handle the actual folder create operation
   */
  handleCreateFolder(agent: ClientConnection, createFolderEvent: CreateFolderEvent): void {
    const { requestId, message } = createFolderEvent;
    const { folderName, folderPath } = message;

    // Send request notification to app
    const requestNotification: FolderCreateRequestNotification = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'fsnotify',
      action: 'createFolderRequest',
      data: {
        folderName,
        folderPath
      }
    };

    this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    console.log(formatLogMessage('info', 'AgentMessageRouter', `Sent create folder request notification for: ${folderPath}`));

    try {
      // Security check
      if (!isValidFilePath(folderPath)) {
        const errorResponse = {
          success: false,
          error: 'Invalid folder path. Only absolute paths without .. are allowed.',
          type: 'createFolderResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Check if folder already exists
      if (fs.existsSync(folderPath)) {
        const errorResponse = {
          success: false,
          error: `Folder already exists: ${folderPath}`,
          type: 'createFolderResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Create the folder
      fs.mkdirSync(folderPath, { recursive: true });
      
      const response = {
        success: true,
        message: `Folder created successfully: ${folderPath}`,
        type: 'createFolderResponse',
        id: requestId,
        folderPath: folderPath
      };

      this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

      // Send response notification to app
      const responseNotification: FolderCreateResponseNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'fsnotify',
        action: 'createFolderResult',
        content: {
          folderName,
          folderPath
        },
        isError: false
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
      console.log(formatLogMessage('info', 'AgentMessageRouter', `Sent create folder response notification for: ${folderPath}`));

    } catch (error) {
      const errorResponse = {
        success: false,
        error: `Failed to create folder: ${error}`,
        type: 'createFolderResponse',
        id: requestId
      };

      this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

      // Send error notification using FolderCreateResponseNotification with isError flag
      const errorNotification: FolderCreateResponseNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'fsnotify',
        action: 'createFolderResult',
        content: {
          folderName,
          folderPath: `Error creating folder: ${error}`
        },
        isError: true
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
    }
  }
}
