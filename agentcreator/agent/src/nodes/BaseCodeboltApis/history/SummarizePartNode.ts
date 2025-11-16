import { BaseSummarizePartNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitHistoryFailure, emitHistorySuccess, getArrayInput, getNumberInput } from './utils';

export class SummarizePartNode extends BaseSummarizePartNode {
  constructor() {
    super();
  }

  async onExecute() {
    const messages = getArrayInput(this, 1, 'messages');
    if (!messages.length) {
      emitHistoryFailure(this, 'Messages array is required to summarize part');
      return;
    }

    const depth = getNumberInput(this, 2, 'depth', 5);

    try {
      const summary = await codebolt.chatSummary.summarize(messages, depth);
      emitHistorySuccess(this, summary);
    } catch (error) {
      emitHistoryFailure(this, 'Failed to summarize partial history', error);
    }
  }
}
