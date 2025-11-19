import { BaseMemoryJsonUpdateNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMemoryFailure, emitMemorySuccess, getObjectInput, getStringInput } from './utils.js';

export class MemoryJsonUpdateNode extends BaseMemoryJsonUpdateNode {
  constructor() {
    super();
  }

  async onExecute() {
    const memoryId = getStringInput(this, 1, 'memoryId');
    if (!memoryId) {
      emitMemoryFailure(this, 'Memory ID is required to update JSON memory');
      return;
    }

    const json = getObjectInput(this, 2, 'json');
    if (!json) {
      emitMemoryFailure(this, 'JSON payload is required to update memory');
      return;
    }

    try {
      const response = await codebolt.memory.json.update(memoryId, json as any);
      emitMemorySuccess(this, response);
    } catch (error) {
      emitMemoryFailure(this, 'Failed to update JSON memory', error);
    }
  }
}
