import { BaseGitLogsNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitGitFailure, emitGitSuccess, getInputOrProperty } from './utils.js';

export class GitLogsNode extends BaseGitLogsNode {
  constructor() {
    super();
  }

  async onExecute() {
    const path = getInputOrProperty(this, 1, 'path');

    if (!path) {
      emitGitFailure(this, 'Path is required to fetch logs');
      return;
    }

    try {
      const response = await codebolt.git.logs(path);
      emitGitSuccess(this, response);
    } catch (error) {
      emitGitFailure(this, 'Failed to retrieve git logs', error);
    }
  }
}
