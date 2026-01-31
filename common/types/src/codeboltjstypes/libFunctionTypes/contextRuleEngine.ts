/**
 * Context Rule Engine Types
 * Type definitions for context rule engine operations
 */

export interface ContextRuleEngineBaseResponse {
    type: string;
    success: boolean;
    data?: any;
    message?: string;
    error?: string;
    timestamp: string;
    requestId: string;
}

export type RuleOperator =
    | 'eq' | 'neq'
    | 'gt' | 'gte' | 'lt' | 'lte'
    | 'contains' | 'not_contains'
    | 'starts_with' | 'ends_with'
    | 'in' | 'not_in'
    | 'exists' | 'not_exists'
    | 'matches';

export type RuleAction =
    | 'include'
    | 'exclude'
    | 'force_include'
    | 'set_priority';

export interface RuleCondition {
    variable: string;
    operator: RuleOperator;
    value: any;
}

export interface Rule {
    id?: string;
    name: string;
    description?: string;
    conditions: RuleCondition[];
    condition_logic?: 'and' | 'or';
    action: RuleAction;
    action_config?: {
        memory_ids?: string[];
        priority?: number;
    };
    enabled?: boolean;
    order?: number;
}

export interface ContextRuleEngine {
    id: string;
    name: string;
    description?: string;
    rules: Rule[];
    enabled: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface PossibleVariable {
    name: string;
    type: 'string' | 'number' | 'boolean' | 'array' | 'object';
    source: 'scope' | 'memory' | 'system';
    description?: string;
    examples?: any[];
}

// Operation parameter types
export interface CreateContextRuleEngineParams {
    id?: string;
    name: string;
    description?: string;
    rules: Rule[];
    enabled?: boolean;
}

export interface UpdateContextRuleEngineParams {
    name?: string;
    description?: string;
    rules?: Rule[];
    enabled?: boolean;
}

export interface EvaluateRulesParams {
    scope_variables: Record<string, any>;
    additional_variables?: Record<string, any>;
    input?: string;
    rule_engine_ids?: string[];
}

// Response types
export interface ContextRuleEngineResponse extends ContextRuleEngineBaseResponse {
    data?: { ruleEngine: ContextRuleEngine };
}

export interface ContextRuleEngineListResponse extends ContextRuleEngineBaseResponse {
    data?: { ruleEngines: ContextRuleEngine[] };
}

export interface ContextRuleEngineDeleteResponse extends ContextRuleEngineBaseResponse {
    data?: { deleted: boolean };
}

export interface EvaluateRulesResponse extends ContextRuleEngineBaseResponse {
    data?: {
        matched_rules: string[];
        excluded_memories: string[];
        included_memories: string[];
        forced_memories: string[];
    };
}

export interface PossibleVariablesResponse extends ContextRuleEngineBaseResponse {
    data?: { variables: PossibleVariable[] };
}
