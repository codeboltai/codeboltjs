import { BaseProcessor, ProcessorInput, ProcessorOutput } from '../../processor';
import codebolt from '@codebolt/codeboltjs';

export interface ChatCompressionInfo {
    originalTokenCount: number;
    newTokenCount: number;
    compressionRatio: number;
    threshold: number;
}

export interface ChatCompressionProcessorOptions {
    compressionThreshold?: number;
    compressionPreserveThreshold?: number;
    tokenLimit?: number;
    enableCompression?: boolean;
}

export class ChatCompressionProcessor extends BaseProcessor {
    private readonly compressionThreshold: number;
    private readonly compressionPreserveThreshold: number;
    private readonly tokenLimit: number;
    private readonly enableCompression: boolean;

    constructor(options: ChatCompressionProcessorOptions = {}) {
        super(options);
        this.compressionThreshold = options.compressionThreshold || 0.7;
        this.compressionPreserveThreshold = options.compressionPreserveThreshold || 0.3;
        this.tokenLimit = options.tokenLimit || 128000;
        this.enableCompression = options.enableCompression !== false;
    }

    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        try {
            const { message, context } = input;
            
            if (!this.enableCompression) {
                return [this.createEvent('ChatCompressionDisabled', {
                    reason: 'Compression is disabled for this session'
                })];
            }

            // Get chat history from CodeBolt
            const chatHistory = await codebolt.chat.getChatHistory();
            
            if (chatHistory.length === 0) {
                return [this.createEvent('NoChatHistory', {
                    reason: 'No chat history available for compression'
                })];
            }

            // Estimate token count (simple heuristic: 4 chars per token)
            const estimatedTokens = this.estimateTokenCount(chatHistory);
            const threshold = this.compressionThreshold * this.tokenLimit;
            
            console.log(`[Compression] Estimated tokens: ${estimatedTokens}, threshold: ${threshold}`);
            
            if (estimatedTokens < threshold) {
                return [this.createEvent('ChatCompressionSkipped', {
                    estimatedTokens,
                    threshold,
                    reason: 'Below compression threshold'
                })];
            }

            // Perform compression using CodeBolt's chatSummary
            const compressionResult = await codebolt.chatSummary.summarizeAll();
            
            if (compressionResult.success && compressionResult.data) {
                const newTokenCount = this.estimateTokenCount(compressionResult.data);
                
                const compressionInfo: ChatCompressionInfo = {
                    originalTokenCount: estimatedTokens,
                    newTokenCount,
                    compressionRatio: newTokenCount / estimatedTokens,
                    threshold: this.compressionThreshold
                };

                // Send notification about compression
                await codebolt.chat.sendNotificationEvent(
                    `Chat compressed: ${estimatedTokens} → ${newTokenCount} tokens`,
                    'debug'
                );

                return [this.createEvent('ChatCompressed', compressionInfo)];
            } else {
                return [this.createEvent('ChatCompressionFailed', {
                    error: compressionResult.message || 'Unknown compression error',
                    originalTokenCount: estimatedTokens
                })];
            }

        } catch (error) {
            console.error('Error in ChatCompressionProcessor:', error);
            return [this.createEvent('ChatCompressionError', {
                error: error instanceof Error ? error.message : String(error)
            })];
        }
    }

    private estimateTokenCount(data: any): number {
        // Simple heuristic: 4 characters per token
        const totalContent = JSON.stringify(data);
        return Math.ceil(totalContent.length / 4);
    }

    // Public methods for external control
    setCompressionThreshold(threshold: number): void {
        (this as any).compressionThreshold = Math.max(0.1, Math.min(0.9, threshold));
    }

    setTokenLimit(limit: number): void {
        (this as any).tokenLimit = Math.max(1000, limit);
    }

    enableCompressionForSession(): void {
        (this as any).enableCompression = true;
    }

    disableCompressionForSession(): void {
        (this as any).enableCompression = false;
    }
}
