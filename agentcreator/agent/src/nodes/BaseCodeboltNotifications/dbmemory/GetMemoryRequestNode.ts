import { BaseGetMemoryRequestNode } from '@agent-creator/shared-nodes';
import { dbmemoryNotifications } from '@codebolt/codeboltjs';

// Backend GetMemoryRequestNode - actual implementation
export class GetMemoryRequestNode extends BaseGetMemoryRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const key: any = this.getInputData(1);
    const toolUseId: any = this.getInputData(2);

    // Validate required input
    if (!key || typeof key !== 'string' || !key.trim()) {
      const errorMessage = 'Error: Memory key is required and must be non-empty string';
      console.error('GetMemoryRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    // Validate optional toolUseId
    if (toolUseId !== undefined && typeof toolUseId !== 'string') {
      const errorMessage = 'Error: toolUseId must be a string value';
      console.error('GetMemoryRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      dbmemoryNotifications.GetMemoryRequestNotify(key, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send get memory request`;
      this.setOutputData(1, false);
      console.error('GetMemoryRequestNode error:', error);
    }
  }
}