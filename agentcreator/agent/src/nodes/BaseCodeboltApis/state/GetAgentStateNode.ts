import { BaseGetAgentStateNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific GetAgentState Node - actual implementation
export class GetAgentStateNode extends BaseGetAgentStateNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const result = await codebolt.state.getAgentState();

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the agentStateRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error getting agent state: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('GetAgentStateNode error:', error);
    }
  }
}