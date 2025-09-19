import {
  ClientConnection,
  ResponseMessage,
  formatLogMessage
} from '@codebolt/types/remote';
import { BaseHandler } from './baseHandler';

/**
 * Handles response messages from agents
 */
export class ResponseHandler extends BaseHandler {
  handle(agent: ClientConnection, message: ResponseMessage): void {
    // Forward agent response back to the original client
    if (message.clientId) {
      const success = this.connectionManager.sendToApp(message.clientId!, message);
      if (success) {
        console.log(formatLogMessage('info', 'ResponseHandler', `Response forwarded to client ${message.clientId} from agent ${agent.id}`));
      } else {
        console.warn(formatLogMessage('warn', 'ResponseHandler', `Client ${message.clientId} not found for agent response`));
      }
    }
  }
}