import { BaseSendManualInterruptNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific SendManualInterrupt Node - actual implementation
export class SendManualInterruptNode extends BaseSendManualInterruptNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const response = await codebolt.terminal.sendManualInterrupt();

      // Update outputs with success results
      this.setOutputData(1, response);
      this.setOutputData(2, true);

      // Trigger the interruptSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error sending manual interrupt: ${error}`;
      this.setOutputData(1, errorMessage);
      this.setOutputData(2, false);
      console.error('SendManualInterruptNode error:', error);
    }
  }
}