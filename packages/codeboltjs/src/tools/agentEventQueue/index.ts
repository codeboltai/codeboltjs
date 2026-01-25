/**
 * Agent Event Queue tools
 */

export { EventQueueAddEventTool, type EventQueueAddEventParams } from './eventqueue-add-event';
export { EventQueueSendMessageTool, type EventQueueSendMessageParams } from './eventqueue-send-message';
export { EventQueueGetStatsTool, type EventQueueGetStatsParams } from './eventqueue-get-stats';
export { EventQueueGetPendingTool, type EventQueueGetPendingParams } from './eventqueue-get-pending';
export { EventQueueWaitNextTool, type EventQueueWaitNextParams } from './eventqueue-wait-next';
export { EventQueueAcknowledgeTool, type EventQueueAcknowledgeParams } from './eventqueue-acknowledge';

// Create instances for convenience
import { EventQueueAddEventTool } from './eventqueue-add-event';
import { EventQueueSendMessageTool } from './eventqueue-send-message';
import { EventQueueGetStatsTool } from './eventqueue-get-stats';
import { EventQueueGetPendingTool } from './eventqueue-get-pending';
import { EventQueueWaitNextTool } from './eventqueue-wait-next';
import { EventQueueAcknowledgeTool } from './eventqueue-acknowledge';

/**
 * All agent event queue tools
 */
export const agentEventQueueTools = [
    new EventQueueAddEventTool(),
    new EventQueueSendMessageTool(),
    new EventQueueGetStatsTool(),
    new EventQueueGetPendingTool(),
    new EventQueueWaitNextTool(),
    new EventQueueAcknowledgeTool(),
];
