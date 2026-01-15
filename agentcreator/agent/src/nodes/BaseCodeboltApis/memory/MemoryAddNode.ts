import { BaseMemoryAddNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMemoryFailure, emitMemorySuccess, getJsonInput, getStringInput } from './utils.js';

export class MemoryAddNode extends BaseMemoryAddNode {
  constructor() {
    super();
  }

  async onExecute() {
    const key = getStringInput(this, 1, 'key');
    if (!key) {
      emitMemoryFailure(this, 'Key is required for memory add');
      return;
    }

    const value = getJsonInput(this, 2, 'value');
    if (value === undefined) {
      emitMemoryFailure(this, 'Value is required for memory add');
      return;
    }

    try {
      const response = await codebolt.dbmemory.addKnowledge(key, value as any);
      emitMemorySuccess(this, response);
    } catch (error) {
      emitMemoryFailure(this, 'Failed to add memory entry', error);
    }
  }
}
