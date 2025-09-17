import { formatLogMessage } from '@codebolt/shared-types';

/**
 * Handles incoming messages for the client
 */
export class AgentMessageHandler {
  
  /**
   * Process incoming messages
   */
  handleMessage(message: unknown): void {
    const msg = message as { type: string; success?: boolean; data?: unknown; error?: string };
    
    switch (msg.type) {
      case 'registered':
        console.log(formatLogMessage('info', 'MessageHandler', 'Successfully registered as client'));
        break;
        
      case 'response':
        this.handleResponse(msg);
        break;
        
      case 'connection':
        console.log(formatLogMessage('info', 'MessageHandler', `Connection established: ${JSON.stringify(message)}`));
        break;
        
      default:
        console.log(formatLogMessage('info', 'MessageHandler', `Received message: ${JSON.stringify(message)}`));
    }
  }

  /**
   * Handle response messages
   */
  private handleResponse(msg: { success?: boolean; data?: unknown; error?: string }): void {
    if (msg.success) {
      console.log(formatLogMessage('info', 'MessageHandler', `Response received: ${JSON.stringify(msg.data)}`));
      
      // Handle specific response types
      if (msg.data && typeof msg.data === 'object') {
        const data = msg.data as any;
        
        if (data.content && data.filepath) {
          console.log(formatLogMessage('info', 'MessageHandler', `File read successful: ${data.filepath} (${data.content.length} characters)`));
        } else if (data.response && data.model) {
          console.log(formatLogMessage('info', 'MessageHandler', `AI Response: ${data.response} (model: ${data.model})`));
        } else if (data.message === 'File written successfully') {
          console.log(formatLogMessage('info', 'MessageHandler', `File written successfully: ${data.filepath}`));
        }
      }
    } else {
      console.error(formatLogMessage('error', 'MessageHandler', `Error response: ${msg.error}`));
    }
  }
}