import { BaseProcessor, ProcessorInput, ProcessorOutput, ProcessedMessage, Message } from '../../processor';

export interface ConversationContinuityInfo {
    contextLinksAdded: number;
    referenceResolutionsAdded: number;
    continuityEnhanced: boolean;
    missingContextDetected: boolean;
    conversationGapsFound: number;
}

export interface ConversationContinuityProcessorOptions {
    enableContextLinking?: boolean;
    enableReferenceResolution?: boolean;
    enableGapDetection?: boolean;
    maxContextLinks?: number;
    contextLookbackWindow?: number;
    enableProactiveContext?: boolean;
}

/**
 * Processor that maintains conversation continuity by linking related messages,
 * resolving references, and detecting context gaps in follow-up conversations.
 */
export class ConversationContinuityProcessor extends BaseProcessor {
    private readonly enableContextLinking: boolean;
    private readonly enableReferenceResolution: boolean;
    private readonly enableGapDetection: boolean;
    private readonly maxContextLinks: number;
    private readonly contextLookbackWindow: number;
    private readonly enableProactiveContext: boolean;

    constructor(options: ConversationContinuityProcessorOptions = {}) {
        super(options);
        this.enableContextLinking = options.enableContextLinking !== false;
        this.enableReferenceResolution = options.enableReferenceResolution !== false;
        this.enableGapDetection = options.enableGapDetection !== false;
        this.maxContextLinks = options.maxContextLinks || 5;
        this.contextLookbackWindow = options.contextLookbackWindow || 20;
        this.enableProactiveContext = options.enableProactiveContext !== false;
    }

    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        try {
            const { message, context } = input;
            
            // Only process follow-up conversations
            if (!context?.followUpProcessing) {
                return [this.createEvent('ContinuityProcessingSkipped', {
                    reason: 'Not a follow-up conversation processing context'
                })];
            }

            const enhancedMessage = await this.enhanceConversationContinuity(message, context);
            const continuityInfo = this.calculateContinuityInfo(message, enhancedMessage, context);

            return [
                this.createEvent('ConversationContinuityProcessed', continuityInfo),
                this.createEvent('ConversationProcessed', enhancedMessage)
            ];

        } catch (error) {
            console.error('Error in ConversationContinuityProcessor:', error);
            return [this.createEvent('ConversationContinuityError', {
                error: error instanceof Error ? error.message : String(error),
                originalLength: input.message.messages.length
            })];
        }
    }

    private async enhanceConversationContinuity(
        message: ProcessedMessage,
        context: Record<string, any>
    ): Promise<ProcessedMessage> {
        let enhancedMessages = [...message.messages];
        let enhancementsAdded = 0;

        // Add context links if enabled
        if (this.enableContextLinking) {
            const contextLinks = this.addContextLinks(enhancedMessages, context);
            enhancedMessages.push(...contextLinks);
            enhancementsAdded += contextLinks.length;
        }

        // Resolve references if enabled
        if (this.enableReferenceResolution) {
            enhancedMessages = this.resolveReferences(enhancedMessages, context);
        }

        // Detect and fill conversation gaps if enabled
        if (this.enableGapDetection) {
            const gapFillers = this.detectAndFillGaps(enhancedMessages, context);
            enhancedMessages.push(...gapFillers);
            enhancementsAdded += gapFillers.length;
        }

        // Add proactive context if enabled
        if (this.enableProactiveContext) {
            const proactiveContext = this.addProactiveContext(enhancedMessages, context);
            enhancedMessages.push(...proactiveContext);
            enhancementsAdded += proactiveContext.length;
        }

        return {
            ...message,
            messages: enhancedMessages,
            metadata: {
                ...message.metadata,
                continuityEnhanced: true,
                enhancementsAdded,
                timestamp: new Date().toISOString()
            }
        };
    }

    private addContextLinks(
        messages: Message[],
        context: Record<string, any>
    ): Message[] {
        const contextLinks: Message[] = [];
        const recentMessages = messages.slice(-this.contextLookbackWindow);
        
        // Find messages that reference previous interactions
        const referencingMessages = this.findReferencingMessages(recentMessages);
        
        if (referencingMessages.length > 0) {
            const linkMessage: Message = {
                role: 'system',
                content: this.generateContextLinkMessage(referencingMessages, context),
                name: 'context-link'
            };
            contextLinks.push(linkMessage);
        }

        return contextLinks.slice(0, this.maxContextLinks);
    }

    private findReferencingMessages(messages: Message[]): Message[] {
        const referencePatterns = [
            /\b(this|that|it|they|them)\b/i,
            /\b(the (above|previous|last|earlier))\b/i,
            /\b(as (mentioned|discussed|shown))\b/i,
            /\b(from (before|earlier))\b/i,
            /\b(the (file|code|result|output))\b/i
        ];

        return messages.filter(message => {
            const content = typeof message.content === 'string' 
                ? message.content 
                : JSON.stringify(message.content);
            
            return referencePatterns.some(pattern => pattern.test(content));
        });
    }

    private generateContextLinkMessage(
        referencingMessages: Message[],
        context: Record<string, any>
    ): string {
        const messageCount = referencingMessages.length;
        const toolResults = context.toolResults || [];
        
        let linkMessage = `**Context Links:** Found ${messageCount} message${messageCount > 1 ? 's' : ''} with references to previous interactions.`;
        
        if (toolResults.length > 0) {
            linkMessage += ` Recent tool executions: ${toolResults.length} tool${toolResults.length > 1 ? 's' : ''} executed.`;
        }

        if (context.originalHistory && context.originalHistory.length > 0) {
            linkMessage += ` Conversation history: ${context.originalHistory.length} previous messages available for reference.`;
        }

        return linkMessage;
    }

    private resolveReferences(
        messages: Message[],
        context: Record<string, any>
    ): Message[] {
        return messages.map(message => {
            if (message.role === 'system' || message.name === 'reference-resolution') {
                return message;
            }

            const resolvedContent = this.resolveMessageReferences(message.content, context);
            
            if (resolvedContent !== message.content) {
                return {
                    ...message,
                    content: resolvedContent,
                    name: message.name || 'reference-resolved'
                };
            }

            return message;
        });
    }

    private resolveMessageReferences(content: any, context: Record<string, any>): any {
        if (typeof content !== 'string') {
            return content;
        }

        let resolvedContent = content;
        const toolResults = context.toolResults || [];

        // Resolve "the file" references
        if (/\bthe file\b/i.test(resolvedContent) && toolResults.length > 0) {
            const fileOperations = toolResults.filter((result: any) => 
                result.tool_call_id && result.tool_call_id.includes('file')
            );
            
            if (fileOperations.length === 1) {
                resolvedContent = resolvedContent.replace(
                    /\bthe file\b/gi, 
                    `the file (from recent tool execution)`
                );
            }
        }

        // Resolve "the result" references
        if (/\bthe result\b/i.test(resolvedContent) && toolResults.length > 0) {
            resolvedContent = resolvedContent.replace(
                /\bthe result\b/gi,
                `the result (from ${toolResults.length} recent tool execution${toolResults.length > 1 ? 's' : ''})`
            );
        }

        // Resolve "it" references in context of tool operations
        if (/\bit\b/i.test(resolvedContent) && toolResults.length === 1) {
            const toolResult = toolResults[0];
            if (toolResult.tool_call_id) {
                resolvedContent = resolvedContent.replace(
                    /\bit\b/gi,
                    `it (referring to the tool execution result)`
                );
            }
        }

        return resolvedContent;
    }

    private detectAndFillGaps(
        messages: Message[],
        context: Record<string, any>
    ): Message[] {
        const gapFillers: Message[] = [];
        const gaps = this.detectConversationGaps(messages, context);

        gaps.forEach(gap => {
            const fillerMessage: Message = {
                role: 'system',
                content: this.generateGapFillerMessage(gap, context),
                name: 'gap-filler'
            };
            gapFillers.push(fillerMessage);
        });

        return gapFillers;
    }

    private detectConversationGaps(
        messages: Message[],
        context: Record<string, any>
    ): Array<{ type: string; description: string; severity: 'low' | 'medium' | 'high' }> {
        const gaps: Array<{ type: string; description: string; severity: 'low' | 'medium' | 'high' }> = [];
        const toolResults = context.toolResults || [];

        // Gap: Tool results without explanation
        const unexplainedToolResults = toolResults.filter((result: any) => {
            const hasExplanation = messages.some(msg => 
                msg.role === 'assistant' && 
                typeof msg.content === 'string' &&
                msg.content.includes('result')
            );
            return !hasExplanation;
        });

        if (unexplainedToolResults.length > 0) {
            gaps.push({
                type: 'unexplained-tool-results',
                description: `${unexplainedToolResults.length} tool result(s) without explanation`,
                severity: 'medium'
            });
        }

        // Gap: Missing context for references
        const unresolvedReferences = messages.filter(msg => {
            const content = typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content);
            return /\b(this|that|it)\b/i.test(content) && msg.role === 'user';
        });

        if (unresolvedReferences.length > 2) {
            gaps.push({
                type: 'unresolved-references',
                description: `${unresolvedReferences.length} messages with unclear references`,
                severity: 'low'
            });
        }

        // Gap: Long silence after tool execution
        const lastToolIndex = messages.findLastIndex(msg => msg.role === 'tool');
        const lastAssistantIndex = messages.findLastIndex(msg => msg.role === 'assistant');
        
        if (lastToolIndex > lastAssistantIndex && lastToolIndex < messages.length - 1) {
            gaps.push({
                type: 'missing-tool-response',
                description: 'Tool execution without assistant response',
                severity: 'high'
            });
        }

        return gaps;
    }

    private generateGapFillerMessage(
        gap: { type: string; description: string; severity: 'low' | 'medium' | 'high' },
        context: Record<string, any>
    ): string {
        switch (gap.type) {
            case 'unexplained-tool-results':
                return `**Context Note:** There are tool execution results that may need explanation or analysis. Consider reviewing the tool outputs and their implications.`;
            
            case 'unresolved-references':
                return `**Context Note:** Some messages contain references that might be unclear. Consider providing more specific context when referring to previous interactions.`;
            
            case 'missing-tool-response':
                return `**Context Note:** Recent tool execution completed but may need assistant analysis or response to continue the conversation effectively.`;
            
            default:
                return `**Context Note:** Potential conversation gap detected: ${gap.description}`;
        }
    }

    private addProactiveContext(
        messages: Message[],
        context: Record<string, any>
    ): Message[] {
        const proactiveMessages: Message[] = [];
        const toolResults = context.toolResults || [];
        const conversationLength = messages.length;

        // Add proactive context for complex tool interactions
        if (toolResults.length > 3) {
            proactiveMessages.push({
                role: 'system',
                content: `**Proactive Context:** Multiple tools have been executed (${toolResults.length} total). This suggests a complex task that may benefit from step-by-step progress tracking.`,
                name: 'proactive-context'
            });
        }

        // Add proactive context for long conversations
        if (conversationLength > 25) {
            proactiveMessages.push({
                role: 'system',
                content: `**Proactive Context:** This is an extended conversation (${conversationLength} messages). Consider summarizing progress or breaking down remaining objectives.`,
                name: 'proactive-context'
            });
        }

        return proactiveMessages.slice(0, 2); // Limit proactive messages
    }

    private calculateContinuityInfo(
        original: ProcessedMessage,
        enhanced: ProcessedMessage,
        context: Record<string, any>
    ): ConversationContinuityInfo {
        const originalCount = original.messages.length;
        const enhancedCount = enhanced.messages.length;
        const addedMessages = enhancedCount - originalCount;

        // Count different types of enhancements
        const contextLinks = enhanced.messages.filter(m => m.name === 'context-link').length;
        const referenceResolutions = enhanced.messages.filter(m => m.name === 'reference-resolved').length;
        const gapFillers = enhanced.messages.filter(m => m.name === 'gap-filler').length;

        return {
            contextLinksAdded: contextLinks,
            referenceResolutionsAdded: referenceResolutions,
            continuityEnhanced: addedMessages > 0,
            missingContextDetected: gapFillers > 0,
            conversationGapsFound: gapFillers
        };
    }

    // Public methods for configuration
    setContextLookbackWindow(window: number): void {
        (this as any).contextLookbackWindow = Math.max(5, Math.min(50, window));
    }

    setMaxContextLinks(max: number): void {
        (this as any).maxContextLinks = Math.max(1, Math.min(10, max));
    }

    enableContextLinkingForSession(): void {
        (this as any).enableContextLinking = true;
    }

    disableContextLinkingForSession(): void {
        (this as any).enableContextLinking = false;
    }

    enableReferenceResolutionForSession(): void {
        (this as any).enableReferenceResolution = true;
    }

    disableReferenceResolutionForSession(): void {
        (this as any).enableReferenceResolution = false;
    }

    enableGapDetectionForSession(): void {
        (this as any).enableGapDetection = true;
    }

    disableGapDetectionForSession(): void {
        (this as any).enableGapDetection = false;
    }
}
