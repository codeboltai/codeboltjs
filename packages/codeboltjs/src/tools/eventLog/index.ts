/**
 * Event Log Tools
 * 
 * Tools for managing event log instances and events.
 */

export { EventLogCreateInstanceTool } from './eventlog-create-instance';
export { EventLogGetInstanceTool } from './eventlog-get-instance';
export { EventLogListInstancesTool } from './eventlog-list-instances';
export { EventLogUpdateInstanceTool } from './eventlog-update-instance';
export { EventLogDeleteInstanceTool } from './eventlog-delete-instance';
export { EventLogAppendEventTool } from './eventlog-append-event';
export { EventLogAppendEventsTool } from './eventlog-append-events';
export { EventLogQueryEventsTool } from './eventlog-query-events';
export { EventLogGetInstanceStatsTool } from './eventlog-get-instance-stats';

import { EventLogCreateInstanceTool } from './eventlog-create-instance';
import { EventLogGetInstanceTool } from './eventlog-get-instance';
import { EventLogListInstancesTool } from './eventlog-list-instances';
import { EventLogUpdateInstanceTool } from './eventlog-update-instance';
import { EventLogDeleteInstanceTool } from './eventlog-delete-instance';
import { EventLogAppendEventTool } from './eventlog-append-event';
import { EventLogAppendEventsTool } from './eventlog-append-events';
import { EventLogQueryEventsTool } from './eventlog-query-events';
import { EventLogGetInstanceStatsTool } from './eventlog-get-instance-stats';

/**
 * Array of all event log tools
 */
export const eventLogTools = [
    new EventLogCreateInstanceTool(),
    new EventLogGetInstanceTool(),
    new EventLogListInstancesTool(),
    new EventLogUpdateInstanceTool(),
    new EventLogDeleteInstanceTool(),
    new EventLogAppendEventTool(),
    new EventLogAppendEventsTool(),
    new EventLogQueryEventsTool(),
    new EventLogGetInstanceStatsTool(),
];
