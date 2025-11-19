import { BaseUpdateActionPlanNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific UpdateActionPlan Node - actual implementation
export class UpdateActionPlanNode extends BaseUpdateActionPlanNode {
  constructor() {
    super();
  }

  async onExecute() {
    const planId = this.getInputData(1);
    const updateData = this.getInputData(2);

    if (!planId || typeof planId !== 'string' || !planId.trim()) {
      const errorMessage = 'Error: Plan ID cannot be empty';
      console.error('UpdateActionPlanNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    if (!updateData || typeof updateData !== 'object') {
      const errorMessage = 'Error: Update data must be a valid object';
      console.error('UpdateActionPlanNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      const result = await codebolt.actionPlan.updateActionPlan(planId, updateData);

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the planUpdated event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error updating action plan: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('UpdateActionPlanNode error:', error);
    }
  }
}