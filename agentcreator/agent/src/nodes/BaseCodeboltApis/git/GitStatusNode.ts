import { BaseGitStatusNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitGitFailure, emitGitSuccess } from './utils.js';

export class GitStatusNode extends BaseGitStatusNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const response = await codebolt.git.status();
      emitGitSuccess(this, response);
    } catch (error) {
      emitGitFailure(this, 'Failed to retrieve git status', error);
    }
  }
}
