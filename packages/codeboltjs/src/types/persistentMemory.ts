/**
 * Persistent Memory Types
 * Type definitions for persistent memory operations
 */

export interface PersistentMemoryBaseResponse {
    type: string;
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
    timestamp: string;
    requestId: string;
}

export interface PersistentMemory {
    id: string;
    label: string;
    description?: string;
    status: 'active' | 'disabled' | 'draft';
    inputs_scope: string[];
    additional_variables?: Record<string, any>;
    retrieval: RetrievalConfig;
    contribution: ContributionConfig;
    createdAt: string;
    updatedAt: string;
}

export interface RetrievalConfig {
    source_type: 'vectordb' | 'kv' | 'eventlog' | 'kg';
    source_id: string;
    query_template?: string;
    limit?: number;
    filters?: Record<string, any>;
}

export interface ContributionConfig {
    format: 'text' | 'json' | 'markdown';
    template?: string;
    max_tokens?: number;
}

export interface PipelineExecutionIntent {
    keywords?: string[];
    action?: string;
    context?: Record<string, any>;
    query?: string;
}

export interface PipelineExecutionResult {
    success: boolean;
    data?: any;
    error?: string;
    executionTime?: number;
}

// Operation parameter types
export interface CreatePersistentMemoryParams {
    id?: string;
    label: string;
    description?: string;
    inputs_scope?: string[];
    additional_variables?: Record<string, any>;
    retrieval: RetrievalConfig;
    contribution: ContributionConfig;
}

export interface UpdatePersistentMemoryParams {
    label?: string;
    description?: string;
    status?: 'active' | 'disabled' | 'draft';
    inputs_scope?: string[];
    additional_variables?: Record<string, any>;
    retrieval?: RetrievalConfig;
    contribution?: ContributionConfig;
}

export interface ListPersistentMemoryParams {
    inputScope?: string;
    activeOnly?: boolean;
}

// Response types
export interface PersistentMemoryResponse extends PersistentMemoryBaseResponse {
    data?: { memory: PersistentMemory };
}

export interface PersistentMemoryListResponse extends PersistentMemoryBaseResponse {
    data?: { memories: PersistentMemory[] };
}

export interface PersistentMemoryExecuteResponse extends PersistentMemoryBaseResponse {
    data?: { result: PipelineExecutionResult };
}

export interface PersistentMemoryValidateResponse extends PersistentMemoryBaseResponse {
    data?: { validation: { valid: boolean; errors?: string[] } };
}

export interface PersistentMemoryStepSpecsResponse extends PersistentMemoryBaseResponse {
    data?: { specs: any[] };
}
