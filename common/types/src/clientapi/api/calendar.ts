// --- Enums and Constants ---

/** Calendar event type */
export type CalendarEventType = 'generic' | 'note' | 'meeting' | 'system-check';

/** Participant status */
export type ParticipantStatus = 'pending' | 'accepted' | 'declined';

/** Participant type */
export type ParticipantType = 'agent' | 'user';

// --- Core Entities ---

/** Calendar participant */
export interface CalendarParticipant {
  id: string;
  name: string;
  type: ParticipantType;
  agentExecutionId?: string;
  threadId?: string;
  status: ParticipantStatus;
}

/** Calendar reminder */
export interface CalendarReminder {
  enabled: boolean;
  minutesBefore: number;
  notificationSent: boolean;
  sentAt?: string;
}

/** Calendar event */
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  eventType: CalendarEventType;
  startTime: string;
  endTime: string;
  hasDuration: boolean;
  allDay: boolean;
  completed: boolean;
  completedAt?: string;
  triggeredAt?: string;
  swarmId?: string;
  createdBy: CalendarParticipant;
  participants: CalendarParticipant[];
  isRecurring: boolean;
  cronExpression?: string;
  recurrenceEndTime?: string;
  isRecurringInstance: boolean;
  parentEventId?: string;
  mailThreadId?: string;
  agenda?: string;
  checkType?: string;
  reminder?: CalendarReminder;
  tags: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

/** Calendar event summary */
export interface CalendarEventSummary {
  id: string;
  title: string;
  eventType: CalendarEventType;
  startTime: string;
  endTime: string;
  hasDuration: boolean;
  allDay: boolean;
  isRecurring: boolean;
  completed: boolean;
  participantCount: number;
  swarmId?: string;
}

/** Calendar service status */
export interface CalendarStatus {
  healthy: boolean;
  eventCount: number;
  upcomingCount: number;
  triggeredCount: number;
}

/** Calendar index entry */
export interface CalendarIndexEntry {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  eventType: CalendarEventType;
}

// --- Request Types ---

/** Create calendar event request */
export interface CreateCalendarEventRequest {
  title: string;
  description?: string;
  eventType?: CalendarEventType;
  startTime: string;
  endTime?: string;
  hasDuration?: boolean;
  allDay?: boolean;
  swarmId?: string;
  participants?: Omit<CalendarParticipant, 'status'>[];
  isRecurring?: boolean;
  cronExpression?: string;
  recurrenceEndTime?: string;
  reminder?: { enabled: boolean; minutesBefore: number };
  agenda?: string;
  checkType?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
}

/** Update calendar event request */
export interface UpdateCalendarEventRequest {
  title?: string;
  description?: string;
  eventType?: CalendarEventType;
  startTime?: string;
  endTime?: string;
  hasDuration?: boolean;
  allDay?: boolean;
  completed?: boolean;
  swarmId?: string;
  participants?: Omit<CalendarParticipant, 'status'>[];
  isRecurring?: boolean;
  cronExpression?: string;
  recurrenceEndTime?: string;
  reminder?: { enabled: boolean; minutesBefore: number };
  agenda?: string;
  checkType?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  updateScope?: 'this' | 'all' | 'future';
}

/** Calendar filter options / list params */
export interface CalendarFilterOptions {
  startDate?: string;
  endDate?: string;
  eventTypes?: CalendarEventType[];
  creatorId?: string;
  participantId?: string;
  swarmId?: string;
  includeRecurrences?: boolean;
  tags?: string[];
  search?: string;
  completed?: boolean;
  includeCompleted?: boolean;
  onlyTriggered?: boolean;
  limit?: number;
  offset?: number;
}

/** Calendar RSVP request */
export interface CalendarRSVPRequest {
  participantId: string;
  status: 'accepted' | 'declined';
}

/** Complete triggered events request */
export interface CompleteTriggeredRequest {
  eventIds: string[];
}

/** Complete event request */
export interface CompleteEventRequest {
  completedAt?: string;
}

/** Bulk complete events request */
export interface BulkCompleteEventsRequest {
  eventIds: string[];
}
