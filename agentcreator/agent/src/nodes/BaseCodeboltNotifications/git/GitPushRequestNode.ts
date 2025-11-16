import { BaseGitPushRequestNode } from '@agent-creator/shared-nodes';
import { GitPushRequestNotify } from '@codebolt/codeboltjs';

// Backend GitPushRequestNode - actual implementation
export class GitPushRequestNode extends BaseGitPushRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const path: any = this.getInputData(1);

    try {
      GitPushRequestNotify(path);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send git push request`;
      this.setOutputData(1, false);
      console.error('GitPushRequestNode error:', error);
    }
  }
}