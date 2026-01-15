import cbws from '../core/websocket';

// ================================
// Calendar Event Types
// ================================

export type CalendarEventType = 'generic' | 'meeting' | 'reminder' | 'deadline' | 'check' | 'milestone';
export type CalendarRSVPStatus = 'pending' | 'accepted' | 'declined';
export type CalendarCheckType = 'email' | 'website' | 'api' | 'file';
export type CalendarParticipantType = 'user' | 'agent' | 'team' | 'swarm';

// ================================
// Calendar Participant Interface
// ================================

export interface CalendarParticipant {
    id: string;
    name: string;
    type: CalendarParticipantType;
    agentExecutionId?: string;
    threadId?: string;
    status?: CalendarRSVPStatus;
}

// ================================
// Calendar Event Interface
// ================================

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    eventType: CalendarEventType;
    startTime: string;
    endTime?: string;
    hasDuration: boolean;
    allDay?: boolean;
    swarmId?: string;
    participants?: CalendarParticipant[];
    isRecurring?: boolean;
    cronExpression?: string;
    recurrenceEndTime?: string;
    reminder?: {
        enabled: boolean;
        minutesBefore: number;
    };
    agenda?: string;
    checkType?: CalendarCheckType;
    tags?: string[];
    metadata?: Record<string, any>;
    completed?: boolean;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    createdBy: CalendarParticipant;
}

// ================================
// Request Parameter Interfaces
// ================================

export interface ICreateEventParams {
    title: string;
    description?: string;
    eventType?: CalendarEventType;
    startTime: string;
    endTime?: string;
    hasDuration?: boolean;
    allDay?: boolean;
    swarmId?: string;
    participants?: CalendarParticipant[];
    isRecurring?: boolean;
    cronExpression?: string;
    recurrenceEndTime?: string;
    reminder?: {
        enabled: boolean;
        minutesBefore: number;
    };
    agenda?: string;
    checkType?: CalendarCheckType;
    tags?: string[];
    metadata?: Record<string, any>;
    // Creator info
    createdById?: string;
    createdByName?: string;
    createdByType?: CalendarParticipantType;
    agentExecutionId?: string;
    threadId?: string;
}

export interface IUpdateEventParams {
    eventId: string;
    title?: string;
    description?: string;
    eventType?: CalendarEventType;
    startTime?: string;
    endTime?: string;
    hasDuration?: boolean;
    allDay?: boolean;
    participants?: CalendarParticipant[];
    isRecurring?: boolean;
    cronExpression?: string;
    recurrenceEndTime?: string;
    reminder?: {
        enabled: boolean;
        minutesBefore: number;
    };
    agenda?: string;
    checkType?: CalendarCheckType;
    tags?: string[];
    metadata?: Record<string, any>;
}

export interface IDeleteEventParams {
    eventId: string;
}

export interface IGetEventParams {
    eventId: string;
}

export interface IListEventsParams {
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
}

export interface IGetEventsInRangeParams {
    startDate: string;
    endDate: string;
}

export interface IGetUpcomingEventsParams {
    withinMinutes?: number;
}

export interface IGetTriggeredEventsParams {
    includeCompleted?: boolean;
}

export interface IMarkEventCompleteParams {
    eventId: string;
}

export interface IMarkEventsCompleteParams {
    eventIds: string[];
}

export interface IRSVPParams {
    eventId: string;
    participantId: string;
    status: 'accepted' | 'declined';
}

// ================================
// Response Interfaces
// ================================

export interface CalendarResponse {
    success: boolean;
    code: string;
    message: string;
    data?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

export interface ICreateEventResponse extends CalendarResponse {
    data?: {
        event: CalendarEvent;
    };
}

export interface IUpdateEventResponse extends CalendarResponse {
    data?: {
        event: CalendarEvent;
    };
}

export interface IDeleteEventResponse extends CalendarResponse { }

export interface IGetEventResponse extends CalendarResponse {
    data?: {
        event: CalendarEvent;
    };
}

export interface IListEventsResponse extends CalendarResponse {
    data?: {
        events: CalendarEvent[];
        count: number;
    };
}

export interface IGetEventsInRangeResponse extends CalendarResponse {
    data?: {
        events: CalendarEvent[];
        count: number;
    };
}

export interface IGetUpcomingEventsResponse extends CalendarResponse {
    data?: {
        events: CalendarEvent[];
        count: number;
    };
}

export interface IGetTriggeredEventsResponse extends CalendarResponse {
    data?: {
        events: CalendarEvent[];
        count: number;
    };
}

export interface IMarkEventCompleteResponse extends CalendarResponse {
    data?: {
        event: CalendarEvent;
    };
}

export interface IMarkEventsCompleteResponse extends CalendarResponse {
    data?: {
        events: CalendarEvent[];
        count: number;
    };
}

export interface IGetTriggeredEventsAndMarkCompleteResponse extends CalendarResponse {
    data?: {
        events: CalendarEvent[];
        count: number;
    };
}

export interface IRSVPResponse extends CalendarResponse {
    data?: {
        event: CalendarEvent;
    };
}

export interface IGetStatusResponse extends CalendarResponse {
    data?: {
        isRunning: boolean;
        lastCheck: string;
        nextCheck: string;
        scheduledEvents: number;
    };
}

// ================================
// Calendar Module
// ================================

const cbcalendar = {
    /**
     * Create a new calendar event
     * @param params - Event creation parameters
     * @returns Promise resolving to the created event
     */
    createEvent: async (params: ICreateEventParams): Promise<ICreateEventResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'calendar.createEvent',
                ...params
            },
            'calendar.createEvent.response'
        );
    },

    /**
     * Update an existing calendar event
     * @param params - Event update parameters including eventId
     * @returns Promise resolving to the updated event
     */
    updateEvent: async (params: IUpdateEventParams): Promise<IUpdateEventResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'calendar.updateEvent',
                ...params
            },
            'calendar.updateEvent.response'
        );
    },

    /**
     * Delete a calendar event
     * @param params - Parameters including eventId
     * @returns Promise resolving to deletion confirmation
     */
    deleteEvent: async (params: IDeleteEventParams): Promise<IDeleteEventResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'calendar.deleteEvent',
                ...params
            },
            'calendar.deleteEvent.response'
        );
    },

    /**
     * Get a single calendar event by ID
     * @param params - Parameters including eventId
     * @returns Promise resolving to the event
     */
    getEvent: async (params: IGetEventParams): Promise<IGetEventResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'calendar.getEvent',
                ...params
            },
            'calendar.getEvent.response'
        );
    },

    /**
     * List calendar events with optional filters
     * @param params - Optional filter parameters
     * @returns Promise resolving to list of events
     */
    listEvents: async (params: IListEventsParams = {}): Promise<IListEventsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'calendar.listEvents',
                ...params
            },
            'calendar.listEvents.response'
        );
    },

    /**
     * Get events within a specific date range
     * @param params - Parameters including startDate and endDate
     * @returns Promise resolving to events in range
     */
    getEventsInRange: async (params: IGetEventsInRangeParams): Promise<IGetEventsInRangeResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'calendar.getEventsInRange',
                ...params
            },
            'calendar.getEventsInRange.response'
        );
    },

    /**
     * Get upcoming events within a specified time window
     * @param params - Optional parameters including withinMinutes (default: 60)
     * @returns Promise resolving to upcoming events
     */
    getUpcomingEvents: async (params: IGetUpcomingEventsParams = {}): Promise<IGetUpcomingEventsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'calendar.getUpcomingEvents',
                ...params
            },
            'calendar.getUpcomingEvents.response'
        );
    },

    /**
     * Get triggered events (events whose start time has passed)
     * @param params - Optional parameters including includeCompleted flag
     * @returns Promise resolving to triggered events
     */
    getTriggeredEvents: async (params: IGetTriggeredEventsParams = {}): Promise<IGetTriggeredEventsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'calendar.getTriggeredEvents',
                ...params
            },
            'calendar.getTriggeredEvents.response'
        );
    },

    /**
     * Mark a single event as complete
     * @param params - Parameters including eventId
     * @returns Promise resolving to the completed event
     */
    markEventComplete: async (params: IMarkEventCompleteParams): Promise<IMarkEventCompleteResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'calendar.markEventComplete',
                ...params
            },
            'calendar.markEventComplete.response'
        );
    },

    /**
     * Mark multiple events as complete
     * @param params - Parameters including array of eventIds
     * @returns Promise resolving to the completed events
     */
    markEventsComplete: async (params: IMarkEventsCompleteParams): Promise<IMarkEventsCompleteResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'calendar.markEventsComplete',
                ...params
            },
            'calendar.markEventsComplete.response'
        );
    },

    /**
     * Get triggered events and mark them all as complete in one operation
     * @returns Promise resolving to the events that were retrieved and marked complete
     */
    getTriggeredEventsAndMarkComplete: async (): Promise<IGetTriggeredEventsAndMarkCompleteResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'calendar.getTriggeredEventsAndMarkComplete'
            },
            'calendar.getTriggeredEventsAndMarkComplete.response'
        );
    },

    /**
     * RSVP to a calendar event
     * @param params - Parameters including eventId, participantId, and status
     * @returns Promise resolving to the updated event
     */
    rsvp: async (params: IRSVPParams): Promise<IRSVPResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'calendar.rsvp',
                ...params
            },
            'calendar.rsvp.response'
        );
    },

    /**
     * Get the calendar scheduler status
     * @returns Promise resolving to scheduler status information
     */
    getStatus: async (): Promise<IGetStatusResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'calendar.getStatus'
            },
            'calendar.getStatus.response'
        );
    }
};

export default cbcalendar;
