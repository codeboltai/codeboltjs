import type { 
    ProcessedMessage, 
    Message, 
    Tool, 
    Processor 
} from './processorTypes';
import type { 
    OpenAIMessage, 
    OpenAITool, 
    ToolResult, 
    CodeboltAPI 
} from './libTypes';

// ================================
// Core Unified Framework Types
// ================================

/**
 * Configuration for the unified agent
 */
export interface UnifiedAgentConfig {
    /** Maximum iterations for agent loops */
    maxIterations?: number;
    /** Maximum conversation length before summarization */
    maxConversationLength?: number;
    /** LLM configuration */
    llmConfig?: LLMConfig;
    /** Codebolt API instance */
    codebolt?: CodeboltAPI;
    /** Enable logging */
    enableLogging?: boolean;
    /** Retry configuration */
    retryConfig?: {
        maxRetries?: number;
        retryDelay?: number;
    };
}

/**
 * LLM configuration for the unified agent
 */
export interface LLMConfig {
    llmname?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
    baseUrl?: string;
}

// /**
//  * Input for unified message processing
//  */
// export interface UnifiedMessageInput {
//     /** Original user message or request */
//     originalMessage: any;
//     /** Processing context */
//     context?: Record<string, any>;
//     /** Available tools */
//     tools?: OpenAITool[];
//     /** Previous conversation history */
//     conversationHistory?: OpenAIMessage[];
// }

/**
 * Output from unified message processing
 */
export interface UnifiedMessageOutput {
    /** Processed messages ready for LLM */
    messages: OpenAIMessage[];
    /** Available tools */
    tools: OpenAITool[];
    /** Updated context */
    context: Record<string, any>;
    /** Tool choice strategy */
    toolChoice: 'auto' | 'none' | 'required';
}

/**
 * Input for unified agent step processing
 */
export interface UnifiedStepInput {
    /** Processed messages */
    messages: OpenAIMessage[];
    /** Available tools */
    tools: OpenAITool[];
    /** Processing context */
    context?: Record<string, any>;
    /** Tool choice strategy */
    toolChoice?: 'auto' | 'none' | 'required';
}

/**
 * Output from unified agent step processing
 */
export interface UnifiedStepOutput {
    /** LLM response */
    llmResponse: any;
    /** Whether processing is complete */
    finished: boolean;
    /** Tool calls detected */
    toolCalls?: Array<{ tool: string; parameters: any }>;
    /** Updated context */
    context: Record<string, any>;
}

/**
 * Input for unified response execution
 */
export interface UnifiedResponseInput {
    /** LLM response to process */
    llmResponse: any;
    /** Previous conversation messages */
    conversationHistory: OpenAIMessage[];
    /** Available tools */
    tools: OpenAITool[];
    /** Processing context */
    context?: Record<string, any>;
}

/**
 * Output from unified response execution
 */
export interface UnifiedResponseOutput {
    /** Tool execution results */
    toolResults: ToolResult[];
    /** Next user message (if any) */
    nextUserMessage: OpenAIMessage | null;
    /** Updated conversation history */
    conversationHistory: OpenAIMessage[];
    /** Whether task is completed */
    completed: boolean;
    /** Final response message */
    finalMessage?: string;
}

/**
 * Complete agent execution input
 */
export interface UnifiedAgentInput {
    /** User message or request */
    userMessage: any;
    /** Available tools */
    tools?: OpenAITool[];
    /** Processing context */
    context?: Record<string, any>;
    /** Previous conversation history */
    conversationHistory?: OpenAIMessage[];
    /** Maximum iterations for this execution */
    maxIterations?: number;
}

/**
 * Complete agent execution output
 */
export interface UnifiedAgentOutput {
    /** Final response message */
    response: string;
    /** Tool execution results */
    toolResults: ToolResult[];
    /** Updated conversation history */
    conversationHistory: OpenAIMessage[];
    /** Final context state */
    context: Record<string, any>;
    /** Whether task was completed successfully */
    completed: boolean;
    /** Number of iterations used */
    iterations: number;
}

// ================================
// Component Interfaces
// ================================

/**
 * Unified message modifier interface
 */
export interface UnifiedMessageModifier {
    /** Process and modify input messages */
    processMessage(input: UnifiedMessageInput): Promise<UnifiedMessageOutput>;
    /** Add a processor to the modifier */
    addProcessor(processor: Processor): void;
    /** Set context value */
    setContext(key: string, value: any): void;
    /** Get context value */
    getContext(key: string): any;
    /** Clear all context */
    clearContext(): void;
}

/**
 * Unified agent step interface
 */
export interface UnifiedAgentStep {
    /** Execute a single agent step */
    executeStep(input: UnifiedStepInput): Promise<UnifiedStepOutput>;
    /** Generate LLM response */
    generateResponse(messages: OpenAIMessage[], tools: OpenAITool[], context?: Record<string, any>): Promise<any>;
}

/**
 * Unified response executor interface
 */
export interface UnifiedResponseExecutor {
    /** Execute response processing including tool execution */
    executeResponse(input: UnifiedResponseInput): Promise<UnifiedResponseOutput>;
    /** Execute tools from LLM response */
    executeTools(llmResponse: any, tools: OpenAITool[], context?: Record<string, any>): Promise<ToolResult[]>;
    /** Build follow-up conversation */
    buildFollowUpConversation(
        conversationHistory: OpenAIMessage[], 
        toolResults: ToolResult[], 
        llmResponse: any
    ): Promise<OpenAIMessage[]>;
    /** Check if conversation needs summarization */
    shouldSummarizeConversation(conversationHistory: OpenAIMessage[]): boolean;
    /** Summarize conversation */
    summarizeConversation(conversationHistory: OpenAIMessage[]): Promise<OpenAIMessage[]>;
    /** Add a follow-up conversation processor */
    addFollowUpConversationProcessor(processor: Processor): void;
    /** Remove a follow-up conversation processor */
    removeFollowUpConversationProcessor(processor: Processor): boolean;
    /** Get all follow-up conversation processors */
    getFollowUpConversationProcessors(): Processor[];
    /** Clear all follow-up conversation processors */
    clearFollowUpConversationProcessors(): void;
    /** Add a pre-tool call processor */
    addPreToolCallProcessor(processor: Processor): void;
    /** Remove a pre-tool call processor */
    removePreToolCallProcessor(processor: Processor): boolean;
    /** Get all pre-tool call processors */
    getPreToolCallProcessors(): Processor[];
    /** Clear all pre-tool call processors */
    clearPreToolCallProcessors(): void;
}

/**
 * Main unified agent interface
 */
export interface UnifiedAgent {
    /** Execute agent with input */
    execute(input: UnifiedAgentInput): Promise<UnifiedAgentOutput>;
    /** Execute single step */
    step(input: UnifiedAgentInput): Promise<UnifiedAgentOutput>;
    /** Execute with loop until completion */
    loop(input: UnifiedAgentInput): Promise<UnifiedAgentOutput>;
    /** Add message modifier */
    addMessageModifier(modifier: UnifiedMessageModifier): void;
    /** Set agent step processor */
    setAgentStep(agentStep: UnifiedAgentStep): void;
    /** Set response executor */
    setResponseExecutor(executor: UnifiedResponseExecutor): void;
}

// ================================
// Event Types
// ================================

export type UnifiedAgentEventType = 
    | 'message_processed'
    | 'step_started'
    | 'step_completed'
    | 'tool_call_detected'
    | 'tool_execution_started'
    | 'tool_execution_completed'
    | 'response_generated'
    | 'conversation_summarized'
    | 'agent_completed'
    | 'agent_error'
    | 'iteration_started'
    | 'iteration_completed';

export interface UnifiedAgentEvent {
    type: UnifiedAgentEventType;
    data?: any;
    timestamp: string;
    context?: Record<string, any>;
}

/**
 * Event handler for unified agent events
 */
export type UnifiedAgentEventHandler = (event: UnifiedAgentEvent) => void | Promise<void>;

// ================================
// Error Types
// ================================

export class UnifiedAgentError extends Error {
    constructor(
        message: string,
        public readonly code: string,
        public readonly context?: Record<string, any>
    ) {
        super(message);
        this.name = 'UnifiedAgentError';
    }
}

export class UnifiedMessageProcessingError extends UnifiedAgentError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, 'MESSAGE_PROCESSING_ERROR', context);
        this.name = 'UnifiedMessageProcessingError';
    }
}

export class UnifiedStepExecutionError extends UnifiedAgentError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, 'STEP_EXECUTION_ERROR', context);
        this.name = 'UnifiedStepExecutionError';
    }
}

export class UnifiedResponseExecutionError extends UnifiedAgentError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, 'RESPONSE_EXECUTION_ERROR', context);
        this.name = 'UnifiedResponseExecutionError';
    }
}

export class UnifiedToolExecutionError extends UnifiedAgentError {
    constructor(message: string, context?: Record<string, any>) {
        super(message, 'TOOL_EXECUTION_ERROR', context);
        this.name = 'UnifiedToolExecutionError';
    }
}
