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
    console.log('SendMessageNode: sendMessage', message);
    try {
      // Call codebolt.chat.sendMessage
      const response = await codebolt.chat.sendMessage(message);
      return response;
    } catch (error) {
      // console.error('SendMessageNode: Error calling codebolt.chat.sendMessage:', error);
      throw new Error(`Failed to send message: ${error.message}`);
    }
  }

  // Override onExecute to handle async properly
  async onExecute() {
    console.log("[utkarsh] This is Starting to Execute SendMessageNode")
    console.log('SendMessageNode: onExecute');
    const message = this.validateMessage(this.getInputData(0));

    if (!message) {
      this.setOutputData(0, "Error: No message provided");
      this.setOutputData(1, false);
      return;
    }

    try {
      // Set loading state
      this.setOutputData(0, "Message Sent");
      this.setOutputData(1, false);

      // Call the actual codebolt.chat.sendMessage
      const response = await this.sendMessage(message);

      this.properties.response = response;
      this.setOutputData(0, response);
      this.setOutputData(1, true);

      // // console.log(`SendMessageNode ${this.id}: Message sent successfully: ${message.substring(0, 30)}...`);
    } catch (error) {
      const errorMessage = `Error sending message: ${error.message}`;
      this.setOutputData(0, errorMessage);
      this.setOutputData(1, false);

      // console.error(`SendMessageNode ${this.id}: Error sending message:`, error);
    }
  }
}