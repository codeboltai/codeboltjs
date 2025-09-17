/**
 * Base Message Modifier Class
 * Abstract base class for all message modifiers
 * Message modifiers convert user messages to prompts for the LLM
 */

import { 
    MessageModifier, 
 
    MessageModifierOptions,
    ProcessedMessage
} from '@codebolt/types/agent';
import { FlatUserMessage } from '@codebolt/types/sdk';

export abstract class BaseMessageModifier implements MessageModifier {
    protected context: Record<string, unknown> = {};

    constructor(options: MessageModifierOptions = {}) {
        this.context = options.context || {};
    }

    abstract modify(originalRequest: FlatUserMessage,createdMessage: ProcessedMessage): Promise<ProcessedMessage>;

  

}
