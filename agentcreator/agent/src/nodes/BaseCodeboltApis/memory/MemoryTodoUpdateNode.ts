import { BaseMemoryTodoUpdateNode } from '@agent-creator/shared-nodes';
import codebolt from '@codebolt/codeboltjs';
import { emitMemoryFailure, emitMemorySuccess, getObjectInput, getStringInput } from './utils.js';

export class MemoryTodoUpdateNode extends BaseMemoryTodoUpdateNode {
  constructor() {
    super();
  }

  async onExecute() {
    const memoryId = getStringInput(this, 1, 'memoryId');
    if (!memoryId) {
      emitMemoryFailure(this, 'Memory ID is required to update todo memory');
      return;
    }

    const todo = getObjectInput(this, 2, 'todo');
    if (!todo) {
      emitMemoryFailure(this, 'Todo data is required to update memory');
      return;
    }

    try {
      const response = await codebolt.memory.todo.update(memoryId, todo as any);
      emitMemorySuccess(this, response);
    } catch (error) {
      emitMemoryFailure(this, 'Failed to update todo memory', error);
    }
  }
}
