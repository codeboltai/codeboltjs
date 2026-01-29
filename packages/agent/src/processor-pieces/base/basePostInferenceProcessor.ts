/**
 * Base Post-Inference Processor Class
 * Abstract base class for all post-inference processors
 * These are called after the LLM is called and we have gotten the response
 * This is before the actual Tool Call is done
 */

import {
    PostInferenceProcessor,
    ProcessedMessage
} from '@codebolt/types/agent';
import { LLMResponse } from '@codebolt/types/sdk';


export abstract class BasePostInferenceProcessor implements PostInferenceProcessor {
    protected context: Record<string, unknown> = {};

    // constructor(options: PostInferenceProcessorOptions = {}) {
    //     this.context = options.context || {};
    // }
    constructor(){

    }

    abstract modify(llmMessageSent: ProcessedMessage,llmResponseMessage: LLMResponse, nextPrompt: ProcessedMessage): Promise<ProcessedMessage>;

    // setContext(key: string, value: unknown): void {
    //     this.context[key] = value;
    // }

    // getContext(key: string): unknown {
    //     return this.context[key];
    // }

    // clearContext(): void {
    //     this.context = {};
    // }

    // Helper method to create LLM inference trigger event
    // protected createLLMInferenceTriggerEvent(
    //     reason: string,
    //     updatedMessage: PostInferenceProcessorInput['nextPrompt'],
    //     retryCount = 0
    // ): LLMInferenceTriggerEvent {
    //     return {
    //         type: 'llm_inference_trigger',
    //         reason,
    //         updatedMessage,
    //         retryCount,
    //         metadata: { 
    //             timestamp: new Date().toISOString(),
    //             processor: this.constructor.name
    //         }
    //     };
    // }

    // // Helper method to create exit event
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

    // // Helper method to validate response
    // protected validateResponse(
    //     response: PostInferenceProcessorInput['llmResponseMessage'], 
    //     rules: ValidationRule[]
    // ): ValidationResult {
    //     const errors: string[] = [];
    //     const warnings: string[] = [];

    //     for (const rule of rules) {
    //         try {
    //             if (!rule.validator(response)) {
    //                 errors.push(rule.errorMessage);
    //             }
    //         } catch (error) {
    //             warnings.push(`Validation rule '${rule.name}' failed to execute: ${error}`);
    //         }
    //     }

    //     return {
    //         isValid: errors.length === 0,
    //         errors,
    //         warnings,
    //         metadata: { 
    //             timestamp: new Date().toISOString(),
    //             rulesChecked: rules.length
    //         }
    //     };
    // }

    // // Helper method to check if response has tool calls
    // protected hasToolCalls(input: PostInferenceProcessorInput): boolean {
    //     return input.llmResponseMessage.messages.some(msg => 
    //         msg.tool_calls && msg.tool_calls.length > 0
    //     );
    // }

    // // Helper method to extract tool calls from response
    // protected extractToolCalls(input: PostInferenceProcessorInput) {
    //     const toolCalls: any[] = [];
        
    //     for (const message of input.llmResponseMessage.messages) {
    //         if (message.tool_calls) {
    //             toolCalls.push(...message.tool_calls);
    //         }
    //     }
        
    //     return toolCalls;
    // }

    // // Helper method to create standard success output
    // protected createSuccessOutput(
    //     nextPrompt: PostInferenceProcessorInput['nextPrompt'],
    //     additionalContext?: Record<string, unknown>
    // ): PostInferenceProcessorOutput {
    //     return {
    //         nextPrompt,
    //         context: {
    //             ...this.context,
    //             ...additionalContext,
    //             processedBy: this.constructor.name,
    //             processedAt: new Date().toISOString()
    //         }
    //     };
    // }

    // // Helper method to create retry output
    // protected createRetryOutput(
    //     updatedMessage: PostInferenceProcessorInput['nextPrompt'],
    //     reason: string,
    //     retryCount = 0
    // ): PostInferenceProcessorOutput {
    //     return {
    //         nextPrompt: updatedMessage,
    //         context: this.context,
    //         llmInferenceTriggerEvent: this.createLLMInferenceTriggerEvent(reason, updatedMessage, retryCount)
    //     };
    // }
}
