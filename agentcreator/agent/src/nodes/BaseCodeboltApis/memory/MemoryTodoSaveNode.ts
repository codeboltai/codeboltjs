import { BaseMemoryTodoSaveNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMemoryFailure, emitMemorySuccess, getObjectInput } from './utils.js';

export class MemoryTodoSaveNode extends BaseMemoryTodoSaveNode {
  constructor() {
    super();
  }

  async onExecute() {
    const todo = getObjectInput(this, 1, 'todo');
    if (!todo) {
      emitMemoryFailure(this, 'Todo data is required to save memory');
      return;
    }

    const metadata = (getObjectInput(this, 2, 'metadata', {}) as Record<string, unknown>) ?? {};

    try {
      const response = await codebolt.memory.todo.save(todo as any, metadata);
      emitMemorySuccess(this, response);
    } catch (error) {
      emitMemoryFailure(this, 'Failed to save todo memory', error);
    }
  }
}
