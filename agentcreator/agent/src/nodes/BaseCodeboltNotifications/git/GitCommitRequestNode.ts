import { BaseGitCommitRequestNode } from '@codebolt/agent-shared-nodes';
import { GitCommitRequestNotify } from '@codebolt/codeboltjs';

// Backend GitCommitRequestNode - actual implementation
export class GitCommitRequestNode extends BaseGitCommitRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const path: any = this.getInputData(1);
    const message: any = this.getInputData(2);

    try {
      GitCommitRequestNotify(path, message);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send git commit request`;
      this.setOutputData(1, false);
      console.error('GitCommitRequestNode error:', error);
    }
  }
}