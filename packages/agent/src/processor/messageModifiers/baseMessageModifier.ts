import { MessageModifier, MessageModifierInput, ProcessedMessage } from '../types/interfaces';

export interface MessageModifierOptions {
    context?: Record<string, any>;
}

export abstract class BaseMessageModifier implements MessageModifier {
    protected context: Record<string, any> = {};

    constructor(options: MessageModifierOptions = {}) {
        this.context = options.context || {};
    }

    abstract modify(input: MessageModifierInput): Promise<ProcessedMessage>;

    setContext(key: string, value: any): void {
        this.context[key] = value;
    }

    getContext(key: string): any {
        return this.context[key];
    }

    clearContext(): void {
        this.context = {};
    }
}

// New RequestMessage class that can chain multiple modifiers
export class RequestMessage {
    private messageModifiers: MessageModifier[] = [];

    constructor(options: { messageModifiers?: MessageModifier[] } = {}) {
        this.messageModifiers = options.messageModifiers || [];
    }

    addModifier(modifier: MessageModifier): void {
        this.messageModifiers.push(modifier);
    }

    async modify(message: any): Promise<ProcessedMessage> {
        let currentMessage: ProcessedMessage = {
            messages: [
                {
                    role: 'user',
                    content: typeof message === 'string' ? message : JSON.stringify(message)
                }
            ]
        };

        // Apply each modifier in sequence
        for (const modifier of this.messageModifiers) {
            try {
                currentMessage = await modifier.modify({
                    originalRequest: message,
                    createdMessage: currentMessage,
                    context: {}
                });
            } catch (error) {
                console.error('Error applying message modifier:', error);
                // Continue with other modifiers
            }
        }

        return currentMessage;
    }
}
