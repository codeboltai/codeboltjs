import { BaseAgentTextResponseNode } from '@agent-creator/shared-nodes';
import { chatNotifications } from '@codebolt/codeboltjs';

// Backend-specific AgentTextResponse Node - actual implementation
export class AgentTextResponseNode extends BaseAgentTextResponseNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const isError = this.getInputData(2) || false;
    const toolUseId = this.getInputData(3);
    const data = this.getInputData(4);

    // Validate required parameters
    if (content === null || content === undefined) {
      const errorMessage = 'Error: Content is required';
      console.error('AgentTextResponseNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the actual notification function
      chatNotifications.AgentTextResponseNotify(content, isError as boolean, toolUseId as string, data as { message: string; timestamp?: string; agentId?: string; conversationId?: string; });

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send agent text response`;
      this.setOutputData(1, false);
      console.error('AgentTextResponseNode error:', error);
    }
  }
}