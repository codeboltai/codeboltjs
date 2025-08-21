import { IAgentStep, AgentStepInput, AgentStepOutput, ProcessedMessage, ToolList, ToolExecutor, ToolExecutionInput, Processor } from '../types/interfaces';

export interface AgentStepOptions {
    inputProcessors?: Processor[];
    outputProcessors?: Processor[];
    toolList?: ToolList;
    toolExecutor?: ToolExecutor;
    maxIterations?: number;
}

export abstract class AgentStep implements IAgentStep {
    protected readonly inputProcessors: Processor[];
    protected readonly outputProcessors: Processor[];
    protected readonly toolList?: ToolList;
    protected readonly toolExecutor?: ToolExecutor;
    protected readonly maxIterations: number;

    constructor(options: AgentStepOptions = {}) {
        this.inputProcessors = options.inputProcessors || [];
        this.outputProcessors = options.outputProcessors || [];
        this.toolList = options.toolList;
        this.toolExecutor = options.toolExecutor;
        this.maxIterations = options.maxIterations || 10;
    }

    /**
     * Single step processing with input/output processors
     */
    async step(message: ProcessedMessage, context?: Record<string, any>): Promise<ProcessedMessage> {
        try {
            let processedMessage = message;

            // Apply input processors
            for (const processor of this.inputProcessors) {
                const results = await processor.processInput({
                    message: processedMessage,
                    context
                });
                
                // Find the processed message from results
                const messageEvent = results.find(r => r.type === 'MessageProcessed' || r.type === 'MessageWithContext');
                if (messageEvent && messageEvent.value) {
                    processedMessage = messageEvent.value;
                }
            }

            // Analyze for tool calls
            const toolCalls = await this.analyzeForToolCalls(processedMessage, this.toolList?.getAllTools() || [], context);
            
            if (toolCalls && toolCalls.length > 0) {
                // Execute tools if we have a tool executor
                if (this.toolExecutor) {
                    const toolResults = await this.toolExecutor.executeTools({
                        toolCalls,
                        tools: this.toolList || { getAllTools: () => [], getTool: () => undefined, addTool: () => {}, removeTool: () => {} },
                        context
                    });

                    // Generate response with tool results
                    const stepOutput = await this.generateFinalResponse(processedMessage, toolResults, context);
                    processedMessage = stepOutput.response;
                } else {
                    // Return message with tool calls for external execution
                    processedMessage = {
                        messages: [
                            ...processedMessage.messages,
                            {
                                role: 'assistant',
                                content: `I need to use tools: ${toolCalls.map(t => t.tool).join(', ')}`,
                                tool_calls: toolCalls.map(t => ({
                                    id: `tool-${Date.now()}`,
                                    function: { name: t.tool, arguments: t.parameters }
                                }))
                            }
                        ]
                    };
                }
            } else {
                // No tool calls needed, generate final response
                const stepOutput = await this.generateFinalResponse(processedMessage, null, context);
                processedMessage = stepOutput.response;
            }

            // Apply output processors
            for (const processor of this.outputProcessors) {
                const results = await processor.processInput({
                    message: processedMessage,
                    context
                });
                
                // Find the processed message from results
                const messageEvent = results.find(r => r.type === 'MessageProcessed' || r.type === 'FinalResponse');
                if (messageEvent && messageEvent.value) {
                    processedMessage = messageEvent.value;
                }
            }

            return processedMessage;

        } catch (error) {
            console.error('Error in AgentStep.step:', error);
            throw error;
        }
    }

    async generateOneStep(input: AgentStepInput): Promise<AgentStepOutput> {
        try {
            const { message, tools, context } = input;
            
            // Analyze for tool calls
            const toolCalls = await this.analyzeForToolCalls(message, tools, context);
            
            if (toolCalls && toolCalls.length > 0) {
                // Execute tools
                const toolResults = await this.toolExecutor!.executeTools({
                    toolCalls,
                    tools: { getAllTools: () => tools, getTool: (name: string) => tools.find(t => t.name === name), addTool: () => {}, removeTool: () => {} },
                    context
                });

                // Generate response with tool results
                return await this.generateFinalResponse(message, toolResults, context);
            } else {
                // No tool calls needed, generate final response
                return await this.generateFinalResponse(message, null, context);
            }
        } catch (error) {
            console.error('Error in generateOneStep:', error);
            throw error;
        }
    }

    async generateWithToolExecution(input: AgentStepInput): Promise<AgentStepOutput> {
        try {
            const { message, tools, context } = input;
            
            // Analyze for tool calls
            const toolCalls = await this.analyzeForToolCalls(message, tools, context);
            
            if (toolCalls && toolCalls.length > 0) {
                // Execute tools
                const toolResults = await this.toolExecutor!.executeTools({
                    toolCalls,
                    tools: { getAllTools: () => tools, getTool: (name: string) => tools.find(t => t.name === name), addTool: () => {}, removeTool: () => {} },
                    context
                });

                // Generate response with tool results
                return await this.generateFinalResponse(message, toolResults, context);
            } else {
                // No tool calls needed, generate final response
                return await this.generateFinalResponse(message, null, context);
            }
        } catch (error) {
            console.error('Error in generateWithToolExecution:', error);
            throw error;
        }
    }

    async loop(input: AgentStepInput, maxIterations?: number): Promise<AgentStepOutput> {
        const maxIter = maxIterations || this.maxIterations;
        let currentMessage = input.message;
        let iteration = 0;

        while (iteration < maxIter) {
            iteration++;
            
            // Generate one step
            const stepResult = await this.generateOneStep({
                message: currentMessage,
                tools: input.tools,
                context: input.context
            });

            // Check if finished
            if (stepResult.finished) {
                return stepResult;
            }

            // Update message for next iteration
            currentMessage = stepResult.response;
        }

        // Max iterations reached
        return await this.generateFinalResponse(currentMessage, null, input.context);
    }

    // Abstract methods to be implemented by subclasses
    protected abstract analyzeForToolCalls(
        message: ProcessedMessage,
        tools: any[],
        context?: Record<string, any>
    ): Promise<Array<{ tool: string; parameters: any }> | null>;

    protected abstract generateFinalResponse(
        message: ProcessedMessage,
        toolResults: any,
        context?: Record<string, any>
    ): Promise<AgentStepOutput>;
}

// Generic LLM Agent Step that can work with any LLM
export interface LLMConfig {
    llmname?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    apiKey?: string;
    baseUrl?: string;
}

export interface LLMAgentStepOptions extends AgentStepOptions {
    llmconfig?: LLMConfig;
}

export class LLMAgentStep extends AgentStep {
    protected readonly llmConfig: LLMConfig;

    constructor(options: LLMAgentStepOptions = {}) {
        super(options);
        this.llmConfig = options.llmconfig || { llmname: "DefaultLLM" };
    }

    protected async analyzeForToolCalls(
        message: ProcessedMessage, 
        tools: any[], 
        context?: Record<string, any>
    ): Promise<Array<{ tool: string; parameters: any }> | null> {
        // Generic implementation that can work with any LLM
        // In a real scenario, you would call your LLM service here
        
        const lastMessage = message.messages[message.messages.length - 1];
        const content = typeof lastMessage.content === 'string' 
            ? lastMessage.content.toLowerCase() 
            : JSON.stringify(lastMessage.content).toLowerCase();
        
        const toolCalls: Array<{ tool: string; parameters: any }> = [];
        
        // Simple keyword-based tool detection (replace with actual LLM call)
        if (content.includes('read') && content.includes('file')) {
            const filePath = this.extractFilePath(content);
            if (filePath) {
                toolCalls.push({
                    tool: 'FileRead',
                    parameters: { filePath }
                });
            }
        }
        
        if (content.includes('write') && content.includes('file')) {
            const filePath = this.extractFilePath(content);
            if (filePath) {
                toolCalls.push({
                    tool: 'FileWrite',
                    parameters: { filePath, content: 'Content to be written' }
                });
            }
        }
        
        if (content.includes('delete') && content.includes('file')) {
            const filePath = this.extractFilePath(content);
            if (filePath) {
                toolCalls.push({
                    tool: 'FileDelete',
                    parameters: { filePath }
                });
            }
        }
        
        return toolCalls.length > 0 ? toolCalls : null;
    }

    protected async generateFinalResponse(
        message: ProcessedMessage, 
        toolResults: any,
        context?: Record<string, any>
    ): Promise<AgentStepOutput> {
        // Generic implementation that can work with any LLM
        // In a real scenario, you would call your LLM service here
        
        const lastMessage = message.messages[message.messages.length - 1];
        
        let responseContent = `I've processed your request: "${lastMessage.content}". Here's my response based on the available information.`;
        
        // Add tool results if available
        if (toolResults && toolResults.results) {
            const toolResultsText = toolResults.results
                .map((r: any) => `${r.tool}: ${r.success ? 'Success' : 'Failed'}`)
                .join(', ');
            responseContent += `\n\nTool execution results: ${toolResultsText}`;
        }
        
        const response: ProcessedMessage = {
            messages: [
                ...message.messages,
                {
                    role: 'assistant',
                    content: responseContent
                }
            ],
            metadata: {
                ...message.metadata,
                responseGenerated: true,
                timestamp: new Date().toISOString(),
                model: this.llmConfig.model || this.llmConfig.llmname || 'generic-llm'
            }
        };
        
        return {
            response,
            finished: true
        };
    }

    private extractFilePath(content: string): string | null {
        // Simple file path extraction (replace with more sophisticated parsing)
        const filePathMatch = content.match(/['"`]([^'"`]+\.\w+)['"`]/);
        return filePathMatch ? filePathMatch[1] : null;
    }
}
