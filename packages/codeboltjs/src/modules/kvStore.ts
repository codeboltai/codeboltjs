/**
 * KV Store Module
 * Provides Key-Value store operations for agent state persistence
 */

import cbws from '../core/websocket';
import { randomUUID } from 'crypto';
import type {
    KVStoreBaseResponse,
    KVInstanceResponse,
    KVInstanceListResponse,
    KVGetResponse,
    KVSetResponse,
    KVDeleteResponse,
    KVDeleteNamespaceResponse,
    KVQueryResponse,
    KVNamespacesResponse,
    KVRecordCountResponse,
    KVQueryDSL,
    CreateKVInstanceParams,
    UpdateKVInstanceParams
} from '@codebolt/types/lib';

const kvStore = {
    /**
     * Create a new KV store instance
     * @param name - Instance name
     * @param description - Optional description
     */
    createInstance: async (name: string, description?: string): Promise<KVInstanceResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kvStore.createInstance',
                requestId: randomUUID(),
                params: { name, description }
            },
            'kvStore.createInstance'
        );
    },

    /**
     * Get a KV store instance by ID
     * @param instanceId - Instance ID
     */
    getInstance: async (instanceId: string): Promise<KVInstanceResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kvStore.getInstance',
                requestId: randomUUID(),
                params: { instanceId }
            },
            'kvStore.getInstance'
        );
    },

    /**
     * List all KV store instances
     */
    listInstances: async (): Promise<KVInstanceListResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kvStore.listInstances',
                requestId: randomUUID(),
                params: {}
            },
            'kvStore.listInstances'
        );
    },

    /**
     * Update a KV store instance
     * @param instanceId - Instance ID
     * @param updates - Update parameters
     */
    updateInstance: async (instanceId: string, updates: UpdateKVInstanceParams): Promise<KVInstanceResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kvStore.updateInstance',
                requestId: randomUUID(),
                params: { instanceId, ...updates }
            },
            'kvStore.updateInstance'
        );
    },

    /**
     * Delete a KV store instance
     * @param instanceId - Instance ID
     */
    deleteInstance: async (instanceId: string): Promise<KVDeleteResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kvStore.deleteInstance',
                requestId: randomUUID(),
                params: { instanceId }
            },
            'kvStore.deleteInstance'
        );
    },

    /**
     * Get a value from the KV store
     * @param instanceId - Instance ID
     * @param namespace - Namespace
     * @param key - Key
     */
    get: async (instanceId: string, namespace: string, key: string): Promise<KVGetResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kvStore.get',
                requestId: randomUUID(),
                params: { instanceId, namespace, key }
            },
            'kvStore.get'
        );
    },

    /**
     * Set a value in the KV store
     * @param instanceId - Instance ID
     * @param namespace - Namespace
     * @param key - Key
     * @param value - Value to store
     * @param autoCreateInstance - Auto-create instance if it doesn't exist
     */
    set: async (
        instanceId: string,
        namespace: string,
        key: string,
        value: any,
        autoCreateInstance: boolean = false
    ): Promise<KVSetResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kvStore.set',
                requestId: randomUUID(),
                params: { instanceId, namespace, key, value, autoCreateInstance }
            },
            'kvStore.set'
        );
    },

    /**
     * Delete a value from the KV store
     * @param instanceId - Instance ID
     * @param namespace - Namespace
     * @param key - Key
     */
    delete: async (instanceId: string, namespace: string, key: string): Promise<KVDeleteResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kvStore.delete',
                requestId: randomUUID(),
                params: { instanceId, namespace, key }
            },
            'kvStore.delete'
        );
    },

    /**
     * Delete an entire namespace from the KV store
     * @param instanceId - Instance ID
     * @param namespace - Namespace to delete
     */
    deleteNamespace: async (instanceId: string, namespace: string): Promise<KVDeleteNamespaceResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kvStore.deleteNamespace',
                requestId: randomUUID(),
                params: { instanceId, namespace }
            },
            'kvStore.deleteNamespace'
        );
    },

    /**
     * Query the KV store using DSL
     * @param query - Query DSL object
     */
    query: async (query: KVQueryDSL): Promise<KVQueryResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kvStore.query',
                requestId: randomUUID(),
                params: { query }
            },
            'kvStore.query'
        );
    },

    /**
     * Get all namespaces in an instance
     * @param instanceId - Instance ID
     */
    getNamespaces: async (instanceId: string): Promise<KVNamespacesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kvStore.getNamespaces',
                requestId: randomUUID(),
                params: { instanceId }
            },
            'kvStore.getNamespaces'
        );
    },

    /**
     * Get record count for an instance or namespace
     * @param instanceId - Instance ID
     * @param namespace - Optional namespace filter
     */
    getRecordCount: async (instanceId: string, namespace?: string): Promise<KVRecordCountResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'kvStore.getRecordCount',
                requestId: randomUUID(),
                params: { instanceId, namespace }
            },
            'kvStore.getRecordCount'
        );
    }
};

export default kvStore;
