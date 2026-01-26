/**
 * Task tools - Tools for task management
 */

export { TaskCreateTool, type TaskCreateParams } from './task-create';
export { TaskUpdateTool, type TaskUpdateParams } from './task-update';
export { TaskDeleteTool, type TaskDeleteParams } from './task-delete';
export { TaskListTool, type TaskListParams } from './task-list';
export { TaskGetTool, type TaskGetParams } from './task-get';
export { TaskAssignTool, type TaskAssignParams } from './task-assign';
export { TaskExecuteTool, type TaskExecuteParams } from './task-execute';

import { TaskCreateTool } from './task-create';
import { TaskUpdateTool } from './task-update';
import { TaskDeleteTool } from './task-delete';
import { TaskListTool } from './task-list';
import { TaskGetTool } from './task-get';
import { TaskAssignTool } from './task-assign';
import { TaskExecuteTool } from './task-execute';

/**
 * All task tools
 */
export const taskTools = [
    new TaskCreateTool(),
    new TaskUpdateTool(),
    new TaskDeleteTool(),
    new TaskListTool(),
    new TaskGetTool(),
    new TaskAssignTool(),
    new TaskExecuteTool(),
];
