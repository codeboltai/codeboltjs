import { BaseSearchInitRequestNode } from '@agent-creator/shared-nodes';
import { searchNotifications } from '@codebolt/codeboltjs';

// Backend-specific SearchInitRequest Node - actual implementation
export class SearchInitRequestNode extends BaseSearchInitRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const engine = this.getInputData(1);
    const toolUseId = this.getInputData(2);

    try {
      // Call the actual notification function
      searchNotifications.SearchInitRequestNotify(engine, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send search init request`;
      this.setOutputData(1, false);
      console.error('SearchInitRequestNode error:', error);
    }
  }
}