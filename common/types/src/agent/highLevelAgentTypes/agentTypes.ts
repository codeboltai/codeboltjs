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

export type AgentYamlConfig = {
    title: string;
    version: string;
    unique_id: string;

    initial_message: string;
    description: string;

    tags: string[];
    longDescription: string;

    avatarSrc?: string;
    avatarFallback: string;

    metadata?: {
        agent_routing?: {
            worksonblankcode?: boolean;
            worksonexistingcode?: boolean;
            supportedlanguages?: string[];
            supportedframeworks?: string[];
            supportRemix?: boolean;
        };

        defaultagentllm?: {
            strict?: boolean;
            modelorder?: string[];
        };

        llm_role?: Array<{
            name: string;
            description: string;
            strict?: boolean;
            modelorder?: string[];
        }>;
    };

    actions: Array<{
        name: string;
        description: string;
        detailDescription: string;
        actionPrompt: string;
    }>;

    supportRemix: boolean;
    author: string;
};
