/**
 * Common Tool Types
 * Shared across processor types
 */

export interface ToolResult {
    toolCallId: string;
    toolName: string;
    result: unknown;
    success: boolean;
    error?: string;
    executionTime?: number;
    metadata?: Record<string, unknown>;
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
