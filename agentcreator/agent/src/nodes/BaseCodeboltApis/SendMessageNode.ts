import { BaseSendMessageNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific SendMessage Node - actual implementation
export class SendMessageNode extends BaseSendMessageNode {
  constructor() {
    super();
    // Backend doesn't need any additional UI widgets or setup
  }


  // Handle execution - this will be called when triggered by the event
  async onExecute() {
    console.log('[Utkarsh1] onExecute called');

    // Get the message from input slot 1 and ensure it's a string
    const messageToSend = this.getInputData(1) as string;

    console.log('SendMessageNode: Sending message:', messageToSend);

    try {
      // Call codebolt.chat.sendMessage
      const response = await codebolt.chat.sendMessage(messageToSend);
      console.log('[utkarsh2]:SendMessageNode: Message sent successfully');

      // Update outputs with results
      this.setOutputData(0, "done");
      this.setOutputData(1, true);

    } catch (error) {
      const errorMessage = `Error`;
      this.setOutputData(0, errorMessage);
      this.setOutputData(1, false);
      console.error('SendMessageNode error:', error);
    }
  }
}
