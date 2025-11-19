import { BaseGitPullNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitGitFailure, emitGitSuccess } from './utils.js';

export class GitPullNode extends BaseGitPullNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const response = await codebolt.git.pull();
      emitGitSuccess(this, response);
    } catch (error) {
      emitGitFailure(this, 'Failed to pull latest changes', error);
    }
  }
}
