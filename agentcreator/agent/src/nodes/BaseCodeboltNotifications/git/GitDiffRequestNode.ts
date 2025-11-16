import { BaseGitDiffRequestNode } from '@agent-creator/shared-nodes';
import { GitDiffRequestNotify } from '@codebolt/codeboltjs';

// Backend GitDiffRequestNode - actual implementation
export class GitDiffRequestNode extends BaseGitDiffRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const path: any = this.getInputData(1);

    try {
      GitDiffRequestNotify(path);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send git diff request`;
      this.setOutputData(1, false);
      console.error('GitDiffRequestNode error:', error);
    }
  }
}