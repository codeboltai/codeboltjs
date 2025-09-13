import { FlatUserMessage } from "../../sdk-types";
import { LLMConfig } from "../baseAgentTypes/agentStepTypes";
import { MessageModifier, PostInferenceProcessor, PostToolCallProcessor, PreInferenceProcessor, PreToolCallProcessor, Tool } from "../processorTypes";
export interface AgentConfig {
    name?: string;
    instructions?: string;
    tools?: Tool[];
    processors?: {
        messageModifiers?: MessageModifier[];
        preInferenceProcessors?: PreInferenceProcessor[];
        postInferenceProcessors?: PostInferenceProcessor[];
        preToolCallProcessors?: PreToolCallProcessor[];
        postToolCallProcessors?: PostToolCallProcessor[];
    };
    defaultProcessors?: boolean;
    /** Maximum iterations for agent loops */
    maxIterations?: number;
    /** Maximum conversation length before summarization */
    maxConversationLength?: number;
    /** LLM configuration */
    llmConfig?: LLMConfig;
    /** Enable logging */
    enableLogging?: boolean;
    /** Retry configuration */
    retryConfig?: {
        maxRetries?: number;
        retryDelay?: number;
    };
}
export interface AgentInterface {
    execute(reqMessage:FlatUserMessage): Promise<{
        success: boolean;
        result: any;
        error?: string;
    }>;
}
