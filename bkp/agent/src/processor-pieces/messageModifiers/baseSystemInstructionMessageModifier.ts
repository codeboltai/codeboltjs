import { BaseMessageModifier, MessageModifierInput, ProcessedMessage, Message } from '../../processor';

export interface BaseSystemInstructionMessageModifierOptions {
    systemInstruction?: string;
    position?: 'start' | 'end';
}

export class BaseSystemInstructionMessageModifier extends BaseMessageModifier {
    private readonly systemInstruction: string;
    private readonly position: 'start' | 'end';

    constructor(options: BaseSystemInstructionMessageModifierOptions = {}) {
        super({ context: options });
        this.systemInstruction = options.systemInstruction || 'You are a helpful assistant.';
        this.position = options.position || 'start';
    }

    async modify(input: MessageModifierInput): Promise<ProcessedMessage> {
        try {
            const { originalRequest, createdMessage, context } = input;
            
            // Create system instruction message
            const systemMessage: Message = {
                role: 'system',
                content: this.systemInstruction,
                name: 'system-instruction'
            };

            let messages: Message[];
            
            if (this.position === 'start') {
                // Add system instruction at the beginning
                messages = [systemMessage, ...createdMessage.messages];
            } else {
                // Add system instruction at the end (before user message)
                const userMessages = createdMessage.messages.filter(m => m.role === 'user');
                const otherMessages = createdMessage.messages.filter(m => m.role !== 'user');
                messages = [...otherMessages, systemMessage, ...userMessages];
            }

            return {
                messages,
                metadata: {
                    ...createdMessage.metadata,
                    systemInstructionAdded: true,
                    systemInstructionPosition: this.position
                }
            };
        } catch (error) {
            console.error('Error in BaseSystemInstructionMessageModifier:', error);
            throw error;
        }
    }
}
