/**
 * Common Message Types
 * Shared across all processor types
 */

export interface Message {
    role: 'user' | 'assistant' | 'tool' | 'system';
    content: string | unknown[];
    name?: string;
    tool_calls?: ToolCall[];
    tool_call_id?: string;
    [key: string]: unknown;
}

export interface ProcessedMessage {
    messages: Message[];
    metadata?: Record<string, unknown>;
}

export interface ToolCall {
    id: string;
    function: {
        name: string;
        arguments: string | Record<string, unknown>;
    };
}