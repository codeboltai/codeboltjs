import { BaseGetModelConfigNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific GetModelConfig Node - actual implementation
export class GetModelConfigNode extends BaseGetModelConfigNode {
  constructor() {
    super();
  }

  async onExecute() {
    const modelId = this.getInputData(1); // Optional parameter

    try {
      const result = await codebolt.llm.getModelConfig(modelId);

      // Update outputs based on result
      this.setOutputData(1, result.config);
      this.setOutputData(2, result.success);
      this.setOutputData(3, result.error || null);

      // Trigger the configRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error getting model config: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      this.setOutputData(3, errorMessage);
      console.error('GetModelConfigNode error:', error);
    }
  }
}