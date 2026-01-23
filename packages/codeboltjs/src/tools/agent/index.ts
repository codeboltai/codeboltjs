/**
 * Agent tools - Tools for agent management
 */

export { AgentFindTool, type AgentFindParams } from './agent-find';
export { AgentStartTool, type AgentStartParams } from './agent-start';
export { AgentListTool, type AgentListParams } from './agent-list';
export { AgentDetailsTool, type AgentDetailsParams } from './agent-details';

import { AgentFindTool } from './agent-find';
import { AgentStartTool } from './agent-start';
import { AgentListTool } from './agent-list';
import { AgentDetailsTool } from './agent-details';

/**
 * All agent tools
 */
export const agentTools = [
    new AgentFindTool(),
    new AgentStartTool(),
    new AgentListTool(),
    new AgentDetailsTool(),
];
