/**
 * Codebolt Event Tools
 * 
 * Tools for event handling and coordination.
 */

export { EventAddRunningAgentTool } from './event-add-running-agent';
export { EventGetRunningAgentCountTool } from './event-get-running-agent-count';
export { EventCheckBackgroundAgentCompletionTool } from './event-check-background-agent-completion';
export { EventOnBackgroundAgentCompletionTool } from './event-on-background-agent-completion';
export { EventWaitForExternalEventTool } from './event-wait-for-external-event';

import { EventAddRunningAgentTool } from './event-add-running-agent';
import { EventGetRunningAgentCountTool } from './event-get-running-agent-count';
import { EventCheckBackgroundAgentCompletionTool } from './event-check-background-agent-completion';
import { EventOnBackgroundAgentCompletionTool } from './event-on-background-agent-completion';
import { EventWaitForExternalEventTool } from './event-wait-for-external-event';

/**
 * Array of all codebolt event tools
 */
export const codeboltEventTools = [
    new EventAddRunningAgentTool(),
    new EventGetRunningAgentCountTool(),
    new EventCheckBackgroundAgentCompletionTool(),
    new EventOnBackgroundAgentCompletionTool(),
    new EventWaitForExternalEventTool(),
];
