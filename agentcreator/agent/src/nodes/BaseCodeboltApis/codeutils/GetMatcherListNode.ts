import { BaseGetMatcherListNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific GetMatcherList Node - actual implementation
export class GetMatcherListNode extends BaseGetMatcherListNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const result = await codebolt.codeutils.getMatcherList();

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the matcherListRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error getting matcher list: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('GetMatcherListNode error:', error);
    }
  }
}