import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import { backgroundAgentMap, backgroundAgentGroups } from './codeboltEvent';

// Import options types from agent-to-app-ws-schema
import type {
    CreateThreadOptions,
    UpdateThreadOptions,
    GetThreadListOptions,
    GetThreadDetailOptions,
    GetThreadMessagesOptions,
    CreateAndStartThreadOptions,
} from '@codebolt/types/agent-to-app-ws-schema';

// Import response types from app-to-agent-ws-schema
import type {
    CreateThreadResponse,
    ListThreadsResponse,
    GetThreadResponse,
    GetThreadMessagesResponse,
    UpdateThreadResponse,
    DeleteThreadResponse,
    StartThreadResponse,
    UpdateThreadStatusResponse,
    ThreadAgentStartedResponse,
    ThreadAgentStartFailedResponse,
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
    createThread: async (options: any): Promise<CreateThreadResponse> => {
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
     * Creates and immediately starts a new thread.
     * @param {CreateAndStartThreadOptions} options - The thread creation and start parameters
     * @returns {Promise<StartThreadResponse>} A promise that resolves with the thread start response
     */
    createAndStartThread: async (options: CreateAndStartThreadOptions): Promise<StartThreadResponse> => {
        const requestId = randomUUID();
        const event = {
            type: 'threadEvent',
            action: 'createAndStartThread',
            requestId,
            message: options
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'startThreadResponse'
        );
    },

    /**
     * Creates a thread in the background and resolves when the agent starts or fails.
     * @param {CreateAndStartThreadOptions} options - The thread creation and start parameters
     * @returns {Promise<ThreadAgentStartedResponse | ThreadAgentStartFailedResponse>} A promise that resolves with ThreadAgentStarted or ThreadAgentStartFailed response
     */
    createThreadInBackground: async (options: CreateAndStartThreadOptions): Promise<ThreadAgentStartedResponse | ThreadAgentStartFailedResponse> => {
        const requestId = randomUUID();
        const event = {
            type: 'threadEvent',
            action: 'createAndStartThread',
            requestId,
            message: options
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'ThreadAgentStarted|ThreadAgentStartFailed'
        );
    },


    /**
     * Retrieves a list of threads with optional filtering.
     * @param {GetThreadListOptions} options - Optional filters for threads
     * @returns {Promise<ListThreadsResponse>} A promise that resolves with the thread list response
     */
    getThreadList: async (options: GetThreadListOptions = {}): Promise<ListThreadsResponse> => {
        const requestId = randomUUID();

        const event = {
            type: 'threadEvent',
            action: 'getThreadList',
            requestId,
            message: options
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'listThreadsResponse'
        );
    },

    /**
     * Retrieves detailed information about a specific thread.
     * @param {GetThreadDetailOptions} options - The thread detail options
     * @returns {Promise<GetThreadResponse>} A promise that resolves with the thread detail response
     */
    getThreadDetail: async (options: GetThreadDetailOptions): Promise<GetThreadResponse> => {
        const requestId = randomUUID();

        const event = {
            type: 'threadEvent',
            action: 'getThreadDetail',
            requestId,
            message: options
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getThreadResponse'
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
     * @returns {Promise<UpdateThreadStatusResponse>} A promise that resolves with the thread status update response
     */
    updateThreadStatus: async (threadId: string, status: string): Promise<UpdateThreadStatusResponse> => {
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
    },

    /**
     * Retrieves file changes associated with a specific thread.
     * @param {string} threadId - The thread ID
     * @returns {Promise<any>} A promise that resolves with the file changes
     */
    getThreadFileChanges: async (threadId: string): Promise<any> => {
        const requestId = randomUUID();

        const event = {
            type: 'threadEvent',
            action: 'getThreadFileChanges',
            requestId,
            message: {
                threadId
            }
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getThreadFileChangesResponse'
        );
    },

    /**
     * Retrieves file changes summary for ChangesSummaryPanel.
     * Returns data in the format: { title, changes, files }
     * @param {string} threadId - The thread ID
     * @returns {Promise<any>} A promise that resolves with the file changes summary
     */
    getThreadFileChangesSummary: async (threadId: string): Promise<any> => {
        const requestId = randomUUID();

        const event = {
            type: 'threadEvent',
            action: 'getThreadFileChangesSummary',
            requestId,
            message: {
                threadId
            }
        };

        return cbws.messageManager.sendAndWaitForResponse(
            event,
            'getThreadFileChangesSummaryResponse'
        );
    }
};

export default threadService;
