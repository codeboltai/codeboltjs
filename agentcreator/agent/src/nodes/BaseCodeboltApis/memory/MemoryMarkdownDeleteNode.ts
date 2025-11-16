import { BaseMemoryMarkdownDeleteNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMemoryFailure, emitMemorySuccess, getStringInput } from './utils';

export class MemoryMarkdownDeleteNode extends BaseMemoryMarkdownDeleteNode {
  constructor() {
    super();
  }

  async onExecute() {
    const memoryId = getStringInput(this, 1, 'memoryId');
    if (!memoryId) {
      emitMemoryFailure(this, 'Memory ID is required to delete markdown memory');
      return;
    }

    try {
      const response = await codebolt.memory.markdown.delete(memoryId);
      emitMemorySuccess(this, response);
    } catch (error) {
      emitMemoryFailure(this, 'Failed to delete markdown memory', error);
    }
  }
}
