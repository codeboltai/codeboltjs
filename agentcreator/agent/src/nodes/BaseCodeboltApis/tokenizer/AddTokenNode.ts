import { BaseAddTokenNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific AddToken Node - actual implementation
export class AddTokenNode extends BaseAddTokenNode {
  constructor() {
    super();
  }

  async onExecute() {
    const key = this.getInputData(1);

    if (!key || typeof key !== 'string' || !key.trim()) {
      const errorMessage = 'Error: Token key cannot be empty';
      console.error('AddTokenNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      const result = await codebolt.tokenizer.addToken(key);

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the tokenAdded event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error adding token: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('AddTokenNode error:', error);
    }
  }
}