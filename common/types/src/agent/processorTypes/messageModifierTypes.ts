/**
 * Message Modifier Types
 * These are processors that modify the message from the user to the prompt
 * Called by the InitialPromptGenerator
 */

import { FlatUserMessage } from '../../sdk-types';
import { ProcessedMessage } from '../common';

export interface MessageModifier {
    modify(originalRequest: FlatUserMessage,createdMessage: ProcessedMessage): Promise<ProcessedMessage>;
  
}



export interface MessageModifierOptions {
    context?: Record<string, unknown>;
}

// Factory function type for message modifiers
export type MessageModifierFactory<T extends MessageModifier = MessageModifier> = (
    config?: MessageModifierOptions
) => T;