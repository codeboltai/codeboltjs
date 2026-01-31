/**
 * Agent Event Queue Types
 * Type definitions for the Agent Event Queue system in codeboltjs SDK
 */

// ============================================================================
// Event Type Enums
// ============================================================================

/**
 * Types of events that can be sent to agents
 */
export enum AgentEventType {
    /** Inter-agent communication */
    AGENT_MESSAGE = 'agentMessage',
    /** Calendar event notifications (reminders, updates) */
    CALENDAR_UPDATE = 'calendarUpdate',
    /** System-level notifications */
    SYSTEM_NOTIFICATION = 'systemNotification',
    /** Task status change notifications */
    TASK_UPDATE = 'taskUpdate',
    /** User-defined custom events */
    CUSTOM = 'custom'
}

/**
 * Status of an event in the queue
 */
export enum AgentEventStatus {
    /** In queue, awaiting delivery */
    PENDING = 'pending',
    /** Sent via WebSocket, awaiting acknowledgement */
    DELIVERED = 'delivered',
    /** Acknowledgement received, can be archived */
    ACKNOWLEDGED = 'acked',
    /** Retrieved via pull mode (auto-removed) */
    PULLED = 'pulled',
    /** Delivery failed */
    FAILED = 'failed',
    /** Event expired before delivery */
    EXPIRED = 'expired'
}

/**
 * Priority levels for events
 */
export enum AgentEventPriority {
    LOW = 'low',
    NORMAL = 'normal',
    HIGH = 'high',
    URGENT = 'urgent'
}

// ============================================================================
// Payload Types
// ============================================================================

/**
 * Payload for inter-agent messages
 */
export interface AgentMessagePayload {
    type: 'agentMessage';
    /** Message content */
    content: string;
    /** Type of message content */
    messageType?: 'text' | 'json' | 'command';
    /** Reference to a previous eventId for replies */
    replyTo?: string;
}

/**
 * Payload for calendar update notifications
 */
export interface CalendarUpdatePayload {
    type: 'calendarUpdate';
    /** ID of the calendar event */
    calendarEventId: string;
    /** Action that occurred */
    action: 'created' | 'updated' | 'deleted' | 'reminder';
    /** Title of the calendar event */
    eventTitle?: string;
    /** Event start time (ISO string) */
    startTime?: string;
    /** Event end time (ISO string) */
    endTime?: string;
    /** Additional event details */
    description?: string;
    /** Location of the event */
    location?: string;
}

/**
 * Payload for system notifications
 */
export interface SystemNotificationPayload {
    type: 'systemNotification';
    /** Type of notification */
    notificationType: 'info' | 'warning' | 'error' | 'success';
    /** Notification title */
    title: string;
    /** Notification message */
    message: string;
    /** Whether the agent needs to take action */
    actionRequired?: boolean;
    /** Action to take if actionRequired is true */
    actionType?: string;
}

/**
 * Payload for task update notifications
 */
export interface TaskUpdatePayload {
    type: 'taskUpdate';
    /** ID of the task */
    taskId: string;
    /** Action that occurred */
    action: 'created' | 'updated' | 'completed' | 'failed' | 'cancelled';
    /** Title of the task */
    taskTitle?: string;
    /** Current status of the task */
    status?: string;
    /** Progress percentage (0-100) */
    progress?: number;
    /** Error message if failed */
    errorMessage?: string;
}

/**
 * Payload for custom events
 */
export interface CustomEventPayload {
    type: 'custom';
    /** Name/identifier for the custom event */
    eventName: string;
    /** Arbitrary data for the custom event */
    data: Record<string, any>;
}

/**
 * Union type for all event payloads
 */
export type AgentEventPayload =
    | AgentMessagePayload
    | CalendarUpdatePayload
    | SystemNotificationPayload
    | TaskUpdatePayload
    | CustomEventPayload;

// ============================================================================
// Core Event Message Interface
// ============================================================================

/**
 * Core event message structure
 */
export interface AgentEventMessage {
    /** Unique event identifier (UUID) */
    eventId: string;
    /** Target agent ID */
    targetAgentId: string;
    /** Specific target agent instance ID (optional) */
    targetAgentInstanceId?: string;
    /** Target thread ID (optional) */
    targetThreadId?: string;
    /** Source agent ID (for inter-agent messages) */
    sourceAgentId?: string;
    /** Source thread ID */
    sourceThreadId?: string;
    /** Type of event */
    eventType: AgentEventType;
    /** Event priority */
    priority: AgentEventPriority;
    /** Event payload (discriminated by type) */
    payload: AgentEventPayload;
    /** Event creation timestamp (ISO string) */
    createdAt: string;
    /** When the event was delivered via WebSocket */
    deliveredAt?: string;
    /** When acknowledgement was received */
    acknowledgedAt?: string;
    /** Optional expiration time (ISO string) */
    expiresAt?: string;
    /** Current status of the event */
    status: AgentEventStatus;
    /** Number of delivery retry attempts */
    retryCount: number;
    /** Additional metadata */
    metadata?: Record<string, any>;
}

// ============================================================================
// Request/Input Types
// ============================================================================

/**
 * Input for adding an event to an agent's queue
 */
export interface AddEventInput {
    /** Target agent ID */
    targetAgentId: string;
    /** Specific target agent instance ID */
    targetAgentInstanceId?: string;
    /** Target thread ID */
    targetThreadId?: string;
    /** Type of event */
    eventType?: AgentEventType;
    /** Event priority */
    priority?: AgentEventPriority;
    /** Event payload */
    payload: AgentEventPayload;
    /** Optional expiration time (ISO string) */
    expiresAt?: string;
    /** Additional metadata */
    metadata?: Record<string, any>;
}

/**
 * Input for getting pending events
 */
export interface GetPendingEventsInput {
    /** Agent ID to get events for */
    agentId?: string;
    /** Agent instance ID */
    agentInstanceId?: string;
    /** Thread ID */
    threadId?: string;
    /** Maximum number of events to return */
    limit?: number;
    /** Filter by event types */
    eventTypes?: AgentEventType[];
    /** Filter by priority */
    minPriority?: AgentEventPriority;
}

/**
 * Input for pulling events (get and remove)
 */
export interface PullEventsInput {
    /** Agent ID to pull events for */
    agentId?: string;
    /** Agent instance ID */
    agentInstanceId?: string;
    /** Thread ID */
    threadId?: string;
    /** Number of events to pull, or 'all' */
    limit?: number | 'all';
    /** Filter by event types */
    eventTypes?: AgentEventType[];
    /** Only pull events since this timestamp */
    since?: string;
}

/**
 * Input for acknowledging an event
 */
export interface AckEventInput {
    /** ID of the event to acknowledge */
    eventId: string;
    /** Whether processing was successful */
    success: boolean;
    /** Error message if processing failed */
    errorMessage?: string;
}

/**
 * Input for sending an inter-agent message
 */
export interface SendAgentMessageInput {
    /** Target agent ID */
    targetAgentId: string;
    /** Target thread ID */
    targetThreadId?: string;
    /** Message content */
    content: string;
    /** Message type */
    messageType?: 'text' | 'json' | 'command';
    /** Event priority */
    priority?: AgentEventPriority;
    /** Reference to a previous eventId for replies */
    replyTo?: string;
}

// ============================================================================
// Response Types
// ============================================================================

/**
 * Standard response for Agent Event Queue operations
 */
export interface AgentEventQueueResponse<T = any> {
    /** Whether the operation succeeded */
    success: boolean;
    /** Response code */
    code: string;
    /** Human-readable message */
    message: string;
    /** Response data */
    data?: T;
    /** Error details */
    error?: {
        code: string;
        message: string;
        details?: any;
    };
    /** Request timestamp */
    timestamp?: string;
    /** Request ID for correlation */
    requestId?: string;
}

/**
 * Response data for getPendingEvents
 */
export interface GetPendingEventsResponseData {
    events: AgentEventMessage[];
    count: number;
    pendingCount: number;
}

/**
 * Response data for pullEvents
 */
export interface PullEventsResponseData {
    events: AgentEventMessage[];
    count: number;
}

/**
 * Response data for addEvent
 */
export interface AddEventResponseData {
    event: AgentEventMessage;
}

/**
 * Response data for getQueueStats
 */
export interface QueueStatsResponseData {
    totalAgents: number;
    totalPending: number;
    totalDelivered: number;
    agentStats: Record<string, {
        pending: number;
        delivered: number;
    }>;
    storage?: {
        totalEvents: number;
        indexSize: number;
    };
}

/**
 * Event handler function type
 */
export type QueueEventHandler = (event: AgentEventMessage) => void;
