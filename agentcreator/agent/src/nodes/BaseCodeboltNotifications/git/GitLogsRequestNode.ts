import { BaseGitLogsRequestNode } from '@codebolt/agent-shared-nodes';
import { GitLogsRequestNotify } from '@codebolt/codeboltjs';

// Backend GitLogsRequestNode - actual implementation
export class GitLogsRequestNode extends BaseGitLogsRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const path: any = this.getInputData(1);

    try {
      GitLogsRequestNotify(path);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send git logs request`;
      this.setOutputData(1, false);
      console.error('GitLogsRequestNode error:', error);
    }
  }
}