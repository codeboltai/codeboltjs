import { BaseProcessor, ProcessorInput, ProcessorOutput, ProcessedMessage, Message } from '../types/processorTypes';
import codeboltjs from "@codebolt/codeboltjs";
const { chatSummary } = codeboltjs;

export interface ConversationCompactorInfo {
    originalMessageCount: number;
    compactedMessageCount: number;
    compressionRatio: number;
    compactionMethod: 'summarization' | 'truncation' | 'smart_removal';
    preservedMessages: number;
    removedMessages: number;
}

export interface ConversationCompactorProcessorOptions {
    maxConversationLength?: number;
    compactionThreshold?: number;
    preserveRecentMessages?: number;
    preserveSystemMessages?: boolean;
    preserveToolMessages?: boolean;
    enableSummarization?: boolean;
    enableSmartRemoval?: boolean;
    compressionRatio?: number;
}

/**
 * Processor that compacts long conversations to keep them within manageable limits
 * while preserving important context and recent interactions.
 */
export class ConversationCompactorProcessor extends BaseProcessor {
    private readonly maxConversationLength: number;
    private readonly compactionThreshold: number;
    private readonly preserveRecentMessages: number;
    private readonly preserveSystemMessages: boolean;
    private readonly preserveToolMessages: boolean;
    private readonly enableSummarization: boolean;
    private readonly enableSmartRemoval: boolean;
    private readonly compressionRatio: number;

    constructor(options: ConversationCompactorProcessorOptions = {}) {
        super(options);
        this.maxConversationLength = options.maxConversationLength || 50;
        this.compactionThreshold = options.compactionThreshold || 0.8; // Compact when 80% of max length
        this.preserveRecentMessages = options.preserveRecentMessages || 10;
        this.preserveSystemMessages = options.preserveSystemMessages !== false;
        this.preserveToolMessages = options.preserveToolMessages !== false;
        this.enableSummarization = options.enableSummarization !== false;
        this.enableSmartRemoval = options.enableSmartRemoval !== false;
        this.compressionRatio = options.compressionRatio || 0.6; // Target 60% of original size
    }

    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        try {
            const { message, context } = input;
            const messages = message.messages;

            // Check if compaction is needed
            const needsCompaction = this.shouldCompactConversation(messages);
            
            if (!needsCompaction) {
                return [this.createEvent('ConversationCompactionSkipped', {
                    reason: 'Conversation length within limits',
                    messageCount: messages.length,
                    maxLength: this.maxConversationLength
                })];
            }

            // Perform compaction
            const compactionResult = await this.compactConversation(messages, context);
            
            // Update the message with compacted conversation
            const compactedMessage: ProcessedMessage = {
                messages: compactionResult.compactedMessages,
                metadata: {
                    ...message.metadata,
                    compactionInfo: compactionResult.info
                }
            };

            return [
                this.createEvent('ConversationCompacted', compactionResult.info),
                this.createEvent('MessageModified', {
                    originalMessageCount: messages.length,
                    newMessageCount: compactionResult.compactedMessages.length,
                    compactedMessage
                })
            ];

        } catch (error) {
            console.error('Error in ConversationCompactorProcessor:', error);
            return [this.createEvent('ConversationCompactionError', {
                error: error instanceof Error ? error.message : String(error)
            })];
        }
    }

    private shouldCompactConversation(messages: Message[]): boolean {
        const threshold = Math.floor(this.maxConversationLength * this.compactionThreshold);
        return messages.length >= threshold;
    }

    private async compactConversation(
        messages: Message[], 
        context?: Record<string, unknown>
    ): Promise<{
        compactedMessages: Message[];
        info: ConversationCompactorInfo;
    }> {
        const originalCount = messages.length;
        let compactedMessages: Message[];
        let compactionMethod: 'summarization' | 'truncation' | 'smart_removal';

        // Determine the best compaction method
        if (this.enableSummarization && originalCount > this.preserveRecentMessages * 2) {
            compactionMethod = 'summarization';
            compactedMessages = await this.compactWithSummarization(messages);
        } else if (this.enableSmartRemoval) {
            compactionMethod = 'smart_removal';
            compactedMessages = this.compactWithSmartRemoval(messages);
        } else {
            compactionMethod = 'truncation';
            compactedMessages = this.compactWithTruncation(messages);
        }

        const compactedCount = compactedMessages.length;
        const info: ConversationCompactorInfo = {
            originalMessageCount: originalCount,
            compactedMessageCount: compactedCount,
            compressionRatio: compactedCount / originalCount,
            compactionMethod,
            preservedMessages: compactedCount,
            removedMessages: originalCount - compactedCount
        };

        return { compactedMessages, info };
    }

    private async compactWithSummarization(messages: Message[]): Promise<Message[]> {
        // Separate messages into categories
        const systemMessages = messages.filter(m => m.role === 'system');
        const recentMessages = messages.slice(-this.preserveRecentMessages);
        const middleMessages = messages.slice(
            systemMessages.length, 
            messages.length - this.preserveRecentMessages
        );

        if (middleMessages.length === 0) {
            return messages;
        }

        try {
            // Create conversation text for summarization
            const conversationText = middleMessages
                .map(m => `${m.role}: ${typeof m.content === 'string' ? m.content : JSON.stringify(m.content)}`)
                .join('\n');

            // Use codeboltjs chat summary
            const summary = await chatSummary.summarizeConversation(conversationText, {
                maxLength: Math.floor(middleMessages.length * this.compressionRatio),
                preserveImportantDetails: true
            });

            // Create summary message
            const summaryMessage: Message = {
                role: 'system',
                content: `[Conversation Summary]: ${summary}`
            };

            // Combine preserved messages with summary
            return [
                ...systemMessages,
                summaryMessage,
                ...recentMessages
            ];

        } catch (error) {
            console.warn('Summarization failed, falling back to smart removal:', error);
            return this.compactWithSmartRemoval(messages);
        }
    }

    private compactWithSmartRemoval(messages: Message[]): Message[] {
        // Always preserve system messages
        const systemMessages = messages.filter(m => m.role === 'system');
        const nonSystemMessages = messages.filter(m => m.role !== 'system');

        // Always preserve recent messages
        const recentMessages = nonSystemMessages.slice(-this.preserveRecentMessages);
        const olderMessages = nonSystemMessages.slice(0, -this.preserveRecentMessages);

        if (olderMessages.length === 0) {
            return messages;
        }

        // Calculate target count for older messages
        const targetTotal = Math.floor(this.maxConversationLength * this.compressionRatio);
        const preservedCount = systemMessages.length + recentMessages.length;
        const targetOlderCount = Math.max(0, targetTotal - preservedCount);

        if (targetOlderCount >= olderMessages.length) {
            return messages;
        }

        // Score messages by importance
        const scoredMessages = olderMessages.map((message, index) => ({
            message,
            score: this.calculateMessageImportance(message, index, olderMessages.length)
        }));

        // Sort by score (descending) and take top messages
        scoredMessages.sort((a, b) => b.score - a.score);
        const selectedOlderMessages = scoredMessages
            .slice(0, targetOlderCount)
            .map(item => item.message);

        // Maintain chronological order
        const selectedIndices = new Set(
            selectedOlderMessages.map(msg => olderMessages.indexOf(msg))
        );
        const chronologicalOlderMessages = olderMessages.filter(
            (_, index) => selectedIndices.has(index)
        );

        return [
            ...systemMessages,
            ...chronologicalOlderMessages,
            ...recentMessages
        ];
    }

    private compactWithTruncation(messages: Message[]): Message[] {
        const targetCount = Math.floor(this.maxConversationLength * this.compressionRatio);
        
        if (messages.length <= targetCount) {
            return messages;
        }

        // Preserve system messages and recent messages
        const systemMessages = messages.filter(m => m.role === 'system');
        const nonSystemMessages = messages.filter(m => m.role !== 'system');
        
        const recentCount = Math.min(this.preserveRecentMessages, nonSystemMessages.length);
        const recentMessages = nonSystemMessages.slice(-recentCount);
        
        const availableForOlder = targetCount - systemMessages.length - recentMessages.length;
        
        if (availableForOlder <= 0) {
            return [...systemMessages, ...recentMessages];
        }

        const olderMessages = nonSystemMessages.slice(0, -recentCount);
        const selectedOlderMessages = olderMessages.slice(-availableForOlder);

        return [
            ...systemMessages,
            ...selectedOlderMessages,
            ...recentMessages
        ];
    }

    private calculateMessageImportance(
        message: Message, 
        index: number, 
        totalCount: number
    ): number {
        let score = 0;

        // Base score for message type
        switch (message.role) {
            case 'system':
                score += 100; // Highest priority
                break;
            case 'assistant':
                score += 50;
                break;
            case 'user':
                score += 40;
                break;
            case 'tool':
                score += this.preserveToolMessages ? 60 : 20;
                break;
        }

        // Boost score for messages with tool calls
        if (message.tool_calls && message.tool_calls.length > 0) {
            score += 30;
        }

        // Boost score for longer messages (more content)
        const contentLength = typeof message.content === 'string' 
            ? message.content.length 
            : JSON.stringify(message.content).length;
        score += Math.min(contentLength / 100, 20); // Max 20 points for length

        // Recency bonus (more recent = higher score)
        const recencyBonus = (index / totalCount) * 10;
        score += recencyBonus;

        // Boost for messages that contain important keywords
        const importantKeywords = [
            'error', 'exception', 'failed', 'success', 'completed',
            'important', 'critical', 'warning', 'note'
        ];
        
        const contentStr = typeof message.content === 'string' 
            ? message.content.toLowerCase()
            : JSON.stringify(message.content).toLowerCase();
            
        const keywordMatches = importantKeywords.filter(
            keyword => contentStr.includes(keyword)
        ).length;
        score += keywordMatches * 5;

        return score;
    }

    // Public methods for configuration
    getMaxConversationLength(): number {
        return this.maxConversationLength;
    }

    getCompactionThreshold(): number {
        return this.compactionThreshold;
    }

    isCompactionNeeded(messageCount: number): boolean {
        return messageCount >= Math.floor(this.maxConversationLength * this.compactionThreshold);
    }

    getCompressionRatio(): number {
        return this.compressionRatio;
    }

    // Statistics and monitoring
    getProcessorStats(): {
        maxLength: number;
        threshold: number;
        preserveRecent: number;
        compressionRatio: number;
        enabledFeatures: string[];
    } {
        const enabledFeatures: string[] = [];
        if (this.enableSummarization) enabledFeatures.push('summarization');
        if (this.enableSmartRemoval) enabledFeatures.push('smart_removal');
        if (this.preserveSystemMessages) enabledFeatures.push('preserve_system');
        if (this.preserveToolMessages) enabledFeatures.push('preserve_tools');

        return {
            maxLength: this.maxConversationLength,
            threshold: this.compactionThreshold,
            preserveRecent: this.preserveRecentMessages,
            compressionRatio: this.compressionRatio,
            enabledFeatures
        };
    }
}
