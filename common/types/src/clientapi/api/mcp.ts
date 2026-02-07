// MCP API types

export interface McpServer {
  name: string;
  displayName?: string;
  description?: string;
  enabled: boolean;
  config?: Record<string, unknown>;
  tools?: McpTool[];
}

export interface McpTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export interface McpConfigureRequest {
  servers: Record<string, unknown>;
}

export interface McpConfigureServerRequest {
  enabled?: boolean;
  config?: Record<string, unknown>;
}

export interface McpToggleRequest {
  serverName: string;
  enabled: boolean;
}

export interface McpBrowserNavigateRequest {
  url: string;
}

export interface McpAvailableServer {
  id: string;
  name: string;
  description?: string;
  author?: string;
  version?: string;
}

export interface McpUpdateToolsRequest {
  serverName: string;
  tools: Record<string, unknown>[];
}

export interface McpInstallRequest {
  name: string;
  source?: string;
  config?: Record<string, unknown>;
}

export interface McpCreateRequest {
  name: string;
  config: Record<string, unknown>;
}

export interface McpConfigPath {
  path: string;
}
