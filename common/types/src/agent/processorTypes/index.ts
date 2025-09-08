/**
 * Processor Types Index
 * Exports all processor type definitions and interfaces
 * Note: Base class implementations are in processor-pieces/base/
 */

// Message Modifier Types
export * from './messageModifierTypes';

// Pre-Inference Processor Types
export * from './preInferenceProcessorTypes';

// Post-Inference Processor Types
export * from './postInferenceTypes';

// Pre-Tool Call Processor Types
export * from './preToolCallProcessorTypes';

// Post-Tool Call Processor Types
export * from './postToolCallProcessorTypes';

// Re-export common types for convenience
export interface Tool {
    type: 'function';
    function: {
        name: string;
        description?: string;
        parameters?: unknown;
    };
}

export interface ProcessorConfig {
    enabled?: boolean;
    priority?: number;
    timeout?: number;
    retries?: number;
    metadata?: Record<string, unknown>;
}

export interface ProcessorChainConfig {
    processors: Array<{
        processor: any; // Will be one of the processor types
        config?: ProcessorConfig;
    }>;
    stopOnError?: boolean;
    enableLogging?: boolean;
    maxExecutionTime?: number;
}

export interface ProcessorChainResult {
    success: boolean;
    results: any[];
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
