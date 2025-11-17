import { BaseGitBranchNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitGitFailure, emitGitSuccess, getInputOrProperty } from './utils.js';

export class GitBranchNode extends BaseGitBranchNode {
  constructor() {
    super();
  }

  async onExecute() {
    const branch = getInputOrProperty(this, 1, 'branch');

    if (!branch) {
      emitGitFailure(this, 'Branch name is required to create a branch');
      return;
    }

    try {
      const response = await codebolt.git.branch(branch);
      emitGitSuccess(this, response);
    } catch (error) {
      emitGitFailure(this, 'Failed to create branch', error);
    }
  }
}
