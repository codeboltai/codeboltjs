import { UnifiedMessageProcessingError } from '../types/types';
import type { FlatUserMessage } from '@codebolt/types/sdk';
import type { InitialPromptGeneratorInterface, MessageModifier, ProcessedMessage } from '@codebolt/types/agent';
import codebolt from '@codebolt/codeboltjs';
import {
    appendTranscriptMessage,
    appendUserContextMessage,
    reconcileRuntimePromptContext,
    setSystemPrompt,
    syncProcessedMessageWithRuntimeContext,
} from './promptContext';





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
        if (options.baseSystemPrompt !== undefined) {
            this.baseSystemPrompt = options.baseSystemPrompt;
        }
    }

    /**
     * Process and modify input messages using the message modifier pattern
     */
    async processMessage(input: FlatUserMessage): Promise<ProcessedMessage> {
        try {
            if (this.enableLogging) {
                // console.log('[InitialPromptGenerator] Processing message:', input);
            }

            let createdMessage: ProcessedMessage = {
                message: {
                    messages: [],
                    tools: []
                },
                metadata: {
                    timestamp: new Date().toISOString(),
                    messageId: input.messageId,
                    threadId: input.threadId
                }
            };


            createdMessage = syncProcessedMessageWithRuntimeContext(createdMessage);

            if (this.baseSystemPrompt !== undefined) {
                createdMessage = setSystemPrompt(createdMessage, this.baseSystemPrompt);
            }

            createdMessage = appendTranscriptMessage(createdMessage, {
                role: 'user' as const,
                content: input.userMessage.trim(),
            });

            for (const messageModifier of this.processors) {
                try {
                    createdMessage = await messageModifier.modify(input, createdMessage);
                    createdMessage = reconcileRuntimePromptContext(createdMessage);
                } catch (error) {
                    console.error(`[InitialPromptGenerator] Error in message modifier:`, error);
                }
            }

            let { todos } = await codebolt.todo.getAllIncompleteTodos();

            if (todos && todos.length == 0) {
                createdMessage = appendUserContextMessage(createdMessage, {
                    role: 'user' as const,
                    content: "<system-reminder>\nThis is a reminder that your todo list is currently empty. DO NOT mention this to the user explicitly because they are already aware. If you are working on tasks that would benefit from a todo list please use the TodoWrite tool to create one. If not, please feel free to ignore. Again do not mention this message to the user.\n</system-reminder>"
                });
            }

            if (this.enableLogging) {
                // console.log('[InitialPromptGenerator] Processing completed:', {
                //     messageCount: createdMessage.message.messages.length,
                //     metadata: createdMessage.metadata
                // });
            }
            return syncProcessedMessageWithRuntimeContext(createdMessage);

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
