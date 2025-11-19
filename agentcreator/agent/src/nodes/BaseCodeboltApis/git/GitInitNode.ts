import { BaseGitInitNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitGitFailure, emitGitSuccess, getInputOrProperty } from './utils.js';

export class GitInitNode extends BaseGitInitNode {
  constructor() {
    super();
  }

  async onExecute() {
    const path = getInputOrProperty(this, 1, 'path');

    if (!path) {
      emitGitFailure(this, 'Path is required for git init');
      return;
    }

    try {
      const response = await codebolt.git.init(path);
      emitGitSuccess(this, response);
    } catch (error) {
      emitGitFailure(this, 'Failed to initialize repository', error);
    }
  }
}
