import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    CreateFileUpdateIntentRequest,
    UpdateFileUpdateIntentRequest,
    FileUpdateIntentFilters,
    FileUpdateIntent,
    IntentOverlapResult,
    FileWithIntent
} from '@codebolt/types/lib';

/**
 * File Update Intent service client for codeboltjs.
 */
const fileUpdateIntentService = {

    /**
     * Create a new file update intent
     */
    create: async (data: CreateFileUpdateIntentRequest, claimedBy: string, claimedByName?: string): Promise<{ intent?: FileUpdateIntent, overlap?: IntentOverlapResult }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'fileUpdateIntent.create',
                action: 'create',
                requestId,
                message: { ...data, claimedBy, claimedByName }
            },
            'fileUpdateIntent.create'
        );
    },

    /**
     * Update an existing intent
     */
    update: async (id: string, data: UpdateFileUpdateIntentRequest): Promise<FileUpdateIntent> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'fileUpdateIntent.update',
                action: 'update',
                requestId,
                message: { id, ...data }
            },
            'fileUpdateIntent.update'
        );
    },

    /**
     * Get a single intent
     */
    get: async (id: string): Promise<FileUpdateIntent> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'fileUpdateIntent.get',
                action: 'get',
                requestId,
                message: { id }
            },
            'fileUpdateIntent.get'
        );
    },

    /**
     * List intents
     */
    list: async (filters: FileUpdateIntentFilters = {}): Promise<FileUpdateIntent[]> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'fileUpdateIntent.list',
                action: 'list',
                requestId,
                message: filters
            },
            'fileUpdateIntent.list'
        );
    },

    /**
     * Complete an intent
     */
    complete: async (id: string, closedBy: string): Promise<FileUpdateIntent> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'fileUpdateIntent.complete',
                action: 'complete',
                requestId,
                message: { id, closedBy }
            },
            'fileUpdateIntent.complete'
        );
    },

    /**
     * Cancel an intent
     */
    cancel: async (id: string, cancelledBy: string): Promise<FileUpdateIntent> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'fileUpdateIntent.cancel',
                action: 'cancel',
                requestId,
                message: { id, cancelledBy }
            },
            'fileUpdateIntent.cancel'
        );
    },

    /**
     * Check for overlap without creating
     */
    checkOverlap: async (environmentId: string, filePaths: string[], priority: number = 5): Promise<IntentOverlapResult> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'fileUpdateIntent.checkOverlap',
                action: 'checkOverlap',
                requestId,
                message: { environmentId, filePaths, priority }
            },
            'fileUpdateIntent.checkOverlap'
        );
    },

    /**
     * Get blocked files (level 4 locks)
     */
    getBlockedFiles: async (environmentId: string): Promise<{ blockedFiles: string[] }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'fileUpdateIntent.getBlockedFiles',
                action: 'getBlockedFiles',
                requestId,
                message: { environmentId }
            },
            'fileUpdateIntent.getBlockedFiles'
        );
    },

    /**
     * Get intents by agent
     */
    getByAgent: async (agentId: string): Promise<FileUpdateIntent[]> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'fileUpdateIntent.getByAgent',
                action: 'getByAgent',
                requestId,
                message: { agentId }
            },
            'fileUpdateIntent.getByAgent'
        );
    },

    /**
     * Get all files with intents
     */
    getFilesWithIntents: async (environmentId: string): Promise<FileWithIntent[]> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'fileUpdateIntent.getFilesWithIntents',
                action: 'getFilesWithIntents',
                requestId,
                message: { environmentId }
            },
            'fileUpdateIntent.getFilesWithIntents'
        );
    },

    /**
     * Delete an intent
     */
    delete: async (id: string): Promise<{ success: boolean }> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'fileUpdateIntent.delete',
                action: 'delete',
                requestId,
                message: { id }
            },
            'fileUpdateIntent.delete'
        );
    }
};

export default fileUpdateIntentService;
