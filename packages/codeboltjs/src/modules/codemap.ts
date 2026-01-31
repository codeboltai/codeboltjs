import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    Codemap,
    CodemapStatus,
    CreateCodemapData,
    UpdateCodemapData,
    CodemapListResponse,
    CodemapGetResponse,
    CodemapCreateResponse,
    CodemapSaveResponse,
    CodemapUpdateResponse,
    CodemapDeleteResponse
} from '@codebolt/types/lib';

/**
 * Codemap Module for codeboltjs
 * Provides functionality for managing codemaps (visual representations of code structure).
 * Mirrors the codemapService.cli.ts operations via WebSocket.
 */
const codeboltCodemap = {
    /**
     * List all codemaps for a project
     */
    list: async (projectPath?: string): Promise<CodemapListResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'codemapEvent',
                action: 'codemap.list',
                requestId,
                message: { projectPath }
            },
            'codemapListResponse'
        );
    },

    /**
     * Get a specific codemap by ID
     */
    get: async (codemapId: string, projectPath?: string): Promise<CodemapGetResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'codemapEvent',
                action: 'codemap.get',
                requestId,
                message: { codemapId, projectPath }
            },
            'codemapGetResponse'
        );
    },

    /**
     * Create a placeholder codemap (status: 'creating')
     * Call this before generating the actual codemap content
     */
    create: async (data: CreateCodemapData, projectPath?: string): Promise<CodemapCreateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'codemapEvent',
                action: 'codemap.create',
                requestId,
                message: { ...data, projectPath }
            },
            'codemapCreateResponse'
        );
    },

    /**
     * Save a complete codemap with content
     */
    save: async (codemapId: string, codemap: Codemap, projectPath?: string): Promise<CodemapSaveResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'codemapEvent',
                action: 'codemap.save',
                requestId,
                message: { codemapId, codemap, projectPath }
            },
            'codemapSaveResponse'
        );
    },

    /**
     * Set the status of a codemap
     */
    setStatus: async (codemapId: string, status: CodemapStatus, error?: string, projectPath?: string): Promise<CodemapUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'codemapEvent',
                action: 'codemap.setStatus',
                requestId,
                message: { codemapId, status, error, projectPath }
            },
            'codemapSetStatusResponse'
        );
    },

    /**
     * Update codemap info (title, description, etc.)
     */
    update: async (codemapId: string, data: UpdateCodemapData, projectPath?: string): Promise<CodemapUpdateResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'codemapEvent',
                action: 'codemap.update',
                requestId,
                message: { codemapId, ...data, projectPath }
            },
            'codemapUpdateResponse'
        );
    },

    /**
     * Delete a codemap
     */
    delete: async (codemapId: string, projectPath?: string): Promise<CodemapDeleteResponse> => {
        const requestId = randomUUID();
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'codemapEvent',
                action: 'codemap.delete',
                requestId,
                message: { codemapId, projectPath }
            },
            'codemapDeleteResponse'
        );
    }
};

export default codeboltCodemap;
