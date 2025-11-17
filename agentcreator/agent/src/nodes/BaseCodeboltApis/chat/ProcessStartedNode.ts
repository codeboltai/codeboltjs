import { BaseProcessStartedNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitChatFailure, emitChatSuccess, setNamedOutput } from './utils.js';

export class ProcessStartedNode extends BaseProcessStartedNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const controller = await codebolt.chat.processStarted();
      emitChatSuccess(this, controller);
      setNamedOutput(this, 'controller', controller);
    } catch (error) {
      emitChatFailure(this, 'Failed to signal process started', error);
    }
  }
}
