import { BaseGitCommitNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitGitFailure, emitGitSuccess, getInputOrProperty } from './utils.js';

export class GitCommitNode extends BaseGitCommitNode {
  constructor() {
    super();
  }

  async onExecute() {
    const message = getInputOrProperty(this, 1, 'message');

    if (!message) {
      emitGitFailure(this, 'Commit message is required');
      return;
    }

    try {
      const response = await codebolt.git.commit(message);
      emitGitSuccess(this, response);
    } catch (error) {
      emitGitFailure(this, 'Failed to commit changes', error);
    }
  }
}
