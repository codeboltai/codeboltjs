import { BaseGetPlanDetailNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific GetPlanDetail Node - actual implementation
export class GetPlanDetailNode extends BaseGetPlanDetailNode {
  constructor() {
    super();
  }

  async onExecute() {
    const planId = this.getInputData(1);

    if (!planId || typeof planId !== 'string' || !planId.trim()) {
      const errorMessage = 'Error: Plan ID cannot be empty';
      console.error('GetPlanDetailNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      const result = await codebolt.actionPlan.getPlanDetail(planId);

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the planDetailRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error getting plan detail: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('GetPlanDetailNode error:', error);
    }
  }
}