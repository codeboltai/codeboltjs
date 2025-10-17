import fs from 'fs';
import path from 'path';
import {
  ClientConnection,
  formatLogMessage,
  isValidFilePath
} from '../types';
import { NotificationService } from '../services/NotificationService';
import type { CreateFileEvent, FileCreateRequestNotification, FileCreateResponseNotification } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../core/connectionManagers/connectionManager';
import { logger } from '../utils/logger';

/**
 * Handles create file messages with notifications
 */
export class CreateFileHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
  }

  /**
   * Handle the actual file create operation
   */
  handleCreateFile(agent: ClientConnection, createFileEvent: CreateFileEvent): void {
    const { requestId, message } = createFileEvent;
    const { fileName, source, filePath } = message;

    // Send request notification to app
    const requestNotification: FileCreateRequestNotification = {
      requestId: requestId,
      toolUseId: requestId,
      type: 'fsnotify',
      action: 'createFileRequest',
      data: {
        fileName,
        source,
        filePath
      }
    };

    this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    logger.info(formatLogMessage('info', 'AgentMessageRouter', `Sent create file request notification for: ${filePath}`));

    try {
      // Security check
      if (!isValidFilePath(filePath)) {
        const errorResponse = {
          success: false,
          error: 'Invalid file path. Only absolute paths without .. are allowed.',
          type: 'createFileResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Ensure directory exists
      const dirPath = path.dirname(filePath);
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Check if file already exists
      if (fs.existsSync(filePath)) {
        const errorResponse = {
          success: false,
          error: `File already exists: ${filePath}`,
          type: 'createFileResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Create the file with source content or empty
      const content = source || '';
      fs.writeFileSync(filePath, content, 'utf8');
      
      const response = {
        success: true,
        message: `File created successfully: ${filePath}`,
        type: 'createFileResponse',
        id: requestId,
        filePath: filePath
      };

      this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

      // Send response notification to app
      const responseNotification: FileCreateResponseNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'fsnotify',
        action: 'createFileResult',
        content: {
          fileName,
          filePath,
          source: content
        },
        isError: false
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
      logger.info(formatLogMessage('info', 'AgentMessageRouter', `Sent create file response notification for: ${filePath}`));

    } catch (error) {
      const errorResponse = {
        success: false,
        error: `Failed to create file: ${error}`,
        type: 'createFileResponse',
        id: requestId
      };

      this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

      // Send error notification using FileCreateResponseNotification with isError flag
      const errorNotification: FileCreateResponseNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'fsnotify',
        action: 'createFileResult',
        content: {
          fileName,
          filePath,
          source: `Error creating file: ${error}`
        },
        isError: true
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
    }
  }
}
