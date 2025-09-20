import fs from 'fs';
import path from 'path';
import {
  ClientConnection,
  formatLogMessage,
  isValidFilePath
} from '@codebolt/types/remote';
import type { FileListEvent } from '@codebolt/types/agent-to-app-ws-types';
import { SendMessageToApp } from '../sendMessageToApp.js';
import { NotificationService } from '../../services/NotificationService.js';
import { ConnectionManager } from '../../core/connectionManager.js';
import { listFiles, LIST_FILES_LIMIT } from '../../utils/parse-source-code/index.js';

/**
 * Handles file list messages - implements same logic as fsService.listFiles
 */
export class FileListHandler {
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;
  private sendMessageToApp: SendMessageToApp;

  constructor() {
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
    this.sendMessageToApp = new SendMessageToApp();
  }

  /**
   * Handle file list request - implements functionality similar to fsService.listFiles
   */
  async handleFileList(agent: ClientConnection, fileListEvent: FileListEvent) {
    const { requestId, message } = fileListEvent;
    const { folderPath, isRecursive } = message;

    console.log(formatLogMessage('info', 'AgentMessageRouter', `Handling file list request for: ${folderPath}, recursive: ${isRecursive}`));
    
    try {
      // Security check
      if (!isValidFilePath(folderPath)) {
        const errorResponse = {
          success: false,
          error: 'Invalid folder path. Only absolute paths without .. are allowed.',
          type: 'fileListResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Check if directory exists
      if (!fs.existsSync(folderPath)) {
        const errorResponse = {
          success: false,
          error: `Directory does not exist: ${folderPath}`,
          type: 'fileListResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Check if path is actually a directory
      const stats = fs.statSync(folderPath);
      if (!stats.isDirectory()) {
        const errorResponse = {
          success: false,
          error: `Path is not a directory: ${folderPath}`,
          type: 'fileListResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // List files using the original parse-source-code implementation
      const files = await listFiles(folderPath, isRecursive || false);
      const formattedFiles = this.formatFilesList(folderPath, files);
      
      const response = {
        success: true,
        data: formattedFiles,
        files: files,
        type: 'fileListResponse',
        id: requestId,
        folderPath: folderPath
      };

      this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });
      console.log(formatLogMessage('info', 'AgentMessageRouter', `Successfully listed ${files.length} items for: ${folderPath}`));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorResponse = {
        success: false,
        error: `Failed to list files: ${errorMessage}`,
        type: 'fileListResponse',
        id: requestId
      };

      this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
      console.error(formatLogMessage('error', 'AgentMessageRouter', `Error listing files: ${errorMessage}`));
    }
  }



  /**
   * Format files list similar to fsService.formatFilesList
   */
  private formatFilesList(absolutePath: string, files: string[]): string {
    const sorted = files
      .map((file) => {
        // Convert absolute path to relative path
        const relativePath = path.relative(absolutePath, file);
        return file.endsWith("/") ? relativePath + "/" : relativePath;
      })
      .sort((a, b) => {
        const aParts = a.split("/");
        const bParts = b.split("/");
        for (let i = 0; i < Math.min(aParts.length, bParts.length); i++) {
          if (aParts[i] !== bParts[i]) {
            // If one is a directory and the other isn't at this level, sort the directory first
            if (i + 1 === aParts.length && i + 1 < bParts.length) {
              return -1;
            }
            if (i + 1 === bParts.length && i + 1 < aParts.length) {
              return 1;
            }
            // Otherwise, sort alphabetically
            return aParts[i].localeCompare(bParts[i], undefined, { numeric: true, sensitivity: "base" });
          }
        }
        // If all parts are the same up to the length of the shorter path,
        // the shorter one comes first
        return aParts.length - bParts.length;
      });

    if (sorted.length >= 200) {
      const truncatedList = sorted.slice(0, 200).join("\n");
      return `${truncatedList}\n\n(Truncated at 200 results. Try listing files in subdirectories if you need to explore further.)`;
    } else if (sorted.length === 0 || (sorted.length === 1 && sorted[0] === "")) {
      return "No files found";
    } else {
      return sorted.join("\n");
    }
  }
}
