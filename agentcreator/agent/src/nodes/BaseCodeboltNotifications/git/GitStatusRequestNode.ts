import { BaseGitStatusRequestNode } from '@codebolt/agent-shared-nodes';
import { GitStatusRequestNotify } from '@codebolt/codeboltjs';

// Backend GitStatusRequestNode - actual implementation
export class GitStatusRequestNode extends BaseGitStatusRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const path: any = this.getInputData(1);

    try {
      GitStatusRequestNotify(path);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send git status request`;
      this.setOutputData(1, false);
      console.error('GitStatusRequestNode error:', error);
    }
  }
}