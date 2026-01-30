/**
 * Event Log Module
 * Provides event logging operations for agent activities
 */

import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    EventLogInstanceResponse,
    EventLogInstanceListResponse,
    EventLogAppendResponse,
    EventLogAppendMultipleResponse,
    EventLogQueryResponse,
    EventLogStatsResponse,
    EventLogDSL,
    CreateEventLogInstanceParams,
    UpdateEventLogInstanceParams,
    AppendEventParams,
    AppendEventsParams
} from '@codebolt/types/lib';

const eventLog = {
    /**
     * Create a new event log instance
     * @param name - Instance name
     * @param description - Optional description
     */
    createInstance: async (name: string, description?: string): Promise<EventLogInstanceResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'eventLog.createInstance',
                requestId: randomUUID(),
                params: { name, description }
            },
            'eventLog.createInstance'
        );
    },

    /**
     * Get an event log instance by ID
     * @param instanceId - Instance ID
     */
    getInstance: async (instanceId: string): Promise<EventLogInstanceResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'eventLog.getInstance',
                requestId: randomUUID(),
                params: { instanceId }
            },
            'eventLog.getInstance'
        );
    },

    /**
     * List all event log instances
     */
    listInstances: async (): Promise<EventLogInstanceListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'eventLog.listInstances',
                requestId: randomUUID(),
                params: {}
            },
            'eventLog.listInstances'
        );
    },

    /**
     * Update an event log instance
     * @param instanceId - Instance ID
     * @param updates - Update parameters
     */
    updateInstance: async (instanceId: string, updates: UpdateEventLogInstanceParams): Promise<EventLogInstanceResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'eventLog.updateInstance',
                requestId: randomUUID(),
                params: { instanceId, ...updates }
            },
            'eventLog.updateInstance'
        );
    },

    /**
     * Delete an event log instance
     * @param instanceId - Instance ID
     */
    deleteInstance: async (instanceId: string): Promise<EventLogInstanceResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'eventLog.deleteInstance',
                requestId: randomUUID(),
                params: { instanceId }
            },
            'eventLog.deleteInstance'
        );
    },

    /**
     * Append a single event to the log
     * @param params - Event parameters
     */
    appendEvent: async (params: AppendEventParams): Promise<EventLogAppendResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'eventLog.appendEvent',
                requestId: randomUUID(),
                params
            },
            'eventLog.appendEvent'
        );
    },

    /**
     * Append multiple events to the log
     * @param params - Events parameters
     */
    appendEvents: async (params: AppendEventsParams): Promise<EventLogAppendMultipleResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'eventLog.appendEvents',
                requestId: randomUUID(),
                params
            },
            'eventLog.appendEvents'
        );
    },

    /**
     * Query events using DSL
     * @param query - Query DSL object
     */
    queryEvents: async (query: EventLogDSL): Promise<EventLogQueryResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'eventLog.queryEvents',
                requestId: randomUUID(),
                params: { query }
            },
            'eventLog.queryEvents'
        );
    },

    /**
     * Get instance statistics
     * @param instanceId - Instance ID
     */
    getInstanceStats: async (instanceId: string): Promise<EventLogStatsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'eventLog.getInstanceStats',
                requestId: randomUUID(),
                params: { instanceId }
            },
            'eventLog.getInstanceStats'
        );
    }
};

export default eventLog;
