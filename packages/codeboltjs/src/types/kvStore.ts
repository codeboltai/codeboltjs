/**
 * KV Store Types
 * Type definitions for Key-Value store operations
 */

// Response types
export interface KVStoreBaseResponse {
    type: string;
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
    timestamp: string;
    requestId: string;
}

export interface KVStoreInstance {
    id: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

export interface KVRecord {
    id: string;
    instanceId: string;
    namespace: string;
    key: string;
    value: any;
    createdAt: string;
    updatedAt: string;
}

// Query DSL types
export interface KVQueryDSL {
    from: {
        instance: string;
        namespace?: string;
    };
    where?: KVQueryCondition[];
    select?: string[];
    orderBy?: {
        field: string;
        direction: 'asc' | 'desc';
    };
    limit?: number;
    offset?: number;
}

export interface KVQueryCondition {
    field: string;
    operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'startsWith' | 'endsWith';
    value: any;
}

export interface KVQueryResult {
    records: KVRecord[];
    total: number;
    limit?: number;
    offset?: number;
}

// Operation parameter types
export interface CreateKVInstanceParams {
    name: string;
    description?: string;
}

export interface UpdateKVInstanceParams {
    name?: string;
    description?: string;
}

export interface KVSetParams {
    instanceId: string;
    namespace: string;
    key: string;
    value: any;
    autoCreateInstance?: boolean;
}

export interface KVGetParams {
    instanceId: string;
    namespace: string;
    key: string;
}

export interface KVDeleteParams {
    instanceId: string;
    namespace: string;
    key: string;
}

export interface KVDeleteNamespaceParams {
    instanceId: string;
    namespace: string;
}

// Response types for specific operations
export interface KVInstanceResponse extends KVStoreBaseResponse {
    data?: { instance: KVStoreInstance };
}

export interface KVInstanceListResponse extends KVStoreBaseResponse {
    data?: { instances: KVStoreInstance[] };
}

export interface KVGetResponse extends KVStoreBaseResponse {
    data?: { value: any; exists: boolean };
}

export interface KVSetResponse extends KVStoreBaseResponse {
    data?: { record: KVRecord };
}

export interface KVDeleteResponse extends KVStoreBaseResponse {
    data?: { deleted: boolean };
}

export interface KVDeleteNamespaceResponse extends KVStoreBaseResponse {
    data?: { deletedCount: number };
}

export interface KVQueryResponse extends KVStoreBaseResponse {
    data?: { result: KVQueryResult };
}

export interface KVNamespacesResponse extends KVStoreBaseResponse {
    data?: { namespaces: string[] };
}

export interface KVRecordCountResponse extends KVStoreBaseResponse {
    data?: { count: number };
}
