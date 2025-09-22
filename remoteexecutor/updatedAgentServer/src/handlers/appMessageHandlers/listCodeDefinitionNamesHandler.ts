import fs from 'fs';
import path from 'path';
import {
  ClientConnection,
  formatLogMessage,
  isValidFilePath
} from './../../types';
import type { ListCodeDefinitionNamesEvent } from '@codebolt/types/agent-to-app-ws-types';
import { SendMessageToApp } from '../sendMessageToApp.js';
import { NotificationService } from '../../services/NotificationService.js';
import { ConnectionManager } from '../../core/connectionManager.js';
// import { parseSourceCodeForDefinitionsTopLevel } from '../../utils/parse-source-code/index.js';

/**
 * Handles list code definition names messages - implements functionality similar to fsService.listCodeDefinitionNames
 */
export class ListCodeDefinitionNamesHandler {
  private sendMessageToApp: SendMessageToApp;
  private notificationService: NotificationService;
  private connectionManager: ConnectionManager;

  constructor() {
    this.sendMessageToApp = new SendMessageToApp();
    this.notificationService = NotificationService.getInstance();
    this.connectionManager = ConnectionManager.getInstance();
  }

  /**
   * Handle list code definition names request - parses source code for top-level definitions
   */
  async handleListCodeDefinitionNames(agent: ClientConnection, listCodeDefEvent: ListCodeDefinitionNamesEvent): Promise<void> {
    const { requestId, message } = listCodeDefEvent;
    const { path: dirPath } = message;

    console.log(formatLogMessage('info', 'AgentMessageRouter', `Handling list code definition names request for: ${dirPath}`));

    try {
      // Validate path parameter
      if (!dirPath) {
        const errorResponse = {
          success: false,
          error: 'Path parameter is required',
          type: 'listCodeDefinitionNamesResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Security check
      if (!isValidFilePath(dirPath)) {
        const errorResponse = {
          success: false,
          error: 'Invalid path. Only absolute paths without .. are allowed.',
          type: 'listCodeDefinitionNamesResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Check if path exists
      if (!fs.existsSync(dirPath)) {
        const errorResponse = {
          success: false,
          error: `Path does not exist: ${dirPath}`,
          type: 'listCodeDefinitionNamesResponse',
          id: requestId
        };
        
        this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
        return;
      }

      // Parse source code for definitions using the original implementation
      // const result = []// await parseSourceCodeForDefinitionsTopLevel(dirPath);
      
      // const response = {
      //   success: true,
      //   data: result,
      //   definitions: result.split('\n').filter(line => line.trim()),
      //   type: 'listCodeDefinitionNamesResponse',
      //   id: requestId,
      //   path: dirPath
      // };

      // this.connectionManager.sendToConnection(agent.id, { ...response, clientId: agent.id });
      console.log(formatLogMessage('info', 'AgentMessageRouter', `Successfully extracted code definitions from: ${dirPath}`));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorResponse = {
        success: false,
        error: `Failed to list code definitions: ${errorMessage}`,
        type: 'listCodeDefinitionNamesResponse',
        id: requestId
      };

      this.connectionManager.sendToConnection(agent.id, { ...errorResponse, clientId: agent.id });
      console.error(formatLogMessage('error', 'AgentMessageRouter', `Error listing code definitions: ${errorMessage}`));
    }
  }


}
