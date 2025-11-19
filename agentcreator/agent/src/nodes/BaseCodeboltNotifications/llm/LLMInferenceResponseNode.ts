import { BaseLLMInferenceResponseNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific LLMInferenceResponse Node - actual implementation
export class LLMInferenceResponseNode extends BaseLLMInferenceResponseNode {
  constructor() {
    super();
  }

  async onExecute() {
    const content = this.getInputData(1);
    const toolUseId = this.getInputData(2);
    const isError = (this.getInputData(3) as boolean) || false;

    // Validate required inputs
    if (content === null || content === undefined) {
      const errorMessage = 'Error: Content is required for LLM inference response';
      console.error('LLMInferenceResponseNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (!toolUseId || typeof toolUseId !== 'string') {
      const errorMessage = 'Error: toolUseId is required for LLM inference response';
      console.error('LLMInferenceResponseNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Call the LLM notification function
      codebolt.notify.llm.sendInferenceResponse(
        content,
        isError,
        toolUseId
      );

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the responseSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send LLM inference response`;
      this.setOutputData(1, false);
      console.error('LLMInferenceResponseNode error:', error);
    }
  }
}
