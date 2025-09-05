import { BaseProcessor, ProcessorInput, ProcessorOutput, ProcessedMessage, Message } from '../../processor';

export interface FollowUpConversationInfo {
    toolResultsProcessed: number;
    followUpMessagesAdded: number;
    conversationEnhanced: boolean;
    processingMethod: 'automatic' | 'guided' | 'minimal';
}

export interface FollowUpConversationProcessorOptions {
    addFollowUpPrompts?: boolean;
    enhanceToolResults?: boolean;
    addContextualHints?: boolean;
    processingMode?: 'automatic' | 'guided' | 'minimal';
    maxFollowUpMessages?: number;
    enableToolResultEnhancement?: boolean;
    enableConversationGuidance?: boolean;
}

/**
 * Processor that enhances follow-up conversations by adding contextual information,
 * improving tool result presentation, and providing guidance for continued interaction.
 */
export class FollowUpConversationProcessor extends BaseProcessor {
    private readonly addFollowUpPrompts: boolean;
    private readonly enhanceToolResults: boolean;
    private readonly addContextualHints: boolean;
    private readonly processingMode: 'automatic' | 'guided' | 'minimal';
    private readonly maxFollowUpMessages: number;
    private readonly enableToolResultEnhancement: boolean;
    private readonly enableConversationGuidance: boolean;

    constructor(options: FollowUpConversationProcessorOptions = {}) {
        super(options);
        this.addFollowUpPrompts = options.addFollowUpPrompts !== false;
        this.enhanceToolResults = options.enhanceToolResults !== false;
        this.addContextualHints = options.addContextualHints !== false;
        this.processingMode = options.processingMode || 'automatic';
        this.maxFollowUpMessages = options.maxFollowUpMessages || 3;
        this.enableToolResultEnhancement = options.enableToolResultEnhancement !== false;
        this.enableConversationGuidance = options.enableConversationGuidance !== false;
    }

    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        try {
            const { message, context } = input;
            
            // Check if this is a follow-up conversation processing
            if (!context?.followUpProcessing) {
                return [this.createEvent('FollowUpProcessingSkipped', {
                    reason: 'Not a follow-up conversation processing context'
                })];
            }

            const enhancedMessage = await this.enhanceFollowUpConversation(message, context);
            const processingInfo = this.calculateProcessingInfo(message, enhancedMessage, context);

            return [
                this.createEvent('FollowUpConversationProcessed', processingInfo),
                this.createEvent('ConversationProcessed', enhancedMessage)
            ];

        } catch (error) {
            console.error('Error in FollowUpConversationProcessor:', error);
            return [this.createEvent('FollowUpConversationError', {
                error: error instanceof Error ? error.message : String(error),
                originalLength: input.message.messages.length
            })];
        }
    }

    private async enhanceFollowUpConversation(
        message: ProcessedMessage,
        context: Record<string, any>
    ): Promise<ProcessedMessage> {
        let enhancedMessages = [...message.messages];
        let enhancementsAdded = 0;

        // Enhance tool results if enabled
        if (this.enableToolResultEnhancement && this.enhanceToolResults) {
            enhancedMessages = this.enhanceToolResultMessages(enhancedMessages, context);
            enhancementsAdded++;
        }

        // Add follow-up prompts if enabled
        if (this.addFollowUpPrompts && this.processingMode !== 'minimal') {
            const followUpMessages = this.generateFollowUpPrompts(enhancedMessages, context);
            enhancedMessages.push(...followUpMessages);
            enhancementsAdded += followUpMessages.length;
        }

        // Add contextual hints if enabled
        if (this.addContextualHints && this.enableConversationGuidance) {
            const contextualMessages = this.generateContextualHints(enhancedMessages, context);
            enhancedMessages.push(...contextualMessages);
            enhancementsAdded += contextualMessages.length;
        }

        return {
            ...message,
            messages: enhancedMessages,
            metadata: {
                ...message.metadata,
                followUpEnhanced: true,
                enhancementsAdded,
                processingMode: this.processingMode,
                timestamp: new Date().toISOString()
            }
        };
    }

    private enhanceToolResultMessages(
        messages: Message[],
        context: Record<string, any>
    ): Message[] {
        return messages.map(message => {
            if (message.role !== 'tool') {
                return message;
            }

            // Enhance tool result presentation
            const enhancedContent = this.enhanceToolResultContent(message.content, context);
            
            return {
                ...message,
                content: enhancedContent,
                name: message.name || 'tool-result'
            };
        });
    }

    private enhanceToolResultContent(content: any, context: Record<string, any>): any {
        if (typeof content !== 'string') {
            return content;
        }

        // Add formatting and context to tool results
        let enhancedContent = content;

        // Add success/failure indicators
        if (content.toLowerCase().includes('error') || content.toLowerCase().includes('failed')) {
            enhancedContent = `❌ **Tool Execution Result:**\n${content}\n\n*The tool encountered an issue. Please review the error and try again if needed.*`;
        } else if (content.toLowerCase().includes('success') || content.toLowerCase().includes('completed')) {
            enhancedContent = `✅ **Tool Execution Result:**\n${content}\n\n*The tool executed successfully.*`;
        } else {
            enhancedContent = `🔧 **Tool Execution Result:**\n${content}`;
        }

        // Add tool execution context if available
        if (context.toolResults && Array.isArray(context.toolResults)) {
            const toolCount = context.toolResults.length;
            if (toolCount > 1) {
                enhancedContent += `\n\n*This is one of ${toolCount} tool results in this interaction.*`;
            }
        }

        return enhancedContent;
    }

    private generateFollowUpPrompts(
        messages: Message[],
        context: Record<string, any>
    ): Message[] {
        const followUpMessages: Message[] = [];
        const toolResults = context.toolResults || [];
        const hasErrors = toolResults.some((result: any) => 
            result.content && result.content.toLowerCase().includes('error')
        );

        // Add different prompts based on processing mode
        switch (this.processingMode) {
            case 'guided':
                followUpMessages.push(...this.generateGuidedPrompts(messages, context, hasErrors));
                break;
            case 'automatic':
                followUpMessages.push(...this.generateAutomaticPrompts(messages, context, hasErrors));
                break;
            case 'minimal':
                // Minimal mode doesn't add prompts
                break;
        }

        // Limit the number of follow-up messages
        return followUpMessages.slice(0, this.maxFollowUpMessages);
    }

    private generateGuidedPrompts(
        messages: Message[],
        context: Record<string, any>,
        hasErrors: boolean
    ): Message[] {
        const prompts: Message[] = [];

        if (hasErrors) {
            prompts.push({
                role: 'user',
                content: "I notice there were some errors in the tool execution. Would you like me to:\n1. Retry the failed operations\n2. Try an alternative approach\n3. Provide more details about the errors\n4. Continue with the successful results\n\nPlease let me know how you'd like to proceed.",
                name: 'error-guidance-prompt'
            });
        } else {
            const toolCount = context.toolResults?.length || 0;
            if (toolCount > 0) {
                prompts.push({
                    role: 'user',
                    content: `The tools have been executed successfully. Based on the results, would you like me to:\n1. Analyze the results further\n2. Perform additional related tasks\n3. Provide a summary of what was accomplished\n4. Continue with the next steps\n\nWhat would be most helpful?`,
                    name: 'success-guidance-prompt'
                });
            }
        }

        return prompts;
    }

    private generateAutomaticPrompts(
        messages: Message[],
        context: Record<string, any>,
        hasErrors: boolean
    ): Message[] {
        const prompts: Message[] = [];

        if (hasErrors) {
            prompts.push({
                role: 'user',
                content: "Please review the errors above and suggest how to resolve them or continue with alternative approaches.",
                name: 'automatic-error-prompt'
            });
        } else {
            const toolCount = context.toolResults?.length || 0;
            if (toolCount > 0) {
                prompts.push({
                    role: 'user',
                    content: "Please analyze the tool execution results and let me know if there are any next steps or if the task has been completed successfully.",
                    name: 'automatic-success-prompt'
                });
            }
        }

        return prompts;
    }

    private generateContextualHints(
        messages: Message[],
        context: Record<string, any>
    ): Message[] {
        const hints: Message[] = [];
        const toolResults = context.toolResults || [];
        const conversationLength = context.conversationLength || 0;

        // Add hints based on conversation state
        if (conversationLength > 30) {
            hints.push({
                role: 'system',
                content: "Note: This conversation is getting quite long. Consider summarizing progress or breaking down remaining tasks into smaller steps.",
                name: 'conversation-length-hint'
            });
        }

        // Add hints based on tool execution patterns
        if (toolResults.length > 5) {
            hints.push({
                role: 'system',
                content: "Multiple tools have been executed in this interaction. Consider reviewing the overall progress and determining if the objectives have been met.",
                name: 'tool-execution-hint'
            });
        }

        // Add hints for specific tool types
        const fileOperations = toolResults.filter((result: any) => 
            result.tool_call_id && (
                result.tool_call_id.includes('file') ||
                result.tool_call_id.includes('read') ||
                result.tool_call_id.includes('write')
            )
        );

        if (fileOperations.length > 0) {
            hints.push({
                role: 'system',
                content: "File operations have been performed. Consider verifying the changes and ensuring all modifications are correct.",
                name: 'file-operations-hint'
            });
        }

        return hints.slice(0, 2); // Limit hints to avoid clutter
    }

    private calculateProcessingInfo(
        original: ProcessedMessage,
        enhanced: ProcessedMessage,
        context: Record<string, any>
    ): FollowUpConversationInfo {
        const originalCount = original.messages.length;
        const enhancedCount = enhanced.messages.length;
        const toolResultsCount = context.toolResults?.length || 0;

        return {
            toolResultsProcessed: toolResultsCount,
            followUpMessagesAdded: enhancedCount - originalCount,
            conversationEnhanced: enhancedCount > originalCount,
            processingMethod: this.processingMode
        };
    }

    // Public methods for configuration
    setProcessingMode(mode: 'automatic' | 'guided' | 'minimal'): void {
        (this as any).processingMode = mode;
    }

    setMaxFollowUpMessages(count: number): void {
        (this as any).maxFollowUpMessages = Math.max(0, Math.min(10, count));
    }

    enableFollowUpPromptsForSession(): void {
        (this as any).addFollowUpPrompts = true;
    }

    disableFollowUpPromptsForSession(): void {
        (this as any).addFollowUpPrompts = false;
    }

    enableToolResultEnhancementForSession(): void {
        (this as any).enableToolResultEnhancement = true;
    }

    disableToolResultEnhancementForSession(): void {
        (this as any).enableToolResultEnhancement = false;
    }

    enableConversationGuidanceForSession(): void {
        (this as any).enableConversationGuidance = true;
    }

    disableConversationGuidanceForSession(): void {
        (this as any).enableConversationGuidance = false;
    }
}
