import { BaseMemoryJsonListNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMemoryFailure, emitMemorySuccess, getObjectInput } from './utils.js';

export class MemoryJsonListNode extends BaseMemoryJsonListNode {
  constructor() {
    super();
  }

  async onExecute() {
    const filters = (getObjectInput(this, 1, 'filters', {}) as Record<string, unknown>) ?? {};

    try {
      const response = await codebolt.memory.json.list(filters);
      emitMemorySuccess(this, response);
    } catch (error) {
      emitMemoryFailure(this, 'Failed to list JSON memory entries', error);
    }
  }
}
