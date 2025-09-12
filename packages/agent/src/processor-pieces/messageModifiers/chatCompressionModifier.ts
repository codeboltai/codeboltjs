import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";

export interface ChatCompressionOptions {
    tokenThreshold?: number;
    compressionRatio?: number;
    preserveRecentMessages?: number;
    enableCompression?: boolean;
}

export class ChatCompressionModifier extends BaseMessageModifier {
    private readonly options: ChatCompressionOptions;
    private hasFailedCompressionAttempt: boolean = false;

    constructor(options: ChatCompressionOptions = {}){
        super()
        this.options = {
            tokenThreshold: options.tokenThreshold || 8000, // Approximate token threshold
            compressionRatio: options.compressionRatio || 0.5, // Compress to 50% of original
            preserveRecentMessages: options.preserveRecentMessages || 5,
            enableCompression: options.enableCompression !== false
        };
    }

    async modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            if (!this.options.enableCompression || this.hasFailedCompressionAttempt) {
                return createdMessage;
            }

            const messages = createdMessage.message.messages;
            
            // Skip compression if we don't have enough messages
            if (messages.length <= this.options.preserveRecentMessages!) {
                return createdMessage;
            }

            const shouldCompress = await this.shouldCompressChat(messages);
            
            if (!shouldCompress) {
                return createdMessage;
            }

            const compressedMessages = await this.compressMessages(messages);
            
            return Promise.resolve({
                message: {
                    ...createdMessage.message,
                    messages: compressedMessages
                },
                metadata: {
                    ...createdMessage.metadata,
                    chatCompressed: true,
                    originalMessageCount: messages.length,
                    compressedMessageCount: compressedMessages.length
                }
            });
        } catch (error) {
            console.error('Error in ChatCompressionModifier:', error);
            this.hasFailedCompressionAttempt = true;
            return createdMessage;
        }
    }

    private async shouldCompressChat(messages: MessageObject[]): Promise<boolean> {
        // Estimate token count (rough approximation: 4 characters per token)
        const totalCharacters = messages.reduce((sum, msg) => {
            return sum + (typeof msg.content === 'string' ? msg.content.length : JSON.stringify(msg.content).length);
        }, 0);
        
        const estimatedTokens = totalCharacters / 4;
        return estimatedTokens > this.options.tokenThreshold!;
    }

    private async compressMessages(messages: MessageObject[]): Promise<MessageObject[]> {
        const preserveCount = this.options.preserveRecentMessages!;
        const recentMessages = messages.slice(-preserveCount);
        const messagesToCompress = messages.slice(0, -preserveCount);

        if (messagesToCompress.length === 0) {
            return messages;
        }

        // Create a summary of the messages to compress
        const conversationSummary = this.createConversationSummary(messagesToCompress);
        
        const compressionMessage: MessageObject = {
            role: 'system',
            content: `[Conversation Summary - Previous ${messagesToCompress.length} messages compressed]

${conversationSummary}

[End of Summary - Continuing with recent conversation...]`
        };

        return [compressionMessage, ...recentMessages];
    }

    private createConversationSummary(messages: MessageObject[]): string {
        const summaryParts: string[] = [];
        let currentTopic = '';
        let userQuestions: string[] = [];
        let assistantResponses: string[] = [];

        for (const message of messages) {
            const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
            
            if (message.role === 'user') {
                // Extract key questions or requests
                if (content.length > 20) { // Only include substantial messages
                    userQuestions.push(content.substring(0, 100) + (content.length > 100 ? '...' : ''));
                }
            } else if (message.role === 'assistant') {
                // Extract key responses or actions
                if (content.length > 20) {
                    assistantResponses.push(content.substring(0, 100) + (content.length > 100 ? '...' : ''));
                }
            }
        }

        if (userQuestions.length > 0) {
            summaryParts.push(`Key user requests: ${userQuestions.slice(0, 3).join('; ')}`);
        }
        
        if (assistantResponses.length > 0) {
            summaryParts.push(`Key assistant actions: ${assistantResponses.slice(0, 3).join('; ')}`);
        }

        summaryParts.push(`Total messages compressed: ${messages.length}`);

        return summaryParts.join('\n');
    }

    public resetCompressionState(): void {
        this.hasFailedCompressionAttempt = false;
    }
}
