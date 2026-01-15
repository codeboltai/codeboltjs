import { BaseAgentCompletionRequestNode } from '@codebolt/agent-shared-nodes';
import { AgentCompletionNotify } from '@codebolt/codeboltjs';

// Backend AgentCompletionRequestNode - actual implementation
export class AgentCompletionRequestNode extends BaseAgentCompletionRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const resultString: any = this.getInputData(1);
    const sessionId: any = this.getInputData(2);
    const duration: any = this.getInputData(3);
    const toolUseId: any = this.getInputData(4);

    // Validate required input
    if (!resultString || typeof resultString !== 'string' || !resultString.trim()) {
      const errorMessage = 'Error: Result string is required and must be non-empty';
      console.error('AgentCompletionRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    // Validate optional inputs
    if (sessionId !== undefined && typeof sessionId !== 'string') {
      const errorMessage = 'Error: sessionId must be a string value';
      console.error('AgentCompletionRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (duration !== undefined && typeof duration !== 'string') {
      const errorMessage = 'Error: duration must be a string value';
      console.error('AgentCompletionRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (toolUseId !== undefined && typeof toolUseId !== 'string') {
      const errorMessage = 'Error: toolUseId must be a string value';
      console.error('AgentCompletionRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      AgentCompletionNotify(resultString, sessionId, duration, toolUseId);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send agent completion request`;
      this.setOutputData(1, false);
      console.error('AgentCompletionRequestNode error:', error);
    }
  }
}