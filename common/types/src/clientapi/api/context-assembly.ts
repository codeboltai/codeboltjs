// Context Assembly API types

export interface ContextAssembleRequest {
  sources: ContextSource[];
  rules?: ContextRule[];
  variables?: Record<string, unknown>;
}

export interface ContextSource {
  type: string;
  id?: string;
  config?: Record<string, unknown>;
}

export interface ContextRule {
  condition: string;
  action: string;
  config?: Record<string, unknown>;
}

export interface ContextAssembleResult {
  context: string;
  sources: string[];
  metadata?: Record<string, unknown>;
}

export interface ValidateContextAssemblyRequest {
  sources: ContextSource[];
  rules?: ContextRule[];
}

export interface EvaluateContextRulesRequest {
  rules: ContextRule[];
  data: Record<string, unknown>;
}

export interface GetRequiredVariablesRequest {
  sources: ContextSource[];
  rules?: ContextRule[];
}

export interface ContextMemoryType {
  name: string;
  description?: string;
}
