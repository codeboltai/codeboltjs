import { BaseProcessor, ProcessorInput, ProcessorOutput } from '@codebolt/agentprocessorframework';
import codebolt from '@codebolt/codeboltjs';

export interface ToolExecutionInfo {
    toolCall: any;
    toolName: string;
    toolbox: string;
    parameters: Record<string, any>;
    needsConfirmation: boolean;
    confirmed?: boolean;
}

export interface ToolExecutionResult {
    toolCallId: string;
    result: any;
    error?: string;
    success: boolean;
    executionTime: number;
}

export interface ToolExecutionProcessorOptions {
    enableToolConfirmation?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    enableLogging?: boolean;
}

export class ToolExecutionProcessor extends BaseProcessor {
    private readonly enableToolConfirmation: boolean;
    private readonly maxRetries: number;
    private readonly retryDelay: number;
    private readonly enableLogging: boolean;
    private executedTools: Map<string, ToolExecutionResult> = new Map();

    constructor(options: ToolExecutionProcessorOptions = {}) {
        super(options);
        this.enableToolConfirmation = options.enableToolConfirmation !== false;
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000;
        this.enableLogging = options.enableLogging !== false;
    }

    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        try {
            const { message, context } = input;
            
            // Check if message contains tool calls
            const toolCalls = this.extractToolCalls(message);
            
            if (toolCalls.length === 0) {
                return [this.createEvent('NoToolCalls', {
                    reason: 'No tool calls found in message'
                })];
            }

            const events: ProcessorOutput[] = [
                this.createEvent('ToolCallsDetected', {
                    count: toolCalls.length,
                    tools: toolCalls.map(tc => tc.function.name)
                })
            ];

            // Process each tool call
            for (const toolCall of toolCalls) {
                const executionInfo = await this.processToolCall(toolCall, context);
                
                if (executionInfo.needsConfirmation) {
                    events.push(this.createEvent('ToolConfirmationRequired', executionInfo));
                } else {
                    const result = await this.executeTool(executionInfo);
                    events.push(this.createEvent('ToolExecuted', result));
                }
            }

            // Add summary event
            events.push(this.createEvent('ToolExecutionSummary', {
                totalTools: toolCalls.length,
                executedTools: Array.from(this.executedTools.values()),
                successRate: this.calculateSuccessRate()
            }));

            return events;

        } catch (error) {
            console.error('Error in ToolExecutionProcessor:', error);
            return [this.createEvent('ToolExecutionError', {
                error: error instanceof Error ? error.message : String(error)
            })];
        }
    }

    private extractToolCalls(message: any): any[] {
        const toolCalls: any[] = [];
        
        message.messages.forEach((msg: any) => {
            if (msg.tool_calls && Array.isArray(msg.tool_calls)) {
                toolCalls.push(...msg.tool_calls);
            }
        });
        
        return toolCalls;
    }

    private async processToolCall(toolCall: any, context?: Record<string, any>): Promise<ToolExecutionInfo> {
        const [toolbox, toolName] = toolCall.function.name.split('--');
        
        if (!toolbox || !toolName) {
            throw new Error(`Invalid tool name format: ${toolCall.function.name}`);
        }

        // Parse tool arguments
        let parameters: Record<string, any> = {};
        try {
            parameters = typeof toolCall.function.arguments === 'string' 
                ? JSON.parse(toolCall.function.arguments)
                : toolCall.function.arguments;
        } catch (error) {
            console.warn(`Failed to parse tool arguments for ${toolCall.function.name}:`, error);
        }

        // Check if tool needs confirmation
        const needsConfirmation = this.shouldConfirmTool(toolCall, parameters);

        return {
            toolCall,
            toolName,
            toolbox,
            parameters,
            needsConfirmation
        };
    }

    private shouldConfirmTool(toolCall: any, parameters: Record<string, any>): boolean {
        // Check for dangerous operations
        const dangerousOperations = [
            'delete', 'remove', 'drop', 'destroy', 'format', 'wipe',
            'shutdown', 'restart', 'kill', 'terminate'
        ];

        const toolName = toolCall.function.name.toLowerCase();
        const hasDangerousOperation = dangerousOperations.some(op => toolName.includes(op));

        // Check for file system operations with important paths
        if (parameters.filePath || parameters.path) {
            const path = (parameters.filePath || parameters.path || '').toLowerCase();
            const importantPaths = ['/', 'c:', 'system', 'windows', 'etc', 'usr'];
            const hasImportantPath = importantPaths.some(ip => path.includes(ip));
            
            if (hasImportantPath) {
                return true;
            }
        }

        // Check for network operations
        if (parameters.url || parameters.host || parameters.port) {
            return true;
        }

        return hasDangerousOperation;
    }

    private async executeTool(executionInfo: ToolExecutionInfo): Promise<ToolExecutionResult> {
        const startTime = Date.now();
        const { toolCall, toolbox, toolName, parameters } = executionInfo;

        try {
            // Execute tool using CodeBolt's MCP
            const { data } = await codebolt.mcp.executeTool(
                toolbox,
                toolName,
                parameters
            );

            // Data comes as [failure: boolean, content: string] from CodeBolt MCP
            let resultData: any;
            let success = true;
            if (Array.isArray(data) && data.length >= 2) {
                const [failure, content] = data;
                if (failure) {
                    success = false;
                    resultData = content; // Content is error message on failure
                } else {
                    resultData = content; // Content is result on success
                }
            } else {
                // Fallback for unexpected data format
                console.warn(`[Tool] Unexpected data format from ${toolCall.function.name}:`, data);
                resultData = data;
            }

            const executionResult: ToolExecutionResult = {
                toolCallId: toolCall.id,
                result: resultData,
                success: success,
                executionTime: Date.now() - startTime,
                error: success ? undefined : String(resultData)
            };

            // Store result
            this.executedTools.set(toolCall.id, executionResult);

            // Log execution if enabled
            if (this.enableLogging) {
                console.log(`[Tool] Successfully executed ${toolbox}--${toolName} in ${executionResult.executionTime}ms`);
            }

            return executionResult;

        } catch (error) {
            const executionResult: ToolExecutionResult = {
                toolCallId: toolCall.id,
                result: null,
                error: error instanceof Error ? error.message : String(error),
                success: false,
                executionTime: Date.now() - startTime
            };

            // Store result
            this.executedTools.set(toolCall.id, executionResult);

            // Log error if enabled
            if (this.enableLogging) {
                console.error(`[Tool] Failed to execute ${toolbox}--${toolName}:`, error);
            }

            return executionResult;
        }
    }

    private calculateSuccessRate(): number {
        if (this.executedTools.size === 0) return 0;
        
        const successfulTools = Array.from(this.executedTools.values())
            .filter(result => result.success).length;
        
        return (successfulTools / this.executedTools.size) * 100;
    }

    // Public methods for external control
    async confirmToolExecution(toolCallId: string, confirmed: boolean): Promise<void> {
        // This method can be used to track confirmation status in the future
        // For now, we'll just log the confirmation
        if (this.enableLogging) {
            console.log(`[ToolExecutor] Tool ${toolCallId} confirmation: ${confirmed}`);
        }
    }

    getToolExecutionHistory(): ToolExecutionResult[] {
        return Array.from(this.executedTools.values());
    }

    clearToolHistory(): void {
        this.executedTools.clear();
    }

    setMaxRetries(maxRetries: number): void {
        (this as any).maxRetries = Math.max(1, maxRetries);
    }

    setRetryDelay(delay: number): void {
        (this as any).retryDelay = Math.max(100, delay);
    }

    enableLoggingForSession(): void {
        (this as any).enableLogging = true;
    }

    disableLoggingForSession(): void {
        (this as any).enableLogging = false;
    }
}
