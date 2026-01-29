import type { FlatUserMessage } from '@codebolt/types';


export interface ToolCall {
    /** Unique identifier for this tool call */
    id: string;
    /** The type of tool call */
    type: 'function';
    /** Function call details */
    function: {
        /** Name of the function to call */
        name: string;
        /** Arguments for the function call as JSON string */
        arguments: string;
    };
}

export interface Message {
    /** Role of the message sender */
    role: 'system' | 'user' | 'assistant' | 'tool';
    /** Content of the message */
    content: string | Array<{ type: string; text: string }>;
    /** Optional name for the message sender */
    name?: string;
    /** Tool call ID for tool messages */
    tool_call_id?: string;
    /** Tool calls for assistant messages */
    tool_calls?: Array<{
        id: string;
        type: 'function';
        function: {
            name: string;
            arguments: string;
        };
    }>;
}

export interface ProcessedMessage {
    /** Array of messages in OpenAI format */
    messages: Message[];
    /** Optional metadata about the processing */
    metadata?: Record<string, unknown>;
}

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

export interface MessageModifierInput {
    originalRequest: FlatUserMessage;
    createdMessage: ProcessedMessage;
    context?: Record<string, unknown>;
}

export interface MessageModifier {
    modify(input: MessageModifierInput): Promise<ProcessedMessage>;
    setContext(key: string, value: unknown): void;
    getContext(key: string): unknown;
    clearContext(): void;
}

export interface Tool {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
    execute(params: unknown, abortSignal?: AbortSignal): Promise<unknown>;
}

export interface ToolList {
    getTool(name: string): Tool | undefined;
    getAllTools(): Tool[];
    addTool(tool: Tool): void;
    removeTool(name: string): void;
}

export interface AgentStepInput {
    message: ProcessedMessage;
    tools: Tool[];
    context?: Record<string, unknown>;
}

export interface AgentStepOutput {
    response: ProcessedMessage;
    toolCalls?: Array<{ tool: string; parameters: unknown }>;
    finished: boolean;
}

export interface IAgentStep {
    generateOneStep(input: AgentStepInput): Promise<AgentStepOutput>;
    generateWithToolExecution(input: AgentStepInput): Promise<AgentStepOutput>;
    loop(input: AgentStepInput, maxIterations?: number): Promise<AgentStepOutput>;
}

export interface ToolExecutionInput {
    toolCalls: Array<{ tool: string; parameters: unknown }>;
    tools: ToolList;
    context?: Record<string, unknown>;
}

export interface ToolExecutionOutput {
    results: Array<{ tool: string; result: unknown; error?: string }>;
    success: boolean;
}

export interface ToolExecutor {
    executeTools(input: ToolExecutionInput): Promise<ToolExecutionOutput>;
}

export type AgentEventType = 
    | 'content'
    | 'tool_call_request'
    | 'tool_call_response'
    | 'tool_call_confirmation'
    | 'user_cancelled'
    | 'error'
    | 'chat_compressed'
    | 'thought'
    | 'max_session_turns'
    | 'finished'
    | 'loop_detected';
