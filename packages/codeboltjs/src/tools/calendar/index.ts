/**
 * Calendar tools for managing calendar events
 */

export { CalendarCreateEventTool, type CalendarCreateEventToolParams } from './calendar-create-event';
export { CalendarUpdateEventTool, type CalendarUpdateEventToolParams } from './calendar-update-event';
export { CalendarDeleteEventTool, type CalendarDeleteEventToolParams } from './calendar-delete-event';
export { CalendarGetEventTool, type CalendarGetEventToolParams } from './calendar-get-event';
export { CalendarListEventsTool, type CalendarListEventsToolParams } from './calendar-list-events';
export { CalendarGetUpcomingTool, type CalendarGetUpcomingToolParams } from './calendar-get-upcoming';
export { CalendarMarkCompleteTool, type CalendarMarkCompleteToolParams } from './calendar-mark-complete';
export { CalendarGetStatusTool, type CalendarGetStatusToolParams } from './calendar-get-status';

// Create instances for convenience
import { CalendarCreateEventTool } from './calendar-create-event';
import { CalendarUpdateEventTool } from './calendar-update-event';
import { CalendarDeleteEventTool } from './calendar-delete-event';
import { CalendarGetEventTool } from './calendar-get-event';
import { CalendarListEventsTool } from './calendar-list-events';
import { CalendarGetUpcomingTool } from './calendar-get-upcoming';
import { CalendarMarkCompleteTool } from './calendar-mark-complete';
import { CalendarGetStatusTool } from './calendar-get-status';

/**
 * All calendar tools
 */
export const calendarTools = [
    new CalendarCreateEventTool(),
    new CalendarUpdateEventTool(),
    new CalendarDeleteEventTool(),
    new CalendarGetEventTool(),
    new CalendarListEventsTool(),
    new CalendarGetUpcomingTool(),
    new CalendarMarkCompleteTool(),
    new CalendarGetStatusTool(),
];
