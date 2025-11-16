import { BaseCreateActionPlanNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific CreateActionPlan Node - actual implementation
export class CreateActionPlanNode extends BaseCreateActionPlanNode {
  constructor() {
    super();
  }

  async onExecute() {
    const name = this.getInputData(1) || this.properties.name;
    const description = this.getInputData(2) || this.properties.description;
    const agentId = this.getInputData(3) || this.properties.agentId;
    const agentName = this.getInputData(4) || this.properties.agentName;
    const status = this.getInputData(5) || this.properties.status;
    const planId = this.getInputData(6) || this.properties.planId;

    if (!name || typeof name !== 'string' || !name.trim()) {
      const errorMessage = 'Error: Action plan name cannot be empty';
      console.error('CreateActionPlanNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      const payload = {
        name,
        description,
        agentId,
        agentName,
        status,
        planId
      };

      const result = await codebolt.actionPlan.createActionPlan(payload);

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the planCreated event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error creating action plan: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('CreateActionPlanNode error:', error);
    }
  }
}