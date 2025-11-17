import { BaseGetChatHistoryNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitChatFailure, emitChatSuccess, getStringInput, setNamedOutput } from './utils.js';

export class GetChatHistoryNode extends BaseGetChatHistoryNode {
  constructor() {
    super();
  }

  async onExecute() {
    const threadId = getStringInput(this, 1, 'threadId');
    if (!threadId) {
      emitChatFailure(this, 'Thread ID is required');
      return;
    }

    try {
      const history = await codebolt.chat.getChatHistory(threadId);
      emitChatSuccess(this, history);
      setNamedOutput(this, 'history', history);
    } catch (error) {
      emitChatFailure(this, 'Failed to fetch chat history', error);
    }
  }
}
