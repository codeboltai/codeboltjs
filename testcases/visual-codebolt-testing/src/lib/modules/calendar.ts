import { CodeboltModule, param, fn } from './types';

export const calendarModule: CodeboltModule = {
  name: 'calendar',
  displayName: 'Calendar',
  description: 'Calendar event management',
  category: 'calendar',
  functions: [
    fn('createEvent', 'Creates a calendar event', [
      param('title', 'string', true, 'Event title'),
      param('startTime', 'string', true, 'Start time (ISO)'),
      param('endTime', 'string', false, 'End time (ISO)'),
      param('description', 'string', false, 'Event description'),
      param('recurring', 'object', false, 'Recurrence config'),
    ], 'EventResponse'),
    fn('updateEvent', 'Updates a calendar event', [
      param('eventId', 'string', true, 'Event ID'),
      param('updates', 'object', true, 'Update data'),
    ], 'EventResponse'),
    fn('deleteEvent', 'Deletes a calendar event', [
      param('eventId', 'string', true, 'Event ID'),
    ], 'DeleteResponse'),
    fn('getEvent', 'Gets a calendar event', [
      param('eventId', 'string', true, 'Event ID'),
    ], 'EventResponse'),
    fn('listEvents', 'Lists calendar events', [
      param('filters', 'object', false, 'Filter options'),
    ], 'EventListResponse'),
    fn('getEventsInRange', 'Gets events in date range', [
      param('startDate', 'string', true, 'Start date (ISO)'),
      param('endDate', 'string', true, 'End date (ISO)'),
    ], 'EventListResponse'),
    fn('getUpcomingEvents', 'Gets upcoming events', [
      param('limit', 'number', false, 'Result limit'),
    ], 'EventListResponse'),
    fn('getTriggeredEvents', 'Gets triggered events', [
      param('filters', 'object', false, 'Filter options'),
    ], 'EventListResponse'),
    fn('markEventComplete', 'Marks event complete', [
      param('eventId', 'string', true, 'Event ID'),
    ], 'EventResponse'),
    fn('markEventsComplete', 'Marks events complete', [
      param('eventIds', 'array', true, 'Event IDs'),
    ], 'EventListResponse'),
    fn('getTriggeredEventsAndMarkComplete', 'Gets and marks triggered events', [], 'EventListResponse'),
    fn('rsvp', 'RSVPs to event', [
      param('eventId', 'string', true, 'Event ID'),
      param('response', 'string', true, 'RSVP response'),
      param('agentId', 'string', false, 'Agent ID'),
    ], 'RSVPResponse'),
    fn('getStatus', 'Gets scheduler status', [], 'SchedulerStatusResponse'),
  ],
};

export const eventLogModule: CodeboltModule = {
  name: 'eventLog',
  displayName: 'Event Log',
  description: 'Event logging operations',
  category: 'calendar',
  functions: [
    fn('createInstance', 'Creates event log instance', [
      param('name', 'string', true, 'Instance name'),
      param('description', 'string', false, 'Instance description'),
    ], 'InstanceResponse'),
    fn('getInstance', 'Gets event log instance', [
      param('instanceId', 'string', true, 'Instance ID'),
    ], 'InstanceResponse'),
    fn('listInstances', 'Lists event log instances', [], 'InstanceListResponse'),
    fn('updateInstance', 'Updates event log instance', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('updates', 'object', true, 'Update data'),
    ], 'InstanceResponse'),
    fn('deleteInstance', 'Deletes event log instance', [
      param('instanceId', 'string', true, 'Instance ID'),
    ], 'DeleteResponse'),
    fn('appendEvent', 'Appends event to log', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('eventType', 'string', true, 'Event type'),
      param('data', 'object', true, 'Event data'),
    ], 'EventResponse'),
    fn('appendEvents', 'Appends multiple events', [
      param('instanceId', 'string', true, 'Instance ID'),
      param('events', 'array', true, 'Events array'),
    ], 'EventsResponse'),
    fn('queryEvents', 'Queries events', [
      param('query', 'object', true, 'Query DSL'),
    ], 'EventsResponse'),
    fn('getInstanceStats', 'Gets instance statistics', [
      param('instanceId', 'string', true, 'Instance ID'),
    ], 'StatsResponse'),
  ],
};

export const hookModule: CodeboltModule = {
  name: 'hook',
  displayName: 'Hook',
  description: 'Hook/trigger management',
  category: 'calendar',
  functions: [
    fn('initialize', 'Initializes hook manager', [
      param('projectPath', 'string', true, 'Project path'),
    ], 'InitResponse'),
    fn('create', 'Creates a hook', [
      param('config', 'object', true, 'Hook configuration'),
    ], 'HookResponse'),
    fn('update', 'Updates a hook', [
      param('hookId', 'string', true, 'Hook ID'),
      param('config', 'object', true, 'Hook configuration'),
    ], 'HookResponse'),
    fn('delete', 'Deletes a hook', [
      param('hookId', 'string', true, 'Hook ID'),
    ], 'DeleteResponse'),
    fn('list', 'Lists hooks', [], 'HookListResponse'),
    fn('get', 'Gets a hook', [
      param('hookId', 'string', true, 'Hook ID'),
    ], 'HookResponse'),
    fn('enable', 'Enables a hook', [
      param('hookId', 'string', true, 'Hook ID'),
    ], 'HookResponse'),
    fn('disable', 'Disables a hook', [
      param('hookId', 'string', true, 'Hook ID'),
    ], 'HookResponse'),
  ],
};
