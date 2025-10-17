import fs from 'fs';
import {
  ClientConnection,
  formatLogMessage,
  isValidFilePath
} from '../types';
import { NotificationService } from '../services/NotificationService';
import type { DeleteFileEvent, FileDeleteRequestNotification, FileDeleteResponseNotification } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../core/connectionManagers/connectionManager';
import { logger } from '../utils/logger';

/**
 * Handles delete file messages with notifications
 */
export class DeleteFileHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
  }

  /**
   * Handle the actual file delete operation
   */
  handleDeleteFile(agent: ClientConnection, deleteFileEvent: DeleteFileEvent): void {
    const { requestId, message } = deleteFileEvent;
    const { filename, filePath } = message;

    // Send request notification to app
    const requestNotification: FileDeleteRequestNotification = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'fsnotify',
      action: 'deleteFileRequest',
      data: {
        fileName: filename,
        filePath
      }
    };

    this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    logger.info(formatLogMessage('info', 'AgentMessageRouter', `Sent delete file request notification for: ${filePath}`));

    try {
      // Security check
      if (!isValidFilePath(filePath)) {
        const errorResponse = {
          success: false,
          error: 'Invalid file path. Only absolute paths without .. are allowed.',
          type: 'deleteFileResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        const errorResponse = {
          success: false,
          error: `File does not exist: ${filePath}`,
          type: 'deleteFileResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Delete the file
      fs.unlinkSync(filePath);
      
      const response = {
        success: true,
        message: `File deleted successfully: ${filePath}`,
        type: 'deleteFileResponse',
        id: requestId,
        filePath: filePath
      };

      this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

      // Send response notification to app
      const responseNotification: FileDeleteResponseNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'fsnotify',
        action: 'deleteFileResult',
        content: {
          fileName: filename,
          filePath
        },
        isError: false
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
      logger.info(formatLogMessage('info', 'AgentMessageRouter', `Sent delete file response notification for: ${filePath}`));

    } catch (error) {
      const errorResponse = {
        success: false,
        error: `Failed to delete file: ${error}`,
        type: 'deleteFileResponse',
        id: requestId
      };

      this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

      // Send error notification using FileDeleteResponseNotification with isError flag
      const errorNotification: FileDeleteResponseNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'fsnotify',
        action: 'deleteFileResult',
        content: {
          fileName: filename,
          filePath: `Error deleting file: ${error}`
        },
        isError: true
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
    }
  }
}
