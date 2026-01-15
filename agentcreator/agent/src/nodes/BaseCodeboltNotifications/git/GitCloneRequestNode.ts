import { BaseGitCloneRequestNode } from '@codebolt/agent-shared-nodes';
import { GitCloneRequestNotify } from '@codebolt/codeboltjs';

// Backend GitCloneRequestNode - actual implementation
export class GitCloneRequestNode extends BaseGitCloneRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const repoUrl: any = this.getInputData(1);
    const targetPath: any = this.getInputData(2);

    // Validate required input
    if (!repoUrl || typeof repoUrl !== 'string' || !repoUrl.trim()) {
      const errorMessage = 'Error: Repository URL is required';
      console.error('GitCloneRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      GitCloneRequestNotify(repoUrl, targetPath);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send git clone request`;
      this.setOutputData(1, false);
      console.error('GitCloneRequestNode error:', error);
    }
  }
}