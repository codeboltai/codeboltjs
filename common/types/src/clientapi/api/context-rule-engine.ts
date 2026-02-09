// Context Rule Engine API types

export interface ContextRuleDefinition {
  id: string;
  name: string;
  description?: string;
  condition: string;
  action: string;
  priority?: number;
  enabled?: boolean;
  config?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateContextRuleRequest {
  name: string;
  description?: string;
  condition: string;
  action: string;
  priority?: number;
  enabled?: boolean;
  config?: Record<string, unknown>;
}

export interface UpdateContextRuleRequest {
  name?: string;
  description?: string;
  condition?: string;
  action?: string;
  priority?: number;
  enabled?: boolean;
  config?: Record<string, unknown>;
}

export interface EvaluateAllRulesRequest {
  data: Record<string, unknown>;
}

export interface EvaluateRuleRequest {
  data: Record<string, unknown>;
}

export interface EvaluateRuleResult {
  matched: boolean;
  result?: unknown;
}

export interface ContextRuleVariable {
  name: string;
  type: string;
  description?: string;
}
