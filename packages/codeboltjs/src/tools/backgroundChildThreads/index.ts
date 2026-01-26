/**
 * Background Child Threads Tools
 * 
 * Tools for tracking and managing background child agent threads.
 */

export { AddRunningAgentTool, type AddRunningAgentParams } from './add-running-agent';
export { GetRunningAgentCountTool, type GetRunningAgentCountParams } from './get-running-agent-count';
export { CheckBackgroundAgentCompletionTool, type CheckBackgroundAgentCompletionParams } from './check-background-agent-completion';
export { OnBackgroundAgentCompletionTool, type OnBackgroundAgentCompletionParams } from './on-background-agent-completion';

import { AddRunningAgentTool } from './add-running-agent';
import { GetRunningAgentCountTool } from './get-running-agent-count';
import { CheckBackgroundAgentCompletionTool } from './check-background-agent-completion';
import { OnBackgroundAgentCompletionTool } from './on-background-agent-completion';

/**
 * Array of all background child threads tools
 */
export const backgroundChildThreadsTools = [
    new AddRunningAgentTool(),
    new GetRunningAgentCountTool(),
    new CheckBackgroundAgentCompletionTool(),
    new OnBackgroundAgentCompletionTool(),
];
