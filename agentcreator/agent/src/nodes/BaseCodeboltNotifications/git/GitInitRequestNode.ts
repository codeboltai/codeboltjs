import { BaseGitInitRequestNode } from '@codebolt/agent-shared-nodes';
import { GitInitRequestNotify } from '@codebolt/codeboltjs';

// Backend GitInitRequestNode - actual implementation
export class GitInitRequestNode extends BaseGitInitRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const path: any = this.getInputData(1);

    try {
      GitInitRequestNotify(path);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send git init request`;
      this.setOutputData(1, false);
      console.error('GitInitRequestNode error:', error);
    }
  }
}