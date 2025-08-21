/**
 * MCP (Model Context Protocol) SDK Function Types
 * Types for the cbmcp module functions
 */

// Base response interface for MCP operations
export interface BaseMCPSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// User message type for MCP operations
export interface MCPUserMessage {
  type: string;
  userMessage: string;
  currentFile: string;
  mentionedFiles: string[];
  mentionedFullPaths: string[];
  mentionedMCPs: string[];
  mentionedFolders: string[];
  uploadedImages: string[];
  selectedAgent: {
    id: string;
    name: string;
  };
  messageId: string;
  threadId: string;
  selection?: {
    start: number;
    end: number;
    text: string;
  };
  remixPrompt?: string;
  mentionedAgents?: string[];
}

// MCP configuration type
export interface MCPConfiguration {
  serverName: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
  [key: string]: unknown;
}

// Tool parameter type
export interface ToolParameters {
  [key: string]: unknown;
}

// MCP toolbox responses
export interface GetEnabledToolBoxesResponse extends BaseMCPSDKResponse {
  data?: Array<{
    name: string;
    enabled: boolean;
    tools?: Array<{
      name: string;
      description?: string;
      parameters?: Record<string, unknown>;
    }>;
  }>;
}

export interface GetLocalToolBoxesResponse extends BaseMCPSDKResponse {
  data?: Array<{
    name: string;
    enabled: boolean;
    tools?: Array<{
      name: string;
      description?: string;
      parameters?: Record<string, unknown>;
    }>;
  }>;
}

export interface GetAvailableToolBoxesResponse extends BaseMCPSDKResponse {
  data?: Array<{
    name: string;
    enabled: boolean;
    tools?: Array<{
      name: string;
      description?: string;
      parameters?: Record<string, unknown>;
    }>;
  }>;
}

export interface SearchAvailableToolBoxesResponse extends BaseMCPSDKResponse {
  data?: Record<string, {
    name: string;
    description?: string;
    tools?: Array<{
      name: string;
      description?: string;
      parameters?: Record<string, unknown>;
    }>;
  }>;
}

export interface ListToolsFromToolBoxesResponse extends BaseMCPSDKResponse {
  data?: Array<{
    toolbox: string;
    tools: Array<{
      name: string;
      description?: string;
      parameters?: Record<string, unknown>;
    }>;
  }>;
  error?: string;
}

export interface ConfigureToolBoxResponse extends BaseMCPSDKResponse {
  configuration?: MCPConfiguration;
  data?: {
    success: boolean;
    message?: string;
  };
  error?: string;
}

// MCP tools responses
export interface GetToolsResponse extends BaseMCPSDKResponse {
  tools?: Array<{
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  }>;
  serverName?: string;
  data?: Array<{
    toolbox: string;
    toolName: string;
    description?: string;
    parameters?: Record<string, unknown>;
  }>;
}

export interface ExecuteToolResponse extends BaseMCPSDKResponse {
  toolName?: string;
  serverName?: string;
  params?: ToolParameters;
  data?: [boolean, unknown] | { error?: string };
  result?: unknown;
  status?: 'pending' | 'executing' | 'success' | 'error' | 'rejected';
}

export interface GetMcpToolsResponse extends BaseMCPSDKResponse {
  data?: Array<{
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  }>;
}

export interface GetMcpListResponse extends BaseMCPSDKResponse {
  data?: Array<{
    name: string;
    enabled: boolean;
    tools?: Array<{
      name: string;
      description?: string;
      parameters?: Record<string, unknown>;
    }>;
  }>;
}

export interface GetAllMCPToolsResponse extends BaseMCPSDKResponse {
  data?: Array<{
    toolbox: string;
    toolName: string;
    description?: string;
    parameters?: Record<string, unknown>;
  }>;
}

export interface GetEnabledMCPSResponse extends BaseMCPSDKResponse {
  data?: Array<{
    name: string;
    enabled: boolean;
    tools?: Array<{
      name: string;
      description?: string;
      parameters?: Record<string, unknown>;
    }>;
  }>;
}

export interface ConfigureMCPToolResponse extends BaseMCPSDKResponse {
  data?: {
    success: boolean;
    message?: string;
    configuration?: MCPConfiguration;
  };
  error?: string;
}
