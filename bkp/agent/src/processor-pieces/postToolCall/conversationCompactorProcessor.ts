import { BaseProcessor, ProcessorInput, ProcessorOutput, ProcessedMessage, Message } from '../../processor';
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
            const conversationLength = message.messages.length;
            const threshold = Math.floor(this.maxConversationLength * this.compactionThreshold);

            // Check if compaction is needed
            if (conversationLength <= threshold) {
                return [this.createEvent('ConversationCompactionSkipped', {
                    conversationLength,
                    threshold,
                    reason: 'Below compaction threshold'
                })];
            }

            // Perform compaction
            const compactedMessage = await this.compactConversation(message, context);
            const compactionInfo = this.calculateCompactionInfo(message, compactedMessage);

            return [
                this.createEvent('ConversationCompacted', compactionInfo),
                this.createEvent('ConversationProcessed', compactedMessage)
            ];

        } catch (error) {
            console.error('Error in ConversationCompactorProcessor:', error);
            return [this.createEvent('ConversationCompactionError', {
                error: error instanceof Error ? error.message : String(error),
                originalLength: input.message.messages.length
            })];
        }
    }

    private async compactConversation(
        message: ProcessedMessage, 
        context?: Record<string, any>
    ): Promise<ProcessedMessage> {
        const messages = [...message.messages];
        let compactionMethod: 'summarization' | 'truncation' | 'smart_removal' = 'truncation';

        // Try smart removal first if enabled
        if (this.enableSmartRemoval) {
            const smartCompacted = await this.performSmartRemoval(messages);
            if (smartCompacted.length <= this.maxConversationLength) {
                compactionMethod = 'smart_removal';
                return {
                    ...message,
                    messages: smartCompacted,
                    metadata: {
                        ...message.metadata,
                        compacted: true,
                        compactionMethod,
                        originalLength: messages.length,
                        compactedLength: smartCompacted.length
                    }
                };
            }
        }

        // Try summarization if enabled and we have chat summary service
        if (this.enableSummarization) {
            try {
                const summarized = await this.performSummarization(messages);
                if (summarized.length <= this.maxConversationLength) {
                    compactionMethod = 'summarization';
                    return {
                        ...message,
                        messages: summarized,
                        metadata: {
                            ...message.metadata,
                            compacted: true,
                            compactionMethod,
                            originalLength: messages.length,
                            compactedLength: summarized.length
                        }
                    };
                }
            } catch (error) {
                console.warn('Summarization failed, falling back to truncation:', error);
            }
        }

        // Fall back to truncation
        const truncated = this.performTruncation(messages);
        return {
            ...message,
            messages: truncated,
            metadata: {
                ...message.metadata,
                compacted: true,
                compactionMethod,
                originalLength: messages.length,
                compactedLength: truncated.length
            }
        };
    }

    private async performSmartRemoval(messages: Message[]): Promise<Message[]> {
        const result: Message[] = [];
        const messagesToAnalyze = [...messages];

        // Always preserve system messages if enabled
        if (this.preserveSystemMessages) {
            const systemMessages = messagesToAnalyze.filter(m => m.role === 'system');
            result.push(...systemMessages);
            messagesToAnalyze.splice(0, messagesToAnalyze.length, 
                ...messagesToAnalyze.filter(m => m.role !== 'system'));
        }

        // Always preserve recent messages
        const recentMessages = messagesToAnalyze.slice(-this.preserveRecentMessages);
        const olderMessages = messagesToAnalyze.slice(0, -this.preserveRecentMessages);

        // Analyze older messages for importance
        const importantOlderMessages = this.selectImportantMessages(olderMessages);

        // Preserve tool messages if enabled
        let toolMessages: Message[] = [];
        if (this.preserveToolMessages) {
            toolMessages = olderMessages.filter(m => m.role === 'tool');
        }

        // Combine all preserved messages
        const preservedMessages = [
            ...importantOlderMessages,
            ...toolMessages,
            ...recentMessages
        ];

        // Remove duplicates while preserving order
        const seen = new Set();
        const uniqueMessages = preservedMessages.filter(msg => {
            const key = `${msg.role}-${JSON.stringify(msg.content)}-${msg.tool_call_id || ''}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        result.push(...uniqueMessages);
        return result;
    }

    private selectImportantMessages(messages: Message[]): Message[] {
        // Score messages based on importance criteria
        const scoredMessages = messages.map(msg => ({
            message: msg,
            score: this.calculateMessageImportance(msg)
        }));

        // Sort by score (highest first)
        scoredMessages.sort((a, b) => b.score - a.score);

        // Select top messages up to compression ratio
        const targetCount = Math.floor(messages.length * this.compressionRatio);
        return scoredMessages.slice(0, targetCount).map(sm => sm.message);
    }

    private calculateMessageImportance(message: Message): number {
        let score = 0;

        // Base score by role
        switch (message.role) {
            case 'system':
                score += 10;
                break;
            case 'tool':
                score += 8;
                break;
            case 'assistant':
                score += 5;
                break;
            case 'user':
                score += 3;
                break;
        }

        // Content-based scoring
        const content = typeof message.content === 'string' 
            ? message.content 
            : JSON.stringify(message.content);

        // Longer messages might be more important
        score += Math.min(content.length / 100, 5);

        // Messages with tool calls are important
        if (message.tool_calls && message.tool_calls.length > 0) {
            score += 7;
        }

        // Messages with specific keywords are important
        const importantKeywords = [
            'error', 'warning', 'critical', 'important', 'required',
            'configuration', 'setup', 'install', 'deploy', 'build'
        ];
        
        const lowerContent = content.toLowerCase();
        importantKeywords.forEach(keyword => {
            if (lowerContent.includes(keyword)) {
                score += 2;
            }
        });

        return score;
    }

    private async performSummarization(messages: Message[]): Promise<Message[]> {
        try {
            // Preserve system messages and recent messages
            const systemMessages = this.preserveSystemMessages 
                ? messages.filter(m => m.role === 'system')
                : [];
            
            const recentMessages = messages.slice(-this.preserveRecentMessages);
            const messagesToSummarize = messages.slice(0, -this.preserveRecentMessages)
                .filter(m => !this.preserveSystemMessages || m.role !== 'system');

            if (messagesToSummarize.length === 0) {
                return [...systemMessages, ...recentMessages];
            }

            // Convert to format expected by chatSummary
            const formattedMessages = messagesToSummarize.map(msg => ({
                role: msg.role,
                content: typeof msg.content === 'string' ? msg.content : 
                        Array.isArray(msg.content) ? msg.content.map(c => (c as any).text).join(' ') : 
                        JSON.stringify(msg.content)
            }));

            // Use chat summary service
            const targetLength = Math.floor(this.maxConversationLength * this.compressionRatio);
            const summaryResponse = await chatSummary.summarize(formattedMessages, targetLength) as any;
            
            if (summaryResponse && (summaryResponse.payload || summaryResponse.summary)) {
                const summaryText = summaryResponse.payload || summaryResponse.summary;
                
                const summaryMessage: Message = {
                    role: 'system',
                    content: `Previous conversation summary: ${summaryText}`,
                    name: 'conversation-summary'
                };

                return [
                    ...systemMessages,
                    summaryMessage,
                    ...recentMessages
                ];
            }

            // If summarization fails, fall back to truncation
            return this.performTruncation(messages);

        } catch (error) {
            console.warn('Summarization failed:', error);
            return this.performTruncation(messages);
        }
    }

    private performTruncation(messages: Message[]): Message[] {
        // Simple truncation: keep system messages + recent messages
        const systemMessages = this.preserveSystemMessages 
            ? messages.filter(m => m.role === 'system')
            : [];
        
        const nonSystemMessages = messages.filter(m => 
            !this.preserveSystemMessages || m.role !== 'system'
        );

        const availableSlots = this.maxConversationLength - systemMessages.length;
        const recentMessages = nonSystemMessages.slice(-Math.max(availableSlots, this.preserveRecentMessages));

        return [...systemMessages, ...recentMessages];
    }

    private calculateCompactionInfo(
        original: ProcessedMessage, 
        compacted: ProcessedMessage
    ): ConversationCompactorInfo {
        const originalCount = original.messages.length;
        const compactedCount = compacted.messages.length;
        
        return {
            originalMessageCount: originalCount,
            compactedMessageCount: compactedCount,
            compressionRatio: compactedCount / originalCount,
            compactionMethod: (compacted.metadata?.compactionMethod as any) || 'truncation',
            preservedMessages: compactedCount,
            removedMessages: originalCount - compactedCount
        };
    }

    // Public methods for configuration
    setMaxConversationLength(length: number): void {
        (this as any).maxConversationLength = Math.max(10, length);
    }

    setCompressionRatio(ratio: number): void {
        (this as any).compressionRatio = Math.max(0.1, Math.min(0.9, ratio));
    }

    setPreserveRecentMessages(count: number): void {
        (this as any).preserveRecentMessages = Math.max(1, count);
    }

    enableSummarizationForSession(): void {
        (this as any).enableSummarization = true;
    }

    disableSummarizationForSession(): void {
        (this as any).enableSummarization = false;
    }

    enableSmartRemovalForSession(): void {
        (this as any).enableSmartRemoval = true;
    }

    disableSmartRemovalForSession(): void {
        (this as any).enableSmartRemoval = false;
    }
}
