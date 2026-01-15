import { BaseMemoryGetNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMemoryFailure, emitMemorySuccess, getStringInput } from './utils.js';

export class MemoryGetNode extends BaseMemoryGetNode {
  constructor() {
    super();
  }

  async onExecute() {
    const key = getStringInput(this, 1, 'key');
    if (!key) {
      emitMemoryFailure(this, 'Key is required for memory get');
      return;
    }

    try {
      const response = await codebolt.dbmemory.getKnowledge(key);
      emitMemorySuccess(this, response);
      this.setOutputData?.(3, response?.value ?? null);
    } catch (error) {
      emitMemoryFailure(this, 'Failed to fetch memory entry', error);
    }
  }
}
