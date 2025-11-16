import { BaseLLMGetTokenCountNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific LLMGetTokenCount Node - actual implementation
export class LLMGetTokenCountNode extends BaseLLMGetTokenCountNode {
  constructor() {
    super();
  }

  async onExecute() {
    const text = this.getInputData(1);
    const model = this.getInputData(2);
    const encoding = this.getInputData(3);

    // Validate required text parameter
    if (!text || typeof text !== 'string') {
      const errorMessage = 'Error: Text is required for token count';
      console.error('LLMGetTokenCountNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      // Prepare data object for the notification function
      const data: any = { text };
      if (model) data.model = model;
      if (encoding) data.encoding = encoding;

      // Call the LLM notification function
      codebolt.notify.llm.getTokenCount(data);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send token count request`;
      this.setOutputData(1, false);
      console.error('LLMGetTokenCountNode error:', error);
    }
  }
}
