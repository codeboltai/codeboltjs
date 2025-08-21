export interface ToolCall {
    id: string;
    function: {
        name: string;
        arguments: string | Record<string, any>;
    };
}

export interface Message {
    role: 'user' | 'assistant' | 'tool' | 'system';
    content: string | any[];
    name?: string;
    tool_calls?: ToolCall[];
    tool_call_id?: string;
    [key: string]: any;
}

export interface ProcessedMessage {
    messages: Message[];
    metadata?: Record<string, any>;
}

export interface ProcessorInput {
    message: ProcessedMessage;
    context?: Record<string, any>;
}

export interface ProcessorOutput {
    type: string;
    value?: any;
}

export interface Processor {
    processInput(input: ProcessorInput): Promise<ProcessorOutput[]>;
    setContext(key: string, value: any): void;
    getContext(key: string): any;
    clearContext(): void;
}

export interface MessageModifierInput {
    originalRequest: any;
    createdMessage: ProcessedMessage;
    context?: Record<string, any>;
}

export interface MessageModifier {
    modify(input: MessageModifierInput): Promise<ProcessedMessage>;
    setContext(key: string, value: any): void;
    getContext(key: string): any;
    clearContext(): void;
}

export interface Tool {
    name: string;
    description: string;
    parameters: Record<string, any>;
    execute(params: any, abortSignal?: AbortSignal): Promise<any>;
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
    context?: Record<string, any>;
}

export interface AgentStepOutput {
    response: ProcessedMessage;
    toolCalls?: Array<{ tool: string; parameters: any }>;
    finished: boolean;
}

export interface IAgentStep {
    generateOneStep(input: AgentStepInput): Promise<AgentStepOutput>;
    generateWithToolExecution(input: AgentStepInput): Promise<AgentStepOutput>;
    loop(input: AgentStepInput, maxIterations?: number): Promise<AgentStepOutput>;
}

export interface ToolExecutionInput {
    toolCalls: Array<{ tool: string; parameters: any }>;
    tools: ToolList;
    context?: Record<string, any>;
}

export interface ToolExecutionOutput {
    results: Array<{ tool: string; result: any; error?: string }>;
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
