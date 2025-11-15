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
    console.log('[Utkarsh1] SendMessageNode onExecute called');
    console.log('[Utkarsh1] Node inputs count:', this.inputs?.length);
    console.log('[Utkarsh1] All input data:', this.inputs?.map((input, idx) => ({ slot: idx, data: this.getInputData(idx), name: input.name })));

    // Get the message from input slot 1 and validate it
    const messageToSend = this.getInputData(1);
    
    // Validate the input message
    if (typeof messageToSend !== 'string' || !messageToSend.trim()) {
      const errorMessage = 'Error: Message cannot be empty';
      console.error('SendMessageNode error:', errorMessage);
      this.setOutputData(0, errorMessage);
      this.setOutputData(1, false);
      return;
    }

    console.log('SendMessageNode: Sending message:', messageToSend);

    try {
      // Call codebolt.chat.sendMessage with the validated message
      await codebolt.chat.sendMessage(messageToSend);
      console.log('[utkarsh2]:SendMessageNode: Message sent successfully');

      // Update outputs with success results
      this.setOutputData(0, "done");
      this.setOutputData(1, true);

    } catch (error) {
      const errorMessage = `Error: Failed to send message`;
      this.setOutputData(0, errorMessage);
      this.setOutputData(1, false);
      console.error('SendMessageNode error:', error);
    }
  }
}
