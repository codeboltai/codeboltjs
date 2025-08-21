import { BaseProcessor, ProcessorInput, ProcessorOutput } from '@codebolt/agentprocessorframework';
import codebolt from '@codebolt/codeboltjs';

export interface TokenManagementProcessorOptions {
    maxTokens?: number;
    warningThreshold?: number; // 0.0 to 1.0
    enableCompression?: boolean;
    compressionThreshold?: number; // 0.0 to 1.0
    enableCaching?: boolean;
    modelTokenLimits?: Record<string, number>;
}

export interface TokenUsage {
    input: number;
    output: number;
    cached: number;
    total: number;
    estimated?: boolean;
}

export class TokenManagementProcessor extends BaseProcessor {
    private readonly maxTokens: number;
    private readonly warningThreshold: number;
    private readonly enableCompression: boolean;
    private readonly compressionThreshold: number;
    private readonly enableCaching: boolean;
    private readonly modelTokenLimits: Record<string, number>;
    
    // Token cache for performance
    private tokenCache = new Map<string, number>();

    constructor(options: TokenManagementProcessorOptions = {}) {
        super();
        this.maxTokens = options.maxTokens || 128000;
        this.warningThreshold = options.warningThreshold || 0.8;
        this.enableCompression = options.enableCompression !== false;
        this.compressionThreshold = options.compressionThreshold || 0.7;
        this.enableCaching = options.enableCaching !== false;
        this.modelTokenLimits = options.modelTokenLimits || {
            'gemini-pro': 128000,
            'gemini-pro-vision': 128000,
            'gemini-flash': 1000000,
            'gpt-4': 128000,
            'gpt-3.5-turbo': 16385,
            'claude-3': 200000
        };
    }

    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        const { message, context } = input;
        
        try {
            // Calculate current token usage
            const tokenUsage = await this.calculateTokenUsage(message);
            
            // Get model-specific limit if available
            const modelName = context?.llmconfig?.model || context?.llmconfig?.llmname || 'gemini-pro';
            const modelLimit = this.modelTokenLimits[modelName] || this.maxTokens;
            
            const results: ProcessorOutput[] = [];
            
            // Add token usage information
            results.push(this.createEvent('TokenUsageCalculated', {
                usage: tokenUsage,
                modelLimit,
                utilizationPercentage: (tokenUsage.total / modelLimit) * 100
            }));

            // Check if we're approaching token limits
            if (tokenUsage.total > modelLimit * this.warningThreshold) {
                results.push(this.createEvent('TokenLimitWarning', {
                    usage: tokenUsage,
                    limit: modelLimit,
                    warningThreshold: this.warningThreshold,
                    recommendation: this.enableCompression ? 'compression_suggested' : 'trim_history'
                }));
            }

            // Check if we need compression
            if (this.enableCompression && tokenUsage.total > modelLimit * this.compressionThreshold) {
                results.push(this.createEvent('CompressionTriggered', {
                    usage: tokenUsage,
                    limit: modelLimit,
                    compressionThreshold: this.compressionThreshold
                }));
            }

            // Check if we're over the limit
            if (tokenUsage.total > modelLimit) {
                results.push(this.createEvent('TokenLimitExceeded', {
                    usage: tokenUsage,
                    limit: modelLimit,
                    excessTokens: tokenUsage.total - modelLimit,
                    action: 'truncation_required'
                }));
            }

            return results;

        } catch (error) {
            console.error('[TokenManagement] Error calculating tokens:', error);
            return [this.createEvent('TokenCalculationError', {
                error: error instanceof Error ? error.message : String(error),
                fallbackEstimate: this.estimateTokens(message)
            })];
        }
    }

    private async calculateTokenUsage(message: any): Promise<TokenUsage> {
        try {
            // Try to use CodeBolt's LLM service for accurate token counting
            const messagesText = this.extractTextFromMessage(message);
            
            // Check cache first
            if (this.enableCaching) {
                const cacheKey = this.getCacheKey(messagesText);
                const cachedCount = this.tokenCache.get(cacheKey);
                if (cachedCount !== undefined) {
                    return {
                        input: cachedCount,
                        output: 0,
                        cached: cachedCount,
                        total: cachedCount
                    };
                }
            }

            // For now, use estimation since we don't have direct access to token counting
            // In a real implementation, you would use codebolt.llm.countTokens() or similar
            const estimatedTokens = this.estimateTokens(message);
            
            // Cache the result
            if (this.enableCaching) {
                const cacheKey = this.getCacheKey(messagesText);
                this.tokenCache.set(cacheKey, estimatedTokens);
                
                // Limit cache size
                if (this.tokenCache.size > 1000) {
                    const firstKey = this.tokenCache.keys().next().value;
                    if (firstKey !== undefined) {
                        this.tokenCache.delete(firstKey);
                    }
                }
            }

            return {
                input: estimatedTokens,
                output: 0,
                cached: 0,
                total: estimatedTokens,
                estimated: true
            };

        } catch (error) {
            console.error('[TokenManagement] Token calculation failed:', error);
            const fallbackEstimate = this.estimateTokens(message);
            return {
                input: fallbackEstimate,
                output: 0,
                cached: 0,
                total: fallbackEstimate,
                estimated: true
            };
        }
    }

    private extractTextFromMessage(message: any): string {
        if (typeof message === 'string') {
            return message;
        }

        if (message?.messages && Array.isArray(message.messages)) {
            return message.messages
                .map((msg: any) => {
                    if (typeof msg.content === 'string') {
                        return msg.content;
                    }
                    if (Array.isArray(msg.content)) {
                        return msg.content
                            .filter((part: any) => part.type === 'text' || typeof part === 'string')
                            .map((part: any) => typeof part === 'string' ? part : part.text)
                            .join(' ');
                    }
                    return JSON.stringify(msg.content);
                })
                .join('\n');
        }

        return JSON.stringify(message);
    }

    private estimateTokens(message: any): number {
        const text = this.extractTextFromMessage(message);
        
        // Rough estimation: ~4 characters per token for English text
        // This is a simplified estimation - real tokenizers are more complex
        const charCount = text.length;
        const wordCount = text.split(/\s+/).length;
        
        // Use a combination of character and word count for better estimation
        const charBasedEstimate = Math.ceil(charCount / 4);
        const wordBasedEstimate = Math.ceil(wordCount * 1.3); // Account for subword tokens
        
        // Use the higher estimate to be conservative
        return Math.max(charBasedEstimate, wordBasedEstimate);
    }

    private getCacheKey(text: string): string {
        // Create a hash-like key for caching
        return text.length.toString() + '_' + text.slice(0, 100).replace(/\s+/g, '');
    }

    getTokenUsageStats(): {
        cacheSize: number;
        cacheHitRate: number;
        averageTokensPerMessage: number;
    } {
        // In a real implementation, you would track these statistics
        return {
            cacheSize: this.tokenCache.size,
            cacheHitRate: 0, // Would track cache hits vs misses
            averageTokensPerMessage: 0 // Would track running average
        };
    }

    clearCache(): void {
        this.tokenCache.clear();
    }
}
