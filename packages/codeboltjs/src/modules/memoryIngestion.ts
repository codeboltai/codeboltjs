/**
 * Memory Ingestion Module
 * Provides memory ingestion pipeline management
 */

import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    IngestionPipelineResponse,
    IngestionPipelineListResponse,
    IngestionExecuteResponse,
    IngestionValidateResponse,
    IngestionProcessorSpecsResponse,
    CreateIngestionPipelineParams,
    UpdateIngestionPipelineParams,
    ListIngestionPipelineParams,
    ExecuteIngestionParams
} from '@codebolt/types/lib';

const memoryIngestion = {
    /**
     * Create a new ingestion pipeline
     * @param config - Pipeline configuration
     */
    create: async (config: CreateIngestionPipelineParams): Promise<IngestionPipelineResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'memoryIngestion.create',
                requestId: randomUUID(),
                params: config
            },
            'memoryIngestion.create'
        );
    },

    /**
     * Get an ingestion pipeline by ID
     * @param pipelineId - Pipeline ID
     */
    get: async (pipelineId: string): Promise<IngestionPipelineResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'memoryIngestion.get',
                requestId: randomUUID(),
                params: { pipelineId }
            },
            'memoryIngestion.get'
        );
    },

    /**
     * List ingestion pipelines
     * @param filters - Optional filters
     */
    list: async (filters?: ListIngestionPipelineParams): Promise<IngestionPipelineListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'memoryIngestion.list',
                requestId: randomUUID(),
                params: filters || {}
            },
            'memoryIngestion.list'
        );
    },

    /**
     * Update an ingestion pipeline
     * @param pipelineId - Pipeline ID
     * @param updates - Update parameters
     */
    update: async (pipelineId: string, updates: UpdateIngestionPipelineParams): Promise<IngestionPipelineResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'memoryIngestion.update',
                requestId: randomUUID(),
                params: { pipelineId, ...updates }
            },
            'memoryIngestion.update'
        );
    },

    /**
     * Delete an ingestion pipeline
     * @param pipelineId - Pipeline ID
     */
    delete: async (pipelineId: string): Promise<IngestionPipelineResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'memoryIngestion.delete',
                requestId: randomUUID(),
                params: { pipelineId }
            },
            'memoryIngestion.delete'
        );
    },

    /**
     * Execute an ingestion pipeline
     * @param params - Execution parameters
     */
    execute: async (params: ExecuteIngestionParams): Promise<IngestionExecuteResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'memoryIngestion.execute',
                requestId: randomUUID(),
                params
            },
            'memoryIngestion.execute'
        );
    },

    /**
     * Validate a pipeline configuration
     * @param pipeline - Pipeline configuration to validate
     */
    validate: async (pipeline: CreateIngestionPipelineParams): Promise<IngestionValidateResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'memoryIngestion.validate',
                requestId: randomUUID(),
                params: { pipeline }
            },
            'memoryIngestion.validate'
        );
    },

    /**
     * Get available processor specifications
     */
    getProcessorSpecs: async (): Promise<IngestionProcessorSpecsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'memoryIngestion.getProcessorSpecs',
                requestId: randomUUID(),
                params: {}
            },
            'memoryIngestion.getProcessorSpecs'
        );
    },

    /**
     * Activate an ingestion pipeline
     * @param pipelineId - Pipeline ID
     */
    activate: async (pipelineId: string): Promise<IngestionPipelineResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'memoryIngestion.activate',
                requestId: randomUUID(),
                params: { pipelineId }
            },
            'memoryIngestion.activate'
        );
    },

    /**
     * Disable an ingestion pipeline
     * @param pipelineId - Pipeline ID
     */
    disable: async (pipelineId: string): Promise<IngestionPipelineResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'memoryIngestion.disable',
                requestId: randomUUID(),
                params: { pipelineId }
            },
            'memoryIngestion.disable'
        );
    },

    /**
     * Duplicate an ingestion pipeline
     * @param pipelineId - Pipeline ID to duplicate
     * @param newId - Optional new ID
     * @param newLabel - Optional new label
     */
    duplicate: async (pipelineId: string, newId?: string, newLabel?: string): Promise<IngestionPipelineResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'memoryIngestion.duplicate',
                requestId: randomUUID(),
                params: { pipelineId, newId, newLabel }
            },
            'memoryIngestion.duplicate'
        );
    }
};

export default memoryIngestion;
