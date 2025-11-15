import { BaseSendMessageNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific SendMessage Node - actual implementation
export class SendMessageNode extends BaseSendMessageNode {
  constructor() {
    super();
  }

  async onExecute() {

    const messageToSend :any = this.getInputData(1);
        
    let finalMessage = ""; 
    if (messageToSend && typeof messageToSend === 'string' && messageToSend.trim()) {
      finalMessage = messageToSend;
    } else {
      const errorMessage = 'Error: Message cannot be empty';
      console.error('SendMessageNode error:', errorMessage);
      this.setOutputData(0, errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      await codebolt.chat.sendMessage(finalMessage);

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
