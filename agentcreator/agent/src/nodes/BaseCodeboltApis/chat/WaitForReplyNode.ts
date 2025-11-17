import { BaseWaitForReplyNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitChatFailure, emitChatSuccess, getStringInput, setNamedOutput } from './utils.js';

export class WaitForReplyNode extends BaseWaitForReplyNode {
  constructor() {
    super();
  }

  async onExecute() {
    const message = getStringInput(this, 1, 'message');
    if (!message) {
      emitChatFailure(this, 'Message is required to wait for reply');
      return;
    }

    try {
      const reply = await codebolt.chat.waitforReply(message);
      emitChatSuccess(this, reply);
      setNamedOutput(this, 'reply', reply);
    } catch (error) {
      emitChatFailure(this, 'Failed to wait for reply', error);
    }
  }
}
