/**
 * Todo operations tools
 */

export { TodoAddTool, type TodoAddToolParams } from './todo-add';
export { TodoUpdateTool, type TodoUpdateToolParams } from './todo-update';
export { TodoListTool, type TodoListToolParams } from './todo-list';
export { TodoListIncompleteTool, type TodoListIncompleteToolParams } from './todo-list-incomplete';
export { TodoExportTool, type TodoExportToolParams } from './todo-export';
export { TodoImportTool, type TodoImportToolParams } from './todo-import';

// Create instances for convenience
import { TodoAddTool } from './todo-add';
import { TodoUpdateTool } from './todo-update';
import { TodoListTool } from './todo-list';
import { TodoListIncompleteTool } from './todo-list-incomplete';
import { TodoExportTool } from './todo-export';
import { TodoImportTool } from './todo-import';

/**
 * All todo operation tools
 */
export const todoTools = [
    new TodoAddTool(),
    new TodoUpdateTool(),
    new TodoListTool(),
    new TodoListIncompleteTool(),
    new TodoExportTool(),
    new TodoImportTool(),
];
