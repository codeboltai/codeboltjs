import { BaseGetAllPlansNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific GetAllPlans Node - actual implementation
export class GetAllPlansNode extends BaseGetAllPlansNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const result = await codebolt.actionPlan.getAllPlans();

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the plansRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error getting all action plans: ${error}`;
      this.setOutputData(1, []);
      this.setOutputData(2, false);
      console.error('GetAllPlansNode error:', error);
    }
  }
}