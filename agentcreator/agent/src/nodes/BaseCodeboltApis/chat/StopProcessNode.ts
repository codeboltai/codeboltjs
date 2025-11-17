import { BaseStopProcessNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitChatFailure, emitChatSuccess } from './utils.js';

export class StopProcessNode extends BaseStopProcessNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      await codebolt.chat.stopProcess();
      emitChatSuccess(this, { stopped: true });
    } catch (error) {
      emitChatFailure(this, 'Failed to stop process', error);
    }
  }
}
