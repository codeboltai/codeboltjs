/**
 * Pre-Tool Call Processor Types
 * These are called before the Tool Call
 * Used to check if the Tool Call is proper and handle Local Tool Interceptor
 * or any other custom exotic tool Processor
 */

import { 
    Message, 
    ProcessedMessage, 
    ToolCall, 
    InterceptedTool,
    ToolValidationRule,
    ToolValidationResult
} from '../common';

export interface PreToolCallProcessor {
    modify(input: PreToolCallProcessorInput): Promise<PreToolCallProcessorOutput>;
    interceptTool?(toolName: string, toolInput: unknown): Promise<boolean>;
    setContext(key: string, value: unknown): void;
    getContext(key: string): unknown;
    clearContext(): void;
}

export interface PreToolCallProcessorInput {
    llmMessageSent: ProcessedMessage;
    llmResponseMessage: ProcessedMessage;
    nextPrompt: ProcessedMessage;
    context?: Record<string, unknown>;
}

export interface PreToolCallProcessorOutput {
    nextPrompt: ProcessedMessage;
    context?: Record<string, unknown>;
    shouldExit?: boolean;
    interceptedTools?: InterceptedTool[];
}

export interface PreToolCallProcessorOptions {
    context?: Record<string, unknown>;
    enabled?: boolean;
    priority?: number;
    interceptableTools?: string[];
    localToolsEnabled?: boolean;
}

// Factory function type for pre-tool call processors
export type PreToolCallProcessorFactory<T extends PreToolCallProcessor = PreToolCallProcessor> = (
    config?: PreToolCallProcessorOptions
) => T;