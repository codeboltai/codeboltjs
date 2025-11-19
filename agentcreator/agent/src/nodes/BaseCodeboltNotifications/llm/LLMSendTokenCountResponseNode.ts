import { BaseLLMSendTokenCountResponseNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific LLMSendTokenCountResponse Node - actual implementation
export class LLMSendTokenCountResponseNode extends BaseLLMSendTokenCountResponseNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const toolUseId = this.getInputData(2);
    const isError = (this.getInputData(3) as boolean) || false;
    const data = this.getInputData(4);

    // Validate required inputs
    if (content === null || content === undefined) {
      const errorMessage = 'Error: Content is required for token count response';
      console.error('LLMSendTokenCountResponseNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (!toolUseId || typeof toolUseId !== 'string') {
      const errorMessage = 'Error: toolUseId is required for token count response';
      console.error('LLMSendTokenCountResponseNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Ensure data has required tokenCount property
      const tokenData = {
        tokenCount: (data as any)?.tokenCount || 0,
        model: (data as any)?.model,
        encoding: (data as any)?.encoding
      };

      // Call the LLM notification function
      codebolt.notify.llm.sendTokenCountResponse(
        content,
        isError,
        toolUseId,
        tokenData
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send token count response`;
      this.setOutputData(1, false);
      console.error('LLMSendTokenCountResponseNode error:', error);
    }
  }
}
