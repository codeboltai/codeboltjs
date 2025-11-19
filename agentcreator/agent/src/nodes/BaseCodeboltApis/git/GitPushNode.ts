import { BaseGitPushNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitGitFailure, emitGitSuccess } from './utils.js';

export class GitPushNode extends BaseGitPushNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const response = await codebolt.git.push();
      emitGitSuccess(this, response);
    } catch (error) {
      emitGitFailure(this, 'Failed to push changes', error);
    }
  }
}
