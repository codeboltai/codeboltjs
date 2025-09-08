/**
 * Message Modifier Types
 * These are processors that modify the message from the user to the prompt
 * Called by the InitialPromptGenerator
 */

import { ProcessedMessage } from '../common';

export interface MessageModifier {
    modify(input: MessageModifierInput): Promise<ProcessedMessage>;
    setContext(key: string, value: unknown): void;
    getContext(key: string): unknown;
    clearContext(): void;
}

export interface MessageModifierInput {
    originalRequest: unknown;
    createdMessage: ProcessedMessage;
    context?: Record<string, unknown>;
}

export interface MessageModifierOptions {
    context?: Record<string, unknown>;
}

// Factory function type for message modifiers
export type MessageModifierFactory<T extends MessageModifier = MessageModifier> = (
    config?: MessageModifierOptions
) => T;