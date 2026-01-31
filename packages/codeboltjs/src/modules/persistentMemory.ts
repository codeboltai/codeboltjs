/**
 * Persistent Memory Module
 * Provides persistent memory retrieval management for agents
 */

import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    PersistentMemoryResponse,
    PersistentMemoryListResponse,
    PersistentMemoryExecuteResponse,
    PersistentMemoryValidateResponse,
    PersistentMemoryStepSpecsResponse,
    CreatePersistentMemoryParams,
    UpdatePersistentMemoryParams,
    ListPersistentMemoryParams,
    PipelineExecutionIntent
} from '@codebolt/types/lib';

const persistentMemory = {
    /**
     * Create a new persistent memory configuration
     * @param config - Memory configuration
     */
    create: async (config: CreatePersistentMemoryParams): Promise<PersistentMemoryResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'persistentMemory.create',
                requestId: randomUUID(),
                params: config
            },
            'persistentMemory.create'
        );
    },

    /**
     * Get a persistent memory by ID
     * @param memoryId - Memory ID
     */
    get: async (memoryId: string): Promise<PersistentMemoryResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'persistentMemory.get',
                requestId: randomUUID(),
                params: { memoryId }
            },
            'persistentMemory.get'
        );
    },

    /**
     * List persistent memories
     * @param filters - Optional filters
     */
    list: async (filters?: ListPersistentMemoryParams): Promise<PersistentMemoryListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'persistentMemory.list',
                requestId: randomUUID(),
                params: filters || {}
            },
            'persistentMemory.list'
        );
    },

    /**
     * Update a persistent memory
     * @param memoryId - Memory ID
     * @param updates - Update parameters
     */
    update: async (memoryId: string, updates: UpdatePersistentMemoryParams): Promise<PersistentMemoryResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'persistentMemory.update',
                requestId: randomUUID(),
                params: { memoryId, ...updates }
            },
            'persistentMemory.update'
        );
    },

    /**
     * Delete a persistent memory
     * @param memoryId - Memory ID
     */
    delete: async (memoryId: string): Promise<PersistentMemoryResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'persistentMemory.delete',
                requestId: randomUUID(),
                params: { memoryId }
            },
            'persistentMemory.delete'
        );
    },

    /**
     * Execute memory retrieval pipeline
     * @param memoryId - Memory ID
     * @param intent - Execution intent with context
     */
    executeRetrieval: async (memoryId: string, intent: PipelineExecutionIntent): Promise<PersistentMemoryExecuteResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'persistentMemory.executeRetrieval',
                requestId: randomUUID(),
                params: { memoryId, ...intent }
            },
            'persistentMemory.executeRetrieval'
        );
    },

    /**
     * Validate a memory configuration
     * @param memory - Memory configuration to validate
     */
    validate: async (memory: CreatePersistentMemoryParams): Promise<PersistentMemoryValidateResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'persistentMemory.validate',
                requestId: randomUUID(),
                params: { memory }
            },
            'persistentMemory.validate'
        );
    },

    /**
     * Get available step specifications
     */
    getStepSpecs: async (): Promise<PersistentMemoryStepSpecsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'persistentMemory.getStepSpecs',
                requestId: randomUUID(),
                params: {}
            },
            'persistentMemory.getStepSpecs'
        );
    }
};

export default persistentMemory;
