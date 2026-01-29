/**
 * Processor types and interfaces for the Unified Agent Framework
 * @deprecated Use types from @codebolt/types/agent instead
 *
 * This file is kept for backward compatibility.
 * New code should import from @codebolt/types/agent:
 * - MessageModifier, MessageModifierOptions
 * - PreInferenceProcessor, PostInferenceProcessor
 * - PreToolCallProcessor, PostToolCallProcessor
 * - ProcessedMessage, ToolCall, ToolResult
 */

// Import and re-export common types from @codebolt/types/agent
import type { ToolResult } from '@codebolt/types/agent';
export type { ToolResult };

// Keep legacy ToolCall export with extended compatibility
export interface ToolCall {
    id: string;
    function: {
        name: string;
        arguments: string | Record<string, unknown>;
    };
}

export interface Tool {
    type: 'function';
    function: {
        name: string;
        description?: string;
        parameters?: unknown;
    };
}

export interface Message {
    role: 'user' | 'assistant' | 'tool' | 'system';
    content: string | unknown[];
    name?: string;
    tool_calls?: ToolCall[];
    tool_call_id?: string;
    [key: string]: unknown;
}

// Local ProcessedMessage differs from common type - kept for backward compatibility
export interface ProcessedMessage {
    messages: Message[];
    metadata?: Record<string, unknown>;
}

// Processor interfaces
export interface ProcessorInput {
    message: ProcessedMessage;
    context?: Record<string, unknown>;
}

export interface ProcessorOutput {
    type: string;
    value?: unknown;
}

export interface Processor {
    processInput(input: ProcessorInput): Promise<ProcessorOutput[]>;
    setContext(key: string, value: unknown): void;
    getContext(key: string): unknown;
    clearContext(): void;
}

// Base processor class
export abstract class BaseProcessor implements Processor {
    protected context: Record<string, unknown> = {};

    constructor(options?: Record<string, unknown>) {
        if (options) {
            this.context = { ...options };
        }
    }

    abstract processInput(input: ProcessorInput): Promise<ProcessorOutput[]>;

    setContext(key: string, value: unknown): void {
        this.context[key] = value;
    }

    getContext(key: string): unknown {
        return this.context[key];
    }

    clearContext(): void {
        this.context = {};
    }

    // Helper method to create events
    protected createEvent(type: string, value?: unknown): ProcessorOutput {
        return { type, value };
    }

    // Helper method to create multiple events
    protected createEvents(...events: Array<{ type: string; value?: unknown }>): ProcessorOutput[] {
        return events.map(event => this.createEvent(event.type, event.value));
    }
}