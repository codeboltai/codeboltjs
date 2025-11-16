import { BaseGetTokenNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific GetToken Node - actual implementation
export class GetTokenNode extends BaseGetTokenNode {
  constructor() {
    super();
  }

  async onExecute() {
    const key = this.getInputData(1);

    if (!key || typeof key !== 'string' || !key.trim()) {
      const errorMessage = 'Error: Token key cannot be empty';
      console.error('GetTokenNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      const result = await codebolt.tokenizer.getToken(key);

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the tokenRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error getting token: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('GetTokenNode error:', error);
    }
  }
}