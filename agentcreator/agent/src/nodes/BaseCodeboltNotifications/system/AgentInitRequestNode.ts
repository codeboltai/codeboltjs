import { BaseAgentInitRequestNode } from '@agent-creator/shared-nodes';
import { AgentInitNotify } from '@codebolt/codeboltjs';

// Backend AgentInitRequestNode - actual implementation
export class AgentInitRequestNode extends BaseAgentInitRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const onStopClicked: any = this.getInputData(1);
    const toolUseId: any = this.getInputData(2);

    // Validate optional inputs
    if (onStopClicked !== undefined && typeof onStopClicked !== 'boolean') {
      const errorMessage = 'Error: onStopClicked must be a boolean value';
      console.error('AgentInitRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (toolUseId !== undefined && typeof toolUseId !== 'string') {
      const errorMessage = 'Error: toolUseId must be a string value';
      console.error('AgentInitRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      AgentInitNotify(onStopClicked, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send agent init request`;
      this.setOutputData(1, false);
      console.error('AgentInitRequestNode error:', error);
    }
  }
}