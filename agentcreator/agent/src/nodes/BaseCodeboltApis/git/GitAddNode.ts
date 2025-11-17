import { BaseGitAddNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitGitFailure, emitGitSuccess } from './utils.js';

export class GitAddNode extends BaseGitAddNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const response = await codebolt.git.addAll();
      emitGitSuccess(this, response);
    } catch (error) {
      emitGitFailure(this, 'Failed to stage changes', error);
    }
  }
}
