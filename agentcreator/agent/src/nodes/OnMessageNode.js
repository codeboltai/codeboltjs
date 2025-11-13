import { BaseOnMessageNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
// Backend-specific OnMessage Node - execution logic only
export class OnMessageNode extends BaseOnMessageNode {
  constructor() {
    super();
    this._messageReceived = false;
  }

  // Backend execution logic - waits for message and triggers event
  async onExecute() {
    // Only execute once - don't wait for message on every step
    if (this._messageReceived) {
      return;
    }

    this._messageReceived = true;

    try {
      // Wait for a message
      const message = await codebolt.getMessage();
      console.log('[Utkarsh]: Received message:', message);

      // Set the data output at slot 1
      this.setOutputData(1, message);

      // Trigger the event output at slot 0 (onTrigger)
      // this.triggerSlot(0, message);
      this.trigger('message_received', message);

      // Send a confirmation message
      await codebolt.chat.sendMessage("Processing your message...");

    } catch (error) {
      console.error('OnMessageNode: Error in message handling:', error);
      // Still trigger with error
      // this.onMessage({ error: error.message });
    }
  }
}