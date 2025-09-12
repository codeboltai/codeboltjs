import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";

export interface LoopDetectionOptions {
    maxSimilarMessages?: number;
    similarityThreshold?: number;
    timeWindowMs?: number;
    enableLoopPrevention?: boolean;
}

interface MessageHistory {
    content: string;
    timestamp: number;
    role: string;
}

export class LoopDetectionModifier extends BaseMessageModifier {
    private readonly options: LoopDetectionOptions;
    private messageHistory: MessageHistory[] = [];
    private loopDetected: boolean = false;

    constructor(options: LoopDetectionOptions = {}){
        super()
        this.options = {
            maxSimilarMessages: options.maxSimilarMessages || 3,
            similarityThreshold: options.similarityThreshold || 0.8,
            timeWindowMs: options.timeWindowMs || 60000, // 1 minute
            enableLoopPrevention: options.enableLoopPrevention !== false
        };
    }

    modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            if (!this.options.enableLoopPrevention) {
                return Promise.resolve(createdMessage);
            }

            const currentTime = Date.now();
            const messages = createdMessage.message.messages;

            // Add current messages to history
            for (const message of messages) {
                if (typeof message.content === 'string') {
                    this.messageHistory.push({
                        content: message.content,
                        timestamp: currentTime,
                        role: message.role
                    });
                }
            }

            // Clean old messages from history
            this.cleanOldMessages(currentTime);

            // Check for loops
            const loopDetected = this.detectLoop();
            
            if (loopDetected && !this.loopDetected) {
                this.loopDetected = true;
                
                // Add loop detection warning
                const warningMessage: MessageObject = {
                    role: 'system',
                    content: `[Loop Detection Warning] Similar messages detected in recent conversation. This may indicate a conversational loop. Consider rephrasing your request or providing more specific information.`
                };

                const updatedMessages = [...messages, warningMessage];

                return Promise.resolve({
                    message: {
                        ...createdMessage.message,
                        messages: updatedMessages
                    },
                    metadata: {
                        ...createdMessage.metadata,
                        loopDetected: true,
                        loopDetectionWarningAdded: true
                    }
                });
            }

            // Reset loop detection if we haven't detected a loop recently
            if (!loopDetected && this.loopDetected) {
                this.loopDetected = false;
            }

            return Promise.resolve({
                message: createdMessage.message,
                metadata: {
                    ...createdMessage.metadata,
                    loopDetectionChecked: true,
                    loopDetected: false
                }
            });
        } catch (error) {
            console.error('Error in LoopDetectionModifier:', error);
            return Promise.resolve(createdMessage);
        }
    }

    private detectLoop(): boolean {
        if (this.messageHistory.length < this.options.maxSimilarMessages!) {
            return false;
        }

        // Get recent messages grouped by role
        const recentUserMessages = this.messageHistory
            .filter(msg => msg.role === 'user')
            .slice(-this.options.maxSimilarMessages!);

        const recentAssistantMessages = this.messageHistory
            .filter(msg => msg.role === 'assistant')
            .slice(-this.options.maxSimilarMessages!);

        // Check for similar user messages
        if (recentUserMessages.length >= this.options.maxSimilarMessages!) {
            const userLoop = this.checkSimilarMessages(recentUserMessages);
            if (userLoop) return true;
        }

        // Check for similar assistant messages
        if (recentAssistantMessages.length >= this.options.maxSimilarMessages!) {
            const assistantLoop = this.checkSimilarMessages(recentAssistantMessages);
            if (assistantLoop) return true;
        }

        return false;
    }

    private checkSimilarMessages(messages: MessageHistory[]): boolean {
        if (messages.length < 2) return false;

        // Compare each message with every other message
        for (let i = 0; i < messages.length - 1; i++) {
            for (let j = i + 1; j < messages.length; j++) {
                const similarity = this.calculateSimilarity(messages[i].content, messages[j].content);
                if (similarity >= this.options.similarityThreshold!) {
                    return true;
                }
            }
        }

        return false;
    }

    private calculateSimilarity(text1: string, text2: string): number {
        // Simple similarity calculation using Levenshtein distance
        const distance = this.levenshteinDistance(text1.toLowerCase(), text2.toLowerCase());
        const maxLength = Math.max(text1.length, text2.length);
        
        if (maxLength === 0) return 1;
        
        return 1 - (distance / maxLength);
    }

    private levenshteinDistance(str1: string, str2: string): number {
        const matrix: number[][] = [];

        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }

        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }

        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }

        return matrix[str2.length][str1.length];
    }

    private cleanOldMessages(currentTime: number): void {
        const cutoffTime = currentTime - this.options.timeWindowMs!;
        this.messageHistory = this.messageHistory.filter(msg => msg.timestamp >= cutoffTime);
    }

    public resetLoopDetection(): void {
        this.messageHistory = [];
        this.loopDetected = false;
    }

    public getMessageHistory(): MessageHistory[] {
        return [...this.messageHistory];
    }
}
