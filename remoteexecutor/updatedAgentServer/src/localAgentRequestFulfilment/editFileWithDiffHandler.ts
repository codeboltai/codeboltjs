import {
  ClientConnection,
  formatLogMessage
} from '../types';
import type { EditFileWithDiffEvent } from '@codebolt/types/agent-to-app-ws-types';
import { SendMessageToApp } from '../handlers/appMessaging/sendMessageToApp';
import { logger } from '../utils/logger';

/**
 * Handles edit file with diff messages - forwards to app for processing
 */
export class EditFileWithDiffHandler {
  private sendMessageToApp: SendMessageToApp;

  constructor() {
    this.sendMessageToApp = new SendMessageToApp();
  }

  /**
   * Handle edit file with diff request - forward to app
   */
  handleEditFileWithDiff(agent: ClientConnection, editFileWithDiffEvent: EditFileWithDiffEvent): void {
    const { requestId, message } = editFileWithDiffEvent;
    const { target_file, code_edit, diffIdentifier, prompt, applyModel } = message;

    logger.info(formatLogMessage('info', 'AgentMessageRouter', `Handling edit file with diff request for: ${target_file}`));

    // Forward to app for processing
    this.sendMessageToApp.forwardToApp(agent, editFileWithDiffEvent as any);
  }
}
