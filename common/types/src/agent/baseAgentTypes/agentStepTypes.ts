import { FlatUserMessage } from "../../sdk-types";
import { ProcessedMessage, ToolResult } from "../common";
import { MessageModifier, PostToolCallProcessor, PreToolCallProcessor } from "../processorTypes";
import { MessageObject, ToolCall, Tool, LLMInferenceParams, LLMCompletion } from '../../sdk-types';



/**
 * Unified message processor interface specifically for message modifiers
 * Processes FlatUserMessage through a chain of MessageModifiers and returns OpenAI-formatted messages
 */
export interface InitialPromptGeneratorInterface {
    /** Process and modify input messages */
    processMessage(input: FlatUserMessage): Promise<ProcessedMessage>;
    /** Add a message modifier */
    updateProcessors(processors: MessageModifier[]): void;

    getProcessors(): MessageModifier[];

    /** Set context value */
    setMetaData(key: string, value: unknown): void;
    /** Get context value */
    getMetaData(key: string): unknown;
    /** Clear all context */
    clearMetaData(): void;
}

/**
 * Unified agent step interface
 */
export interface AgentStepInterface {
    /** Execute a single agent step */
    executeStep(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<AgentStepOutput>;

}



/**
 * Output from unified agent step processing
 */
export interface AgentStepOutput {
    /** LLM response */
    rawLLMResponse: LLMCompletion;
    nextMessage: ProcessedMessage;
    actualMessageSentToLLM: ProcessedMessage

}
export interface LLMConfig {
    llmname?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
    baseUrl?: string;
}

// --------------------------------------

/**
 * Input for unified response execution
 */
export interface ResponseInput {
    /** LLM response to process */

    initialUserMessage: FlatUserMessage
    actualMessageSentToLLM: ProcessedMessage
    rawLLMOutput: LLMCompletion;
    nextMessage: ProcessedMessage

}

/**
 * Output from unified response execution
 */
export interface ResponseOutput {

    nextMessage: ProcessedMessage
    /** Tool execution results */
    toolResults?: ToolResult[];
    completed: boolean;
    /** Final message from the agent when task is completed */
    finalMessage?: string;
}

export interface AgentResponseExecutor {
    /** Execute response processing including tool execution */
    executeResponse(input: ResponseInput): Promise<ResponseOutput>;

    setPreToolCallProcessors(processors: PreToolCallProcessor[]): void
    setPostToolCallProcessors(processors: PostToolCallProcessor[]): void;

    getPreToolCallProcessors(): PreToolCallProcessor[]
    getPostToolCallProcessors(): PostToolCallProcessor[]




}