import { BaseGitBranchRequestNode } from '@agent-creator/shared-nodes';
import { GitBranchRequestNotify } from '@codebolt/codeboltjs';

// Backend GitBranchRequestNode - actual implementation
export class GitBranchRequestNode extends BaseGitBranchRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const path: any = this.getInputData(1);
    const branchName: any = this.getInputData(2);

    try {
      GitBranchRequestNotify(path, branchName);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send git branch request`;
      this.setOutputData(1, false);
      console.error('GitBranchRequestNode error:', error);
    }
  }
}