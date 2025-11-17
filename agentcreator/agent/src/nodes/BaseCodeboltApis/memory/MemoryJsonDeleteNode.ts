import { BaseMemoryJsonDeleteNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMemoryFailure, emitMemorySuccess, getStringInput } from './utils.js';

export class MemoryJsonDeleteNode extends BaseMemoryJsonDeleteNode {
  constructor() {
    super();
  }

  async onExecute() {
    const memoryId = getStringInput(this, 1, 'memoryId');
    if (!memoryId) {
      emitMemoryFailure(this, 'Memory ID is required to delete JSON memory');
      return;
    }

    try {
      const response = await codebolt.memory.json.delete(memoryId);
      emitMemorySuccess(this, response);
    } catch (error) {
      emitMemoryFailure(this, 'Failed to delete JSON memory', error);
    }
  }
}
