import type { ProcessedMessage } from '@codebolt/types/agent';
import type { FlatUserMessage, MessageObject } from '@codebolt/types/sdk';
import {
  ChatCompressionModifier,
  ConversationCompactorModifier,
  type ConversationCompactorOptions,
} from '@codebolt/agent/processor-pieces';

type CompressionStage = 'pre_inference' | 'post_tool' | 'reactive_force_compact';

interface CompressionMetadata {
  status: string;
  stage: CompressionStage;
  originalTokenCount: number;
  newTokenCount: number;
  timestamp: string;
  strategy: string;
  messagesCompressed?: number;
  messagesPreserved?: number;
  toolOutputsTruncated?: boolean;
  reactiveRetryCount?: number;
  reason?: string;
}

interface CompressionCoordinatorOptions {
  proactiveThreshold?: number;
  postToolThreshold?: number;
  preserveThreshold?: number;
  reactiveRetryLimit?: number;
  compactStrategy?: ConversationCompactorOptions['compactStrategy'];
  enableLogging?: boolean;
}

export class CompressionCoordinator {
  private readonly chatCompression: ChatCompressionModifier;
  private readonly conversationCompactor: ConversationCompactorModifier;
  private readonly options: Required<CompressionCoordinatorOptions>;
  private reactiveRetryCount = 0;

  constructor(options: CompressionCoordinatorOptions = {}) {
    this.options = {
      proactiveThreshold: options.proactiveThreshold ?? 0.7,
      postToolThreshold: options.postToolThreshold ?? 0.5,
      preserveThreshold: options.preserveThreshold ?? 0.3,
      reactiveRetryLimit: options.reactiveRetryLimit ?? 1,
      compactStrategy: options.compactStrategy ?? 'summarize',
      enableLogging: options.enableLogging ?? false,
    };

    this.chatCompression = new ChatCompressionModifier({
      contextPercentageThreshold: this.options.proactiveThreshold,
      enableCompression: true,
    });
    this.conversationCompactor = new ConversationCompactorModifier({
      compressionTokenThreshold: this.options.postToolThreshold,
      preserveThreshold: this.options.preserveThreshold,
      compactStrategy: this.options.compactStrategy,
      enableLogging: this.options.enableLogging,
    });
  }

  getPreInferenceProcessor(): ChatCompressionModifier {
    return this.chatCompression;
  }

  getPostToolCallProcessor(): ConversationCompactorModifier {
    return this.conversationCompactor;
  }

  resetReactiveRetries(): void {
    this.reactiveRetryCount = 0;
  }

  async recoverFromContextError(
    reqMessage: FlatUserMessage,
    prompt: ProcessedMessage,
    error: unknown,
  ): Promise<{ recoveredMessage: ProcessedMessage; shouldRetry: boolean; reason: string }> {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!this.isRecoverableContextError(errorMessage)) {
      return { recoveredMessage: prompt, shouldRetry: false, reason: 'Error is not context-related' };
    }

    if (this.reactiveRetryCount >= this.options.reactiveRetryLimit) {
      return { recoveredMessage: prompt, shouldRetry: false, reason: 'Reactive retry limit reached' };
    }

    this.reactiveRetryCount++;

    const proactiveCompression = await this.chatCompression.tryCompressChat(
      prompt.message.messages,
      true,
    );

    if (
      proactiveCompression.compressedMessages &&
      proactiveCompression.compressionStatus === 1
    ) {
      return {
        recoveredMessage: this.withCompressionMetadata(
          {
            ...prompt,
            message: {
              ...prompt.message,
              messages: proactiveCompression.compressedMessages,
            },
          },
          {
            status: 'COMPRESSED',
            stage: 'reactive_force_compact',
            originalTokenCount: proactiveCompression.originalTokenCount,
            newTokenCount: proactiveCompression.newTokenCount,
            timestamp: new Date().toISOString(),
            strategy: 'summarize',
            reactiveRetryCount: this.reactiveRetryCount,
            reason: `Reactive compression applied for ${reqMessage.messageId ?? 'current request'}`,
          },
        ),
        shouldRetry: true,
        reason: 'Reactive pre-inference compression applied',
      };
    }

    const forceCompressed = await this.conversationCompactor.forceCompress(
      prompt.message.messages,
    );

    return {
      recoveredMessage: this.withCompressionMetadata(
        {
          ...prompt,
          message: {
            ...prompt.message,
            messages: forceCompressed.messages,
          },
        },
        {
          status: 'COMPRESSED',
          stage: 'reactive_force_compact',
          originalTokenCount: this.countMessageTokens(prompt.message.messages),
          newTokenCount: this.countMessageTokens(forceCompressed.messages),
          timestamp: new Date().toISOString(),
          strategy: this.options.compactStrategy,
          ...(forceCompressed.metadata.messagesCompressed !== undefined && {
            messagesCompressed: forceCompressed.metadata.messagesCompressed,
          }),
          ...(forceCompressed.metadata.messagesPreserved !== undefined && {
            messagesPreserved: forceCompressed.metadata.messagesPreserved,
          }),
          ...(forceCompressed.metadata.toolOutputsTruncated !== undefined && {
            toolOutputsTruncated: forceCompressed.metadata.toolOutputsTruncated,
          }),
          reactiveRetryCount: this.reactiveRetryCount,
          reason: 'Reactive post-tool compaction applied',
        },
      ),
      shouldRetry: true,
      reason: 'Reactive post-tool compaction applied',
    };
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

  private countMessageTokens(messages: MessageObject[]): number {
    return messages.reduce((totalTokens, message) => {
      const content =
        typeof message.content === 'string'
          ? message.content
          : JSON.stringify(message.content ?? '');
      return totalTokens + Math.ceil(content.length / 4) + 4;
    }, 0);
  }

  private isRecoverableContextError(errorMessage: string): boolean {
    const patterns = [
      /prompt too long/i,
      /context length/i,
      /maximum context/i,
      /context window/i,
      /too many tokens/i,
      /token limit/i,
      /request too large/i,
      /input is too long/i,
    ];

    return patterns.some(pattern => pattern.test(errorMessage));
  }
}
