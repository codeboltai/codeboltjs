import { FlatUserMessage } from "../../sdk-types";
import { ProcessedMessage } from "../common";
import { MessageModifier } from "../processorTypes";
import { MessageObject,ToolCall, Tool, LLMInferenceParams, LLMCompletion } from '../../sdk-types';


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
 * Input for unified agent step processing
 */
export interface UnifiedStepInput {
    /** Processed messages */
    messages: MessageObject[];
    /** Available tools */
    tools: Tool[];
    /** Processing context */
    context?: Record<string, any>;
    /** Tool choice strategy */
    toolChoice?: 'auto' | 'none' | 'required';
}

/**
 * Output from unified agent step processing
 */
export interface AgentStepOutput {
    /** LLM response */
    rawLLMResponse: LLMCompletion;
    /** Updated context */
    metaData: Record<string, unknown>;

    nextMessage:ProcessedMessage
}
export interface LLMConfig {
    llmname?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
    baseUrl?: string;
}