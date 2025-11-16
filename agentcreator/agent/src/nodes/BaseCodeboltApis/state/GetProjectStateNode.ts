import { BaseGetProjectStateNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific GetProjectState Node - actual implementation
export class GetProjectStateNode extends BaseGetProjectStateNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const result = await codebolt.state.getProjectState();

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the projectStateRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error getting project state: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('GetProjectStateNode error:', error);
    }
  }
}