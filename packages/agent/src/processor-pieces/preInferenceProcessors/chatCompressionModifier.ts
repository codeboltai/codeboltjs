import { ProcessedMessage } from "@codebolt/types/agent";
import { BaseMessageModifier, BasePreInferenceProcessor } from "../base";
import { FlatUserMessage, MessageObject } from "@codebolt/types/sdk";

/**
 * Threshold for compression token count as a fraction of the model's token limit.
 * If the chat history exceeds this threshold, it will be compressed.
 */
const COMPRESSION_TOKEN_THRESHOLD = 0.7;

/**
 * The fraction of the latest chat history to keep. A value of 0.3
 * means that only the last 30% of the chat history will be kept after compression.
 */
const COMPRESSION_PRESERVE_THRESHOLD = 0.3;

export enum CompressionStatus {
  /** The compression was successful */
  COMPRESSED = 1,

  /** The compression failed due to the compression inflating the token count */
  COMPRESSION_FAILED_INFLATED_TOKEN_COUNT,

  /** The compression failed due to an error counting tokens */
  COMPRESSION_FAILED_TOKEN_COUNT_ERROR,

  /** The compression was not necessary and no action was taken */
  NOOP,
}

export interface ChatCompressionInfo {
  originalTokenCount: number;
  newTokenCount: number;
  compressionStatus: CompressionStatus;
}

export interface ChatCompressionOptions {
    contextPercentageThreshold?: number;
    enableCompression?: boolean;
    force?: boolean;
}

/**
 * Returns the index of the content after the fraction of the total characters in the history.
 */
function findIndexAfterFraction(
  history: MessageObject[],
  fraction: number,
): number {
  if (fraction <= 0 || fraction >= 1) {
    throw new Error('Fraction must be between 0 and 1');
  }

  const contentLengths = history.map(
    (content) => JSON.stringify(content).length,
  );

  const totalCharacters = contentLengths.reduce(
    (sum, length) => sum + length,
    0,
  );
  const targetCharacters = totalCharacters * fraction;

  let charactersSoFar = 0;
  for (let i = 0; i < contentLengths.length; i++) {
    charactersSoFar += contentLengths[i];
    if (charactersSoFar >= targetCharacters) {
      return i;
    }
  }
  return contentLengths.length;
}

function isFunctionResponse(message: MessageObject): boolean {
  // Check if message has function response content
  if (typeof message.content === 'object' && message.content !== null) {
    return 'functionResponse' in message.content;
  }
  return false;
}

// Mock token limit for different models (should be replaced with actual implementation)
function tokenLimit(model: string): number {
  // Default token limits for common models
  if (model.includes('gemini-pro')) return 30720;
  if (model.includes('gemini-flash')) return 1048576;
  if (model.includes('gpt-4')) return 8192;
  if (model.includes('gpt-3.5')) return 4096;
  return 8192; // Default fallback
}

export class ChatCompressionModifier extends BasePreInferenceProcessor {
    private readonly options: ChatCompressionOptions;
    private hasFailedCompressionAttempt: boolean = false;

    constructor(options: ChatCompressionOptions = {}){
        super()
        this.options = {
            contextPercentageThreshold: options.contextPercentageThreshold || COMPRESSION_TOKEN_THRESHOLD,
            enableCompression: options.enableCompression !== false,
            force: options.force || false
        };
    }

    async modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        try {
            const compressionResult = await this.tryCompressChat(
                createdMessage.message.messages, 
                this.options.force || false
            );

            if (compressionResult.compressionStatus === CompressionStatus.COMPRESSED) {
                return {
                    message: {
                        ...createdMessage.message,
                        messages: compressionResult.compressedMessages || createdMessage.message.messages
                    },
                    metadata: {
                        ...createdMessage.metadata,
                        chatCompressed: true,
                        originalTokenCount: compressionResult.originalTokenCount,
                        newTokenCount: compressionResult.newTokenCount,
                        compressionStatus: compressionResult.compressionStatus
                    }
                };
            }

            return {
                ...createdMessage,
                metadata: {
                    ...createdMessage.metadata,
                    compressionStatus: compressionResult.compressionStatus,
                    originalTokenCount: compressionResult.originalTokenCount,
                    newTokenCount: compressionResult.newTokenCount
                }
            };
        } catch (error) {
            console.error('Error in ChatCompressionModifier:', error);
            this.hasFailedCompressionAttempt = true;
            return createdMessage;
        }
    }

    async tryCompressChat(
        messages: MessageObject[],
        force: boolean = false,
    ): Promise<ChatCompressionInfo & { compressedMessages?: MessageObject[] }> {
        const curatedHistory = messages;

        // Regardless of `force`, don't do anything if the history is empty.
        if (
            curatedHistory.length === 0 ||
            (this.hasFailedCompressionAttempt && !force)
        ) {
            return {
                originalTokenCount: 0,
                newTokenCount: 0,
                compressionStatus: CompressionStatus.NOOP,
            };
        }

        // Mock model - should be replaced with actual model detection
        const model = "gemini-pro";

        const originalTokenCount = await this.countTokens(model, curatedHistory);
        if (originalTokenCount === undefined) {
            console.warn(`Could not determine token count for model ${model}.`);
            this.hasFailedCompressionAttempt = !force && true;
            return {
                originalTokenCount: 0,
                newTokenCount: 0,
                compressionStatus: CompressionStatus.COMPRESSION_FAILED_TOKEN_COUNT_ERROR,
            };
        }

        const contextPercentageThreshold = this.options.contextPercentageThreshold;

        // Don't compress if not forced and we are under the limit.
        if (!force) {
            const threshold = contextPercentageThreshold ?? COMPRESSION_TOKEN_THRESHOLD;
            if (originalTokenCount < threshold * tokenLimit(model)) {
                return {
                    originalTokenCount,
                    newTokenCount: originalTokenCount,
                    compressionStatus: CompressionStatus.NOOP,
                };
            }
        }

        let compressBeforeIndex = findIndexAfterFraction(
            curatedHistory,
            1 - COMPRESSION_PRESERVE_THRESHOLD,
        );
        
        // Find the first user message after the index. This is the start of the next turn.
        while (
            compressBeforeIndex < curatedHistory.length &&
            (curatedHistory[compressBeforeIndex]?.role === 'assistant' ||
            isFunctionResponse(curatedHistory[compressBeforeIndex]))
        ) {
            compressBeforeIndex++;
        }

        const historyToCompress = curatedHistory.slice(0, compressBeforeIndex);
        const historyToKeep = curatedHistory.slice(compressBeforeIndex);

        // Generate AI summary using the compression prompt
        const summary = await this.generateCompressionSummary(historyToCompress);
        
        const compressedMessages = [
            {
                role: 'user' as const,
                content: summary
            },
            {
                role: 'assistant' as const, 
                content: 'Got it. Thanks for the additional context!'
            },
            ...historyToKeep,
        ];

        const newTokenCount = await this.countTokens(model, compressedMessages);
        if (newTokenCount === undefined) {
            console.warn('Could not determine compressed history token count.');
            this.hasFailedCompressionAttempt = !force && true;
            return {
                originalTokenCount,
                newTokenCount: originalTokenCount,
                compressionStatus: CompressionStatus.COMPRESSION_FAILED_TOKEN_COUNT_ERROR,
            };
        }

        if (newTokenCount > originalTokenCount) {
            this.hasFailedCompressionAttempt = !force && true;
            return {
                originalTokenCount,
                newTokenCount,
                compressionStatus: CompressionStatus.COMPRESSION_FAILED_INFLATED_TOKEN_COUNT,
            };
        }

        return {
            originalTokenCount,
            newTokenCount,
            compressionStatus: CompressionStatus.COMPRESSED,
            compressedMessages,
        };
    }

    private async countTokens(model: string, messages: MessageObject[]): Promise<number | undefined> {
        // Mock token counting - should be replaced with actual API call
        // Rough approximation: 4 characters per token
        const totalCharacters = messages.reduce((sum, msg) => {
            return sum + (typeof msg.content === 'string' ? msg.content.length : JSON.stringify(msg.content).length);
        }, 0);
        
        return Math.ceil(totalCharacters / 4);
    }

    private async generateCompressionSummary(messages: MessageObject[]): Promise<string> {
        // This should use the actual compression prompt and LLM call
        // For now, using a simplified version similar to the original
        const compressionPrompt = `You are tasked with creating a concise summary of a conversation history to preserve context while reducing token usage.

Please analyze the conversation and create a state snapshot that captures:
1. Key topics discussed
2. Important decisions made
3. Current context and progress
4. Any ongoing tasks or issues

Format your response as a clear, structured summary that maintains the essential information needed to continue the conversation effectively.`;

        // Mock LLM call - should be replaced with actual LLM integration
        const summaryParts: string[] = [];
        let userQuestions: string[] = [];
        let assistantResponses: string[] = [];

        for (const message of messages) {
            const content = typeof message.content === 'string' ? message.content : JSON.stringify(message.content);
            
            if (message.role === 'user') {
                if (content.length > 20) {
                    userQuestions.push(content.substring(0, 150) + (content.length > 150 ? '...' : ''));
                }
            } else if (message.role === 'assistant') {
                if (content.length > 20) {
                    assistantResponses.push(content.substring(0, 150) + (content.length > 150 ? '...' : ''));
                }
            }
        }

        summaryParts.push('<state_snapshot>');
        summaryParts.push('This is a compressed summary of the previous conversation:');
        summaryParts.push('');
        
        if (userQuestions.length > 0) {
            summaryParts.push('Key user requests and questions:');
            userQuestions.slice(0, 5).forEach((q, i) => {
                summaryParts.push(`${i + 1}. ${q}`);
            });
            summaryParts.push('');
        }
        
        if (assistantResponses.length > 0) {
            summaryParts.push('Key assistant responses and actions:');
            assistantResponses.slice(0, 5).forEach((r, i) => {
                summaryParts.push(`${i + 1}. ${r}`);
            });
            summaryParts.push('');
        }

        summaryParts.push(`Total messages compressed: ${messages.length}`);
        summaryParts.push('</state_snapshot>');

        return summaryParts.join('\n');
    }

    public resetCompressionState(): void {
        this.hasFailedCompressionAttempt = false;
    }
}

////
