/**
 * Base Pre-Tool Call Processor Class
 * Abstract base class for all pre-tool call processors
 * These are called before the Tool Call
 * Used to check if the Tool Call is proper and handle Local Tool Interceptor
 */

import {
    PreToolCallProcessor,
    PreToolCallProcessorInput,
    PreToolCallProcessorOutput,
    InterceptedTool,
    ToolValidationRule,
    ToolValidationResult,
    ToolCall
} from '@codebolt/types/agent';

export abstract class BasePreToolCallProcessor implements PreToolCallProcessor {
    protected context: Record<string, unknown> = {};

    constructor() {
        // this.context = options.context || {};
    }

    abstract modify(input: PreToolCallProcessorInput): Promise<PreToolCallProcessorOutput>;

    // Optional tool interceptor method
    async interceptTool?(_toolName: string, _toolInput: unknown): Promise<boolean> {
        return false; // Default: don't intercept
    }

    setContext(key: string, value: unknown): void {
        this.context[key] = value;
    }

    getContext(key: string): unknown {
        return this.context[key];
    }

    clearContext(): void {
        this.context = {};
    }

    // Helper method to create intercepted tool result
    protected createInterceptedTool(
        toolName: string,
        originalInput: unknown,
        result?: unknown,
        reason?: string
    ): InterceptedTool {
        const interceptedTool: InterceptedTool = {
            toolName,
            originalInput,
            result,
            intercepted: true,
        };
        if (reason !== undefined) {
            interceptedTool.reason = reason;
        }
        return interceptedTool;
    }

    // Helper method to validate tool call
    protected validateToolCall(
        toolCall: ToolCall,
        validationRules: ToolValidationRule[]
    ): ToolValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];
        const toolName = toolCall.function.name;

        const relevantRules = validationRules.filter(rule => rule.toolName === toolName);

        for (const rule of relevantRules) {
            try {
                if (!rule.validator(toolCall.function.arguments)) {
                    errors.push(rule.errorMessage);
                }
            } catch (error) {
                warnings.push(`Validation rule for '${toolName}' failed to execute: ${error}`);
            }
        }

        return {
            isValid: errors.length === 0,
            toolName,
            errors,
            warnings,
            metadata: { 
                timestamp: new Date().toISOString(),
                processor: this.constructor.name
            }
        };
    }

    // // Helper method to extract tool calls from message
    // protected extractToolCalls(input: PreToolCallProcessorInput): ToolCall[] {
    //     const toolCalls: ToolCall[] = [];
        
    //     for (const msg of input.llmResponseMessage.messages) {
    //         if (msg.tool_calls) {
    //             toolCalls.push(...msg.tool_calls);
    //         }
    //     }
        
    //     return toolCalls;
    // }

    // // Helper method to check if tool should be intercepted
    // protected shouldInterceptTool(toolName: string, interceptableTools?: string[]): boolean {
    //     if (!interceptableTools) {
    //         return false;
    //     }
    //     return interceptableTools.includes(toolName) || interceptableTools.includes('*');
    // }

    // // Helper method to create standard success output
    // protected createSuccessOutput(
    //     nextPrompt: PreToolCallProcessorInput['nextPrompt'],
    //     additionalContext?: Record<string, unknown>,
    //     interceptedTools?: InterceptedTool[]
    // ): PreToolCallProcessorOutput {
    //     return {
    //         nextPrompt,
    //         context: {
    //             ...this.context,
    //             ...additionalContext,
    //             processedBy: this.constructor.name,
    //             processedAt: new Date().toISOString()
    //         },
    //         shouldExit: false,
    //         interceptedTools
    //     };
    // }

    // // Helper method to create exit output
    // protected createExitOutput(
    //     reason: string,
    //     nextPrompt?: PreToolCallProcessorInput['nextPrompt']
    // ): PreToolCallProcessorOutput {
    //     return {
    //         nextPrompt: nextPrompt {mess} ,
    //         context: {
    //             ...this.context,
    //             exitReason: reason,
    //             exitedBy: this.constructor.name,
    //             exitedAt: new Date().toISOString()
    //         },
    //         shouldExit: true
    //     };
    // }

    // // Helper method to validate all tool calls in the input
    // protected validateAllToolCalls(
    //     input: PreToolCallProcessorInput,
    //     validationRules: ToolValidationRule[]
    // ): { isValid: boolean; results: ToolValidationResult[] } {
    //     const toolCalls = this.extractToolCalls(input);
    //     const results = toolCalls.map(toolCall => this.validateToolCall(toolCall, validationRules));
    //     const isValid = results.every(result => result.isValid);
        
    //     return { isValid, results };
    // }

    // Helper method to check if local tools are enabled
    // protected isLocalToolsEnabled(): boolean {
    //     const options = this.context.options as PreToolCallProcessorOptions;
    //     return options?.localToolsEnabled || false;
    // }
}
