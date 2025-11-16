import { BaseGitCheckoutRequestNode } from '@agent-creator/shared-nodes';
import { GitCheckoutRequestNotify } from '@codebolt/codeboltjs';

// Backend GitCheckoutRequestNode - actual implementation
export class GitCheckoutRequestNode extends BaseGitCheckoutRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const path: any = this.getInputData(1);
    const branchName: any = this.getInputData(2);

    try {
      GitCheckoutRequestNotify(path, branchName);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send git checkout request`;
      this.setOutputData(1, false);
      console.error('GitCheckoutRequestNode error:', error);
    }
  }
}