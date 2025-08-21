import { ToolExecutor as IToolExecutor, ToolExecutionInput, ToolExecutionOutput, ToolList } from '../types/interfaces';

export interface ToolExecutorOptions {
    maxRetries?: number;
    retryDelay?: number;
    enableLogging?: boolean;
}

export class ToolExecutor implements IToolExecutor {
    private readonly maxRetries: number;
    private readonly retryDelay: number;
    private readonly enableLogging: boolean;

    constructor(
        private readonly toolList: ToolList,
        options: ToolExecutorOptions = {}
    ) {
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000;
        this.enableLogging = options.enableLogging !== false;
    }

    async executeTools(input: ToolExecutionInput): Promise<ToolExecutionOutput> {
        try {
            const { toolCalls, tools, context } = input;
            
            const results = [];
            
            for (const toolCall of toolCalls) {
                try {
                    const tool = tools.getTool(toolCall.tool);
                    
                    if (!tool) {
                        results.push({
                            tool: toolCall.tool,
                            result: null,
                            error: `Tool '${toolCall.tool}' not found`
                        });
                        continue;
                    }

                    // Execute tool with retry logic
                    const result = await this.executeToolWithRetry(tool, toolCall.parameters);
                    
                    results.push({
                        tool: toolCall.tool,
                        result,
                        error: undefined
                    });

                } catch (error) {
                    results.push({
                        tool: toolCall.tool,
                        result: null,
                        error: error instanceof Error ? error.message : String(error)
                    });
                }
            }

            const success = results.every(r => !r.error);
            
            return {
                results,
                success
            };

        } catch (error) {
            console.error('Error in ToolExecutor.executeTools:', error);
            throw error;
        }
    }

    private async executeToolWithRetry(tool: any, parameters: any): Promise<any> {
        let lastError: Error | null = null;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                if (this.enableLogging) {
                    console.log(`[ToolExecutor] Executing ${tool.name} (attempt ${attempt}/${this.maxRetries})`);
                }
                
                const result = await tool.execute(parameters);
                return result;
                
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                
                if (this.enableLogging) {
                    console.warn(`[ToolExecutor] Attempt ${attempt} failed for ${tool.name}:`, lastError.message);
                }
                
                if (attempt < this.maxRetries) {
                    await this.delay(this.retryDelay);
                }
            }
        }
        
        throw lastError || new Error(`Tool execution failed after ${this.maxRetries} attempts`);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Helper methods for tool management
    addTool(tool: any): void {
        this.toolList.addTool(tool);
    }

    removeTool(toolName: string): boolean {
        this.toolList.removeTool(toolName);
        return true;
    }

    getToolNames(): string[] {
        return this.toolList.getAllTools().map(tool => tool.name);
    }
}
