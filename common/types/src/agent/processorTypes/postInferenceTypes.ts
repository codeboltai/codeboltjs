/**
 * Post-Inference Processor Types
 * These are called after the LLM is called and we have gotten the response
 * This is before the actual Tool Call is done
 * Mostly used for things like Response Validation
 */

import { 
    ProcessedMessage, 
    ExitEvent, 
    LLMInferenceTriggerEvent,
    ValidationRule,
} from '../common';

export interface PostInferenceProcessor {
    modify(input: PostInferenceProcessorInput): Promise<PostInferenceProcessorOutput>;
    setContext(key: string, value: unknown): void;
    getContext(key: string): unknown;
    clearContext(): void;
}

export interface PostInferenceProcessorInput {
    llmMessageSent: ProcessedMessage;
    llmResponseMessage: ProcessedMessage;
    nextPrompt: ProcessedMessage;
    context?: Record<string, unknown>;
}

export interface PostInferenceProcessorOutput {
    nextPrompt: ProcessedMessage;
    context?: Record<string, unknown>;
    llmInferenceTriggerEvent?: LLMInferenceTriggerEvent;
    exitEvent?: ExitEvent;
}

export interface PostInferenceProcessorOptions {
    context?: Record<string, unknown>;
    enabled?: boolean;
    priority?: number;
    validationRules?: ValidationRule[];
}

// Factory function type for post-inference processors
export type PostInferenceProcessorFactory<T extends PostInferenceProcessor = PostInferenceProcessor> = (
    config?: PostInferenceProcessorOptions
) => T;