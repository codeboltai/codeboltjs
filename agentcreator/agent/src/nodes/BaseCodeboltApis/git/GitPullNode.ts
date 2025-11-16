import { BaseGitPullNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitGitFailure, emitGitSuccess } from './utils';

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
