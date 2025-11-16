import { BaseAddMemoryRequestNode } from '@agent-creator/shared-nodes';
import { dbmemoryNotifications } from '@codebolt/codeboltjs';

// Backend AddMemoryRequestNode - actual implementation
export class AddMemoryRequestNode extends BaseAddMemoryRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const key: any = this.getInputData(1);
    const value: any = this.getInputData(2);
    const toolUseId: any = this.getInputData(3);

    // Validate required inputs
    if (!key || typeof key !== 'string' || !key.trim()) {
      const errorMessage = 'Error: Memory key is required and must be non-empty string';
      console.error('AddMemoryRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    // Value can be any type except undefined (null is allowed)
    if (value === undefined) {
      const errorMessage = 'Error: Memory value is required (cannot be undefined)';
      console.error('AddMemoryRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    // Validate optional toolUseId
    if (toolUseId !== undefined && typeof toolUseId !== 'string') {
      const errorMessage = 'Error: toolUseId must be a string value';
      console.error('AddMemoryRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      dbmemoryNotifications.AddMemoryRequestNotify(key, value, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send add memory request`;
      this.setOutputData(1, false);
      console.error('AddMemoryRequestNode error:', error);
    }
  }
}