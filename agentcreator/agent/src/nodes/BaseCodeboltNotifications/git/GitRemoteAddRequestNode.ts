import { BaseGitRemoteAddRequestNode } from '@agent-creator/shared-nodes';
import { GitRemoteAddRequestNotify } from '@codebolt/codeboltjs';

// Backend GitRemoteAddRequestNode - actual implementation
export class GitRemoteAddRequestNode extends BaseGitRemoteAddRequestNode {
  constructor() {
    super();
  }

  async onExecute() {
    const remoteName: any = this.getInputData(1);
    const remoteUrl: any = this.getInputData(2);
    const path: any = this.getInputData(3);

    // Validate required inputs
    if (!remoteName || typeof remoteName !== 'string' || !remoteName.trim()) {
      const errorMessage = 'Error: Remote name is required';
      console.error('GitRemoteAddRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    if (!remoteUrl || typeof remoteUrl !== 'string' || !remoteUrl.trim()) {
      const errorMessage = 'Error: Remote URL is required';
      console.error('GitRemoteAddRequestNode error:', errorMessage);
      this.setOutputData(1, false);
      return;
    }

    try {
      GitRemoteAddRequestNotify(remoteName, remoteUrl, path);

      // Update outputs with success results
      this.setOutputData(1, true);

      // Trigger the requestSent event
      this.triggerSlot(0, null, null);

    } catch (error) {
      const errorMessage = `Error: Failed to send git remote add request`;
      this.setOutputData(1, false);
      console.error('GitRemoteAddRequestNode error:', error);
    }
  }
}