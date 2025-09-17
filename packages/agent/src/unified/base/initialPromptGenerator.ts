import { UnifiedMessageProcessingError } from '../types/types';
import type { FlatUserMessage, MessageObject } from '@codebolt/types/sdk';
import type { InitialPromptGeneratorInterface, MessageModifier, ProcessedMessage } from '@codebolt/types/agent';
import codebolt from '@codebolt/codeboltjs';





/**
 * Initial prompt generator that combines message modifiers with unified processing
 */
export class InitialPromptGenerator implements InitialPromptGeneratorInterface {
    private processors: MessageModifier[] = [];
    private metaData: Record<string, unknown> = {};
    private enableLogging: boolean;
    private baseSystemPrompt?: string;

    constructor(options: {
        processors?: MessageModifier[];
        baseSystemPrompt?: string;
        metaData?: Record<string, unknown>;
        enableLogging?: boolean;
        templating?: boolean;
    } = {}) {
        this.processors = options.processors || [];
        this.metaData = options.metaData || {};
        this.enableLogging = options.enableLogging !== false;
        this.baseSystemPrompt = options.baseSystemPrompt;
    }

    /**
     * Process and modify input messages using the message modifier pattern
     */
    async processMessage(input: FlatUserMessage): Promise<ProcessedMessage> {
        try {
            if (this.enableLogging) {
                console.log('[InitialPromptGenerator] Processing message:', input);
            }

            // Create initial ProcessedMessage from FlatUserMessage
            const content = input.userMessage;

            // Create messages array, starting with system message if baseSystemPrompt is defined
            const messages: MessageObject[] = [];

            let createdMessage: ProcessedMessage = {
                message: {
                    messages: messages,
                    tools: []
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    messageId: input.messageId,
                    threadId: input.threadId
                }
            };


            // Apply all message modifiers in sequence
            // Each modifier receives the original request (FlatUserMessage) and the current processed message
            for (const messageModifier of this.processors) {
                try {
                    // Each modifier returns a new ProcessedMessage
                    createdMessage = await messageModifier.modify(input, createdMessage);

                } catch (error) {
                    console.error(`[InitialPromptGenerator] Error in message modifier:`, error);
                    // Continue with other modifiers
                }
            }
            createdMessage.message.messages.push({
                role: 'assistant' as const,
                content:"Got it. Thanks for the context!"
            });

            createdMessage.message.messages.push({
                role: 'user' as const,
                content:content.trim()
            });

            if (this.enableLogging) {
                console.log('[InitialPromptGenerator] Processing completed:', {
                    messageCount: createdMessage.message.messages.length,
                    metadata: createdMessage.metadata
                });
            }
            if (this.baseSystemPrompt !== undefined) {
                const hasSystem = createdMessage.message.messages.some(msg => msg.role === 'system');
                if (!hasSystem) {
                    createdMessage.message.messages.unshift({
                        role: 'system' as const,
                        content: this.baseSystemPrompt
                    });
                }
            }
            return createdMessage;

        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            throw new UnifiedMessageProcessingError(
                `Failed to process message: ${errorMessage}`
            );
        }
    }



    /**
     * Set context value
     */
    setMetaData(key: string, value: unknown): void {
        this.metaData[key] = value;
    }

    /**
     * Get context value
     */
    getMetaData(key: string): unknown {
        return this.metaData[key];
    }

    /**
     * Clear all context
     */
    clearMetaData(): void {
        this.metaData = {};
    }

    /**
     * Get all message modifiers
     */
    updateProcessors(processors: MessageModifier[]) {
        this.processors = processors;
    };

    getProcessors() {
        return this.processors
    }





}

/**
 * Factory function to create a unified message processor with message modifiers
 */
export function createUnifiedMessageProcessor(options: {
    processors?: MessageModifier[];
    baseSystemPrompt?: string;
    metaData?: Record<string, unknown>;
    enableLogging?: boolean;
} = {}): InitialPromptGeneratorInterface {
    return new InitialPromptGenerator(options);
}


