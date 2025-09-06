/**
 * Base Message Modifier Class
 * Abstract base class for all message modifiers
 * Message modifiers convert user messages to prompts for the LLM
 */

import { 
    MessageModifier, 
    MessageModifierInput, 
    MessageModifierOptions 
} from '../../types/processorTypes/messageModifierTypes';
import { ProcessedMessage } from '../../types/common';

export abstract class BaseMessageModifier implements MessageModifier {
    protected context: Record<string, unknown> = {};

    constructor(options: MessageModifierOptions = {}) {
        this.context = options.context || {};
    }

    abstract modify(input: MessageModifierInput): Promise<ProcessedMessage>;

    setContext(key: string, value: unknown): void {
        this.context[key] = value;
    }

    getContext(key: string): unknown {
        return this.context[key];
    }

    clearContext(): void {
        this.context = {};
    }

    // Helper method to merge messages
    protected mergeMessages(existing: ProcessedMessage, additional: ProcessedMessage): ProcessedMessage {
        return {
            messages: [...existing.messages, ...additional.messages],
            metadata: {
                ...existing.metadata,
                ...additional.metadata,
                merged: true,
                mergedAt: new Date().toISOString()
            }
        };
    }

    // Helper method to add system message
    protected addSystemMessage(message: ProcessedMessage, systemContent: string): ProcessedMessage {
        const systemMessage = {
            role: 'system' as const,
            content: systemContent
        };

        return {
            messages: [systemMessage, ...message.messages],
            metadata: {
                ...message.metadata,
                systemMessageAdded: true
            }
        };
    }

    // Helper method to add user context
    protected addUserContext(message: ProcessedMessage, contextKey: string, contextValue: unknown): ProcessedMessage {
        const contextString = typeof contextValue === 'string' ? contextValue : JSON.stringify(contextValue);
        const contextMessage = {
            role: 'user' as const,
            content: `Context (${contextKey}): ${contextString}`
        };

        return {
            messages: [...message.messages, contextMessage],
            metadata: {
                ...message.metadata,
                contextAdded: contextKey
            }
        };
    }
}
