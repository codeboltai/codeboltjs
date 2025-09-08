/**
 * Pre-Inference Processor Types
 * These are called before the Agent calls the LLM
 * Called by AgentStep before the LLM calling step
 */

import { ProcessedMessage, ExitEvent } from '../common';

export interface PreInferenceProcessor {
    modify(input: PreInferenceProcessorInput): Promise<PreInferenceProcessorOutput>;
    setContext(key: string, value: unknown): void;
    getContext(key: string): unknown;
    clearContext(): void;
}

export interface PreInferenceProcessorInput {
    initialUserMessage: unknown;
    currentMessage: ProcessedMessage;
    exitEvent?: ExitEvent;
    context?: Record<string, unknown>;
}

export interface PreInferenceProcessorOutput {
    currentMessage: ProcessedMessage;
    context?: Record<string, unknown>;
    exitEvent?: ExitEvent;
}

export interface PreInferenceProcessorOptions {
    context?: Record<string, unknown>;
    enabled?: boolean;
    priority?: number;
}

// Factory function type for pre-inference processors
export type PreInferenceProcessorFactory<T extends PreInferenceProcessor = PreInferenceProcessor> = (
    config?: PreInferenceProcessorOptions
) => T;