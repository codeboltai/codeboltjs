import { BaseGitPullRequestNode } from '@agent-creator/shared-nodes';
import { GitPullRequestNotify } from '@codebolt/codeboltjs';

// Backend GitPullRequestNode - actual implementation
export class GitPullRequestNode extends BaseGitPullRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const path: any = this.getInputData(1);

    try {
      GitPullRequestNotify(path);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send git pull request`;
      this.setOutputData(1, false);
      console.error('GitPullRequestNode error:', error);
    }
  }
}