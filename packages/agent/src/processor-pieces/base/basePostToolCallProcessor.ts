/**
 * Base Post-Tool Call Processor Class
 * Abstract base class for all post-tool call processors
 * These are called after the Tool Call
 * Help in checking the tool call results and adding them to the LLM message
 */

import { 
    PostToolCallProcessor,
    PostToolCallProcessorInput,
    PostToolCallProcessorOutput,
  
    ToolResult,
    EnhancedToolResult,
    ResultProcessingRule,
    ToolExecutionMetrics
} from '@codebolt/types/agent';


export abstract class BasePostToolCallProcessor implements PostToolCallProcessor {
    protected context: Record<string, unknown> = {};

    constructor() {
        // this.context = options.context || {};
    }

    abstract modify(input: PostToolCallProcessorInput): Promise<PostToolCallProcessorOutput>;

    setContext(key: string, value: unknown): void {
        this.context[key] = value;
    }

    getContext(key: string): unknown {
        return this.context[key];
    }

    clearContext(): void {
        this.context = {};
    }


 


    // // Helper method to create summary from tool results
    // protected createToolResultsSummary(toolResults: ToolResult[]): string {
    //     const successful = toolResults.filter(r => r.success).length;
    //     const failed = toolResults.length - successful;
        
    //     let summary = `Executed ${toolResults.length} tool(s): ${successful} successful`;
    //     if (failed > 0) {
    //         summary += `, ${failed} failed`;
    //     }
        
    //     return summary;
    // }

    // // Helper method to filter failed tool results
    // protected getFailedToolResults(toolResults: ToolResult[]): ToolResult[] {
    //     return toolResults.filter(result => !result.success);
    // }

    // // Helper method to filter successful tool results
    // protected getSuccessfulToolResults(toolResults: ToolResult[]): ToolResult[] {
    //     return toolResults.filter(result => result.success);
    // }

    // // Helper method to create standard success output
    // protected createSuccessOutput(
    //     nextPrompt: PostToolCallProcessorInput['nextPrompt'],
    //     additionalContext?: Record<string, unknown>,
    //     enhancedResults?: EnhancedToolResult[]
    // ): PostToolCallProcessorOutput {
    //     return {
    //         nextPrompt,
    //         context: {
    //             ...this.context,
    //             ...additionalContext,
    //             processedBy: this.constructor.name,
    //             processedAt: new Date().toISOString()
    //         },
    //         enhancedResults
    //     };
    // }

    // // Helper method to check if any tool calls failed
    // protected hasFailedToolCalls(toolResults: ToolResult[]): boolean {
    //     return toolResults.some(result => !result.success);
    // }

    // // Helper method to get tool results by name
    // protected getToolResultsByName(toolResults: ToolResult[], toolName: string): ToolResult[] {
    //     return toolResults.filter(result => result.toolName === toolName);
    // }

    // // Helper method to add context from tool results
    // protected addToolResultsContext(
    //     context: Record<string, unknown>,
    //     toolResults: ToolResult[]
    // ): Record<string, unknown> {
    //     const metrics = this.calculateToolMetrics(toolResults);
    //     const summary = this.createToolResultsSummary(toolResults);
        
    //     return {
    //         ...context,
    //         toolExecutionSummary: summary,
    //         toolMetrics: metrics,
    //         toolResultsCount: toolResults.length,
    //         lastToolExecution: new Date().toISOString()
    //     };
    // }
}
