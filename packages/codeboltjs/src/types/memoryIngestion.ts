/**
 * Memory Ingestion Types
 * Type definitions for memory ingestion pipeline operations
 */

export interface MemoryIngestionBaseResponse {
    type: string;
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
    timestamp: string;
    requestId: string;
}

export type IngestionTrigger =
    | 'onConversationEnd'
    | 'onAgentComplete'
    | 'onFileChange'
    | 'onSchedule'
    | 'manual';

export type ProcessorType =
    | 'llm_extract'
    | 'llm_summarize'
    | 'filter'
    | 'transform'
    | 'aggregate'
    | 'split'
    | 'embed';

export type RoutingDestination =
    | 'vectordb'
    | 'kv'
    | 'eventlog'
    | 'kg';

export interface IngestionProcessor {
    type: ProcessorType;
    config: Record<string, any>;
    order?: number;
}

export interface IngestionRouting {
    destination: RoutingDestination;
    destination_id: string;
    field_mapping?: Record<string, string>;
}

export interface IngestionPipeline {
    id: string;
    label: string;
    description?: string;
    status: 'active' | 'disabled' | 'draft';
    trigger: IngestionTrigger;
    trigger_config?: Record<string, any>;
    processors: IngestionProcessor[];
    routing: IngestionRouting;
    createdAt: string;
    updatedAt: string;
}

export interface IngestionEventData {
    type: string;
    timestamp: string;
    source: {
        threadId?: string;
        agentId?: string;
        swarmId?: string;
        projectId?: string;
    };
    payload: Record<string, any>;
}

export interface IngestionExecutionResult {
    success: boolean;
    pipelineId: string;
    processedCount?: number;
    routedCount?: number;
    error?: string;
    executionTime?: number;
}

// Operation parameter types
export interface CreateIngestionPipelineParams {
    id?: string;
    label: string;
    description?: string;
    trigger: IngestionTrigger;
    trigger_config?: Record<string, any>;
    processors: IngestionProcessor[];
    routing: IngestionRouting;
}

export interface UpdateIngestionPipelineParams {
    label?: string;
    description?: string;
    status?: 'active' | 'disabled' | 'draft';
    trigger?: IngestionTrigger;
    trigger_config?: Record<string, any>;
    processors?: IngestionProcessor[];
    routing?: IngestionRouting;
}

export interface ListIngestionPipelineParams {
    trigger?: IngestionTrigger;
    activeOnly?: boolean;
}

export interface ExecuteIngestionParams {
    pipelineId: string;
    eventType?: string;
    trigger?: string;
    threadId?: string;
    agentId?: string;
    swarmId?: string;
    projectId?: string;
    payload?: Record<string, any>;
}

// Response types
export interface IngestionPipelineResponse extends MemoryIngestionBaseResponse {
    data?: { pipeline: IngestionPipeline };
}

export interface IngestionPipelineListResponse extends MemoryIngestionBaseResponse {
    data?: { pipelines: IngestionPipeline[] };
}

export interface IngestionExecuteResponse extends MemoryIngestionBaseResponse {
    data?: { result: IngestionExecutionResult };
}

export interface IngestionValidateResponse extends MemoryIngestionBaseResponse {
    data?: { validation: { valid: boolean; errors?: string[] } };
}

export interface IngestionProcessorSpecsResponse extends MemoryIngestionBaseResponse {
    data?: { specs: any[] };
}
