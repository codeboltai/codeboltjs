import { BaseFileCreateRequestNode } from '@agent-creator/shared-nodes';
import { fsNotifications } from '@codebolt/codeboltjs';

// Backend-specific FileCreateRequest Node - actual implementation
export class FileCreateRequestNode extends BaseFileCreateRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const fileName = this.getInputData(1);
    const source = this.getInputData(2);
    const filePath = this.getInputData(3);
    const toolUseId = this.getInputData(4);

    try {
      // Call the actual notification function
      fsNotifications.FileCreateRequestNotify(fileName, source, filePath, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send file create request`;
      this.setOutputData(1, false);
      console.error('FileCreateRequestNode error:', error);
    }
  }
}