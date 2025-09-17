import {
  ClientConnection,
  formatLogMessage
} from '@codebolt/shared-types';
import type { SearchFilesEvent } from '@codebolt/types/agent-to-app-ws-types';
import { SendMessageToApp } from '../sendMessageToApp';

/**
 * Handles search files messages - forwards to app for processing
 */
export class SearchFilesHandler {
  private sendMessageToApp: SendMessageToApp;

  constructor() {
    this.sendMessageToApp = new SendMessageToApp();
  }

  /**
   * Handle search files request - forward to app
   */
  handleSearchFiles(agent: ClientConnection, searchFilesEvent: SearchFilesEvent): void {
    const { requestId, message } = searchFilesEvent;
    const { path, regex, filePattern } = message;

    console.log(formatLogMessage('info', 'AgentMessageRouter', `Handling search files request in: ${path} with pattern: ${filePattern}`));

    // Forward to app for processing
    this.sendMessageToApp.forwardToApp(agent, searchFilesEvent as any);
  }
}
