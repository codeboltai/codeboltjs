import { BaseGitAddRequestNode } from '@codebolt/agent-shared-nodes';
import { GitAddRequestNotify } from '@codebolt/codeboltjs';

// Backend GitAddRequestNode - actual implementation
export class GitAddRequestNode extends BaseGitAddRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const path: any = this.getInputData(1);
    const files: any = this.getInputData(2);

    try {
      GitAddRequestNotify(path, files);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send git add request`;
      this.setOutputData(1, false);
      console.error('GitAddRequestNode error:', error);
    }
  }
}