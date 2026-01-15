import { BaseAddToAgentStateNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific AddToAgentState Node - actual implementation
export class AddToAgentStateNode extends BaseAddToAgentStateNode {
  constructor() {
    super();
  }

  async onExecute() {
    const key = this.getInputData(1);
    const value = this.getInputData(2);

    if (!key || typeof key !== 'string' || !key.trim()) {
      const errorMessage = 'Error: Key cannot be empty';
      console.error('AddToAgentStateNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    if (value === null || value === undefined) {
      const errorMessage = 'Error: Value cannot be null or undefined';
      console.error('AddToAgentStateNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      const result = await codebolt.cbstate.addToAgentState(key, String(value));

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the stateAdded event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error adding to agent state: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('AddToAgentStateNode error:', error);
    }
  }
}