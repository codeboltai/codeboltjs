/**
 * Event tools
 */

export { EventAddRunningAgentTool, type EventAddRunningAgentParams } from './event-add-running-agent';
export { EventGetRunningCountTool, type EventGetRunningCountParams } from './event-get-running-count';
export { EventCheckCompletionTool, type EventCheckCompletionParams } from './event-check-completion';
export { EventOnCompletionTool, type EventOnCompletionParams } from './event-on-completion';
export { EventCheckGroupedCompletionTool, type EventCheckGroupedCompletionParams } from './event-check-grouped-completion';
export { EventOnGroupedCompletionTool, type EventOnGroupedCompletionParams } from './event-on-grouped-completion';
export { EventCheckAgentEventTool, type EventCheckAgentEventParams } from './event-check-agent-event';
export { EventOnAgentEventTool, type EventOnAgentEventParams } from './event-on-agent-event';
export { EventWaitAnyTool, type EventWaitAnyParams } from './event-wait-any';

// Create instances for convenience
import { EventAddRunningAgentTool } from './event-add-running-agent';
import { EventGetRunningCountTool } from './event-get-running-count';
import { EventCheckCompletionTool } from './event-check-completion';
import { EventOnCompletionTool } from './event-on-completion';
import { EventCheckGroupedCompletionTool } from './event-check-grouped-completion';
import { EventOnGroupedCompletionTool } from './event-on-grouped-completion';
import { EventCheckAgentEventTool } from './event-check-agent-event';
import { EventOnAgentEventTool } from './event-on-agent-event';
import { EventWaitAnyTool } from './event-wait-any';

/**
 * All event tools
 */
export const eventTools = [
    new EventAddRunningAgentTool(),
    new EventGetRunningCountTool(),
    new EventCheckCompletionTool(),
    new EventOnCompletionTool(),
    new EventCheckGroupedCompletionTool(),
    new EventOnGroupedCompletionTool(),
    new EventCheckAgentEventTool(),
    new EventOnAgentEventTool(),
    new EventWaitAnyTool(),
];
