/**
 * Base Pre-Inference Processor Class
 * Abstract base class for all pre-inference processors
 * These are called before the Agent calls the LLM
 */

import { 
    PreInferenceProcessor,

    ExitEvent,
    ProcessedMessage
} from '@codebolt/types/agent';
import { FlatUserMessage } from '@codebolt/types/sdk';


export abstract class BasePreInferenceProcessor implements PreInferenceProcessor {
    protected context: Record<string, unknown> = {};

    // constructor(options: PreInferenceProcessorOptions = {}) {
    //     this.context = options.context || {};
    // }
    constructor(){

    }

    abstract modify(originalRequest: FlatUserMessage,createdMessage: ProcessedMessage): Promise<ProcessedMessage>;

    // setContext(key: string, value: unknown): void {
    //     this.context[key] = value;
    // }

    // getContext(key: string): unknown {
    //     return this.context[key];
    // }

    // clearContext(): void {
    //     this.context = {};
    // }

    // Helper method to create exit event
    // protected createExitEvent(reason: string, error?: string): ExitEvent {
    //     return {
    //         type: 'exit',
    //         reason,
    //         error,
    //         metadata: { 
    //             timestamp: new Date().toISOString(),
    //             processor: this.constructor.name
    //         }
    //     };
    // }

    // Helper method to validate message structure
    // protected validateMessage(originalRequest: FlatUserMessage,createdMessage: ProcessedMessage): boolean {
    //     return !!(
    //         createdMessage&&
    //         createdMessage.messages &&
    //         Array.isArray(createdMessage.messages)
    //     );
    // }

    // // Helper method to add processing metadata
    // protected addProcessingMetadata(
    //     output: PreInferenceProcessorOutput,
    //     processingInfo: Record<string, unknown>
    // ): PreInferenceProcessorOutput {
    //     return {
    //         ...output,
    //         context: {
    //             ...output.context,
    //             processingMetadata: {
    //                 ...((output.context?.processingMetadata as Record<string, unknown>) || {}),
    //                 ...processingInfo,
    //                 processor: this.constructor.name,
    //                 processedAt: new Date().toISOString()
    //             }
    //         }
    //     };
    // }

    // // Helper method to check if exit is required
    // protected shouldExit(input: PreInferenceProcessorInput): boolean {
    //     return !!input.exitEvent;
    // }

    // // Helper method to create standard success output
    // protected createSuccessOutput(
    //     currentMessage: PreInferenceProcessorInput['currentMessage'],
    //     additionalContext?: Record<string, unknown>
    // ): PreInferenceProcessorOutput {
    //     return {
    //         currentMessage,
    //         context: {
    //             ...this.context,
    //             ...additionalContext
    //         }
    //     };
    // }
}
