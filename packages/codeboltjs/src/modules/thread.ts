import cbws from '../core/websocket';
import { randomUUID } from 'crypto';

// Import options types from agent-to-app-ws-schema
import type {
    CreateThreadOptions,
    UpdateThreadOptions,
    GetThreadListOptions,
    GetThreadDetailOptions,
    GetThreadMessagesOptions,
} from '@codebolt/types/agent-to-app-ws-schema';

// Import response types from app-to-agent-ws-schema
import type {
    CreateThreadResponse,
    GetThreadListResponse,
    GetThreadDetailResponse,
    GetThreadMessagesResponse,
    UpdateThreadResponse,
    DeleteThreadResponse,
    StartThreadResponse,
} from '@codebolt/types/app-to-agent-ws-schema';

/**
 * Thread service for managing conversation threads.
 * This module provides a comprehensive API for thread management using thread-specific types.
 */
const threadService = {

    /**
     * Creates a new thread with comprehensive options.
     * @param {CreateThreadOptions} options - The thread creation parameters
     * @returns {Promise<CreateThreadResponse>} A promise that resolves with the thread creation response
     */
    createThread: async (options: CreateThreadOptions): Promise<CreateThreadResponse> => {
        const requestId = randomUUID();

        const event = {
            type: 'threadEvent',
            action: 'createThread',
            requestId,
            message: options
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'createThreadResponse'
        );
    },

    /**
     * Retrieves a list of threads with optional filtering.
     * @param {GetThreadListOptions} options - Optional filters for threads
     * @returns {Promise<GetThreadListResponse>} A promise that resolves with the thread list response
     */
    getThreadList: async (options: GetThreadListOptions = {}): Promise<GetThreadListResponse> => {
        const requestId = randomUUID();

        const event = {
            type: 'threadEvent',
            action: 'getThreadList',
            requestId,
            message: options
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getThreadListResponse'
        );
    },

    /**
     * Retrieves detailed information about a specific thread.
     * @param {GetThreadDetailOptions} options - The thread detail options
     * @returns {Promise<GetThreadDetailResponse>} A promise that resolves with the thread detail response
     */
    getThreadDetail: async (options: GetThreadDetailOptions): Promise<GetThreadDetailResponse> => {
        const requestId = randomUUID();

        const event = {
            type: 'threadEvent',
            action: 'getThreadDetail',
            requestId,
            message: options
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getThreadDetailResponse'
        );
    },

    /**
     * Starts a thread.
     * @param {string} threadId - The thread ID to start
     * @returns {Promise<StartThreadResponse>} A promise that resolves with the thread start response
     */
    startThread: async (threadId: string): Promise<StartThreadResponse> => {
        const requestId = randomUUID();

        const event = {
            type: 'threadEvent',
            action: 'startThread',
            requestId,
            message: {
                threadId
            }
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'startThreadResponse'
        );
    },

    /**
     * Updates an existing thread.
     * @param {string} threadId - The thread ID to update
     * @param {UpdateThreadOptions} updates - The thread update parameters
     * @returns {Promise<UpdateThreadResponse>} A promise that resolves with the thread update response
     */
    updateThread: async (threadId: string, updates: UpdateThreadOptions): Promise<UpdateThreadResponse> => {
        const requestId = randomUUID();

        const event = {
            type: 'threadEvent',
            action: 'updateThread',
            requestId,
            message: {
                threadId,
                ...updates
            }
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'updateThreadResponse'
        );
    },

    /**
     * Deletes a thread.
     * @param {string} threadId - The thread ID to delete
     * @returns {Promise<DeleteThreadResponse>} A promise that resolves with the thread deletion response
     */
    deleteThread: async (threadId: string): Promise<DeleteThreadResponse> => {
        const requestId = randomUUID();

        const event = {
            type: 'threadEvent',
            action: 'deleteThread',
            requestId,
            message: {
                threadId
            }
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'deleteThreadResponse'
        );
    },

    /**
     * Updates the status of a thread.
     * @param {string} threadId - The thread ID
     * @param {string} status - The new status
     * @returns {Promise<UpdateThreadResponse>} A promise that resolves with the thread status update response
     */
    updateThreadStatus: async (threadId: string, status: string): Promise<UpdateThreadResponse> => {
        const requestId = randomUUID();

        const event = {
            type: 'threadEvent',
            action: 'updateThreadStatus',
            requestId,
            message: {
                threadId,
                status
            }
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'updateThreadStatusResponse'
        );
    },

    /**
     * Retrieves messages for a specific thread.
     * @param {GetThreadMessagesOptions} options - The thread messages options
     * @returns {Promise<GetThreadMessagesResponse>} A promise that resolves with the thread messages response
     */
    getThreadMessages: async (options: GetThreadMessagesOptions): Promise<GetThreadMessagesResponse> => {
        const requestId = randomUUID();

        const event = {
            type: 'threadEvent',
            action: 'getThreadMessages',
            requestId,
            message: options
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getThreadMessagesResponse'
        );
    }

};

export default threadService;
