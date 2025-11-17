import { BaseGitDiffNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitGitFailure, emitGitSuccess, getInputOrProperty } from './utils.js';

export class GitDiffNode extends BaseGitDiffNode {
  constructor() {
    super();
  }

  async onExecute() {
    const commitHash = getInputOrProperty(this, 1, 'commitHash');

    if (!commitHash) {
      emitGitFailure(this, 'Commit hash is required to fetch diff');
      return;
    }

    try {
      const response = await codebolt.git.diff(commitHash);
      emitGitSuccess(this, response);
    } catch (error) {
      emitGitFailure(this, 'Failed to retrieve git diff', error);
    }
  }
}
