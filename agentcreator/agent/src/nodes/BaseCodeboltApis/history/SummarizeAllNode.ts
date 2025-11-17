import { BaseSummarizeAllNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitHistoryFailure, emitHistorySuccess } from './utils.js';

export class SummarizeAllNode extends BaseSummarizeAllNode {
  constructor() {
    super();
  }

  async onExecute() {
    try {
      const summary = await codebolt.chatSummary.summarizeAll();
      emitHistorySuccess(this, summary);
    } catch (error) {
      emitHistoryFailure(this, 'Failed to summarize full history', error);
    }
  }
}
