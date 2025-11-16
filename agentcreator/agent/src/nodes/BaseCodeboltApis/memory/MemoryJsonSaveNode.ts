import { BaseMemoryJsonSaveNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMemoryFailure, emitMemorySuccess, getObjectInput } from './utils';

export class MemoryJsonSaveNode extends BaseMemoryJsonSaveNode {
  constructor() {
    super();
  }

  async onExecute() {
    const json = getObjectInput(this, 1, 'json');
    if (!json) {
      emitMemoryFailure(this, 'JSON payload is required to save memory');
      return;
    }

    try {
      const response = await codebolt.memory.json.save(json as any);
      emitMemorySuccess(this, response);
    } catch (error) {
      emitMemoryFailure(this, 'Failed to save JSON memory', error);
    }
  }
}
