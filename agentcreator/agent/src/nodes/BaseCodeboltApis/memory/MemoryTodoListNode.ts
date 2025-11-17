import { BaseMemoryTodoListNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMemoryFailure, emitMemorySuccess, getObjectInput } from './utils.js';

export class MemoryTodoListNode extends BaseMemoryTodoListNode {
  constructor() {
    super();
  }

  async onExecute() {
    const filters = (getObjectInput(this, 1, 'filters', {}) as Record<string, unknown>) ?? {};

    try {
      const response = await codebolt.memory.todo.list(filters);
      emitMemorySuccess(this, response);
    } catch (error) {
      emitMemoryFailure(this, 'Failed to list todo memory entries', error);
    }
  }
}
