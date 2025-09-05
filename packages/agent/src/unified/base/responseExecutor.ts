import codeboltjs from "@codebolt/codeboltjs";
const { chatSummary } = codeboltjs;

import type { 
    OpenAIMessage, 
    OpenAITool, 
    ToolResult,
    CodeboltAPI 
} from '../types/libTypes';
import type {
    Processor,
    ProcessorInput,
    ProcessedMessage
} from '../types/processorTypes';

// ToolDetails type for internal use
interface ToolDetails {
    name: string;
    toolName: string;
    arguments: Record<string, unknown>;
    toolCallId: string;
    toolUseId: string;
    toolInput: Record<string, unknown>;
}
import type {
    UnifiedResponseExecutor,
    UnifiedResponseInput,
    UnifiedResponseOutput
} from '../types/types';
import {
    UnifiedResponseExecutionError,
    UnifiedToolExecutionError
} from '../types/types';

// Helper function to create tool result message
function createToolResultMessage(toolCallId: string, content: string): OpenAIMessage {
    return {
        role: 'tool',
        tool_call_id: toolCallId,
        content: content
    };
}

// Helper function to create tool result object
function createToolResultObj(toolCallId: string, toolName: string, result: string, success: boolean = true): ToolResult {
    return {
        toolCallId,
        toolName,
        result,
        success
    };
}

/**
 * Unified response executor that handles tool execution and conversation management
 */
export class ResponseExecutor implements UnifiedResponseExecutor {
    private codebolt?: CodeboltAPI;
    private maxConversationLength: number;
    private enableLogging: boolean;
    private maxRetries: number;
    private retryDelay: number;
    private followUpConversationProcessors: Processor[] = [];
    private preToolCallProcessors: Processor[] = [];

    constructor(options: {
        codebolt?: CodeboltAPI;
        maxConversationLength?: number;
        enableLogging?: boolean;
        maxRetries?: number;
        retryDelay?: number;
        followUpConversationProcessors?: Processor[];
        preToolCallProcessors?: Processor[];
    } = {}) {
        this.codebolt = options.codebolt;
        this.maxConversationLength = options.maxConversationLength || 50;
        this.enableLogging = options.enableLogging !== false;
        this.maxRetries = options.maxRetries || 3;
        this.retryDelay = options.retryDelay || 1000;
        this.followUpConversationProcessors = options.followUpConversationProcessors || [];
        this.preToolCallProcessors = options.preToolCallProcessors || [];
    }

    /**
     * Execute response processing including tool execution and conversation management
     */
    async executeResponse(input: UnifiedResponseInput): Promise<UnifiedResponseOutput> {
        try {
            if (this.enableLogging) {
                console.log('[UnifiedResponseExecutor] Executing response processing');
            }

            let completed = false;
            let finalMessage: string | undefined;
            let nextUserMessage: OpenAIMessage | null = null;
            let toolResults: ToolResult[] = [];

            // Check if LLM response has tool calls
            const hasToolCalls = this.hasToolCalls(input.llmResponse);
            
            if (hasToolCalls) {
                // Execute tools
                toolResults = await this.executeTools(input.llmResponse, input.tools, input.context);
                
                // Check if any tool indicates completion
                completed = this.checkToolCompletionStatus(toolResults, input.llmResponse);
            } else {
                // No tool calls, send message to user and mark as completed
                finalMessage = await this.sendMessageToUser(input.llmResponse);
                completed = true;
            }

            // Build updated conversation history
            const conversationHistory = await this.buildFollowUpConversation(
                input.conversationHistory,
                toolResults,
                input.llmResponse
            );

            // Check if we need to add a follow-up message
            if (!completed && toolResults.length === 0) {
                nextUserMessage = {
                    role: "user",
                    content: "If you have completed the user's task, use the attempt_completion tool. If you require additional information from the user, use the ask_followup_question tool. Otherwise, if you have not completed the task and do not need additional information, then proceed with the next step of the task. (This is an automated message, so do not respond to it conversationally.)"
                };
            }

            const output: UnifiedResponseOutput = {
                toolResults,
                nextUserMessage,
                conversationHistory,
                completed,
                finalMessage
            };

            if (this.enableLogging) {
                console.log('[UnifiedResponseExecutor] Response processing completed:', {
                    completed: output.completed,
                    toolResultsCount: output.toolResults.length,
                    hasNextUserMessage: !!output.nextUserMessage
                });
            }

            return output;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new UnifiedResponseExecutionError(
                `Failed to execute response: ${errorMessage}`,
                { input }
            );
        }
    }

    /**
     * Execute tools from LLM response
     */
    async executeTools(
        llmResponse: unknown, 
        tools: OpenAITool[], 
        context?: Record<string, any>
    ): Promise<ToolResult[]> {
        try {
            if (!this.hasToolCalls(llmResponse)) {
                return [];
            }

            const toolResults: ToolResult[] = [];
            let userRejectedToolUse = false;
            let taskCompletedBlock: any;

            if (this.enableLogging) {
                console.log('[UnifiedResponseExecutor] Executing tools from LLM response');
            }

            if (!this.isValidLLMResponse(llmResponse)) {
                return [];
            }
            
            const contentBlock = llmResponse.completion.choices[0];
            
            if (!contentBlock || !contentBlock.message || !contentBlock.message.tool_calls) {
                return [];
            }

            // Process each tool call
            for (const tool of contentBlock.message.tool_calls) {
                try {
                    const { toolInput, toolName, toolUseId } = this.getToolDetail(tool);

                    if (!userRejectedToolUse) {
                        if (toolName.includes("attempt_completion")) {
                            taskCompletedBlock = tool;
                        } else {
                            // Apply pre-tool call processors
                            const preProcessResult = await this.applyPreToolCallProcessors(
                                toolName, 
                                toolInput, 
                                toolUseId, 
                                { tools, context, llmResponse }
                            );

                            if (preProcessResult.intercepted) {
                                // Tool was intercepted and handled by a processor
                                toolResults.push(createToolResultObj(
                                    toolUseId,
                                    toolName,
                                    preProcessResult.result || 'Tool intercepted',
                                    true
                                ));

                                if (preProcessResult.userRejected) {
                                    userRejectedToolUse = true;
                                }
                            } else {
                                // Execute the tool normally
                                const [didUserReject, result] = await this.executeSingleTool(toolName, toolInput);
                                
                                toolResults.push(createToolResultObj(
                                    toolUseId,
                                    toolName,
                                    result,
                                    !didUserReject
                                ));

                                if (didUserReject) {
                                    userRejectedToolUse = true;
                                }
                            }
                        }
                    } else {
                        // Skip tool execution due to previous rejection
                        const toolResult = this.getToolResult(
                            toolUseId, 
                            "Skipping tool execution due to previous tool user rejection."
                        );

                        toolResults.push(createToolResultObj(
                            toolResult.toolCallId || 'unknown',
                            'skipped',
                            toolResult.result || 'Skipped due to user rejection',
                            false
                        ));
                    }

                } catch (error) {
                    // Add error result
                    const toolId = this.isValidToolCall(tool) ? tool.id : "unknown";
                    const toolName = this.isValidToolCall(tool) && tool.function ? tool.function.name : 'unknown';
                    toolResults.push(createToolResultObj(
                        toolId,
                        toolName,
                        String(error),
                        false
                    ));
                }
            }

            // Handle task completion
            if (taskCompletedBlock) {
                const taskResult = await this.handleTaskCompletion(taskCompletedBlock);
                toolResults.push(taskResult);
            }

            return toolResults;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new UnifiedToolExecutionError(
                `Failed to execute tools: ${errorMessage}`,
                { llmResponse, tools, context }
            );
        }
    }

    /**
     * Build follow-up conversation with tool results
     */
    async buildFollowUpConversation(
        conversationHistory: OpenAIMessage[], 
        toolResults: ToolResult[], 
        llmResponse: unknown
    ): Promise<OpenAIMessage[]> {
        try {
            let updatedHistory = [...conversationHistory];

            // Add the assistant's response to conversation
            const assistantMessage = this.extractAssistantMessage(llmResponse);
            if (assistantMessage) {
                updatedHistory.push(assistantMessage);
            }

            // Add tool results to conversation
            if (toolResults.length > 0) {
                const toolMessages = toolResults.map(result => 
                    createToolResultMessage(result.toolCallId, result.result)
                );
                updatedHistory.push(...toolMessages);
            }

            // Apply follow-up conversation processors
            updatedHistory = await this.applyFollowUpConversationProcessors(updatedHistory, {
                toolResults,
                llmResponse,
                originalHistory: conversationHistory
            });

            return updatedHistory;

        } catch (error) {
            if (this.enableLogging) {
                console.error('[UnifiedResponseExecutor] Error building follow-up conversation:', error);
            }
            // Return original history with tool results if processing fails
            const toolMessages = toolResults.map(result => 
                createToolResultMessage(result.toolCallId, result.result)
            );
            return [...conversationHistory, ...toolMessages];
        }
    }

    /**
     * Check if conversation needs summarization
     */
    shouldSummarizeConversation(conversationHistory: OpenAIMessage[]): boolean {
        return conversationHistory.length > this.maxConversationLength;
    }

    /**
     * Apply follow-up conversation processors
     */
    private async applyFollowUpConversationProcessors(
        conversationHistory: OpenAIMessage[],
        context: {
            toolResults: ToolResult[];
            llmResponse: unknown;
            originalHistory: OpenAIMessage[];
        }
    ): Promise<OpenAIMessage[]> {
        try {
            if (this.followUpConversationProcessors.length === 0) {
                return conversationHistory;
            }

            // Convert OpenAI messages to ProcessedMessage format for processors
            let processedMessage: ProcessedMessage = {
                messages: conversationHistory.map(msg => ({
                    role: msg.role,
                    content: msg.content,
                    tool_call_id: msg.tool_call_id,
                    tool_calls: msg.tool_calls
                })),
                metadata: {
                    followUpProcessing: true,
                    toolResultsCount: context.toolResults.length,
                    originalHistoryLength: context.originalHistory.length,
                    timestamp: new Date().toISOString()
                }
            };

            // Apply each processor in sequence
            for (const processor of this.followUpConversationProcessors) {
                try {
                    const processorInput: ProcessorInput = {
                        message: processedMessage,
                        context: {
                            ...context,
                            conversationLength: processedMessage.messages.length,
                            maxConversationLength: this.maxConversationLength
                        }
                    };

                    const results = await processor.processInput(processorInput);
                    
                    // Find the processed message from results
                    const messageEvent = results.find(r => 
                        r.type === 'MessageProcessed' || 
                        r.type === 'ConversationProcessed' ||
                        r.type === 'ConversationCompacted' ||
                        r.type === 'ConversationSummarized'
                    );
                    
                    if (messageEvent && messageEvent.value && 
                        typeof messageEvent.value === 'object' && 
                        'messages' in messageEvent.value) {
                        processedMessage = messageEvent.value as ProcessedMessage;
                    }

                    // Log processor events
                    if (this.enableLogging) {
                        results.forEach(result => {
                            console.log(`[UnifiedResponseExecutor] Processor event: ${result.type}`, result.value);
                        });
                    }

                } catch (error) {
                    if (this.enableLogging) {
                        console.error(`[UnifiedResponseExecutor] Error in follow-up processor:`, error);
                    }
                    // Continue with other processors
                }
            }

            // Convert back to OpenAI format
            return processedMessage.messages.map(msg => ({
                role: msg.role as 'system' | 'user' | 'assistant' | 'tool',
                content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
                tool_call_id: msg.tool_call_id,
                tool_calls: msg.tool_calls as OpenAIMessage['tool_calls']
            }));

        } catch (error) {
            if (this.enableLogging) {
                console.error('[UnifiedResponseExecutor] Error applying follow-up processors:', error);
            }
            return conversationHistory;
        }
    }

    /**
     * Summarize conversation to reduce length
     */
    async summarizeConversation(conversationHistory: OpenAIMessage[]): Promise<OpenAIMessage[]> {
        try {
            if (this.enableLogging) {
                console.log('[UnifiedResponseExecutor] Summarizing conversation:', conversationHistory.length);
            }

            // Convert to format expected by chatSummary
            const messagesToSummarize = conversationHistory.map(msg => ({
                role: msg.role,
                content: typeof msg.content === 'string' ? msg.content : 
                        Array.isArray(msg.content) ? msg.content.map(c => c.text).join(' ') : 
                        String(msg.content)
            }));

            // Use chat summary service
            const summaryResponse = await chatSummary.summarize(
                messagesToSummarize, 
                Math.floor(this.maxConversationLength / 2)
            ) as { payload?: string; summary?: string; };
            
            if (summaryResponse.payload || summaryResponse.summary) {
                const summaryText = summaryResponse.payload || summaryResponse.summary || '';
                
                // Keep system message if it exists
                const systemMessage = conversationHistory.find(msg => msg.role === 'system');
                const summarizedMessages: OpenAIMessage[] = [];
                
                if (systemMessage) {
                    summarizedMessages.push(systemMessage);
                }
                
                // Add summary as system message
                summarizedMessages.push({
                    role: 'system',
                    content: `Previous conversation summary: ${summaryText}`
                });
                
                // Keep last few messages for context
                const recentMessages = conversationHistory.slice(-5);
                summarizedMessages.push(...recentMessages);
                
                return summarizedMessages;
            }

            return conversationHistory;

        } catch (error) {
            if (this.enableLogging) {
                console.error('[UnifiedResponseExecutor] Error summarizing conversation:', error);
            }
            return conversationHistory;
        }
    }

    /**
     * Check if LLM response has tool calls
     */
    private hasToolCalls(llmResponse: unknown): boolean {
        try {
            if (!this.isValidLLMResponse(llmResponse)) return false;
            
            const choices = llmResponse.completion.choices;
            if (!Array.isArray(choices) || choices.length === 0) return false;
            
            const choice = choices[0];
            return !!(choice?.message?.tool_calls && choice.message.tool_calls.length > 0);
        } catch (error) {
            return false;
        }
    }

    /**
     * Extract tool details from tool call
     */
    private getToolDetail(tool: unknown): ToolDetails {
        if (!this.isValidToolCall(tool)) {
            throw new Error("Invalid tool call structure");
        }

        let toolInput: unknown = {};
        if (tool.function.arguments) {
            try {
                toolInput = JSON.parse(tool.function.arguments);
            } catch (parseError) {
                throw new Error(`Failed to parse tool arguments: ${parseError}`);
            }
        }

        return {
            toolName: tool.function.name,
            toolInput: toolInput,
            toolUseId: tool.id
        };
    }

    /**
     * Execute a single tool
     */
    private async executeSingleTool(toolName: string, toolInput: unknown): Promise<[boolean, string]> {
        try {
            if (!this.codebolt) {
                throw new Error("Codebolt API not available");
            }

            // Handle subagent calls
            if (toolName.startsWith('subagent--')) {
                const agentName = toolName.replace("subagent--", '');
                // Note: agent property might not exist on CodeboltAPI interface
                // This would need to be implemented based on actual API
                // await this.codebolt.agent?.startAgent(agentName, toolInput.task);
                console.log(`Would execute subagent: ${agentName}`);
                return [false, "Subagent task completed successfully"];
            }

            // Handle regular MCP tools
            const [toolboxName, actualToolName] = toolName.split('--');
            if (!toolboxName || !actualToolName) {
                throw new Error(`Invalid tool name format: ${toolName}`);
            }

            const result = await this.executeWithRetry(async () => {
                const data = await this.codebolt!.mcp.executeTool(toolboxName, actualToolName, toolInput);
                return data;
            });

            return [false, "Tool executed successfully"];

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (this.enableLogging) {
                console.error(`[UnifiedResponseExecutor] Tool execution failed: ${toolName}`, error);
            }
            return [false, `Tool execution failed: ${errorMessage}`];
        }
    }

    /**
     * Execute with retry logic
     */
    private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: Error | null = null;
        
        for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                
                if (this.enableLogging) {
                    console.warn(`[UnifiedResponseExecutor] Attempt ${attempt} failed:`, lastError.message);
                }
                
                if (attempt < this.maxRetries) {
                    await this.delay(this.retryDelay);
                }
            }
        }
        
        throw lastError || new Error(`Operation failed after ${this.maxRetries} attempts`);
    }

    /**
     * Delay utility
     */
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Handle task completion
     */
    private async handleTaskCompletion(taskCompletedBlock: unknown): Promise<ToolResult> {
        try {
            if (!this.isValidToolCall(taskCompletedBlock)) {
                throw new Error('Invalid task completion block');
            }
            
            let taskArgs = {};
            if (taskCompletedBlock.function?.arguments) {
                taskArgs = JSON.parse(taskCompletedBlock.function.arguments);
            }
            
            const [, result] = await this.executeSingleTool(
                taskCompletedBlock.function.name,
                taskArgs
            );

            const finalResult = result === "" ? "The user is satisfied with the result." : result;
            
            return createToolResultObj(
                taskCompletedBlock.id || 'unknown',
                'task_completion',
                finalResult,
                true
            );

        } catch (error) {
            return createToolResultObj(
                'unknown',
                'task_completion',
                `Task completion failed: ${error}`,
                false
            );
        }
    }

    /**
     * Create tool result object
     */
    private getToolResult(tool_call_id: string, content: string): ToolResult {
        let userMessage = undefined;

        try {
            // Handle JSON responses with payload
            if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
                const parsed = JSON.parse(content);
                if (parsed && typeof parsed === 'object' && parsed.payload && parsed.payload.content) {
                    content = `The browser action has been executed. The screenshot have been captured for your analysis. The tool response is provided in the next user message`;
                    if (parsed && typeof parsed === 'object' && 'payload' in parsed) {
                        const payload = (parsed as any).payload;
                        if (payload && typeof payload === 'object' && 'content' in payload) {
                            userMessage = payload.content;
                        }
                    }
                }
            }
        } catch (error) {
            // Content is not JSON, use as-is
        }

        return createToolResultObj(
            tool_call_id,
            'generic',
            content,
            true
        );
    }

    /**
     * Send message to user
     */
    private async sendMessageToUser(llmResponse: unknown): Promise<string> {
        try {
            let messageContent = '';
            
            if (!this.isValidLLMResponse(llmResponse)) {
                return '';
            }
            
            const completion = llmResponse.completion;

            if (completion.choices && completion.choices.length > 0) {
                const choice = completion.choices[0];
                if (choice.message && choice.message.content) {
                    messageContent = choice.message.content;
                }
            } else if ('content' in completion && typeof (completion as any).content === 'string') {
                messageContent = (completion as any).content;
            }

            if (messageContent && this.codebolt?.chat?.sendMessage) {
                await this.codebolt.chat.sendMessage(messageContent, {});
            }

            return messageContent;

        } catch (error) {
            if (this.enableLogging) {
                console.error('[UnifiedResponseExecutor] Error sending message to user:', error);
            }
            return '';
        }
    }

    /**
     * Extract assistant message from LLM response
     */
    private extractAssistantMessage(llmResponse: unknown): OpenAIMessage | null {
        try {
            if (!this.isValidLLMResponse(llmResponse)) {
                return null;
            }
            
            const completion = llmResponse.completion;
            if (completion.choices && completion.choices.length > 0) {
                const choice = completion.choices[0];
                if (choice.message) {
                    return {
                        role: 'assistant',
                        content: choice.message.content || '',
                        tool_calls: choice.message.tool_calls as any || undefined
                    };
                }
            }
            return null;
        } catch (error) {
            return null;
        }
    }

    /**
     * Check if tool results indicate task completion
     */
    private checkToolCompletionStatus(toolResults: ToolResult[], llmResponse: unknown): boolean {
        // Check if any tool result indicates completion
        return toolResults.some(result => 
            result.result.toLowerCase().includes('task completed') ||
            result.result.toLowerCase().includes('user is satisfied')
        );
    }

    /**
     * Type guard for valid LLM response
     */
    private isValidLLMResponse(response: unknown): response is { completion: { choices: Array<{ message?: { tool_calls?: unknown[]; content?: string } }> } } {
        return (
            typeof response === 'object' &&
            response !== null &&
            'completion' in response &&
            typeof (response as any).completion === 'object' &&
            (response as any).completion !== null &&
            'choices' in (response as any).completion &&
            Array.isArray((response as any).completion.choices)
        );
    }

    /**
     * Type guard for valid tool call
     */
    private isValidToolCall(tool: unknown): tool is { function: { name: string; arguments?: string }; id: string } {
        return (
            typeof tool === 'object' &&
            tool !== null &&
            'function' in tool &&
            typeof (tool as any).function === 'object' &&
            (tool as any).function !== null &&
            'name' in (tool as any).function &&
            typeof (tool as any).function.name === 'string' &&
            'id' in tool &&
            typeof (tool as any).id === 'string'
        );
    }

    /**
     * Add a follow-up conversation processor
     */
    addFollowUpConversationProcessor(processor: Processor): void {
        this.followUpConversationProcessors.push(processor);
        if (this.enableLogging) {
            console.log('[UnifiedResponseExecutor] Added follow-up conversation processor:', processor.constructor.name);
        }
    }

    /**
     * Remove a follow-up conversation processor
     */
    removeFollowUpConversationProcessor(processor: Processor): boolean {
        const index = this.followUpConversationProcessors.indexOf(processor);
        if (index > -1) {
            this.followUpConversationProcessors.splice(index, 1);
            if (this.enableLogging) {
                console.log('[UnifiedResponseExecutor] Removed follow-up conversation processor:', processor.constructor.name);
            }
            return true;
        }
        return false;
    }

    /**
     * Get all follow-up conversation processors
     */
    getFollowUpConversationProcessors(): Processor[] {
        return [...this.followUpConversationProcessors];
    }

    /**
     * Clear all follow-up conversation processors
     */
    clearFollowUpConversationProcessors(): void {
        this.followUpConversationProcessors = [];
        if (this.enableLogging) {
            console.log('[UnifiedResponseExecutor] Cleared all follow-up conversation processors');
        }
    }

    /**
     * Apply pre-tool call processors
     */
    private async applyPreToolCallProcessors(
        toolName: string,
        toolInput: unknown,
        toolUseId: string,
        context: {
            tools: OpenAITool[];
            context?: Record<string, any>;
            llmResponse: unknown;
        }
    ): Promise<{
        intercepted: boolean;
        result: string;
        userRejected?: boolean;
        modifiedToolName?: string;
        modifiedToolInput?: unknown;
    }> {
        try {
            if (this.preToolCallProcessors.length === 0) {
                return { intercepted: false, result: '' };
            }

            // Create processed message for processors
            const processedMessage: ProcessedMessage = {
                messages: [{
                    role: 'assistant',
                    content: `Tool call: ${toolName}`,
                    tool_calls: [{
                        id: toolUseId,
                        function: {
                            name: toolName,
                            arguments: typeof toolInput === 'string' ? toolInput : JSON.stringify(toolInput)
                        }
                    }]
                }],
                metadata: {
                    preToolCallProcessing: true,
                    toolName,
                    toolInput,
                    toolUseId,
                    timestamp: new Date().toISOString()
                }
            };

            let intercepted = false;
            let result = '';
            let userRejected = false;
            let modifiedToolName = toolName;
            let modifiedToolInput = toolInput;

            // Apply each processor in sequence
            for (const processor of this.preToolCallProcessors) {
                try {
                    const processorInput: ProcessorInput = {
                        message: processedMessage,
                        context: {
                            ...context,
                            toolName: modifiedToolName,
                            toolInput: modifiedToolInput,
                            toolUseId,
                            originalToolName: toolName,
                            originalToolInput: toolInput
                        }
                    };

                    const results = await processor.processInput(processorInput);
                    
                    // Check for interception events
                    const interceptEvent = results.find(r => 
                        r.type === 'ToolIntercepted' || 
                        r.type === 'ToolHandled' ||
                        r.type === 'LocalToolExecuted'
                    );
                    
                    if (interceptEvent && interceptEvent.value) {
                        intercepted = true;
                        result = interceptEvent.value.result || interceptEvent.value.content || String(interceptEvent.value);
                        userRejected = interceptEvent.value.userRejected || false;
                        
                        if (this.enableLogging) {
                            console.log(`[UnifiedResponseExecutor] Tool ${toolName} intercepted by processor:`, processor.constructor.name);
                        }
                        
                        // Stop processing if tool was intercepted
                        break;
                    }

                    // Check for tool modification events
                    const modifyEvent = results.find(r => 
                        r.type === 'ToolModified' || 
                        r.type === 'ToolParametersModified'
                    );
                    
                    if (modifyEvent && modifyEvent.value) {
                        modifiedToolName = modifyEvent.value.toolName || modifiedToolName;
                        modifiedToolInput = modifyEvent.value.toolInput || modifiedToolInput;
                        
                        if (this.enableLogging) {
                            console.log(`[UnifiedResponseExecutor] Tool ${toolName} modified by processor:`, processor.constructor.name);
                        }
                    }

                    // Log other processor events
                    if (this.enableLogging) {
                        results.forEach(result => {
                            if (result.type !== 'ToolIntercepted' && result.type !== 'ToolModified') {
                                console.log(`[UnifiedResponseExecutor] Pre-tool processor event: ${result.type}`, result.value);
                            }
                        });
                    }

                } catch (error) {
                    if (this.enableLogging) {
                        console.error(`[UnifiedResponseExecutor] Error in pre-tool processor:`, error);
                    }
                    // Continue with other processors
                }
            }

            return {
                intercepted,
                result,
                userRejected,
                modifiedToolName: modifiedToolName !== toolName ? modifiedToolName : undefined,
                modifiedToolInput: modifiedToolInput !== toolInput ? modifiedToolInput : undefined
            };

        } catch (error) {
            if (this.enableLogging) {
                console.error('[UnifiedResponseExecutor] Error applying pre-tool processors:', error);
            }
            return { intercepted: false, result: '' };
        }
    }

    /**
     * Add a pre-tool call processor
     */
    addPreToolCallProcessor(processor: Processor): void {
        this.preToolCallProcessors.push(processor);
        if (this.enableLogging) {
            console.log('[UnifiedResponseExecutor] Added pre-tool call processor:', processor.constructor.name);
        }
    }

    /**
     * Remove a pre-tool call processor
     */
    removePreToolCallProcessor(processor: Processor): boolean {
        const index = this.preToolCallProcessors.indexOf(processor);
        if (index > -1) {
            this.preToolCallProcessors.splice(index, 1);
            if (this.enableLogging) {
                console.log('[UnifiedResponseExecutor] Removed pre-tool call processor:', processor.constructor.name);
            }
            return true;
        }
        return false;
    }

    /**
     * Get all pre-tool call processors
     */
    getPreToolCallProcessors(): Processor[] {
        return [...this.preToolCallProcessors];
    }

    /**
     * Clear all pre-tool call processors
     */
    clearPreToolCallProcessors(): void {
        this.preToolCallProcessors = [];
        if (this.enableLogging) {
            console.log('[UnifiedResponseExecutor] Cleared all pre-tool call processors');
        }
    }
}

/**
 * Factory function to create unified response executor
 */
export function createUnifiedResponseExecutor(options: {
    codebolt?: CodeboltAPI;
    maxConversationLength?: number;
    enableLogging?: boolean;
    maxRetries?: number;
    retryDelay?: number;
    followUpConversationProcessors?: Processor[];
    preToolCallProcessors?: Processor[];
} = {}): UnifiedResponseExecutor {
    return new UnifiedResponseExecutorImpl(options);
}

/**
 * Create basic response executor with default settings
 */
export function createBasicResponseExecutor(): UnifiedResponseExecutor {
    return new UnifiedResponseExecutorImpl({
        maxConversationLength: 50,
        enableLogging: true,
        maxRetries: 3,
        retryDelay: 1000
    });
}
