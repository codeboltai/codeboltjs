/**
 * Orchestration tools - Individual tools for task, agent, and thread management
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

// Thread tools
export { ThreadCreateTool, type ThreadCreateParams } from './thread-create';
export { ThreadCreateStartTool, type ThreadCreateStartParams } from './thread-create-start';
export { ThreadCreateBackgroundTool, type ThreadCreateBackgroundParams } from './thread-create-background';
export { ThreadListTool, type ThreadListParams } from './thread-list';
export { ThreadGetTool, type ThreadGetParams } from './thread-get';
export { ThreadStartTool, type ThreadStartParams } from './thread-start';
export { ThreadUpdateTool, type ThreadUpdateParams } from './thread-update';
export { ThreadDeleteTool, type ThreadDeleteParams } from './thread-delete';
export { ThreadGetMessagesTool, type ThreadGetMessagesParams } from './thread-get-messages';
export { ThreadUpdateStatusTool, type ThreadUpdateStatusParams } from './thread-update-status';

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
import { ThreadCreateTool } from './thread-create';
import { ThreadCreateStartTool } from './thread-create-start';
import { ThreadCreateBackgroundTool } from './thread-create-background';
import { ThreadListTool } from './thread-list';
import { ThreadGetTool } from './thread-get';
import { ThreadStartTool } from './thread-start';
import { ThreadUpdateTool } from './thread-update';
import { ThreadDeleteTool } from './thread-delete';
import { ThreadGetMessagesTool } from './thread-get-messages';
import { ThreadUpdateStatusTool } from './thread-update-status';

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
    // Thread tools
    new ThreadCreateTool(),
    new ThreadCreateStartTool(),
    new ThreadCreateBackgroundTool(),
    new ThreadListTool(),
    new ThreadGetTool(),
    new ThreadStartTool(),
    new ThreadUpdateTool(),
    new ThreadDeleteTool(),
    new ThreadGetMessagesTool(),
    new ThreadUpdateStatusTool(),
];
