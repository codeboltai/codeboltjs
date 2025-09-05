import type { 
    OpenAIMessage, 
    OpenAITool,
    ToolResult,
    CodeboltAPI 
} from '../types/libTypes';
import type {
    UnifiedAgentStep,
    UnifiedStepInput,
    UnifiedStepOutput,
    LLMConfig
} from '../types/types';
import {
    UnifiedStepExecutionError
} from '../types/types';

/**
 * Unified agent step that handles LLM interaction and tool call analysis
 */
export class AgentStep implements UnifiedAgentStep {
    private preLLmProcessors: Processor[];
    private postLLmProcessors: Processor[];
    private llmConfig: LLMConfig;
    private codebolt?: CodeboltAPI;
    private enableLogging: boolean;

    constructor(options: {
        llmConfig?: LLMConfig;
        codebolt?: CodeboltAPI;
        preLLmProcessors?: Processor[];
        postLLmProcessors?: Processor[];
        enableLogging?: boolean;
    } = {}) {
        this.preLLmProcessors = options.preLLmProcessors || [];
        this.postLLmProcessors = options.postLLmProcessors || [];
        this.llmConfig = options.llmConfig || { llmname: 'DefaultLLM' };
        this.codebolt = options.codebolt;
        this.enableLogging = options.enableLogging !== false;
    }

    /**
     * Execute a single agent step
     */
    async executeStep(input: UnifiedStepInput): Promise<UnifiedStepOutput> {
        try {
            if (this.enableLogging) {
                console.log('[UnifiedAgentStep] Executing step with:', {
                    messageCount: input.messages.length,
                    toolCount: input.tools.length,
                    toolChoice: input.toolChoice
                });
            }

            // Generate LLM response
            const llmResponse = await this.generateLLMResponse(input.messages, input.tools, input.context);

            

            // Determine if processing is finished
            const finished = this.isProcessingFinished(llmResponse, toolCalls);

            const output: UnifiedStepOutput = {
                llmResponse,
                finished,
                toolCalls: toolCalls || undefined,
                context: { ...input.context }
            };

            if (this.enableLogging) {
                console.log('[UnifiedAgentStep] Step completed:', {
                    finished: output.finished,
                    toolCallsCount: output.toolCalls?.length || 0
                });
            }

            return output;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new UnifiedStepExecutionError(
                `Failed to execute agent step: ${errorMessage}`,
                { input, llmConfig: this.llmConfig }
            );
        }
    }

    

    /**
     * Generate response using actual LLM service
     */
    private async generateLLMResponse(
        messages: OpenAIMessage[], 
        tools: OpenAITool[], 
        context?: Record<string, any>
    ): Promise<any> {
        // This would integrate with the actual LLM service
        // For now, return a mock structure that matches expected format
        const lastMessage = messages[messages.length - 1];
        const content = this.extractMessageContent(lastMessage.content);

        return {
            completion: {
                choices: [
                    {
                        message: {
                            role: 'assistant',
                            content: `I understand you want me to: ${content}. Let me help you with that.`,
                            tool_calls: [] // Would be populated by actual LLM
                        }
                    }
                ]
            }
        };
    }



    /**
     * Extract tool parameters from content
     */
    private extractToolParameters(content: string, tool: OpenAITool): any {
        const parameters: any = {};
        
        // Basic parameter extraction based on tool schema
        if (tool.function.parameters && tool.function.parameters.properties) {
            const properties = tool.function.parameters.properties;
            
            for (const [paramName, paramSchema] of Object.entries(properties)) {
                // Simple extraction logic - can be enhanced
                if (paramName.toLowerCase().includes('path') || paramName.toLowerCase().includes('file')) {
                    const filePath = this.extractFilePath(content);
                    if (filePath) {
                        parameters[paramName] = filePath;
                    }
                } else if (paramName.toLowerCase().includes('query') || paramName.toLowerCase().includes('search')) {
                    // Extract quoted strings as potential queries
                    const queryMatch = content.match(/["']([^"']+)["']/);
                    if (queryMatch) {
                        parameters[paramName] = queryMatch[1];
                    }
                }
            }
        }

        return parameters;
    }

    /**
     * Extract file path from content
     */
    private extractFilePath(content: string): string | null {
        // Look for file paths in quotes
        const filePathMatch = content.match(/['"`]([^'"`]+\.\w+)['"`]/);
        if (filePathMatch) {
            return filePathMatch[1];
        }

        // Look for common file extensions
        const extensionMatch = content.match(/(\S+\.(ts|js|tsx|jsx|py|java|cpp|c|h|md|txt|json|yaml|yml|xml|html|css))/i);
        if (extensionMatch) {
            return extensionMatch[1];
        }

        return null;
    }

    /**
     * Extract content from OpenAI message format
     */
    private extractMessageContent(content: string | Array<{ type: string; text: string }>): string {
        if (typeof content === 'string') {
            return content;
        }

        if (Array.isArray(content)) {
            return content
                .filter(block => block.type === 'text')
                .map(block => block.text)
                .join(' ');
        }

        return JSON.stringify(content);
    }

    /**
     * Determine if processing is finished
     */
    private isProcessingFinished(llmResponse: any, toolCalls: Array<{ tool: string; parameters: any }> | null): boolean {
        // Check if LLM response indicates completion
        if (llmResponse && llmResponse.completion && llmResponse.completion.choices) {
            const choice = llmResponse.completion.choices[0];
            if (choice && choice.message) {
                const content = choice.message.content || '';
                
                // Check for completion indicators
                if (content.toLowerCase().includes('task completed') ||
                    content.toLowerCase().includes('finished') ||
                    choice.message.tool_calls?.some((tc: any) => tc.function.name.includes('attempt_completion'))) {
                    return true;
                }
            }
        }

        // If no tool calls are needed, consider it finished
        return !toolCalls || toolCalls.length === 0;
    }

    /**
     * Update LLM configuration
     */
    setLLMConfig(config: LLMConfig): void {
        this.llmConfig = { ...this.llmConfig, ...config };
    }

    /**
     * Get current LLM configuration
     */
    getLLMConfig(): LLMConfig {
        return { ...this.llmConfig };
    }
}

/**
 * Factory function to create a unified agent step
 */
export function createUnifiedAgentStep(options: {
    llmConfig?: LLMConfig;
    codebolt?: CodeboltAPI;
    enableLogging?: boolean;
} = {}): UnifiedAgentStep {
    return new UnifiedAgentStepImpl(options);
}

/**
 * Create a basic agent step with default configuration
 */
export function createBasicAgentStep(): UnifiedAgentStep {
    return new UnifiedAgentStepImpl({
        llmConfig: { llmname: 'DefaultLLM', temperature: 0.7 },
        enableLogging: true
    });
}
