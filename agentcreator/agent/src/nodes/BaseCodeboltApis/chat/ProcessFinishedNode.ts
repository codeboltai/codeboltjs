import { BaseProcessFinishedNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitChatFailure, emitChatSuccess } from './utils.js';

export class ProcessFinishedNode extends BaseProcessFinishedNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      await codebolt.chat.processFinished();
      emitChatSuccess(this, { finished: true });
    } catch (error) {
      emitChatFailure(this, 'Failed to signal process finished', error);
    }
  }
}
