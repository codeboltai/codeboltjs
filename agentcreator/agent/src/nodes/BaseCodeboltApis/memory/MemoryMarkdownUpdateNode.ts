import { BaseMemoryMarkdownUpdateNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMemoryFailure, emitMemorySuccess, getObjectInput, getStringInput } from './utils.js';

export class MemoryMarkdownUpdateNode extends BaseMemoryMarkdownUpdateNode {
  constructor() {
    super();
  }

  async onExecute() {
    const memoryId = getStringInput(this, 1, 'memoryId');
    if (!memoryId) {
      emitMemoryFailure(this, 'Memory ID is required to update markdown memory');
      return;
    }

    const markdown = getStringInput(this, 2, 'markdown');
    if (!markdown) {
      emitMemoryFailure(this, 'Markdown content is required to update memory');
      return;
    }

    const metadata = (getObjectInput(this, 3, 'metadata', {}) as Record<string, unknown>) ?? {};

    try {
      const response = await codebolt.memory.markdown.update(memoryId, markdown, metadata);
      emitMemorySuccess(this, response);
    } catch (error) {
      emitMemoryFailure(this, 'Failed to update markdown memory', error);
    }
  }
}
