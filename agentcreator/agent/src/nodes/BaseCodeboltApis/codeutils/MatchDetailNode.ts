import { BaseMatchDetailNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';

// Backend-specific MatchDetail Node - actual implementation
export class MatchDetailNode extends BaseMatchDetailNode {
  constructor() {
    super();
  }

  async onExecute() {
    const matcher = this.getInputData(1);

    if (!matcher || typeof matcher !== 'string' || !matcher.trim()) {
      const errorMessage = 'Error: Matcher identifier cannot be empty';
      console.error('MatchDetailNode error:', errorMessage);
      this.setOutputData(2, false);
      this.setOutputData(1, null);
      return;
    }

    try {
      const result = await codebolt.codeutils.matchDetail(matcher);

      // Update outputs with success results
      this.setOutputData(1, result);
      this.setOutputData(2, true);

      // Trigger the matchDetailRetrieved event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error getting match detail: ${error}`;
      this.setOutputData(1, null);
      this.setOutputData(2, false);
      console.error('MatchDetailNode error:', error);
    }
  }
}