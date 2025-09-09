import { PostInferenceProcessor, PreInferenceProcessor,AgentStepInterface, AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';

import * as codebolt from '@codebolt/codeboltjs'


import {
    UnifiedStepExecutionError
} from '../types/types';
import { Tool,MessageObject, FlatUserMessage ,LLMInferenceParams, LLMCompletion} from '@codebolt/types/sdk';


/**
 * Unified agent step that handles LLM interaction and tool call analysis
 */
export class AgentStep implements AgentStepInterface {
    private preLLmProcessors: PreInferenceProcessor[];
    private postLLmProcessors: PostInferenceProcessor[];
    private llmRole: string;
 
 

    private enableLogging: boolean;

    constructor(options: {
        preLLmProcessors?: PreInferenceProcessor[];
        postLLmProcessors?: PostInferenceProcessor[];
        llmRole?: string;
        enableLogging?: boolean;
    } = {}) {
      
        this.preLLmProcessors = options.preLLmProcessors || [];
        this.postLLmProcessors = options.postLLmProcessors || [];
        this.llmRole = options.llmRole || 'default'
        this.enableLogging = options.enableLogging !== false;
    }

    /**
     * Execute a single agent step
     */
    async executeStep(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<AgentStepOutput> {
        try {
            if (this.enableLogging) {
                console.log('[UnifiedAgentStep] Executing step with:', {
                    messageCount: createdMessage.message.messages.length,
                    toolCount: 0,
                    toolChoice: 'auto'
                });
            }


            for (const preLLMProcessor of this.preLLmProcessors) {
                try {
                    // Each modifier returns a new ProcessedMessage
                   createdMessage= await preLLMProcessor.modify(originalRequest,createdMessage);

                } catch (error) {
                    console.error(`[InitialPromptGenerator] Error in message modifier:`, error);
                    // Continue with other modifiers
                }
            }


            // Generate LLM response
            const llmResponse = await this.generateResponse(createdMessage.message);

            // Extract tool calls from LLM response
            const toolCalls = this.extractToolCalls(llmResponse);

            // Determine if processing is finished
            const finished = this.isProcessingFinished(llmResponse, toolCalls);

            const output: AgentStepOutput = {
                rawLLMResponse:llmResponse,
                metaData: createdMessage.metadata || {},
                nextMessage:createdMessage
            };

            if (this.enableLogging) {
                console.log('[UnifiedAgentStep] Step completed:', {
                    finished: output.rawLLMResponse.finish_reason,
                    toolCallsCount: output.rawLLMResponse.tool_calls?.length || 0
                });
            }

            return output;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new Error(`Failed to execute agent step: ${errorMessage}`);
        }
    }

    /**
     * Extract tool calls from LLM response
     */
    private extractToolCalls(llmResponse: any): Array<{ tool: string; parameters: any }> | null {
        if (llmResponse?.completion?.choices?.[0]?.message?.tool_calls) {
            return llmResponse.completion.choices[0].message.tool_calls.map((tc: any) => ({
                tool: tc.function.name,
                parameters: tc.function.arguments
            }));
        }
        return null;
    }

    /**
     * Generate response using actual LLM service
     */
   private  async generateResponse(messageForLLM:LLMInferenceParams): Promise<LLMCompletion> {
      const response = await codebolt.default.llm.inference(messageForLLM)
      return response.completion
    }



    /**
     * Extract tool parameters from content
     */
    private extractToolParameters(content: string, tool: Tool): any {
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
    private extractMessageContent(content: string | Array<{ type: string; text?: string; image_url?: { url: string; } }>): string {
        if (typeof content === 'string') {
            return content;
        }

        if (Array.isArray(content)) {
            return content
                .filter(block => block.type === 'text' && block.text)
                .map(block => block.text!)
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
    setLLMConfig(config: string): void {
        this.llmRole =config
    }

    /**
     * Get current LLM configuration
     */
    getLLMConfig(): string {
        return  this.llmRole ;
    }
}

/**
 * Factory function to create a unified agent step
 */
// export function createUnifiedAgentStep(options: {
//     llmConfig?: LLMConfig;
//     codebolt?: CodeboltAPI;
//     enableLogging?: boolean;
// } = {}): UnifiedAgentStep {
//     return new UnifiedAgentStepImpl(options);
// }

/**
 * Create a basic agent step with default configuration
 */
// export function createBasicAgentStep(): UnifiedAgentStep {
//     return new UnifiedAgentStepImpl({
//         llmConfig: { llmname: 'DefaultLLM', temperature: 0.7 },
//         enableLogging: true
//     });
// }