import { BaseCreateActionPlanNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific CreateActionPlan Node - actual implementation
export class CreateActionPlanNode extends BaseCreateActionPlanNode {
  constructor() {
    super();
  }

  async onExecute() {
    const getStringInput = (index: number, propertyKey: keyof typeof this.properties) => {
      const inputValue = this.getInputData(index);
      if (typeof inputValue === 'string' && inputValue.trim()) {
        return inputValue.trim();
      }

      const propertyValue = this.properties?.[propertyKey];
      return typeof propertyValue === 'string' && propertyValue.trim()
        ? propertyValue.trim()
        : undefined;
    };

    const name = getStringInput(1, 'name');
    const description = getStringInput(2, 'description');
    const agentId = getStringInput(3, 'agentId');
    const agentName = getStringInput(4, 'agentName');
    const status = getStringInput(5, 'status') ?? 'pending';
    const planId = getStringInput(6, 'planId');

    if (!name) {
      const errorMessage = 'Error: Action plan name cannot be empty';
      console.error('CreateActionPlanNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      const payload: {
        name: string;
        description?: string;
        agentId?: string;
        agentName?: string;
        status?: string;
        planId?: string;
      } = { name };

      if (description) payload.description = description;
      if (agentId) payload.agentId = agentId;
      if (agentName) payload.agentName = agentName;
      if (status) payload.status = status;
      if (planId) payload.planId = planId;

      const result = await codebolt.actionPlan.createActionPlan(payload);

      // Update outputs with success results
      this.setOutputData(1, result as unknown as string);
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