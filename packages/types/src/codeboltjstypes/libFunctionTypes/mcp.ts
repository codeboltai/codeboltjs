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

// MCP toolbox responses
export interface GetEnabledToolBoxesResponse extends BaseMCPSDKResponse {
  data?: any[];
}

export interface GetLocalToolBoxesResponse extends BaseMCPSDKResponse {
  data?: any[];
}

export interface GetAvailableToolBoxesResponse extends BaseMCPSDKResponse {
  data?: any[];
}

export interface SearchAvailableToolBoxesResponse extends BaseMCPSDKResponse {
  data?: Record<string, any>;
}

export interface ListToolsFromToolBoxesResponse extends BaseMCPSDKResponse {
  data?: any[];
  error?: string;
}

export interface ConfigureToolBoxResponse extends BaseMCPSDKResponse {
  configuration?: Record<string, any>;
  data?: any;
  error?: string;
}

// MCP tools responses
export interface GetToolsResponse extends BaseMCPSDKResponse {
  tools?: Array<{
    name: string;
    description: string;
    parameters: Record<string, any>;
  }>;
  serverName?: string;
  data?: any[];
}

export interface ExecuteToolResponse extends BaseMCPSDKResponse {
  toolName?: string;
  serverName?: string;
  params?: any;
  data?: [boolean, any] | { error?: string };
  result?: any;
  status?: 'pending' | 'executing' | 'success' | 'error' | 'rejected';
}

export interface GetMcpToolsResponse extends BaseMCPSDKResponse {
  data?: any[];
}

export interface GetMcpListResponse extends BaseMCPSDKResponse {
  data?: any[];
}

export interface GetAllMCPToolsResponse extends BaseMCPSDKResponse {
  data?: any[];
}

export interface GetEnabledMCPSResponse extends BaseMCPSDKResponse {
  data?: any;
}

export interface ConfigureMCPToolResponse extends BaseMCPSDKResponse {
  data?: any;
  error?: string;
}
