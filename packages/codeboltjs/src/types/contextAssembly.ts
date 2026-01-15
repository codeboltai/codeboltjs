/**
 * Context Assembly Types
 * Type definitions for context assembly engine operations
 */

export interface ContextAssemblyBaseResponse {
    type: string;
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
    timestamp: string;
    requestId: string;
}

export interface ContextAssemblyRequest {
    scope_variables: Record<string, any>;
    additional_variables?: Record<string, any>;
    input?: string;
    explicit_memory?: string[];
    constraints?: ContextConstraints;
    rule_engine_ids?: string[];
}

export interface ContextConstraints {
    max_tokens?: number;
    max_sources?: number;
    timeout_ms?: number;
}

export interface MemoryContribution {
    memory_id: string;
    memory_label: string;
    content: string;
    format: 'text' | 'json' | 'markdown';
    tokens?: number;
    source?: string;
}

export interface AssembledContext {
    contributions: MemoryContribution[];
    total_tokens: number;
    assembly_time_ms: number;
    applied_rules?: string[];
    warnings?: string[];
}

export interface MemoryTypeSpec {
    id: string;
    label: string;
    description?: string;
    inputs_scope: string[];
    additional_variables?: Record<string, { type: string; required?: boolean; default?: any }>;
    contribution: {
        format: string;
        max_tokens?: number;
    };
}

export interface ValidationResult {
    valid: boolean;
    errors?: string[];
    warnings?: string[];
    resolved_memories?: string[];
}

export interface RuleEvaluationResult {
    matched_rules: string[];
    excluded_memories: string[];
    included_memories: string[];
    forced_memories: string[];
}

export interface RequiredVariablesResult {
    scope_variables: string[];
    additional_variables: Record<string, { type: string; required: boolean; from_memory: string }>;
}

// Response types
export interface ContextAssemblyResponse extends ContextAssemblyBaseResponse {
    data?: { context: AssembledContext };
}

export interface ContextValidateResponse extends ContextAssemblyBaseResponse {
    data?: { validation: ValidationResult };
}

export interface MemoryTypesResponse extends ContextAssemblyBaseResponse {
    data?: { memoryTypes: MemoryTypeSpec[] };
}

export interface RuleEvaluationResponse extends ContextAssemblyBaseResponse {
    data?: RuleEvaluationResult;
}

export interface RequiredVariablesResponse extends ContextAssemblyBaseResponse {
    data?: RequiredVariablesResult;
}
