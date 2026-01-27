/**
 * Agent Event Queue Module
 * Provides functionality for managing agent event queues with local caching,
 * WebSocket event subscription, and acknowledgement handling.
 */

import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    AgentEventMessage,
    AddEventInput,
    SendAgentMessageInput,
    AckEventInput,
    GetPendingEventsInput,
    AgentEventQueueResponse,
    AddEventResponseData,
    GetPendingEventsResponseData,
    QueueStatsResponseData,
    QueueEventHandler
} from '../types/agentEventQueue';

// Re-export types for convenience
export type {
    AgentEventMessage,
    AddEventInput,
    SendAgentMessageInput,
    AckEventInput,
    GetPendingEventsInput,
    AgentEventQueueResponse,
    AddEventResponseData,
    GetPendingEventsResponseData,
    QueueStatsResponseData,
    QueueEventHandler
} from '../types/agentEventQueue';

export {
    AgentEventType,
    AgentEventStatus,
    AgentEventPriority
} from '../types/agentEventQueue';

// ============================================================================
// Local Event Cache
// ============================================================================

/** Local cache for events received via WebSocket */
const localEventCache = new Map<string, AgentEventMessage>();

/** Registered event handlers */
const eventHandlers = new Set<QueueEventHandler>();

/** Event emitter for waiting promises */
import { EventEmitter } from 'events';
const eventEmitter = new EventEmitter();

// ============================================================================
// WebSocket Subscription
// ============================================================================

// Subscribe to agentEvent messages from WebSocket
const agentEventSubscription = cbws.messageManager.subscribe('agentEvent');
agentEventSubscription.on('message', (message: any) => {
    const event = message.event as AgentEventMessage;
    if (event && event.eventId) {
        // Store in local cache
        localEventCache.set(event.eventId, event);

        // Notify waiting promises
        eventEmitter.emit('newEvent', event);

        // Call registered handlers
        for (const handler of eventHandlers) {
            try {
                handler(event);
            } catch (error) {
                console.error('[AgentEventQueue] Error in event handler:', error);
            }
        }
    }
});

// ============================================================================
// Agent Event Queue Module
// ============================================================================

const agentEventQueue = {
    // ========================================================================
    // Backend Communication Functions
    // ========================================================================

    /**
     * Add an event to a target agent's queue
     * @param params - Event creation parameters
     * @returns Promise resolving to the created event
     */
    addEvent: (params: AddEventInput): Promise<AgentEventQueueResponse<AddEventResponseData>> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'agentEventQueue.addEventForAgent',
                requestId,
                params
            },
            'agentEventQueue.addEventForAgentResponse'
        );
    },

    /**
     * Send an inter-agent message (convenience wrapper)
     * @param params - Message parameters
     * @returns Promise resolving to the created event
     */
    sendAgentMessage: (params: SendAgentMessageInput): Promise<AgentEventQueueResponse<AddEventResponseData>> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'agentEventQueue.sendAgentMessage',
                requestId,
                params
            },
            'agentEventQueue.sendAgentMessageResponse'
        );
    },

    /**
     * Get queue statistics
     * @returns Promise resolving to queue statistics
     */
    getQueueStats: (): Promise<AgentEventQueueResponse<QueueStatsResponseData>> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'agentEventQueue.getQueueStats',
                requestId,
                params: {}
            },
            'agentEventQueue.getQueueStatsResponse',
        );
    },

    /**
     * Clear the queue for an agent
     * @param agentId - Optional agent ID (defaults to current agent)
     * @returns Promise resolving to success confirmation
     */
    clearQueue: (agentId?: string): Promise<AgentEventQueueResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'agentEventQueue.clearQueue',
                requestId,
                params: { agentId }
            },
            'agentEventQueue.clearQueueResponse',
        );
    },

    // ========================================================================
    // Internal Acknowledgement Helper
    // ========================================================================

    /**
     * Acknowledge an event at the backend
     * @param eventId - ID of the event to acknowledge
     * @param success - Whether processing was successful
     * @param errorMessage - Optional error message
     */
    _acknowledgeEvent: async (eventId: string, success: boolean = true, errorMessage?: string): Promise<AgentEventQueueResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'agentEventQueue.ackEvent',
                requestId,
                params: {
                    eventId,
                    success,
                    errorMessage
                } as AckEventInput
            },
            'agentEventQueue.ackEventResponse',
        );
    },

    /**
     * Fetch pending events from backend
     * @param params - Query parameters
     */
    _fetchPendingFromBackend: async (params: GetPendingEventsInput = {}): Promise<AgentEventMessage[]> => {
        const requestId = randomUUID();
        try {
            const response = await cbws.messageManager.sendAndWaitForResponse<AgentEventQueueResponse<GetPendingEventsResponseData>>(
                {
                    type: 'agentEventQueue.getPendingEvents',
                    requestId,
                    params
                },
                'agentEventQueue.getPendingEventsResponse'
            );

            console.log('[AgentEventQueue] Backend response:', JSON.stringify(response, null, 2));

            if (response.success && response.data) {
                const events = response.data.events;
                // Ensure we always return an array
                if (Array.isArray(events)) {
                    return events;
                }
                console.warn('[AgentEventQueue] response.data.events is not an array:', typeof events, events);
                return [];
            }
            return [];
        } catch (error) {
            console.error('[AgentEventQueue] Error fetching pending events from backend:', error);
            return [];
        }
    },

    // ========================================================================
    // Local Event Management Functions
    // ========================================================================

    /**
     * Get pending events from local cache.
     * Sends acknowledgement for each event and removes from local cache.
     * If no local events, fetches from backend.
     * 
     * @param maxDepth - Maximum number of events to return (default: all)
     * @returns Promise resolving to array of events
     */
    getPendingQueueEvents: async (maxDepth?: number): Promise<AgentEventMessage[]> => {
        const events: AgentEventMessage[] = [];
        const eventIds = Array.from(localEventCache.keys());

        console.log('[AgentEventQueue] getPendingQueueEvents - localEventCache size:', localEventCache.size);

        // Determine how many events to process
        const limit = maxDepth !== undefined ? Math.min(maxDepth, eventIds.length) : eventIds.length;

        // Get events from local cache
        for (let i = 0; i < limit; i++) {
            const eventId = eventIds[i];
            const event = localEventCache.get(eventId);
            if (event) {
                console.log('[AgentEventQueue] Local cache event:', eventId, 'has eventId field:', !!event.eventId);
                events.push(event);
            }
        }

        // If no local events, try fetching from backend
        if (events.length === 0) {
            const backendEvents = await agentEventQueue._fetchPendingFromBackend({ limit: maxDepth });

            console.log('[AgentEventQueue] getPendingQueueEvents - backendEvents:',
                Array.isArray(backendEvents) ? `array of ${backendEvents.length}` : typeof backendEvents,
                JSON.stringify(backendEvents, null, 2));

            // Ensure backendEvents is an array
            if (!Array.isArray(backendEvents)) {
                console.error('[AgentEventQueue] backendEvents is not an array, returning empty array');
                return [];
            }

            // Acknowledge backend events
            for (const event of backendEvents) {
                try {
                    const ackResponse = await agentEventQueue._acknowledgeEvent(event.eventId, true);
                    console.log(`[AgentEventQueue] Ack response for ${event.eventId}:`, JSON.stringify(ackResponse));
                    if (!ackResponse.success) {
                        console.error(`[AgentEventQueue] Failed to acknowledge event ${event.eventId}:`, ackResponse.message);
                    }
                } catch (error) {
                    console.error(`[AgentEventQueue] Error acknowledging event ${event.eventId}:`, error);
                }
            }

            return backendEvents;
        }

        // Acknowledge and remove local events
        for (const event of events) {
            try {
                await agentEventQueue._acknowledgeEvent(event.eventId, true);
                localEventCache.delete(event.eventId);
            } catch (error) {
                console.error(`[AgentEventQueue] Error acknowledging event ${event.eventId}:`, error);
            }
        }

        return events;
    },

    /**
     * Wait for the next event(s) from the queue.
     * First checks local cache, then waits for WebSocket events.
     * Sends acknowledgement and removes from cache before resolving.
     * 
     * @param maxDepth - Maximum number of events to return (default: 1)
     * @returns Promise resolving to event(s)
     */
    waitForNextQueueEvent: async (maxDepth: number = 1): Promise<AgentEventMessage | AgentEventMessage[]> => {
        // Check local cache first
        if (localEventCache.size > 0) {
            const events = await agentEventQueue.getPendingQueueEvents(maxDepth);
            if (events.length > 0) {
                return maxDepth === 1 ? events[0] : events;
            }
        }

        // Wait for new event from WebSocket
        return new Promise((resolve) => {
            const onNewEvent = async (event: AgentEventMessage) => {
                eventEmitter.removeListener('newEvent', onNewEvent);

                // Acknowledge the event
                try {
                    await agentEventQueue._acknowledgeEvent(event.eventId, true);
                    localEventCache.delete(event.eventId);
                } catch (error) {
                    console.error(`[AgentEventQueue] Error acknowledging event ${event.eventId}:`, error);
                }

                // If maxDepth > 1, try to get more events from cache
                if (maxDepth > 1 && localEventCache.size > 0) {
                    const additionalEvents = await agentEventQueue.getPendingQueueEvents(maxDepth - 1);
                    resolve([event, ...additionalEvents]);
                } else {
                    resolve(maxDepth === 1 ? event : [event]);
                }
            };

            eventEmitter.once('newEvent', onNewEvent);
        });
    },

    /**
     * Register an event handler that will be called when events are received.
     * The handler receives events as they arrive via WebSocket.
     * Note: This does NOT automatically acknowledge events.
     * 
     * @param handler - Function to call when an event is received
     * @returns Unsubscribe function
     */
    onQueueEvent: (handler: QueueEventHandler): (() => void) => {
        eventHandlers.add(handler);

        return () => {
            eventHandlers.delete(handler);
        };
    },

    /**
     * Manually acknowledge an event.
     * Use this when handling events via onQueueEvent.
     * 
     * @param eventId - ID of the event to acknowledge
     * @param success - Whether processing was successful
     * @param errorMessage - Optional error message if failed
     */
    acknowledgeEvent: async (eventId: string, success: boolean = true, errorMessage?: string): Promise<AgentEventQueueResponse> => {
        const response = await agentEventQueue._acknowledgeEvent(eventId, success, errorMessage);

        // Remove from local cache
        localEventCache.delete(eventId);

        return response;
    },

    // ========================================================================
    // Utility Functions
    // ========================================================================

    /**
     * Get the number of events in the local cache
     * @returns Number of cached events
     */
    getLocalCacheSize: (): number => {
        return localEventCache.size;
    },

    /**
     * Get all events currently in the local cache without removing them
     * @returns Array of cached events
     */
    peekLocalCache: (): AgentEventMessage[] => {
        return Array.from(localEventCache.values());
    },

    /**
     * Clear the local event cache (does not affect backend)
     */
    clearLocalCache: (): void => {
        localEventCache.clear();
    }
};

export default agentEventQueue;
