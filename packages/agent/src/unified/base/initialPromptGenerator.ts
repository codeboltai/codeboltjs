import {UnifiedMessageProcessingError} from '../types/types';
import { MessageModifierInput, ProcessedMessage, MessageModifier } from '../../processor';
import type { FlatUserMessage } from '@codebolt/types/sdk';


/**
 * Unified message processor interface specifically for message modifiers
 * Processes FlatUserMessage through a chain of MessageModifiers and returns OpenAI-formatted messages
 */
export interface UnifiedMessageProcessor {
    /** Process and modify input messages */
    processMessage(input: FlatUserMessage): Promise<ProcessedMessage>;
    /** Add a message modifier */
    addProcessor(processor: MessageModifier): void;
    /** Set context value */
    setContext(key: string, value: unknown): void;
    /** Get context value */
    getContext(key: string): unknown;
    /** Clear all context */
    clearContext(): void;
}

/**
 * Initial prompt generator that combines message modifiers with unified processing
 */
export class InitialPromptGenerator implements UnifiedMessageProcessor {
    private processors: MessageModifier[] = [];
    private context: Record<string, unknown> = {};
    private enableLogging: boolean;

    constructor(options: { 
        processors?: MessageModifier[];
        baseSystemPrompt?: string;
        context?: Record<string, unknown>;  
        enableLogging?: boolean;
        templating?: boolean;
    } = {}) {
        this.processors = options.processors || [];
        this.context = options.context || {};
        this.enableLogging = options.enableLogging !== false;
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

            let createdMessage: ProcessedMessage = {
                messages: [
                    {
                        role: 'user',
                        content
                    }
                ],
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
                    createdMessage = await messageModifier.modify({
                        originalRequest: input,  // The entire FlatUserMessage
                        createdMessage: createdMessage,  // Current state of processed messages
                        context: this.context
                    });

                } catch (error) {
                    console.error(`[InitialPromptGenerator] Error in message modifier:`, error);
                    // Continue with other modifiers
                }
            }

            if (this.enableLogging) {
                console.log('[InitialPromptGenerator] Processing completed:', {
                    messageCount: createdMessage.messages.length,
                    metadata: createdMessage.metadata
                });
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
     * Add a message modifier to the generator
     */
    addProcessor(processor: MessageModifier): void {
        this.processors.push(processor);
        if (this.enableLogging) {
            console.log('[UnifiedMessageModifier] Added message modifier:', processor.constructor.name);
        }
    }

    /**
     * Remove a message modifier from the generator
     */
    removeProcessor(processor: MessageModifier): boolean {
        const index = this.processors.indexOf(processor);
        if (index > -1) {
            this.processors.splice(index, 1);
            if (this.enableLogging) {
                console.log('[UnifiedMessageModifier] Removed message modifier:', processor.constructor.name);
            }
            return true;
        }
        return false;
    }

    /**
     * Set context value
     */
    setContext(key: string, value: unknown): void {
        this.context[key] = value;
    }

    /**
     * Get context value
     */
    getContext(key: string): unknown {
        return this.context[key];
    }

    /**
     * Clear all context
     */
    clearContext(): void {
        this.context = {};
    }

    /**
     * Get all message modifiers
     */
    getProcessors(): MessageModifier[] {
        return [...this.processors];
    }


}

/**
 * Factory function to create a unified message processor with message modifiers
 */
export function createUnifiedMessageProcessor(options: {
    processors?: MessageModifier[];
    context?: Record<string, unknown>;
    enableLogging?: boolean;
} = {}): UnifiedMessageProcessor {
    return new InitialPromptGenerator(options);
}

/**
 * Utility function to create a basic message processor with default settings
 */
export function createBasicMessageProcessor(): UnifiedMessageProcessor {
    return new InitialPromptGenerator({
        enableLogging: true,
        context: {
            timestamp: new Date().toISOString(),
            version: '1.0.0'
        }
    });
}
