import {UnifiedMessageProcessingError} from '../types/types';
import type { FlatUserMessage} from '@codebolt/types/sdk';
import type { InitialPromptGeneratorInterface, MessageModifier, ProcessedMessage} from '@codebolt/types/agent';





/**
 * Initial prompt generator that combines message modifiers with unified processing
 */
export class InitialPromptGenerator implements InitialPromptGeneratorInterface {
    private processors: MessageModifier[] = [];
    private metaData: Record<string, unknown> = {};
    private enableLogging: boolean;

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
                    createdMessage = await messageModifier.modify(input, createdMessage);

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
    updateProcessors(processors: MessageModifier[]){
        this.processors=processors;
    };

    getProcessors(){
        return this.processors
    }





}

/**
 * Factory function to create a unified message processor with message modifiers
 */
export function createUnifiedMessageProcessor(options: {
    processors?: MessageModifier[];
    metaData?: Record<string, unknown>;
    enableLogging?: boolean;
} = {}): InitialPromptGeneratorInterface {
    return new InitialPromptGenerator(options);
}


