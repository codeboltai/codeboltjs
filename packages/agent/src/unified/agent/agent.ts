/**
 * Unified Agent - Core implementation that orchestrates message processing, agent steps, and response execution
 */

import { z } from 'zod';
import { InitialPromptGenerator } from '../base';
import { AgentStep } from '../base/agentStep';
import { ResponseExecutor } from '../base/responseExecutor';
import { BaseMessageModifier, BasePostInferenceProcessor, BasePostToolCallProcessor, BasePreInferenceProcessor, BasePreToolCallProcessor } from 'src/processor-pieces/base';
import { AgentConfig, AgentInterface, MessageModifier, PreToolCallProcessor } from '@codebolt/types/agent';
import { MessageObject } from '@codebolt/types/sdk';


// Tool-related types and interfaces
export interface ToolConfig<TInput = unknown, TOutput = unknown> {
    id: string;
    name: string;
    description: string;
    inputSchema: z.ZodType<TInput>;
    outputSchema?: z.ZodType<TOutput>;
    execute: (params: { 
        input: TInput; 
        context?: Record<string, unknown>;
        agent?: UnifiedAgent;
    }) => Promise<TOutput> | TOutput;
    timeout?: number;
    retries?: number;
    category?: string;
    tags?: string[];
}

export interface Tool<TInput = unknown, TOutput = unknown> extends ToolConfig<TInput, TOutput> {
    validateInput: (input: unknown) => TInput;
    validateOutput?: (output: unknown) => TOutput;
    toOpenAITool: () => OpenAITool;
}

export interface ExecutionResult {
    success: boolean;
    response: string;
    error?: string;
    conversationHistory: OpenAIMessage[];
    toolResults: ToolResult[];
    metadata: Record<string, unknown>;
    iterations: number;
}

export interface ExecutionOptions {
    maxIterations?: number;
    stream?: boolean;
    callback?: (chunk: { type: string; content: string }) => void;
    context?: Record<string, unknown>;
}

/**
 * Unified Agent that provides both framework-level control and comprehensive functionality
 */
export class Agent implements AgentInterface {
    private messageModifier: InitialPromptGenerator;
    private agentStep: AgentStep;
    private responseExecutor: ResponseExecutor;
    private config: AgentConfig;
    // private eventHandlers: Map<UnifiedAgentEventType, UnifiedAgentEventHandler[]> = new Map();
    private tools: Map<string, Tool> = new Map();
    private conversation: MessageObject[] = [];

    constructor(config: AgentConfig) {
        this.config = {
            maxIterations: 10,
            maxConversationLength: 50,
            enableLogging: true,
            ...config
        };

        // Register tools if provided
        if (config.tools) {
            config.tools.forEach(tool => this.addTool(tool));
        }

        // Initialize components with config
        this.messageModifier = new InitialPromptGenerator({
            enableLogging: this.config.enableLogging
        });

        this.agentStep = new AgentStep();

        this.responseExecutor = new ResponseExecutor({
            preToolCalProcessors: config.processors?.preToolCallProcessors || [],
            postToolCallProcessors: config.processors?.postToolCallProcessors || []
        });

        // Setup processors
        this.setupProcessors(config);

        // Initialize conversation with system message if provided
        if (config.instructions) {
            this.conversation = [{
                role: 'system',
                content: config.instructions
            }];
        }

        if (this.config.enableLogging) {
            console.log('[UnifiedAgent] Initialized with config:', this.config);
        }
    }

    /**
     * Setup processors (default + custom)
     */
    private setupProcessors(config: {
        defaultProcessors?: boolean;
        processors?: {
            messageModifiers?: MessageModifier[];
       
            preToolCall?: PreToolCallProcessor[];
        };
    }): void {
        // Setup message modifiers
        if (config.defaultProcessors !== false) {
            // Add default message modifier processors if needed
        }
        
        if (config.processors?.messageModifiers) {
            // Note: messageModifiers in config are Processor type, but InitialPromptGenerator expects MessageModifier
            // This would need to be addressed based on the actual processor implementation
            console.warn('[UnifiedAgent] Message modifier processors need to implement MessageModifier interface');
        }

        // Setup response executor with processors
  
        const preToolCallProcessors: PreToolCallProcessor[] = [];

        if (config.defaultProcessors !== false) {
          

            // Add default pre-tool call processors
            preToolCallProcessors.push(
                new ToolValidationProcessor({
                    enableParameterValidation: true,
                    enableSecurityValidation: true,
                    enableTypeValidation: true,
                    strictMode: false
                }),
                new ToolParameterModifierProcessor({
                    enableParameterTransformation: true,
                    enableParameterEnrichment: true,
                    enableParameterSanitization: true
                })
            );
        }

        // Add custom processors
        if (config.processors?.followUpConversation) {
            followUpProcessors.push(...config.processors.followUpConversation);
        }

        if (config.processors?.preToolCall) {
            preToolCallProcessors.push(...config.processors.preToolCall);
        }

        // Set processors on response executor
        followUpProcessors.forEach(processor => {
            this.responseExecutor.addFollowUpConversationProcessor(processor);
        });

        preToolCallProcessors.forEach(processor => {
            this.responseExecutor.addPreToolCallProcessor(processor);
        });
    }

    /**
     * Execute agent with single step processing
     */
    async execute(input: UnifiedAgentInput): Promise<UnifiedAgentOutput> {
        try {
            this.emitEvent('step_started', { input });

            // Process message using FlatUserMessage format
            const processedMessage = await this.messageModifier.processMessage(input.userMessage);

            this.emitEvent('message_processed', { processedMessage });

            // Convert tools
            const tools = input.tools || Array.from(this.tools.values()).map(tool => tool.toOpenAITool());

            // Execute agent step
            const stepOutput = await this.agentStep.executeStep({
                messages: processedMessage.messages,
                tools,
                context: input.context,
                toolChoice: 'auto'
            });

            this.emitEvent('step_completed', { stepOutput });

            // Execute response
            const responseOutput = await this.responseExecutor.executeResponse({
                llmResponse: stepOutput.llmResponse,
                conversationHistory: [...(input.conversationHistory || []), ...processedMessage.messages],
                tools,
                context: stepOutput.context
            });

            this.emitEvent('response_generated', { responseOutput });

            // Build final output
            const finalOutput: UnifiedAgentOutput = {
                response: responseOutput.finalMessage || this.extractResponseMessage(stepOutput.llmResponse),
                toolResults: responseOutput.toolResults,
                conversationHistory: responseOutput.conversationHistory,
                context: stepOutput.context,
                completed: responseOutput.completed,
                iterations: 1
            };

            this.emitEvent('agent_completed', { output: finalOutput });

            return finalOutput;

        } catch (error) {
            const agentError = error instanceof Error ? error : new Error(String(error));
            this.emitEvent('agent_error', { error: agentError });
            throw agentError;
        }
    }

    /**
     * Execute single step (alias for execute)
     */
    async step(input: UnifiedAgentInput): Promise<UnifiedAgentOutput> {
        return this.execute(input);
    }

    /**
     * Execute with loop until completion or max iterations
     */
    async loop(input: UnifiedAgentInput): Promise<UnifiedAgentOutput> {
        const maxIterations = input.maxIterations || this.config.maxIterations || 10;
        let currentInput = { ...input };
        let iteration = 0;

        this.emitEvent('iteration_started', { iteration: 0, maxIterations });

        while (iteration < maxIterations) {
            iteration++;
            
            this.emitEvent('iteration_started', { iteration, maxIterations });

            // Execute one step
            const stepResult = await this.execute(currentInput);

            this.emitEvent('iteration_completed', { iteration, stepResult });

            // Check if finished
            if (stepResult.completed) {
                const finalOutput: UnifiedAgentOutput = {
                    ...stepResult,
                    iterations: iteration
                };

                this.emitEvent('agent_completed', { output: finalOutput });
                return finalOutput;
            }

            // Prepare for next iteration
            currentInput = {
                ...currentInput,
                conversationHistory: stepResult.conversationHistory,
                context: stepResult.context
            };

            // Add any follow-up message if needed
            if (stepResult.toolResults.length === 0) {
                const followUpMessage: OpenAIMessage = {
                    role: "user",
                    content: "Continue with the next step of the task. If you have completed the user's task, use the attempt_completion tool."
                };
                
                currentInput.conversationHistory = [
                    ...(currentInput.conversationHistory || []),
                    followUpMessage
                ];
            }
        }

        // Max iterations reached
        const finalOutput: UnifiedAgentOutput = {
            response: `Maximum iterations (${maxIterations}) reached. Task may not be fully completed.`,
            toolResults: [],
            conversationHistory: currentInput.conversationHistory || [],
            context: currentInput.context || {},
            completed: false,
            iterations: maxIterations
        };

        this.emitEvent('agent_completed', { output: finalOutput });
        return finalOutput;
    }

    /**
     * Add message modifier
     */
    addMessageModifier(modifier: UnifiedMessageProcessor): void {
        this.messageModifier = modifier;
        if (this.config.enableLogging) {
            console.log('[UnifiedAgent] Message modifier updated');
        }
    }

    /**
     * Set agent step processor
     */
    setAgentStep(agentStep: UnifiedAgentStep): void {
        this.agentStep = agentStep;
        if (this.config.enableLogging) {
            console.log('[UnifiedAgent] Agent step updated');
        }
    }

    /**
     * Set response executor
     */
    setResponseExecutor(executor: ResponseExecutor): void {
        this.responseExecutor = executor;
        if (this.config.enableLogging) {
            console.log('[UnifiedAgent] Response executor updated');
        }
    }

    /**
     * Add a tool to the agent
     */
    addTool(tool: Tool): void {
        this.tools.set(tool.id, tool);
        
        if (this.config.enableLogging) {
            console.log(`[UnifiedAgent] Added tool: ${tool.id}`);
        }
    }

    /**
     * Remove a tool from the agent
     */
    removeTool(toolId: string): boolean {
        const removed = this.tools.delete(toolId);
        
        if (removed && this.config.enableLogging) {
            console.log(`[UnifiedAgent] Removed tool: ${toolId}`);
        }
        
        return removed;
    }

    /**
     * Get all tools
     */
    getTools(): Tool[] {
        return Array.from(this.tools.values());
    }

    /**
     * Get a specific tool
     */
    getTool(toolId: string): Tool | undefined {
        return this.tools.get(toolId);
    }

    /**
     * Add a processor to the agent
     */
    addProcessor(type: 'followUpConversation' | 'preToolCall', processor: Processor): void {
        switch (type) {
            case 'followUpConversation':
                this.responseExecutor.addFollowUpConversationProcessor(processor);
                break;
            case 'preToolCall':
                this.responseExecutor.addPreToolCallProcessor(processor);
                break;
        }

        if (this.config.enableLogging) {
            console.log(`[UnifiedAgent] Added ${type} processor:`, processor.constructor.name);
        }
    }

    /**
     * Remove a processor from the agent
     */
    removeProcessor(type: 'followUpConversation' | 'preToolCall', processor: Processor): boolean {
        let removed = false;
        
        switch (type) {
            case 'followUpConversation':
                removed = this.responseExecutor.removeFollowUpConversationProcessor(processor);
                break;
            case 'preToolCall':
                removed = this.responseExecutor.removePreToolCallProcessor(processor);
                break;
        }

        if (removed && this.config.enableLogging) {
            console.log(`[UnifiedAgent] Removed ${type} processor:`, processor.constructor.name);
        }
        
        return removed;
    }

    /**
     * Get conversation history
     */
    getConversation(): OpenAIMessage[] {
        return [...this.conversation];
    }

    /**
     * Clear conversation history (keeps system message)
     */
    clearConversation(): void {
        const systemMessage = this.conversation.find(msg => msg.role === 'system');
        this.conversation = systemMessage ? [systemMessage] : [];
    }

    /**
     * Add a message to the conversation
     */
    addMessage(message: OpenAIMessage): void {
        this.conversation.push(message);
    }

    /**
     * Add event handler
     */
    addEventListener(eventType: UnifiedAgentEventType, handler: UnifiedAgentEventHandler): void {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, []);
        }
        this.eventHandlers.get(eventType)!.push(handler);
    }

    /**
     * Remove event handler
     */
    removeEventListener(eventType: UnifiedAgentEventType, handler: UnifiedAgentEventHandler): boolean {
        const handlers = this.eventHandlers.get(eventType);
        if (handlers) {
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
                return true;
            }
        }
        return false;
    }

    /**
     * Emit event to all registered handlers
     */
    private emitEvent(eventType: UnifiedAgentEventType, data?: unknown): void {
        const event: UnifiedAgentEvent = {
            type: eventType,
            data,
            timestamp: new Date().toISOString(),
            context: this.getEventContext()
        };

        const handlers = this.eventHandlers.get(eventType);
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(event);
                } catch (error) {
                    if (this.config.enableLogging) {
                        console.error(`[UnifiedAgent] Error in event handler for ${eventType}:`, error);
                    }
                }
            });
        }

        if (this.config.enableLogging) {
            console.log(`[UnifiedAgent] Event emitted: ${eventType}`, data);
        }
    }

    /**
     * Get context for events
     */
    private getEventContext(): Record<string, unknown> {
        return {
            agentId: this.constructor.name,
            timestamp: new Date().toISOString(),
            config: {
                maxIterations: this.config.maxIterations,
                maxConversationLength: this.config.maxConversationLength
            }
        };
    }

    /**
     * Extract response message from LLM response
     */
    private extractResponseMessage(llmResponse: unknown): string {
        try {
            if (llmResponse && typeof llmResponse === 'object' && 'completion' in llmResponse) {
                const response = llmResponse as { completion?: { choices?: Array<{ message?: { content?: string } }>; content?: string } };
                const completion = response.completion;
                if (completion && completion.choices && completion.choices.length > 0) {
                    const choice = completion.choices[0];
                    if (choice && choice.message && typeof choice.message.content === 'string') {
                        return choice.message.content;
                    }
                }
                
                if (completion && typeof completion.content === 'string') {
                    return completion.content;
                }
            }

            return 'Response generated successfully';
        } catch {
            return 'Error extracting response message';
        }
    }

    /**
     * Update agent configuration
     */
    updateConfig(newConfig: Partial<UnifiedAgentConfig>): void {
        this.config = { ...this.config, ...newConfig };
        
        if (this.config.enableLogging) {
            console.log('[UnifiedAgent] Configuration updated:', newConfig);
        }
    }

    /**
     * Get current configuration
     */
    getConfig(): UnifiedAgentConfig {
        return { ...this.config };
    }

    /**
     * Get component instances (for advanced usage)
     */
    getComponents(): {
        messageModifier: UnifiedMessageProcessor;
        agentStep: UnifiedAgentStep;
        responseExecutor: UnifiedResponseExecutor;
    } {
        return {
            messageModifier: this.messageModifier,
            agentStep: this.agentStep,
            responseExecutor: this.responseExecutor
        };
    }

    /**
     * Reset agent state
     */
    reset(): void {
        this.messageModifier.clearContext();
        this.eventHandlers.clear();
        this.clearConversation();
        
        if (this.config.enableLogging) {
            console.log('[UnifiedAgent] Agent state reset');
        }
    }

    /**
     * Create an OpenAI-compatible tool from this agent
     */
    toOpenAITool(): Tool {
        return {
            type: 'function',
            function: {
                name: `unified_agent`,
                description: `Execute unified agent with comprehensive processing capabilities`,
                parameters: {
                    type: 'object',
                    properties: {
                        userMessage: {
                            type: 'object',
                            description: 'FlatUserMessage to process'
                        },
                        context: {
                            type: 'object',
                            description: 'Additional context data',
                            additionalProperties: true
                        },
                        maxIterations: {
                            type: 'number',
                            description: 'Maximum iterations for agent execution',
                            minimum: 1,
                            maximum: 20
                        }
                    },
                    required: ['userMessage'],
                    additionalProperties: false
                }
            }
        };
    }
}

/**
 * Factory function to create a unified agent
 */
export function createUnifiedAgent(config: UnifiedAgentConfig & {
    name?: string;
    instructions?: string;
    tools?: Tool[];
    processors?: {
        messageModifiers?: Processor[];
        followUpConversation?: Processor[];
        preToolCall?: Processor[];
    };
    defaultProcessors?: boolean;
} = {}): UnifiedAgent {
    return new UnifiedAgent(config);
}

/**
 * Create a basic unified agent with default configuration
 */
export function createBasicUnifiedAgent(codebolt?: CodeboltAPI): UnifiedAgent {
    return new UnifiedAgent({
        maxIterations: 10,
        maxConversationLength: 50,
        enableLogging: true,
        codebolt,
        llmConfig: {
            llmname: 'DefaultLLM',
            temperature: 0.7
        }
    });
}

/**
 * Create a production-ready unified agent
 */
export function createProductionUnifiedAgent(config: {
    codebolt: CodeboltAPI;
    llmConfig: {
        llmname: string;
        model?: string;
        temperature?: number;
        maxTokens?: number;
    };
    maxIterations?: number;
    maxConversationLength?: number;
    instructions?: string;
    tools?: Tool[];
}): UnifiedAgent {
    return new UnifiedAgent({
        maxIterations: config.maxIterations || 15,
        maxConversationLength: config.maxConversationLength || 100,
        enableLogging: false, // Disable verbose logging in production
        codebolt: config.codebolt,
        llmConfig: config.llmConfig,
        instructions: config.instructions,
        tools: config.tools,
        retryConfig: {
            maxRetries: 3,
            retryDelay: 1000
        }
    });
}