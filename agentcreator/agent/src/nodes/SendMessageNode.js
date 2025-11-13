import { BaseSendMessageNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific SendMessage Node - actual implementation
export class SendMessageNode extends BaseSendMessageNode {
  constructor() {
    super();
    // Backend doesn't need any additional UI widgets or setup
  }

  // Backend execution logic with actual codebolt implementation
  async sendMessage(message) {
    console.log('SendMessageNode: Sending message:', message);
    try {
      // Call codebolt.chat.sendMessage
      const response = await codebolt.chat.sendMessage(message);
      console.log('SendMessageNode: Message sent successfully');
      return response;
    } catch (error) {
      console.error('SendMessageNode: Error sending message:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }
  
  // Handle the action - this will be called when triggered by the event
  async onAction(action, param) {
    if (action === 'onTrigger') {
      console.log('[Utkarsh1]: SendMessageNode: Received onTrigger with param:', param);
      // Delegate to base: it will read param or input slot 1 (message)
      await super.onAction(action, param);
    }
  }
}