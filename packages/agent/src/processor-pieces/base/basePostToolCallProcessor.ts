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
    PostToolCallProcessorOptions,
    ToolResult,
    EnhancedToolResult,
    ResultProcessingRule,
    ToolExecutionMetrics
} from '../../types/processorTypes/postToolCallProcessorTypes';

export abstract class BasePostToolCallProcessor implements PostToolCallProcessor {
    protected context: Record<string, unknown> = {};

    constructor(options: PostToolCallProcessorOptions = {}) {
        this.context = options.context || {};
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

    // Helper method to enhance tool results
    protected enhanceToolResults(
        toolResults: ToolResult[],
        processingRules: ResultProcessingRule[]
    ): EnhancedToolResult[] {
        return toolResults.map(result => {
            const relevantRules = processingRules.filter(rule => 
                rule.toolName === result.toolName && 
                (!rule.condition || rule.condition(result))
            );

            let enhancedResult: EnhancedToolResult = { ...result };

            for (const rule of relevantRules) {
                try {
                    enhancedResult = rule.processor(enhancedResult);
                } catch (error) {
                    console.warn(`Failed to process result for ${result.toolName}: ${error}`);
                }
            }

            return enhancedResult;
        });
    }

    // Helper method to add tool results to message
    protected addToolResultsToMessage(
        input: PostToolCallProcessorInput
    ): PostToolCallProcessorInput['nextPrompt'] {
        if (!input.toolResults || input.toolResults.length === 0) {
            return input.nextPrompt;
        }

        const toolMessages = input.toolResults.map(result => ({
            role: 'tool' as const,
            content: typeof result.result === 'string' ? result.result : JSON.stringify(result.result),
            tool_call_id: result.toolCallId,
            name: result.toolName
        }));

        return {
            messages: [...input.nextPrompt.messages, ...toolMessages],
            metadata: {
                ...input.nextPrompt.metadata,
                toolResults: input.toolResults.length,
                lastToolExecution: new Date().toISOString(),
                processedBy: this.constructor.name
            }
        };
    }

    // Helper method to calculate tool metrics
    protected calculateToolMetrics(toolResults: ToolResult[]): ToolExecutionMetrics[] {
        const metricsMap = new Map<string, {
            count: number;
            totalTime: number;
            successes: number;
            errors: Record<string, number>;
            lastExecution: string;
        }>();

        for (const result of toolResults) {
            const existing = metricsMap.get(result.toolName) || {
                count: 0,
                totalTime: 0,
                successes: 0,
                errors: {},
                lastExecution: ''
            };

            existing.count++;
            existing.totalTime += result.executionTime || 0;
            if (result.success) {
                existing.successes++;
            } else if (result.error) {
                existing.errors[result.error] = (existing.errors[result.error] || 0) + 1;
            }
            
            if (result.metadata?.timestamp) {
                existing.lastExecution = result.metadata.timestamp as string;
            }

            metricsMap.set(result.toolName, existing);
        }

        return Array.from(metricsMap.entries()).map(([toolName, data]) => ({
            toolName,
            executionCount: data.count,
            averageExecutionTime: data.count > 0 ? data.totalTime / data.count : 0,
            successRate: data.count > 0 ? data.successes / data.count : 0,
            lastExecution: data.lastExecution,
            errorPatterns: data.errors
        }));
    }

    // Helper method to create summary from tool results
    protected createToolResultsSummary(toolResults: ToolResult[]): string {
        const successful = toolResults.filter(r => r.success).length;
        const failed = toolResults.length - successful;
        
        let summary = `Executed ${toolResults.length} tool(s): ${successful} successful`;
        if (failed > 0) {
            summary += `, ${failed} failed`;
        }
        
        return summary;
    }

    // Helper method to filter failed tool results
    protected getFailedToolResults(toolResults: ToolResult[]): ToolResult[] {
        return toolResults.filter(result => !result.success);
    }

    // Helper method to filter successful tool results
    protected getSuccessfulToolResults(toolResults: ToolResult[]): ToolResult[] {
        return toolResults.filter(result => result.success);
    }

    // Helper method to create standard success output
    protected createSuccessOutput(
        nextPrompt: PostToolCallProcessorInput['nextPrompt'],
        additionalContext?: Record<string, unknown>,
        enhancedResults?: EnhancedToolResult[]
    ): PostToolCallProcessorOutput {
        return {
            nextPrompt,
            context: {
                ...this.context,
                ...additionalContext,
                processedBy: this.constructor.name,
                processedAt: new Date().toISOString()
            },
            enhancedResults
        };
    }

    // Helper method to check if any tool calls failed
    protected hasFailedToolCalls(toolResults: ToolResult[]): boolean {
        return toolResults.some(result => !result.success);
    }

    // Helper method to get tool results by name
    protected getToolResultsByName(toolResults: ToolResult[], toolName: string): ToolResult[] {
        return toolResults.filter(result => result.toolName === toolName);
    }

    // Helper method to add context from tool results
    protected addToolResultsContext(
        context: Record<string, unknown>,
        toolResults: ToolResult[]
    ): Record<string, unknown> {
        const metrics = this.calculateToolMetrics(toolResults);
        const summary = this.createToolResultsSummary(toolResults);
        
        return {
            ...context,
            toolExecutionSummary: summary,
            toolMetrics: metrics,
            toolResultsCount: toolResults.length,
            lastToolExecution: new Date().toISOString()
        };
    }
}
