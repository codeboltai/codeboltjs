import type { ProcessedMessage } from '@codebolt/types/agent';
import type { FlatUserMessage, MessageObject } from '@codebolt/types/sdk';
import {
    ChatCompressionModifier,
    type ChatCompressionOptions,
    ConversationCompactorModifier,
    type ConversationCompactorOptions,
} from '../../processor-pieces';

export type CompressionStage =
    | 'pre_inference'
    | 'post_tool'
    | 'reactive_force_compact';

export interface CompressionCoordinatorOptions {
    enabled?: boolean;
    proactiveThreshold?: number;
    postToolThreshold?: number;
    preserveThreshold?: number;
    toolResponseTokenBudget?: number;
    truncateLines?: number;
    reactiveRetryLimit?: number;
    modelTokenLimit?: number;
    compactStrategy?: 'simple' | 'smart' | 'summarize';
    enableLogging?: boolean;
}

export interface CompressionMetadata {
    status: string;
    stage: CompressionStage;
    originalTokenCount: number;
    newTokenCount: number;
    timestamp: string;
    strategy: string;
    messagesCompressed?: number;
    messagesPreserved?: number;
    toolOutputsTruncated?: boolean;
    failedAttempts?: number;
    reactiveRetryCount?: number;
    reason?: string;
}

export interface CompressionDecision {
    shouldCompress: boolean;
    estimatedTokens: number;
    threshold: number;
    reason: string;
}

export interface CompressionRecoveryResult {
    recoveredMessage: ProcessedMessage;
    shouldRetry: boolean;
    reason: string;
}

const DEFAULT_MODEL_TOKEN_LIMIT = 128000;

export class CompressionCoordinator {
    private readonly options: Required<CompressionCoordinatorOptions>;
    private readonly chatCompression: ChatCompressionModifier;
    private readonly conversationCompactor: ConversationCompactorModifier;
    private reactiveRetryCount: number = 0;

    constructor(options: CompressionCoordinatorOptions = {}) {
        this.options = {
            enabled: options.enabled ?? true,
            proactiveThreshold: options.proactiveThreshold ?? 0.7,
            postToolThreshold: options.postToolThreshold ?? 0.5,
            preserveThreshold: options.preserveThreshold ?? 0.3,
            toolResponseTokenBudget: options.toolResponseTokenBudget ?? 50000,
            truncateLines: options.truncateLines ?? 30,
            reactiveRetryLimit: options.reactiveRetryLimit ?? 1,
            modelTokenLimit: options.modelTokenLimit ?? DEFAULT_MODEL_TOKEN_LIMIT,
            compactStrategy: options.compactStrategy ?? 'summarize',
            enableLogging: options.enableLogging ?? false,
        };

        const chatCompressionOptions: ChatCompressionOptions = {
            enableCompression: this.options.enabled,
            contextPercentageThreshold: this.options.proactiveThreshold,
            modelTokenLimit: this.options.modelTokenLimit,
        };

        const conversationCompactorOptions: ConversationCompactorOptions = {
            compressionTokenThreshold: this.options.postToolThreshold,
            preserveThreshold: this.options.preserveThreshold,
            toolResponseTokenBudget: this.options.toolResponseTokenBudget,
            truncateLines: this.options.truncateLines,
            compactStrategy: this.options.compactStrategy,
            modelTokenLimit: this.options.modelTokenLimit,
            enableLogging: this.options.enableLogging,
        };

        this.chatCompression = new ChatCompressionModifier(chatCompressionOptions);
        this.conversationCompactor = new ConversationCompactorModifier(
            conversationCompactorOptions,
        );
    }

    public shouldCompressBeforeInference(
        message: ProcessedMessage,
    ): CompressionDecision {
        const estimatedTokens = this.countMessageTokens(message.message.messages);
        const threshold =
            this.options.proactiveThreshold * this.options.modelTokenLimit;

        if (!this.options.enabled) {
            return {
                shouldCompress: false,
                estimatedTokens,
                threshold,
                reason: 'Compression disabled',
            };
        }

        if (estimatedTokens >= threshold) {
            return {
                shouldCompress: true,
                estimatedTokens,
                threshold,
                reason: 'Proactive threshold reached',
            };
        }

        return {
            shouldCompress: false,
            estimatedTokens,
            threshold,
            reason: 'Below proactive threshold',
        };
    }

    public async compressBeforeInference(
        _originalRequest: FlatUserMessage,
        message: ProcessedMessage,
    ): Promise<ProcessedMessage> {
        if (!this.options.enabled) {
            return message;
        }

        return this.chatCompression.modify(_originalRequest, message);
    }

    public getPreInferenceProcessor(): ChatCompressionModifier {
        return this.chatCompression;
    }

    public getPostToolCallProcessor(): ConversationCompactorModifier {
        return this.conversationCompactor;
    }

    public async compressAfterTools(input: {
        llmMessageSent: ProcessedMessage;
        rawLLMResponseMessage: any;
        nextPrompt: ProcessedMessage;
        toolResults: any[];
        tokenLimit?: number;
        maxOutputTokens?: number;
    }): Promise<ProcessedMessage> {
        const result = await this.conversationCompactor.modify(input);
        return this.withCompressionStage(result.nextPrompt, 'post_tool');
    }

    public async recoverFromContextError(
        _originalRequest: FlatUserMessage,
        message: ProcessedMessage,
        error: unknown,
    ): Promise<CompressionRecoveryResult> {
        const errorMessage =
            error instanceof Error ? error.message : String(error);

        if (!this.isRecoverableContextError(errorMessage)) {
            return {
                recoveredMessage: message,
                shouldRetry: false,
                reason: 'Error is not context-related',
            };
        }

        if (this.reactiveRetryCount >= this.options.reactiveRetryLimit) {
            return {
                recoveredMessage: this.withCompressionMetadata(message, {
                    status: 'FAILED_REACTIVE_RETRY_LIMIT',
                    stage: 'reactive_force_compact',
                    originalTokenCount: this.countMessageTokens(
                        message.message.messages,
                    ),
                    newTokenCount: this.countMessageTokens(
                        message.message.messages,
                    ),
                    timestamp: new Date().toISOString(),
                    strategy: this.options.compactStrategy,
                    reactiveRetryCount: this.reactiveRetryCount,
                    reason: 'Reactive retry limit reached',
                }),
                shouldRetry: false,
                reason: 'Reactive retry limit reached',
            };
        }

        this.reactiveRetryCount++;

        const proactiveCompression = await this.chatCompression.tryCompressChat(
            message.message.messages,
            true,
        );

        if (
            proactiveCompression.compressedMessages &&
            proactiveCompression.compressionStatus === 1
        ) {
            return {
                recoveredMessage: this.withCompressionMetadata(
                    {
                        ...message,
                        message: {
                            ...message.message,
                            messages: proactiveCompression.compressedMessages,
                        },
                    },
                    {
                        status: 'COMPRESSED',
                        stage: 'reactive_force_compact',
                        originalTokenCount:
                            proactiveCompression.originalTokenCount,
                        newTokenCount: proactiveCompression.newTokenCount,
                        timestamp: new Date().toISOString(),
                        strategy: 'summarize',
                        reactiveRetryCount: this.reactiveRetryCount,
                        reason: 'Reactive pre-inference compression applied',
                    },
                ),
                shouldRetry: true,
                reason: 'Reactive pre-inference compression applied',
            };
        }

        const forceCompressed = await this.conversationCompactor.forceCompress(
            message.message.messages,
        );

        return {
            recoveredMessage: this.withCompressionMetadata(
                {
                    ...message,
                    message: {
                        ...message.message,
                        messages: forceCompressed.messages,
                    },
                },
                {
                    status: 'COMPRESSED',
                    stage: 'reactive_force_compact',
                    originalTokenCount: this.countMessageTokens(
                        message.message.messages,
                    ),
                    newTokenCount: this.countMessageTokens(
                        forceCompressed.messages,
                    ),
                    timestamp: new Date().toISOString(),
                    strategy: this.options.compactStrategy,
                    ...(forceCompressed.metadata.messagesCompressed !==
                        undefined && {
                        messagesCompressed:
                            forceCompressed.metadata.messagesCompressed,
                    }),
                    ...(forceCompressed.metadata.messagesPreserved !==
                        undefined && {
                        messagesPreserved:
                            forceCompressed.metadata.messagesPreserved,
                    }),
                    ...(forceCompressed.metadata.toolOutputsTruncated !==
                        undefined && {
                        toolOutputsTruncated:
                            forceCompressed.metadata.toolOutputsTruncated,
                    }),
                    reactiveRetryCount: this.reactiveRetryCount,
                    reason: 'Reactive post-tool compaction applied',
                },
            ),
            shouldRetry: true,
            reason: 'Reactive post-tool compaction applied',
        };
    }

    public resetReactiveRetries(): void {
        this.reactiveRetryCount = 0;
    }

    public getReactiveRetryCount(): number {
        return this.reactiveRetryCount;
    }

    private countMessageTokens(messages: MessageObject[]): number {
        return messages.reduce((totalTokens, message) => {
            const content =
                typeof message.content === 'string'
                    ? message.content
                    : JSON.stringify(message.content ?? '');
            return totalTokens + Math.ceil(content.length / 4) + 4;
        }, 0);
    }

    private withCompressionStage(
        message: ProcessedMessage,
        stage: CompressionStage,
    ): ProcessedMessage {
        const existingMetadata = message.metadata?.['compression'] as
            | CompressionMetadata
            | undefined;

        if (!existingMetadata) {
            return message;
        }

        return this.withCompressionMetadata(message, {
            ...existingMetadata,
            stage,
        });
    }

    private withCompressionMetadata(
        message: ProcessedMessage,
        compression: CompressionMetadata,
    ): ProcessedMessage {
        return {
            ...message,
            metadata: {
                ...message.metadata,
                compression,
            },
        };
    }

    private isRecoverableContextError(errorMessage: string): boolean {
        const contextErrorPatterns = [
            /prompt too long/i,
            /context length/i,
            /maximum context/i,
            /context window/i,
            /too many tokens/i,
            /token limit/i,
            /request too large/i,
            /input is too long/i,
        ];

        return contextErrorPatterns.some(pattern => pattern.test(errorMessage));
    }
}
