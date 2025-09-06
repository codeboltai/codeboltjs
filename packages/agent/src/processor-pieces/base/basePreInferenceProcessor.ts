/**
 * Base Pre-Inference Processor Class
 * Abstract base class for all pre-inference processors
 * These are called before the Agent calls the LLM
 */

import { 
    PreInferenceProcessor,
    PreInferenceProcessorInput,
    PreInferenceProcessorOutput,
    PreInferenceProcessorOptions
} from '../../types/processorTypes/preInferenceProcessorTypes';
import { ExitEvent } from '../../types/common';

export abstract class BasePreInferenceProcessor implements PreInferenceProcessor {
    protected context: Record<string, unknown> = {};

    constructor(options: PreInferenceProcessorOptions = {}) {
        this.context = options.context || {};
    }

    abstract modify(input: PreInferenceProcessorInput): Promise<PreInferenceProcessorOutput>;

    setContext(key: string, value: unknown): void {
        this.context[key] = value;
    }

    getContext(key: string): unknown {
        return this.context[key];
    }

    clearContext(): void {
        this.context = {};
    }

    // Helper method to create exit event
    protected createExitEvent(reason: string, error?: string): ExitEvent {
        return {
            type: 'exit',
            reason,
            error,
            metadata: { 
                timestamp: new Date().toISOString(),
                processor: this.constructor.name
            }
        };
    }

    // Helper method to validate message structure
    protected validateMessage(input: PreInferenceProcessorInput): boolean {
        return !!(
            input.currentMessage &&
            input.currentMessage.messages &&
            Array.isArray(input.currentMessage.messages)
        );
    }

    // Helper method to add processing metadata
    protected addProcessingMetadata(
        output: PreInferenceProcessorOutput,
        processingInfo: Record<string, unknown>
    ): PreInferenceProcessorOutput {
        return {
            ...output,
            context: {
                ...output.context,
                processingMetadata: {
                    ...((output.context?.processingMetadata as Record<string, unknown>) || {}),
                    ...processingInfo,
                    processor: this.constructor.name,
                    processedAt: new Date().toISOString()
                }
            }
        };
    }

    // Helper method to check if exit is required
    protected shouldExit(input: PreInferenceProcessorInput): boolean {
        return !!input.exitEvent;
    }

    // Helper method to create standard success output
    protected createSuccessOutput(
        currentMessage: PreInferenceProcessorInput['currentMessage'],
        additionalContext?: Record<string, unknown>
    ): PreInferenceProcessorOutput {
        return {
            currentMessage,
            context: {
                ...this.context,
                ...additionalContext
            }
        };
    }
}
