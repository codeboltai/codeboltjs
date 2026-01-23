/**
 * Orchestration tools - Individual tools for task and agent management
 */

// Task tools
export { TaskCreateTool, type TaskCreateParams } from './task-create';
export { TaskUpdateTool, type TaskUpdateParams } from './task-update';
export { TaskDeleteTool, type TaskDeleteParams } from './task-delete';
export { TaskListTool, type TaskListParams } from './task-list';
export { TaskGetTool, type TaskGetParams } from './task-get';
export { TaskAssignTool, type TaskAssignParams } from './task-assign';
export { TaskExecuteTool, type TaskExecuteParams } from './task-execute';

// Agent tools
export { AgentFindTool, type AgentFindParams } from './agent-find';
export { AgentStartTool, type AgentStartParams } from './agent-start';
export { AgentListTool, type AgentListParams } from './agent-list';
export { AgentDetailsTool, type AgentDetailsParams } from './agent-details';

// Create instances for convenience
import { TaskCreateTool } from './task-create';
import { TaskUpdateTool } from './task-update';
import { TaskDeleteTool } from './task-delete';
import { TaskListTool } from './task-list';
import { TaskGetTool } from './task-get';
import { TaskAssignTool } from './task-assign';
import { TaskExecuteTool } from './task-execute';
import { AgentFindTool } from './agent-find';
import { AgentStartTool } from './agent-start';
import { AgentListTool } from './agent-list';
import { AgentDetailsTool } from './agent-details';

/**
 * All orchestration tools
 */
export const orchestrationTools = [
    // Task tools
    new TaskCreateTool(),
    new TaskUpdateTool(),
    new TaskDeleteTool(),
    new TaskListTool(),
    new TaskGetTool(),
    new TaskAssignTool(),
    new TaskExecuteTool(),
    // Agent tools
    new AgentFindTool(),
    new AgentStartTool(),
    new AgentListTool(),
    new AgentDetailsTool(),
];
