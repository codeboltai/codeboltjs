import { BaseGitCheckoutNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitGitFailure, emitGitSuccess, getInputOrProperty } from './utils.js';

export class GitCheckoutNode extends BaseGitCheckoutNode {
  constructor() {
    super();
  }

  async onExecute() {
    const branch = getInputOrProperty(this, 1, 'branch');

    if (!branch) {
      emitGitFailure(this, 'Branch name is required for checkout');
      return;
    }

    try {
      const response = await codebolt.git.checkout(branch);
      emitGitSuccess(this, response);
    } catch (error) {
      emitGitFailure(this, 'Failed to checkout branch', error);
    }
  }
}
