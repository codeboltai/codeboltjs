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
    console.log('[Utkarsh1] Input connections:', this.inputs?.map((input, idx) => ({ 
      slot: idx, 
      name: input.name, 
      type: input.type,
      connected: input.link !== null,
      data: this.getInputData(idx) 
    })));
    
    // Check if we're connected to the OnMessageNode output
    const messageInput = this.getInputData(1);
    console.log('[Utkarsh1] Raw input data from slot 1:', messageInput);
    console.log('[Utkarsh1] Type of input data:', typeof messageInput);

    // Get the message from input slot 1 and validate it
    const messageToSend :any = this.getInputData(1);

    console.log("[utkarsh4] the message is ", messageToSend);
    
    // Handle different types of input data
    let finalMessage = "Hi Data"; // default fallback
    
    if (messageToSend) {
      if (typeof messageToSend === 'string') {
        finalMessage = messageToSend;
      } else if (typeof messageToSend === 'object' && messageToSend.userMessage) {
        // If we get the full message object, extract the userMessage
        finalMessage = messageToSend.userMessage;
      } else {
        // Convert to string if it's something else
        finalMessage = String(messageToSend);
      }
    }
    
    console.log('[utkarsh3] the final message is ', finalMessage);
    console.log('[utkarsh3] final message type:', typeof finalMessage);
    // Validate the input message
    if (typeof finalMessage !== 'string' || !finalMessage.trim()) {
      const errorMessage = 'Error: Message cannot be empty';
      console.error('SendMessageNode error:', errorMessage);
      this.setOutputData(0, errorMessage);
      this.setOutputData(1, false);
      return;
    }

    console.log('SendMessageNode: Sending message:', finalMessage);

    try {
      // Call codebolt.chat.sendMessage with the validated message
      await codebolt.chat.sendMessage(finalMessage);
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
