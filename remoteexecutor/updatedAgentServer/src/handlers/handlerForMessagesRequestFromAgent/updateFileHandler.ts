import fs from 'fs';
import {
  ClientConnection,
  formatLogMessage,
  isValidFilePath
} from './../../types';
import { NotificationService } from '../../services/NotificationService';
import type { UpdateFileEvent, FileEditRequestNotification, FileEditResponseNotification } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../../core/connectionManager';

/**
 * Handles update file messages with notifications
 */
export class UpdateFileHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
  }

  /**
   * Handle the actual file update operation
   */
  handleUpdateFile(agent: ClientConnection, updateFileEvent: UpdateFileEvent): void {
    const { requestId, message } = updateFileEvent;
    const { filename, filePath, newContent } = message;

    // Send request notification to app
    const requestNotification: FileEditRequestNotification = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'fsnotify',
      action: 'updateFileRequest',
      data: {
        fileName: filename,
        filePath,
        newContent
      }
    };

    this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    console.log(formatLogMessage('info', 'AgentMessageRouter', `Sent update file request notification for: ${filePath}`));

    try {
      // Security check
      if (!isValidFilePath(filePath)) {
        const errorResponse = {
          success: false,
          error: 'Invalid file path. Only absolute paths without .. are allowed.',
          type: 'updateFileResponse',
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
          type: 'updateFileResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Update the file with new content
      fs.writeFileSync(filePath, newContent, 'utf8');
      
      const response = {
        success: true,
        message: `File updated successfully: ${filePath}`,
        type: 'updateFileResponse',
        id: requestId,
        filePath: filePath
      };

      this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

      // Send response notification to app
      const responseNotification: FileEditResponseNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'fsnotify',
        action: 'updateFileResult',
        content: {
          fileName: filename,
          filePath,
          content: newContent
        },
        isError: false
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
      console.log(formatLogMessage('info', 'AgentMessageRouter', `Sent update file response notification for: ${filePath}`));

    } catch (error) {
      const errorResponse = {
        success: false,
        error: `Failed to update file: ${error}`,
        type: 'updateFileResponse',
        id: requestId
      };

      this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

      // Send error notification using FileEditResponseNotification with isError flag
      const errorNotification: FileEditResponseNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'fsnotify',
        action: 'updateFileResult',
        content: {
          fileName: filename,
          filePath,
          content: `Error updating file: ${error}`
        },
        isError: true
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
    }
  }
}
