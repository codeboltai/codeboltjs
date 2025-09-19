import fs from 'fs';
import {
  ClientConnection,
  ReadFileMessage,
  formatLogMessage,
  isValidFilePath
} from '@codebolt/types/remote';
import { NotificationService } from '../../services/NotificationService';
import type { ReadFileEvent, FileReadRequestNotification, FileReadResponseNotification } from '@codebolt/types/agent-to-app-ws-types';
import { ConnectionManager } from '../../core/connectionManager';
import { response } from 'express';
/**
 * Handles read file messages with notifications
 */

export class ReadFileHandler  {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;


  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();


  }
  /**
   * Handle the actual file read operation
   */
  handleReadFile(agent: ClientConnection, readFileEvent: ReadFileEvent){
    const { requestId, message } = readFileEvent;
    const { filePath } = message;

    // Send request notification to app
    // const requestNotification: FileReadRequestNotification = {
    //   requestId: requestId,
    //   toolUseId: requestId,
    //   type: 'fsnotify',
    //   action: 'readFileRequest',
    //   data: {
    //     filePath: filePath
    //   }
    // };

    // this.notificationService.sendToAppRelatedToAgentId(agent.id, requestNotification as any);
    console.log(formatLogMessage('info', 'AgentMessageRouter', `Sent read file request notification for: ${filePath}`));
    try {

      const filepath = readFileEvent.message.filePath;
         // Security check
         if (!isValidFilePath(filepath)) {
          const errorResponse = {
            success: false,
            error: 'Invalid file path. Only absolute paths without .. are allowed.',
            type: 'readFileResponse',
            id: requestId
          };
          
          this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
          return;
        }
    
        const content = fs.readFileSync(filepath, 'utf8');
        
        const response = {
          success: true,
          data: content,
          type: 'readFileResponse',
          id: requestId,
          filepath: filepath
        };
      this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });

      // Send response notification to app
      const responseNotification: FileReadResponseNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'fsnotify',
        action: 'readFileResult',
        data: {
          filePath,
          content: response.data
        },
        isError: false
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, responseNotification as any);
      console.log(formatLogMessage('info', 'AgentMessageRouter', `Sent read file response notification for: ${filePath}`));

    } catch (error) {
      const errorResponse = {
        success: false,
        error: `Failed to read file: ${error}`,
        type: 'readFileResponse',
        id: requestId
      };

      this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });

      // Send specific error notification using the new FileReadErrorNotification type
      const errorNotification: FileReadResponseNotification = {
        requestId: requestId,
        toolUseId: requestId,
        type: 'fsnotify',
        action: 'readFileResult',
        data: {
          filePath: filePath,
          error: `Error reading file: ${error}`
        } as any,
        isError: true
      };

      this.notificationService.sendToAppRelatedToAgentId(agent.id, errorNotification as any);
    }
    
  }
}