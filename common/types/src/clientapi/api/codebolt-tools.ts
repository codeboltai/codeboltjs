// Codebolt Tools API types

export interface CodeboltTool {
  name: string;
  description?: string;
  category?: string;
  inputSchema?: Record<string, unknown>;
}

export interface CodeboltToolSchema {
  name: string;
  schema: Record<string, unknown>;
}

export interface ExecuteToolRequest {
  toolName: string;
  input: Record<string, unknown>;
}

export interface ValidateToolRequest {
  toolName: string;
  input: Record<string, unknown>;
}

export interface CodeboltToolsConfig {
  enabledTools?: string[];
  [key: string]: unknown;
}

export interface UpdateCodeboltToolsConfigRequest {
  enabledTools?: string[];
  [key: string]: unknown;
}

export interface OpenAiTool {
  type: 'function';
  function: OpenAiFunction;
}

export interface OpenAiFunction {
  name: string;
  description?: string;
  parameters?: Record<string, unknown>;
}
