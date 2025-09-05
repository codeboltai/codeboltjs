/**
 * Processor types and interfaces for the Unified Agent Framework
 * Self-contained within the unified directory
 */

// Core message and tool call interfaces
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

// Message modifier interfaces
export interface MessageModifierInput {
    originalRequest: unknown;
    createdMessage: ProcessedMessage;
    context?: Record<string, unknown>;
}

export interface MessageModifier {
    modify(input: MessageModifierInput): Promise<ProcessedMessage>;
    setContext(key: string, value: unknown): void;
    getContext(key: string): unknown;
    clearContext(): void;
}

export interface MessageModifierOptions {
    context?: Record<string, unknown>;
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

// Base message modifier class
export abstract class BaseMessageModifier implements MessageModifier {
    protected context: Record<string, unknown> = {};

    constructor(options: MessageModifierOptions = {}) {
        this.context = options.context || {};
    }

    abstract modify(input: MessageModifierInput): Promise<ProcessedMessage>;

    setContext(key: string, value: unknown): void {
        this.context[key] = value;
    }

    getContext(key: string): unknown {
        return this.context[key];
    }

    clearContext(): void {
        this.context = {};
    }
}

// Request message class for chaining modifiers
export class RequestMessage {
    private messageModifiers: MessageModifier[] = [];

    constructor(options: { messageModifiers?: MessageModifier[] } = {}) {
        this.messageModifiers = options.messageModifiers || [];
    }

    addModifier(modifier: MessageModifier): void {
        this.messageModifiers.push(modifier);
    }

    async modify(message: unknown): Promise<ProcessedMessage> {
        let currentMessage: ProcessedMessage = {
            messages: [
                {
                    role: 'user',
                    content: typeof message === 'string' ? message : JSON.stringify(message)
                }
            ]
        };

        // Apply all modifiers in sequence
        for (const modifier of this.messageModifiers) {
            currentMessage = await modifier.modify({
                originalRequest: message,
                createdMessage: currentMessage
            });
        }

        return currentMessage;
    }

    removeModifier(modifier: MessageModifier): boolean {
        const index = this.messageModifiers.indexOf(modifier);
        if (index > -1) {
            this.messageModifiers.splice(index, 1);
            return true;
        }
        return false;
    }

    getModifiers(): MessageModifier[] {
        return [...this.messageModifiers];
    }

    clearModifiers(): void {
        this.messageModifiers = [];
    }
}

// Additional processor-specific types
export interface ConversationProcessor extends Processor {
    processConversation?(messages: Message[]): Promise<Message[]>;
}

export interface PreToolCallProcessor extends Processor {
    interceptTool?(toolName: string, toolInput: unknown): Promise<boolean>;
}

export interface FollowUpProcessor extends Processor {
    enhanceFollowUp?(conversation: Message[]): Promise<Message[]>;
}

// Event types for processors
export type ProcessorEventType = 
    | 'ProcessorStarted'
    | 'ProcessorCompleted'
    | 'ProcessorError'
    | 'MessageModified'
    | 'ToolIntercepted'
    | 'ConversationEnhanced'
    | 'FollowUpGenerated'
    | 'ValidationPassed'
    | 'ValidationFailed'
    | 'TransformationApplied'
    | 'LocalToolExecuted'
    | 'ConversationCompacted'
    | 'ContinuityMaintained';

export interface ProcessorEvent {
    type: ProcessorEventType;
    processorName: string;
    timestamp: string;
    data?: Record<string, unknown>;
    error?: string;
}

// Processor configuration interfaces
export interface ProcessorConfig {
    enabled?: boolean;
    priority?: number;
    timeout?: number;
    retries?: number;
    metadata?: Record<string, unknown>;
}

export interface ProcessorChainConfig {
    processors: Array<{
        processor: Processor;
        config?: ProcessorConfig;
    }>;
    stopOnError?: boolean;
    enableLogging?: boolean;
    maxExecutionTime?: number;
}

// Factory function types
export type ProcessorFactory<T extends Processor = Processor> = (
    config?: Record<string, unknown>
) => T;

export type MessageModifierFactory<T extends MessageModifier = MessageModifier> = (
    config?: MessageModifierOptions
) => T;

// Utility types for processor chains
export interface ProcessorChainResult {
    success: boolean;
    results: ProcessorOutput[];
    errors: Array<{
        processor: string;
        error: string;
    }>;
    executionTime: number;
    metadata: Record<string, unknown>;
}

export interface ProcessorMetrics {
    processorName: string;
    executionCount: number;
    totalExecutionTime: number;
    averageExecutionTime: number;
    errorCount: number;
    successRate: number;
    lastExecution: string;
}

// Validation and transformation types
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    metadata?: Record<string, unknown>;
}

export interface TransformationResult<T = unknown> {
    success: boolean;
    data: T;
    transformations: string[];
    metadata?: Record<string, unknown>;
}

// Context management types
export interface ProcessorContext {
    sessionId?: string;
    userId?: string;
    conversationId?: string;
    toolExecutionId?: string;
    metadata: Record<string, unknown>;
    startTime: string;
    parentContext?: ProcessorContext;
}

export interface ContextManager {
    createContext(data?: Record<string, unknown>): ProcessorContext;
    getContext(id: string): ProcessorContext | undefined;
    updateContext(id: string, updates: Partial<ProcessorContext>): boolean;
    deleteContext(id: string): boolean;
    clearContexts(): void;
}

// Error types for processors
export class ProcessorError extends Error {
    constructor(
        message: string,
        public readonly processorName: string,
        public readonly context?: Record<string, unknown>
    ) {
        super(message);
        this.name = 'ProcessorError';
    }
}

export class ProcessorTimeoutError extends ProcessorError {
    constructor(processorName: string, timeout: number) {
        super(`Processor '${processorName}' timed out after ${timeout}ms`, processorName);
        this.name = 'ProcessorTimeoutError';
    }
}

export class ProcessorValidationError extends ProcessorError {
    constructor(
        processorName: string,
        validationErrors: string[],
        context?: Record<string, unknown>
    ) {
        super(
            `Processor '${processorName}' validation failed: ${validationErrors.join(', ')}`,
            processorName,
            context
        );
        this.name = 'ProcessorValidationError';
    }
}
