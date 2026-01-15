import { BaseGetApplicationStateNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific GetApplicationState Node - actual implementation
export class GetApplicationStateNode extends BaseGetApplicationStateNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const result = await codebolt.cbstate.getApplicationState();

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the stateRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error getting application state: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('GetApplicationStateNode error:', error);
    }
  }
}