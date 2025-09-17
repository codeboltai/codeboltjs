/**
 * Common Tool Types
 * Shared across processor types
 */

export interface ToolResult {
   /** Always 'tool' for tool execution results */
   role: 'tool';
   /** ID that links this result to the original tool call */
   tool_call_id: string;
   /** The content returned by the tool */
   content: any;
   /** Optional user message to be added after tool execution */
   userMessage?: any;
 
}

export interface EnhancedToolResult extends ToolResult {
    processedResult?: unknown;
    summary?: string;
    relevanceScore?: number;
    actionItems?: string[];
}

export interface InterceptedTool {
    toolName: string;
    originalInput: unknown;
    modifiedInput?: unknown;
    result?: unknown;
    intercepted: boolean;
    reason?: string;
}

export interface ResultProcessingRule {
    toolName: string;
    processor: (result: ToolResult) => EnhancedToolResult;
    condition?: (result: ToolResult) => boolean;
}

export interface ToolExecutionMetrics {
    toolName: string;
    executionCount: number;
    averageExecutionTime: number;
    successRate: number;
    lastExecution: string;
    errorPatterns: Record<string, number>;
}
