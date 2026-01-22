/**
 * Orchestration tools (task, thread, agent management)
 */

export { TaskManagementTool, type TaskManagementToolParams, type TaskActionType } from './task-management';
export { AgentManagementTool, type AgentManagementToolParams, type AgentActionType } from './agent-management';

// Create instances for convenience
import { TaskManagementTool } from './task-management';
import { AgentManagementTool } from './agent-management';

/**
 * All orchestration tools
 */
export const orchestrationTools = [
    new TaskManagementTool(),
    new AgentManagementTool(),
];
