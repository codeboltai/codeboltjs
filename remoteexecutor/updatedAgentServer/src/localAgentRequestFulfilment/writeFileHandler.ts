import fs from 'fs';
import {
  ClientConnection,
  WriteFileMessage,
  formatLogMessage,
  isValidFilePath
} from '../types';  
import { NotificationService } from '../services/NotificationService';
import type { WriteToFileEvent, WriteToFileRequestNotification, WriteToFileResponseNotification } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../core/connectionManagers/connectionManager';
import { logger } from '../utils/logger';

/**
 * Handles write file messages with notifications
 */
export class WriteFileHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
  }

  /**
   * Handle the actual file write operation
   */
  handleWriteToFile(agent: ClientConnection, writeToFileEvent: WriteToFileEvent): void {
    const { requestId, message } = writeToFileEvent;
    const { relPath, newContent } = message;

    // Send request notification to app
    const requestNotification: WriteToFileRequestNotification = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'fsnotify',
      action: 'writeToFileRequest',
      data: {
        filePath: relPath,
        text: newContent
      }
    };

    this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    logger.info(formatLogMessage('info', 'AgentMessageRouter', `Sent write to file request notification for: ${relPath}`));

    try {
      // Security check
      if (!isValidFilePath(relPath)) {
        const errorResponse = {
          success: false,
          error: 'Invalid file path. Only absolute paths without .. are allowed.',
          type: 'writeFileResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      fs.writeFileSync(relPath, newContent, 'utf8');
      
      const response = {
        success: true,
        message: `File written successfully: ${relPath}`,
        type: 'writeFileResponse',
        id: requestId,
        filepath: relPath
      };

      this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

      // Send response notification to app
      const responseNotification: WriteToFileResponseNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'fsnotify',
        action: 'writeToFileResult',
        content: response.message || 'Success',
        isError: false
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
      logger.info(formatLogMessage('info', 'AgentMessageRouter', `Sent write to file response notification for: ${relPath}`));

    } catch (error) {
      const errorResponse = {
        success: false,
        error: `Failed to write file: ${error}`,
        type: 'writeFileResponse',
        id: requestId
      };

      this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

      // Send error notification using WriteToFileResponseNotification with isError flag
      const errorNotification: WriteToFileResponseNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'fsnotify',
        action: 'writeToFileResult',
        content: `Error writing file: ${error}`,
        isError: true
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
    }
  }

  /**
   * Legacy method for backward compatibility
   */
  handleWriteFile(message: WriteFileMessage): { success: boolean; message?: string; error?: string; type: string; id: string; filepath?: string } {
    try {
      const { filepath, content } = message;
      
      // Security check
      if (!isValidFilePath(filepath)) {
        return {
          success: false,
          error: 'Invalid file path. Only absolute paths without .. are allowed.',
          type: 'writeFileResponse',
          id: message.id
        };
      }
  
      fs.writeFileSync(filepath, content, 'utf8');
      
      return {
        success: true,
        message: `File written successfully: ${filepath}`,
        type: 'writeFileResponse',
        id: message.id,
        filepath: filepath
      };
      
    } catch (error) {
      return {
        success: false,
        error: `Failed to write file: ${error}`,
        type: 'writeFileResponse',
        id: message.id
      };
    }
  }
}