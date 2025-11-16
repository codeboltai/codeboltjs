import { BaseLLMInferenceRequestNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific LLMInferenceRequest Node - actual implementation
export class LLMInferenceRequestNode extends BaseLLMInferenceRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const data = this.getInputData(1);
    
    // If data object is not provided, try to construct from individual inputs
    let finalData = data as any;
    if (!finalData) {
      finalData = {};

      // Try to get data from individual inputs
      const messages = this.getInputData(2);
      const tools = this.getInputData(3);
      const tool_choice = this.getInputData(4);
      const full = this.getInputData(5);
      const llmrole = this.getInputData(6);
      const max_tokens = this.getInputData(7);
      const temperature = this.getInputData(8);
      const stream = this.getInputData(9);
      const prompt = this.getInputData(10);

      if (messages) (finalData as any).messages = messages;
      if (tools) (finalData as any).tools = tools;
      if (tool_choice) (finalData as any).tool_choice = tool_choice;
      if (full !== undefined) (finalData as any).full = full;
      if (llmrole) (finalData as any).llmrole = llmrole;
      if (max_tokens) (finalData as any).max_tokens = max_tokens;
      if (temperature) (finalData as any).temperature = temperature;
      if (stream !== undefined) (finalData as any).stream = stream;
      if (prompt) (finalData as any).prompt = prompt;
    }

    try {
      // Call the LLM notification function
      codebolt.notify.llm.sendInferenceRequest(finalData);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send LLM inference request`;
      this.setOutputData(1, false);
      console.error('LLMInferenceRequestNode error:', error);
    }
  }
}
