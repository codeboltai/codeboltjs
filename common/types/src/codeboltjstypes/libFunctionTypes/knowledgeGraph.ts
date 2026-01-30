/**
 * Knowledge Graph Types
 * Type definitions for knowledge graph operations
 */

export interface KGBaseResponse {
    type: string;
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
    timestamp: string;
    requestId: string;
}

// Instance Template Types
export interface KGRecordKind {
    name: string;
    label: string;
    description?: string;
    attributes: Record<string, KGAttributeSchema>;
}

export interface KGAttributeSchema {
    type: 'string' | 'number' | 'boolean' | 'date' | 'json';
    required?: boolean;
    default?: any;
}

export interface KGEdgeType {
    name: string;
    label: string;
    description?: string;
    from_kinds: string[];
    to_kinds: string[];
    attributes?: Record<string, KGAttributeSchema>;
}

export interface KGInstanceTemplate {
    id: string;
    name: string;
    description?: string;
    record_kinds: KGRecordKind[];
    edge_types: KGEdgeType[];
    createdAt: string;
    updatedAt: string;
}

// Instance Types
export interface KGInstance {
    id: string;
    templateId: string;
    name: string;
    description?: string;
    createdAt: string;
    updatedAt: string;
}

// Memory Record Types
export interface KGMemoryRecord {
    id: string;
    instanceId: string;
    kind: string;
    attributes: Record<string, any>;
    valid_from?: string;
    valid_to?: string;
    createdAt: string;
    updatedAt: string;
}

// Edge Types
export interface KGEdge {
    id: string;
    instanceId: string;
    kind: string;
    from_node_id: string;
    to_node_id: string;
    attributes?: Record<string, any>;
    createdAt: string;
}

// View Template Types
export interface KGViewTemplate {
    id: string;
    name: string;
    description?: string;
    applicable_template_ids: string[];
    match?: Record<string, any>;
    patterns?: any[];
    where?: any[];
    with?: any[];
    orderBy?: any[];
    skip?: number;
    limit?: number;
    return?: string[];
    createdAt: string;
    updatedAt: string;
}

// View Types
export interface KGView {
    id: string;
    name: string;
    instanceId: string;
    templateId: string;
    createdAt: string;
}

// Operation parameter types
export interface CreateKGInstanceTemplateParams {
    name: string;
    description?: string;
    record_kinds: KGRecordKind[];
    edge_types: KGEdgeType[];
}

export interface CreateKGInstanceParams {
    templateId: string;
    name: string;
    description?: string;
}

export interface CreateKGMemoryRecordParams {
    kind: string;
    attributes: Record<string, any>;
    valid_from?: string;
    valid_to?: string;
}

export interface CreateKGEdgeParams {
    kind: string;
    from_node_id: string;
    to_node_id: string;
    attributes?: Record<string, any>;
}

export interface CreateKGViewTemplateParams {
    name: string;
    description?: string;
    applicable_template_ids: string[];
    match?: Record<string, any>;
    patterns?: any[];
    where?: any[];
    with?: any[];
    orderBy?: any[];
    skip?: number;
    limit?: number;
    return?: string[];
}

export interface CreateKGViewParams {
    name: string;
    instanceId: string;
    templateId: string;
}

export interface ListKGMemoryRecordsParams {
    kind?: string;
    limit?: number;
    offset?: number;
}

export interface ListKGEdgesParams {
    kind?: string;
    from_node_id?: string;
    to_node_id?: string;
}

// Response types
export interface KGInstanceTemplateResponse extends KGBaseResponse {
    data?: KGInstanceTemplate;
}

export interface KGInstanceTemplateListResponse extends KGBaseResponse {
    data?: KGInstanceTemplate[];
}

export interface KGInstanceResponse extends KGBaseResponse {
    data?: KGInstance;
}

export interface KGInstanceListResponse extends KGBaseResponse {
    data?: KGInstance[];
}

export interface KGMemoryRecordResponse extends KGBaseResponse {
    data?: KGMemoryRecord;
}

export interface KGMemoryRecordListResponse extends KGBaseResponse {
    data?: KGMemoryRecord[];
}

export interface KGEdgeResponse extends KGBaseResponse {
    data?: KGEdge;
}

export interface KGEdgeListResponse extends KGBaseResponse {
    data?: KGEdge[];
}

export interface KGViewTemplateResponse extends KGBaseResponse {
    data?: KGViewTemplate;
}

export interface KGViewTemplateListResponse extends KGBaseResponse {
    data?: KGViewTemplate[];
}

export interface KGViewResponse extends KGBaseResponse {
    data?: KGView;
}

export interface KGViewListResponse extends KGBaseResponse {
    data?: KGView[];
}

export interface KGViewExecuteResponse extends KGBaseResponse {
    data?: any;
}

export interface KGDeleteResponse extends KGBaseResponse {
    data?: { deleted: boolean };
}
