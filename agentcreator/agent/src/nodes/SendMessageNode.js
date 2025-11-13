import { BaseSendMessageNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific SendMessage Node - actual implementation
export class SendMessageNode extends BaseSendMessageNode {
  constructor() {
    super();
    // Backend doesn't need any additional UI widgets or setup
  }


  // Handle the action - this will be called when triggered by the event
  async onAction(action, param) {

    console.log('[Utkarsh1] onAction called with action:', action, 'param:', param);
    try {
      // Call codebolt.chat.sendMessage
      const response = await codebolt.chat.sendMessage("Hello");
      console.log('SendMessageNode: Message sent successfully');

      // Update outputs with results
      // this.properties.response = response;
      this.setOutputData(0, "success");
      this.setOutputData(1, true);

      // return response;
    } catch (error) {
      const errorMessage = `Error sending message: ${error.message}`;
      this.setOutputData(0, "failure");
      this.setOutputData(1, false);
      console.error('SendMessageNode error:', error);
      // return { success: false, error: errorMessage };
    }
    // return;
  }
}
