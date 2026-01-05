import { BaseAddTodoNode, BaseUpdateTodoNode, BaseGetTodoListNode, BaseGetAllIncompleteTodosNode } from '@codebolt/agent-shared-nodes';
import codebolt from '@codebolt/codeboltjs';

export class AddTodoNode extends BaseAddTodoNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const title = this.getInputData(1) as string;
            const priority = this.getInputData(2) as 'high' | 'medium' | 'low';
            const result = await codebolt.todo.addTodo({ title, priority });
            this.setOutputData(1, result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('AddTodoNode error:', error);
            this.setOutputData(2, false);
        }
    }
}

export class UpdateTodoNode extends BaseUpdateTodoNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const id = this.getInputData(1) as string;
            const title = this.getInputData(2) as string;
            const status = this.getInputData(3) as 'pending' | 'processing' | 'completed' | 'cancelled';
            const result = await codebolt.todo.updateTodo({ id, title, status });
            this.setOutputData(1, result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('UpdateTodoNode error:', error);
            this.setOutputData(2, false);
        }
    }
}

export class GetTodoListNode extends BaseGetTodoListNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const result = await codebolt.todo.getTodoList();
            this.setOutputData(1, (result as any).todos || result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('GetTodoListNode error:', error);
            this.setOutputData(2, false);
        }
    }
}

export class GetAllIncompleteTodosNode extends BaseGetAllIncompleteTodosNode {
    constructor() { super(); }
    async onExecute() {
        try {
            const result = await codebolt.todo.getAllIncompleteTodos();
            this.setOutputData(1, (result as any).todos || result);
            this.setOutputData(2, true);
            this.triggerSlot(0, null, null);
        } catch (error) {
            console.error('GetAllIncompleteTodosNode error:', error);
            this.setOutputData(2, false);
        }
    }
}
