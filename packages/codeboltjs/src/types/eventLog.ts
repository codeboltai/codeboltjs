/**
 * Event Log Types
 * Type definitions for event log operations
 */

export interface EventLogBaseResponse {
    type: string;
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
    timestamp: string;
    requestId: string;
}

export interface EventLogInstance {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface EventLogEntry {
    id: string;
    instanceId: string;
    stream_id: string;
    event_type: string;
    payload: Record<string, any>;
    metadata: Record<string, any>;
    timestamp: string;
    sequence_number: number;
}

// Query DSL types
export interface EventLogDSL {
    from: {
        instance: string;
        stream?: string;
    };
    where?: EventLogCondition[];
    select?: string[];
    orderBy?: {
        field: string;
        direction: 'asc' | 'desc';
    };
    limit?: number;
    offset?: number;
    reduce?: {
        type: 'count' | 'sum' | 'avg' | 'min' | 'max' | 'collect';
        field?: string;
        groupBy?: string[];
    };
}

export interface EventLogCondition {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'in' | 'between';
    value: any;
}

export interface EventLogQueryResult {
    events?: EventLogEntry[];
    aggregation?: any;
    total: number;
    limit?: number;
    offset?: number;
}

// Operation parameter types
export interface CreateEventLogInstanceParams {
    name: string;
    description?: string;
}

export interface UpdateEventLogInstanceParams {
    name?: string;
    description?: string;
}

export interface AppendEventParams {
    instanceId: string;
    stream_id?: string;
    streamId?: string;
    event_type?: string;
    eventType?: string;
    payload?: Record<string, any>;
    metadata?: Record<string, any>;
    autoCreateInstance?: boolean;
}

export interface AppendEventsParams {
    instanceId: string;
    events: Array<{
        stream_id?: string;
        streamId?: string;
        event_type?: string;
        eventType?: string;
        payload?: Record<string, any>;
        metadata?: Record<string, any>;
    }>;
    autoCreateInstance?: boolean;
}

// Response types
export interface EventLogInstanceResponse extends EventLogBaseResponse {
    data?: { instance: EventLogInstance };
}

export interface EventLogInstanceListResponse extends EventLogBaseResponse {
    data?: { instances: EventLogInstance[] };
}

export interface EventLogAppendResponse extends EventLogBaseResponse {
    data?: { event: EventLogEntry };
}

export interface EventLogAppendMultipleResponse extends EventLogBaseResponse {
    data?: { events: EventLogEntry[]; count: number };
}

export interface EventLogQueryResponse extends EventLogBaseResponse {
    data?: { result: EventLogQueryResult };
}

export interface EventLogStatsResponse extends EventLogBaseResponse {
    data?: {
        instanceId: string;
        name: string;
        eventCount: number;
        createdAt: string;
        updatedAt: string;
    };
}
