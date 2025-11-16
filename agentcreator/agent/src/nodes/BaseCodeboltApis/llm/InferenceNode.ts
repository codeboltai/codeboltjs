import { BaseInferenceNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import type { MessageObject, Tool, LLMInferenceParams } from '@codebolt/types/sdk';

// Backend-specific Inference Node - actual implementation
export class InferenceNode extends BaseInferenceNode {
  constructor() {
    super();
  }

  async onExecute() {
    const messages = this.getInputData(1) || [];
    const tools = this.getInputData(2) || [];
    const tool_choice = this.getInputData(3) || this.properties.tool_choice;
    const llmrole = this.getInputData(4) || this.properties.llmrole;
    const max_tokens = this.getInputData(5) || this.properties.max_tokens;
    const temperature = this.getInputData(6) || this.properties.temperature;
    const stream = this.getInputData(7) !== undefined ? this.getInputData(7) : this.properties.stream;
    const full = this.getInputData(8) !== undefined ? this.getInputData(8) : this.properties.full;

    // Validate required parameters
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      const errorMessage = 'Error: Messages array is required and cannot be empty';
      console.error('InferenceNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      // Construct inference parameters
      const params: LLMInferenceParams = {
        messages: messages as MessageObject[],
        tools: tools as Tool[],
        tool_choice: tool_choice as any,
        llmrole: llmrole as string,
        max_tokens: max_tokens as number,
        temperature: temperature as number,
        stream: stream as boolean,
        full: full as boolean
      };

      const result = await codebolt.llm.inference(params);

      // Update outputs with success results
      this.setOutputData(1, result.completion);
      this.setOutputData(2, true);

      // Trigger the inferenceComplete event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error during LLM inference: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('InferenceNode error:', error);
    }
  }
}