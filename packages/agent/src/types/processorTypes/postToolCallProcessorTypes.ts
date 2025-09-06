/**
 * Post-Tool Call Processor Types
 * These are called after the Tool Call
 * Help in checking the tool call results and adding them to the LLM message
 * This LLM Message will be used as prompt for the next time
 */

import { 
    Message, 
    ProcessedMessage, 
    ToolCall,
    ToolResult,
    EnhancedToolResult,
    ResultProcessingRule,
    ToolExecutionMetrics
} from '../common';

export interface PostToolCallProcessor {
    modify(input: PostToolCallProcessorInput): Promise<PostToolCallProcessorOutput>;
    setContext(key: string, value: unknown): void;
    getContext(key: string): unknown;
    clearContext(): void;
}

export interface PostToolCallProcessorInput {
    userMessage: ProcessedMessage;
    llmMessageSent: ProcessedMessage;
    llmResponseMessage: ProcessedMessage;
    nextPrompt: ProcessedMessage;
    toolResults?: ToolResult[];
    context?: Record<string, unknown>;
}

export interface PostToolCallProcessorOutput {
    nextPrompt: ProcessedMessage;
    context?: Record<string, unknown>;
    enhancedResults?: EnhancedToolResult[];
}

export interface PostToolCallProcessorOptions {
    context?: Record<string, unknown>;
    enabled?: boolean;
    priority?: number;
    resultProcessingRules?: ResultProcessingRule[];
}

// Factory function type for post-tool call processors
export type PostToolCallProcessorFactory<T extends PostToolCallProcessor = PostToolCallProcessor> = (
    config?: PostToolCallProcessorOptions
) => T;