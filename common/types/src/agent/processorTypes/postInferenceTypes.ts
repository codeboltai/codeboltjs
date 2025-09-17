/**
 * Post-Inference Processor Types
 * These are called after the LLM is called and we have gotten the response
 * This is before the actual Tool Call is done
 * Mostly used for things like Response Validation
 */

import { LLMCompletion } from '../../sdk-types';
import { 
    ProcessedMessage, 
    ExitEvent, 
    LLMInferenceTriggerEvent,
    ValidationRule,
} from '../common';

export interface PostInferenceProcessor {
    modify(llmMessageSent: ProcessedMessage,llmResponseMessage: LLMCompletion, nextPrompt: ProcessedMessage): Promise<ProcessedMessage>;
}




export interface PostInferenceProcessorOptions {
    enabled?: boolean;
    priority?: number;
    validationRules?: ValidationRule[];
}

// Factory function type for post-inference processors
export type PostInferenceProcessorFactory<T extends PostInferenceProcessor = PostInferenceProcessor> = (
    config?: PostInferenceProcessorOptions
) => T;