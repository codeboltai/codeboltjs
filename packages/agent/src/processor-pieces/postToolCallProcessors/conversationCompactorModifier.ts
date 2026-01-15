/**
 * Conversation Compactor Modifier
 * Post-Tool Call processor for compacting conversation history to reduce context size
 */

import { BasePostToolCallProcessor } from '../base/basePostToolCallProcessor';
import {
    PostToolCallProcessorInput,
    PostToolCallProcessorOutput,
    ProcessedMessage
} from '@codebolt/types/agent';

export interface ConversationCompactorOptions {
    maxMessages?: number;
    preserveSystemMessages?: boolean;
    preserveLastUserMessages?: number;
    preserveLastToolResults?: number;
    compactStrategy?: 'simple' | 'smart' | 'summarize';
}

export class ConversationCompactorModifier extends BasePostToolCallProcessor {
    private options: ConversationCompactorOptions;

    constructor(options: ConversationCompactorOptions = {}) {
        super();
        this.options = {
            maxMessages: 50,
            preserveSystemMessages: true,
            preserveLastUserMessages: 5,
            preserveLastToolResults: 10,
            compactStrategy: 'smart',
            ...options
        };
    }

    async modify(input: PostToolCallProcessorInput): Promise<PostToolCallProcessorOutput> {
        // For now, pass through the nextPrompt unchanged since we need to understand
        // the ProcessedMessage structure better for compaction
        // TODO: Implement conversation compaction logic once we understand the message structure

        // Add metadata to track that this processor was applied
        const modifiedNextPrompt: ProcessedMessage = {
            ...input.nextPrompt,
            metadata: {
                ...input.nextPrompt.metadata,
                compactedBy: 'ConversationCompactorModifier',
                compactedAt: new Date().toISOString(),
                strategy: this.options.compactStrategy
            }
        };

        return {
            nextPrompt: modifiedNextPrompt,
            shouldExit: false
        };
    }
}