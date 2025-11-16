import { BaseMemoryMarkdownSaveNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMemoryFailure, emitMemorySuccess, getObjectInput, getStringInput } from './utils';

export class MemoryMarkdownSaveNode extends BaseMemoryMarkdownSaveNode {
  constructor() {
    super();
  }

  async onExecute() {
    const markdown = getStringInput(this, 1, 'markdown');
    if (!markdown) {
      emitMemoryFailure(this, 'Markdown content is required to save memory');
      return;
    }

    const metadata = (getObjectInput(this, 2, 'metadata', {}) as Record<string, unknown>) ?? {};

    try {
      const response = await codebolt.memory.markdown.save(markdown, metadata);
      emitMemorySuccess(this, response);
    } catch (error) {
      emitMemoryFailure(this, 'Failed to save markdown memory', error);
    }
  }
}
