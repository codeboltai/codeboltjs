/**
 * Agent SDK Function Types
 * Types for the cbagent module functions
 */

import { AgentInfo, AgentDetail, TaskResult } from './baseappResponse';

// Base response interface for agent operations
export interface BaseAgentSDKResponse {
  success?: boolean;
  message?: string;
  error?: string;
}

// Agent operation responses
export interface FindAgentByTaskResponse extends BaseAgentSDKResponse {
  agents?: AgentInfo[];
}

export interface ListAgentsResponse extends BaseAgentSDKResponse {
  agents?: AgentInfo[];
}

export interface AgentsDetailResponse extends BaseAgentSDKResponse {
  payload?: {
    agents: AgentDetail[];
  };
}

export interface TaskCompletionResponse extends BaseAgentSDKResponse {
  from?: string;
  agentId?: string;
  task?: string;
  result?: TaskResult;
}

/**
 * MCP tool processing result
 */
export interface MCPToolResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// Agent configuration types
export interface AgentProcessingConfig {
  /** Whether to process mentioned MCPs and make them available as tools */
  processMentionedMCPs?: boolean;
  /** Whether to use remix prompt to enhance system instructions */
  processRemixPrompt?: boolean;
  /** Whether to process mentioned files and include their content */
  processMentionedFiles?: boolean;
  /** Whether to process mentioned agents and make them available as sub-agents */
  processMentionedAgents?: boolean;
  /** Custom file content processor */
  fileContentProcessor?: (filePath: string) => Promise<string>;
  /** Custom MCP tool processor */
  mcpToolProcessor?: (toolbox: string, toolName: string) => Promise<MCPToolResult | null>;
}
