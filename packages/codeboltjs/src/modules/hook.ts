/**
 * Hook Module
 * Provides hook management for triggering actions
 */

import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    HookResponse,
    HookListResponse,
    HookInitializeResponse,
    HookDeleteResponse,
    HookConfig
} from '../types/hook';

const hook = {
    /**
     * Initialize the hook manager for a project
     * @param projectPath - Path to the project
     */
    initialize: async (projectPath: string): Promise<HookInitializeResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'hookEvent',
                action: 'initialize',
                requestId: randomUUID(),
                params: { projectPath }
            },
            'hookInitializeResponse'
        );
    },

    /**
     * Create a new hook
     * @param config - Hook configuration
     */
    create: async (config: HookConfig): Promise<HookResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'hookEvent',
                action: 'create',
                requestId: randomUUID(),
                params: { config }
            },
            'hookCreateResponse'
        );
    },

    /**
     * Update an existing hook
     * @param hookId - Hook ID
     * @param config - Updated hook configuration
     */
    update: async (hookId: string, config: Partial<HookConfig>): Promise<HookResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'hookEvent',
                action: 'update',
                requestId: randomUUID(),
                params: { hookId, config }
            },
            'hookUpdateResponse'
        );
    },

    /**
     * Delete a hook
     * @param hookId - Hook ID
     */
    delete: async (hookId: string): Promise<HookDeleteResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'hookEvent',
                action: 'delete',
                requestId: randomUUID(),
                params: { hookId }
            },
            'hookDeleteResponse'
        );
    },

    /**
     * List all hooks
     */
    list: async (): Promise<HookListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'hookEvent',
                action: 'list',
                requestId: randomUUID(),
                params: {}
            },
            'hookListResponse'
        );
    },

    /**
     * Get a hook by ID
     * @param hookId - Hook ID
     */
    get: async (hookId: string): Promise<HookResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'hookEvent',
                action: 'get',
                requestId: randomUUID(),
                params: { hookId }
            },
            'hookGetResponse'
        );
    },

    /**
     * Enable a hook
     * @param hookId - Hook ID
     */
    enable: async (hookId: string): Promise<HookResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'hookEvent',
                action: 'enable',
                requestId: randomUUID(),
                params: { hookId }
            },
            'hookEnableResponse'
        );
    },

    /**
     * Disable a hook
     * @param hookId - Hook ID
     */
    disable: async (hookId: string): Promise<HookResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'hookEvent',
                action: 'disable',
                requestId: randomUUID(),
                params: { hookId }
            },
            'hookDisableResponse'
        );
    }
};

export default hook;
