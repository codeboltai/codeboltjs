/**
 * Conversation Compactor Modifier
 * Post-Tool Call processor for compacting conversation history to reduce context size
 *
 * Inspired by gemini-cli's ChatCompressionService approach:
 * - Truncates large tool outputs
 * - Summarizes old conversation history using LLM
 * - Preserves recent context for continuity
 */

import { BasePostToolCallProcessor } from '../base/basePostToolCallProcessor';
import {
    PostToolCallProcessorInput,
    PostToolCallProcessorOutput
} from '@codebolt/types/agent';
import { MessageObject } from '@codebolt/types/sdk';
import codebolt from '@codebolt/codeboltjs';

// ============================================================================
// Constants (from gemini-cli)
// ============================================================================

/** Default threshold for compression - compress when exceeding 50% of model limit */
const DEFAULT_COMPRESSION_TOKEN_THRESHOLD = 0.5;

/** Fraction of recent history to preserve - keep last 30% */
const DEFAULT_COMPRESSION_PRESERVE_THRESHOLD = 0.3;

/** Maximum token budget for all tool outputs combined */
const DEFAULT_TOOL_RESPONSE_TOKEN_BUDGET = 50000;

/** Lines to keep when truncating tool outputs */
const DEFAULT_TRUNCATE_LINES = 30;

/** Default model token limit */
const DEFAULT_MODEL_TOKEN_LIMIT = 128000;

// ============================================================================
// Model Token Limits Lookup
// ============================================================================

/**
 * Known model token limits
 * Based on common LLM provider specifications
 */
const MODEL_TOKEN_LIMITS: Record<string, number> = {
    // OpenAI models
    'gpt-4': 8192,
    'gpt-4-32k': 32768,
    'gpt-4-turbo': 128000,
    'gpt-4-turbo-preview': 128000,
    'gpt-4o': 128000,
    'gpt-4o-mini': 128000,
    'gpt-3.5-turbo': 16385,
    'gpt-3.5-turbo-16k': 16385,
    // Anthropic models
    'claude-3-opus': 200000,
    'claude-3-sonnet': 200000,
    'claude-3-haiku': 200000,
    'claude-3-5-sonnet': 200000,
    'claude-2': 100000,
    'claude-2.1': 200000,
    // Google models
    'gemini-pro': 32768,
    'gemini-1.5-pro': 1048576,
    'gemini-1.5-flash': 1048576,
    // Mistral models
    'mistral-large': 32768,
    'mistral-medium': 32768,
    'mistral-small': 32768,
};

/**
 * Gets the token limit for a model
 * Falls back to default if model not found
 */
function getModelTokenLimit(modelName?: string): number {
    if (!modelName) return DEFAULT_MODEL_TOKEN_LIMIT;

    // Try exact match first
    if (MODEL_TOKEN_LIMITS[modelName]) {
        return MODEL_TOKEN_LIMITS[modelName];
    }

    // Try partial match (model names often have version suffixes)
    const lowerModel = modelName.toLowerCase();
    for (const [key, limit] of Object.entries(MODEL_TOKEN_LIMITS)) {
        if (lowerModel.includes(key.toLowerCase()) || key.toLowerCase().includes(lowerModel)) {
            return limit;
        }
    }

    return DEFAULT_MODEL_TOKEN_LIMIT;
}

// ============================================================================
// Types and Interfaces
// ============================================================================

/**
 * Compression Status Enum - tracks the result of compression attempts
 */
export enum CompressionStatus {
    /** Compression was successful */
    COMPRESSED = 'COMPRESSED',
    /** Compression not needed - under threshold */
    NOOP = 'NOOP',
    /** Compression failed - summary larger than original */
    FAILED_INFLATED_TOKEN_COUNT = 'FAILED_INFLATED_TOKEN_COUNT',
    /** Compression failed - token counting error */
    FAILED_TOKEN_COUNT_ERROR = 'FAILED_TOKEN_COUNT_ERROR',
    /** Compression failed - LLM summarization error */
    FAILED_SUMMARIZATION_ERROR = 'FAILED_SUMMARIZATION_ERROR',
    /** Tool output truncation was applied (without full compression) */
    TOOL_OUTPUT_TRUNCATED = 'TOOL_OUTPUT_TRUNCATED'
}

/**
 * Compression metadata - tracks compression state and statistics
 */
export interface CompressionMetadata {
    /** Status of the compression attempt */
    status: CompressionStatus;
    /** Original token count before compression */
    originalTokenCount: number;
    /** Token count after compression */
    newTokenCount: number;
    /** Number of messages that were compressed/removed */
    messagesCompressed: number;
    /** Number of messages preserved */
    messagesPreserved: number;
    /** Whether tool outputs were truncated */
    toolOutputsTruncated: boolean;
    /** Number of failed compression attempts in this session */
    failedAttempts: number;
    /** Timestamp of compression */
    timestamp: string;
    /** Compression strategy used */
    strategy: 'simple' | 'smart' | 'summarize';
}

/**
 * Configuration options for ConversationCompactorModifier
 * Based on gemini-cli thresholds with codebolt adaptations
 */
export interface ConversationCompactorOptions {
    /**
     * Token threshold as fraction of model limit (0.0 - 1.0)
     * Compression triggers when tokens exceed this fraction of the limit
     * @default 0.5 (compress at 50% of limit, same as gemini-cli)
     */
    compressionTokenThreshold?: number;

    /**
     * Fraction of recent history to preserve after compression (0.0 - 1.0)
     * @default 0.3 (keep last 30% of history, same as gemini-cli)
     */
    preserveThreshold?: number;

    /**
     * Maximum token budget for tool response content
     * Older tool outputs exceeding this budget will be truncated
     * @default 50000 (same as gemini-cli COMPRESSION_FUNCTION_RESPONSE_TOKEN_BUDGET)
     */
    toolResponseTokenBudget?: number;

    /**
     * Maximum lines to keep when truncating tool outputs
     * @default 30 (same as gemini-cli COMPRESSION_TRUNCATE_LINES)
     */
    truncateLines?: number;

    /**
     * Compression strategy
     * - 'simple': Just truncate old messages
     * - 'smart': Truncate tool outputs + remove old messages intelligently
     * - 'summarize': Use LLM to generate state_snapshot summary
     * @default 'smart'
     */
    compactStrategy?: 'simple' | 'smart' | 'summarize';

    /**
     * Whether to preserve system messages during compression
     * @default true
     */
    preserveSystemMessages?: boolean;

    /**
     * Minimum number of user messages to always preserve
     * @default 3
     */
    minPreservedUserMessages?: number;

    /**
     * Whether to enable LLM verification pass for summarization
     * Adds a second LLM call to verify summary accuracy
     * @default false (for performance)
     */
    enableVerificationPass?: boolean;

    /**
     * Model token limit (auto-detected if not specified)
     * @default 128000
     */
    modelTokenLimit?: number;

    /**
     * LLM role for summarization calls
     * @default 'summarizer'
     */
    llmRole?: string;

    /**
     * Enable debug logging
     * @default false
     */
    enableLogging?: boolean;
}

// ============================================================================
// Main Class
// ============================================================================

export class ConversationCompactorModifier extends BasePostToolCallProcessor {
    private readonly options: Required<ConversationCompactorOptions>;
    private failedCompressionAttempts: number = 0;
    private hasFailedCompression: boolean = false;
    private lastCompressionTokenCount: number = 0;
    private stepsSinceLastCompression: number = 0;

    constructor(options: ConversationCompactorOptions = {}) {
        super();
        this.options = {
            compressionTokenThreshold: options.compressionTokenThreshold ?? DEFAULT_COMPRESSION_TOKEN_THRESHOLD,
            preserveThreshold: options.preserveThreshold ?? DEFAULT_COMPRESSION_PRESERVE_THRESHOLD,
            toolResponseTokenBudget: options.toolResponseTokenBudget ?? DEFAULT_TOOL_RESPONSE_TOKEN_BUDGET,
            truncateLines: options.truncateLines ?? DEFAULT_TRUNCATE_LINES,
            compactStrategy: options.compactStrategy ?? 'smart',
            preserveSystemMessages: options.preserveSystemMessages ?? true,
            minPreservedUserMessages: options.minPreservedUserMessages ?? 3,
            enableVerificationPass: options.enableVerificationPass ?? false,
            modelTokenLimit: options.modelTokenLimit ?? DEFAULT_MODEL_TOKEN_LIMIT,
            llmRole: options.llmRole ?? 'summarizer',
            enableLogging: options.enableLogging ?? false
        };
    }

    // ========================================================================
    // Token Counting Utilities
    // ========================================================================

    /**
     * Estimates token count for a string
     * Uses the ~4 characters per token approximation
     */
    private estimateTokens(text: string): number {
        if (!text) return 0;
        return Math.ceil(text.length / 4);
    }

    /**
     * Counts tokens for an array of messages
     */
    private countMessageTokens(messages: MessageObject[]): number {
        if (!messages || !Array.isArray(messages)) return 0;
        return messages.reduce((total, msg) => {
            if (!msg) return total;
            const content = !msg.content ? '' :
                (typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content));
            // Add overhead for role and structure (~4 tokens per message)
            return total + this.estimateTokens(content) + 4;
        }, 0);
    }

    /**
     * Gets content length from a message (handles string and array content)
     */
    private getMessageContentLength(message: MessageObject): number {
        if (!message || message.content === undefined || message.content === null) {
            return 0;
        }
        if (typeof message.content === 'string') {
            return message.content.length;
        }
        return JSON.stringify(message.content).length;
    }

    /**
     * Extracts text content from a message
     */
    private getMessageContent(message: MessageObject): string {
        if (!message || message.content === undefined || message.content === null) {
            return '';
        }
        if (typeof message.content === 'string') {
            return message.content;
        }
        // Extract text from content blocks
        if (!Array.isArray(message.content)) {
            return JSON.stringify(message.content);
        }
        return message.content
            .filter(block => block && block.text)
            .map(block => block.text)
            .join('\n');
    }

    // ========================================================================
    // Tool Output Truncation (Phase 1)
    // ========================================================================

    /**
     * Checks if a message is a function/tool response
     */
    private isToolResponseMessage(message: MessageObject): boolean {
        if (!message) return false;
        if (message.role === 'tool') return true;
        if (message.tool_call_id) return true;

        // Check for function response in content
        if (typeof message.content === 'object' && message.content !== null) {
            if (Array.isArray(message.content)) {
                return message.content.some(block =>
                    block && (block.type === 'tool_result' ||
                    block.type === 'function_response')
                );
            }
        }
        return false;
    }

    /**
     * Truncates content to a specified number of lines
     * Keeps first half and last half of allowed lines for context
     */
    private truncateToLines(content: string, maxLines: number): string {
        const lines = content.split('\n');
        if (lines.length <= maxLines) {
            return content;
        }

        // Keep first half and last half of allowed lines for context
        const halfLines = Math.floor(maxLines / 2);
        const firstPart = lines.slice(0, halfLines);
        const lastPart = lines.slice(-halfLines);
        const omittedCount = lines.length - maxLines;

        return [
            ...firstPart,
            `\n... [${omittedCount} lines truncated] ...\n`,
            ...lastPart
        ].join('\n');
    }

    /**
     * Truncates large tool output messages to reduce token count
     * Iterates backwards (prioritizing recent messages) following gemini-cli approach
     */
    private truncateLargeToolOutputs(messages: MessageObject[]): {
        messages: MessageObject[];
        truncated: boolean;
        tokensSaved: number;
    } {
        const result: MessageObject[] = [...messages];
        let truncated = false;
        let tokensSaved = 0;

        // Calculate current tool response tokens and identify tool message indices
        let toolResponseTokens = 0;
        const toolMessageInfo: Array<{ index: number; tokens: number }> = [];

        for (let i = 0; i < result.length; i++) {
            const msg = result[i];
            if (msg && (msg.role === 'tool' || this.isToolResponseMessage(msg))) {
                const content = this.getMessageContent(msg);
                const tokens = this.estimateTokens(content);
                toolMessageInfo.push({ index: i, tokens });
                toolResponseTokens += tokens;
            }
        }

        // If under budget, no truncation needed
        if (toolResponseTokens <= this.options.toolResponseTokenBudget) {
            return { messages: result, truncated: false, tokensSaved: 0 };
        }

        // Iterate from oldest to newest tool messages for truncation
        // (We truncate older tool outputs first to preserve recent context)
        for (const info of toolMessageInfo) {
            if (toolResponseTokens <= this.options.toolResponseTokenBudget) {
                break;
            }

            const msg = result[info.index];
            if (!msg) continue;

            const originalContent = this.getMessageContent(msg);
            const originalTokens = this.estimateTokens(originalContent);

            // Only truncate if content is substantial
            if (originalTokens > 100) {
                const truncatedContent = this.truncateToLines(
                    originalContent,
                    this.options.truncateLines
                );
                const newTokens = this.estimateTokens(truncatedContent);

                if (newTokens < originalTokens) {
                    // Update the message with truncated content
                    const updatedMsg: MessageObject = {
                        role: msg.role,
                        content: truncatedContent
                    };
                    if (msg.tool_call_id) updatedMsg.tool_call_id = msg.tool_call_id;
                    if (msg.tool_calls) updatedMsg.tool_calls = msg.tool_calls;
                    if (msg.name) updatedMsg.name = msg.name;
                    result[info.index] = updatedMsg;

                    const saved = originalTokens - newTokens;
                    tokensSaved += saved;
                    toolResponseTokens -= saved;
                    truncated = true;

                    if (this.options.enableLogging) {
                        console.log(`[ConversationCompactor] Truncated tool output at index ${info.index}, saved ${saved} tokens`);
                    }
                }
            }
        }

        return { messages: result, truncated, tokensSaved };
    }

    // ========================================================================
    // History Split Point Calculation (Phase 2)
    // ========================================================================

    /**
     * Adjusts split index to the start of the next turn (user message)
     * Ensures we don't split in the middle of a conversation turn
     */
    private adjustToTurnBoundary(messages: MessageObject[], index: number): number {
        while (index < messages.length) {
            const msg = messages[index];
            if (!msg) {
                index++;
                continue;
            }
            // Stop at a user message that isn't a tool response
            if (msg.role === 'user' && !this.isToolResponseMessage(msg)) {
                break;
            }
            // Also stop at assistant message without pending tool calls
            if (msg.role === 'assistant' && (!msg.tool_calls || msg.tool_calls.length === 0)) {
                break;
            }
            index++;
        }
        return index;
    }

    /**
     * Maps filtered array index back to original messages array
     */
    private mapToOriginalIndex(
        original: MessageObject[],
        filtered: MessageObject[],
        filteredIndex: number
    ): number {
        if (filteredIndex >= filtered.length) return original.length;

        const targetMessage = filtered[filteredIndex];
        return original.findIndex(msg => msg === targetMessage);
    }

    /**
     * Finds the index to split history for compression
     * Returns the index after which messages should be preserved
     */
    private findCompressionSplitIndex(messages: MessageObject[]): number {
        // Filter out system messages if preserving them
        const processableMessages = this.options.preserveSystemMessages
            ? messages.filter(m => m.role !== 'system')
            : messages;

        if (processableMessages.length <= this.options.minPreservedUserMessages * 2) {
            // Too few messages to compress
            return 0;
        }

        // Calculate content lengths for fraction-based splitting
        const contentLengths = processableMessages.map(msg => this.getMessageContentLength(msg));
        const totalLength = contentLengths.reduce((sum, len) => sum + len, 0);

        // Find index after (1 - preserveThreshold) of content
        // e.g., if preserveThreshold is 0.3, find index after 70% of content
        const targetLength = totalLength * (1 - this.options.preserveThreshold);

        let accumulatedLength = 0;
        let splitIndex = 0;

        for (let i = 0; i < contentLengths.length; i++) {
            const len = contentLengths[i];
            if (len !== undefined) {
                accumulatedLength += len;
            }
            if (accumulatedLength >= targetLength) {
                splitIndex = i;
                break;
            }
        }

        // Ensure we don't split too early
        if (splitIndex === 0) {
            splitIndex = Math.floor(processableMessages.length * (1 - this.options.preserveThreshold));
        }

        // Adjust to turn boundary - find the next user message
        splitIndex = this.adjustToTurnBoundary(processableMessages, splitIndex);

        // Map back to original messages array if we filtered system messages
        if (this.options.preserveSystemMessages) {
            return this.mapToOriginalIndex(messages, processableMessages, splitIndex);
        }

        return splitIndex;
    }

    // ========================================================================
    // LLM Summarization (Phase 3 - 'summarize' strategy only)
    // ========================================================================

    /**
     * Generates the compression prompt with state_snapshot XML format
     * Based on gemini-cli's approach
     */
    private getCompressionPrompt(historyToCompress: MessageObject[]): string {
        const historyText = historyToCompress.map((msg, i) => {
            const content = this.getMessageContent(msg);
            const truncated = content.length > 500 ? content.substring(0, 500) + '...' : content;
            return `[${i + 1}] ${msg.role}: ${truncated}`;
        }).join('\n\n');

        return `You are a conversation compression assistant. Analyze the following conversation history and create a concise state snapshot that preserves all critical information.

CONVERSATION HISTORY TO COMPRESS:
${historyText}

Generate a state snapshot in the following XML format. Be extremely concise but preserve all critical technical details:

<state_snapshot>
    <overall_goal>
        [Describe the user's high-level objective in 1-2 sentences]
    </overall_goal>

    <active_constraints>
        [List any user-specified rules, preferences, or constraints that must be maintained]
    </active_constraints>

    <key_knowledge>
        [List crucial technical facts discovered: file structures, dependencies, API details, error patterns, etc.]
    </key_knowledge>

    <artifact_trail>
        [Track evolution of critical files/symbols that were modified or are important]
    </artifact_trail>

    <file_system_state>
        [Describe current relevant file system state: created files, modified files, directory structure if relevant]
    </file_system_state>

    <recent_actions>
        [Fact-based summary of tool calls and their outcomes - what was done, not how]
    </recent_actions>

    <task_state>
        [Current state of the task: what's complete, what's pending, and the IMMEDIATE next step]
    </task_state>
</state_snapshot>

IMPORTANT:
- Be extremely concise - aim for maximum information density
- Preserve technical accuracy - exact file paths, function names, error messages
- Focus on facts that affect future decisions
- Do not include conversational pleasantries or redundant information`;
    }

    /**
     * Generates a state snapshot summary using LLM
     */
    private async generateStateSummary(historyToCompress: MessageObject[]): Promise<string> {
        try {
            const prompt = this.getCompressionPrompt(historyToCompress);

            const response = await codebolt.llm.inference({
                messages: [
                    { role: 'system', content: 'You are a precise conversation compression assistant.' },
                    { role: 'user', content: prompt }
                ],
               
            });

            const summary = response.completion?.content || '';

            if (this.options.enableLogging) {
                console.log(`[ConversationCompactor] Generated summary (${summary.length} chars)`);
            }

            return summary;
        } catch (error) {
            console.error('[ConversationCompactor] Error generating summary:', error);
            throw error;
        }
    }

    /**
     * Optional verification pass - asks LLM to verify and correct the summary
     */
    private async verifySummary(
        summary: string,
        originalHistory: MessageObject[]
    ): Promise<string> {
        if (!this.options.enableVerificationPass) {
            return summary;
        }

        try {
            const verificationPrompt = `Review this conversation state snapshot for accuracy and completeness.

STATE SNAPSHOT:
${summary}

ORIGINAL MESSAGES COUNT: ${originalHistory.length}

If the snapshot is accurate and complete, respond with just the original snapshot.
If there are inaccuracies or missing critical information, provide a corrected version.
Keep the same XML format.`;

            const response = await codebolt.llm.inference({
                messages: [
                    { role: 'system', content: 'You are verifying a conversation compression for accuracy.' },
                    { role: 'user', content: verificationPrompt }
                ]
            });

            return response.completion?.content || summary;
        } catch (error) {
            console.warn('[ConversationCompactor] Verification pass failed, using original summary');
            return summary;
        }
    }

    // ========================================================================
    // Compression Strategies
    // ========================================================================

    /**
     * Simple compression strategy - just removes old messages
     */
    private async compressSimple(messages: MessageObject[]): Promise<{
        compressedMessages: MessageObject[];
        metadata: Partial<CompressionMetadata>;
    }> {
        const splitIndex = this.findCompressionSplitIndex(messages);

        if (splitIndex === 0) {
            return {
                compressedMessages: messages,
                metadata: {
                    strategy: 'simple',
                    messagesCompressed: 0,
                    messagesPreserved: messages.length
                }
            };
        }

        // Preserve system messages
        const systemMessages = this.options.preserveSystemMessages
            ? messages.filter(m => m.role === 'system')
            : [];

        // Keep messages after split point
        const preservedMessages = messages.slice(splitIndex);

        // Combine: system messages first, then placeholder, then preserved history
        const compressedMessages: MessageObject[] = [
            ...systemMessages.filter(sm => !preservedMessages.includes(sm)),
            {
                role: 'user' as const,
                content: `[Previous conversation context has been compressed. ${splitIndex} messages were removed to manage context length.]`
            },
            ...preservedMessages
        ];

        return {
            compressedMessages,
            metadata: {
                strategy: 'simple',
                messagesCompressed: splitIndex,
                messagesPreserved: preservedMessages.length,
                toolOutputsTruncated: false
            }
        };
    }

    /**
     * Smart compression strategy - truncates tool outputs + intelligent message removal
     */
    private async compressSmart(messages: MessageObject[]): Promise<{
        compressedMessages: MessageObject[];
        metadata: Partial<CompressionMetadata>;
    }> {
        // Phase 1: Truncate large tool outputs
        const { messages: truncatedMessages, truncated } =
            this.truncateLargeToolOutputs(messages);

        // Check if truncation alone was sufficient
        const tokensAfterTruncation = this.countMessageTokens(truncatedMessages);
        const threshold = this.options.modelTokenLimit * this.options.compressionTokenThreshold;

        if (tokensAfterTruncation < threshold) {
            return {
                compressedMessages: truncatedMessages,
                metadata: {
                    strategy: 'smart',
                    toolOutputsTruncated: truncated,
                    messagesCompressed: 0,
                    messagesPreserved: truncatedMessages.length
                }
            };
        }

        // Phase 2: Remove old messages
        const splitIndex = this.findCompressionSplitIndex(truncatedMessages);

        if (splitIndex === 0) {
            return {
                compressedMessages: truncatedMessages,
                metadata: {
                    strategy: 'smart',
                    toolOutputsTruncated: truncated,
                    messagesCompressed: 0,
                    messagesPreserved: truncatedMessages.length
                }
            };
        }

        const systemMessages = this.options.preserveSystemMessages
            ? truncatedMessages.filter(m => m.role === 'system')
            : [];

        const preservedMessages = truncatedMessages.slice(splitIndex);

        const compressedMessages: MessageObject[] = [
            ...systemMessages.filter(sm => !preservedMessages.includes(sm)),
            {
                role: 'user' as const,
                content: `[Conversation compressed. ${splitIndex} older messages summarized. Tool outputs may have been truncated.]`
            },
            ...preservedMessages
        ];

        return {
            compressedMessages,
            metadata: {
                strategy: 'smart',
                toolOutputsTruncated: truncated,
                messagesCompressed: splitIndex,
                messagesPreserved: preservedMessages.length
            }
        };
    }

    /**
     * Summarize compression strategy - uses LLM to create state snapshot
     */
    private async compressSummarize(messages: MessageObject[]): Promise<{
        compressedMessages: MessageObject[];
        metadata: Partial<CompressionMetadata>;
    }> {
        // Phase 1: Truncate large tool outputs
        const { messages: truncatedMessages, truncated } =
            this.truncateLargeToolOutputs(messages);

        // Phase 2: Find split point
        const splitIndex = this.findCompressionSplitIndex(truncatedMessages);

        if (splitIndex === 0) {
            // Nothing to compress
            return {
                compressedMessages: truncatedMessages,
                metadata: {
                    strategy: 'summarize',
                    toolOutputsTruncated: truncated,
                    messagesCompressed: 0,
                    messagesPreserved: truncatedMessages.length
                }
            };
        }

        // Phase 3: Generate summary of messages to compress
        const systemMessages = this.options.preserveSystemMessages
            ? truncatedMessages.filter(m => m.role === 'system')
            : [];

        const historyToCompress = truncatedMessages
            .slice(0, splitIndex)
            .filter(m => m.role !== 'system');

        const preservedMessages = truncatedMessages.slice(splitIndex);

        try {
            // Generate LLM summary
            let summary = await this.generateStateSummary(historyToCompress);

            // Optional verification pass
            summary = await this.verifySummary(summary, historyToCompress);

            if (!summary || summary.trim().length === 0) {
                throw new Error('Empty summary generated');
            }

            // Build compressed message array
            const compressedMessages: MessageObject[] = [
                ...systemMessages.filter(sm => !preservedMessages.includes(sm)),
                {
                    role: 'user' as const,
                    content: summary
                },
                {
                    role: 'assistant' as const,
                    content: 'Understood. I have processed the conversation state snapshot and am ready to continue from where we left off.'
                },
                ...preservedMessages
            ];

            return {
                compressedMessages,
                metadata: {
                    strategy: 'summarize',
                    toolOutputsTruncated: truncated,
                    messagesCompressed: historyToCompress.length,
                    messagesPreserved: preservedMessages.length
                }
            };
        } catch (error) {
            // Fall back to smart compression if summarization fails
            console.warn('[ConversationCompactor] Summarization failed, falling back to smart compression:', error);
            this.failedCompressionAttempts++;
            return this.compressSmart(messages);
        }
    }

    // ========================================================================
    // Main Entry Point
    // ========================================================================

    async modify(input: PostToolCallProcessorInput): Promise<PostToolCallProcessorOutput> {
        const { nextPrompt, rawLLMResponseMessage, tokenLimit } = input;

        try {
            // Safety check: ensure messages array exists
            if (!nextPrompt?.message?.messages || !Array.isArray(nextPrompt.message.messages)) {
                if (this.options.enableLogging) {
                    console.warn('[ConversationCompactor] No messages array found, skipping compression');
                }
                return {
                    nextPrompt,
                    shouldExit: false
                };
            }

            const messages = nextPrompt.message.messages;

            // Get model token limit: prefer tokenLimit from LLM response, then lookup by model name, then fallback to config
            const modelName = rawLLMResponseMessage?.model;
            const modelTokenLimit = tokenLimit
                ?? (modelName ? getModelTokenLimit(modelName) : this.options.modelTokenLimit);

            // Use actual token count from LLM response if available, otherwise estimate
            const currentTokens = rawLLMResponseMessage?.usage?.prompt_tokens
                ?? this.countMessageTokens(messages);

            const threshold = modelTokenLimit * this.options.compressionTokenThreshold;

            this.stepsSinceLastCompression++;

            if (this.options.enableLogging) {
                console.log(`[ConversationCompactor] Current tokens: ${currentTokens}, Threshold: ${threshold}, Steps since last compression: ${this.stepsSinceLastCompression}`);
            }

            // Skip if we just compressed recently and tokens haven't grown significantly
            // This prevents re-compressing when the token estimate is still high right after compression
            if (this.lastCompressionTokenCount > 0 && this.stepsSinceLastCompression <= 2) {
                // Only re-compress if tokens have grown by at least 20% since last compression
                const growthThreshold = this.lastCompressionTokenCount * 1.2;
                if (currentTokens < growthThreshold) {
                    if (this.options.enableLogging) {
                        console.log(`[ConversationCompactor] Skipping - recently compressed (${this.stepsSinceLastCompression} steps ago), tokens: ${currentTokens}, last compressed to: ${this.lastCompressionTokenCount}`);
                    }
                    return {
                        nextPrompt: {
                            ...nextPrompt,
                            metadata: {
                                ...nextPrompt.metadata,
                                compression: {
                                    status: CompressionStatus.NOOP,
                                    originalTokenCount: currentTokens,
                                    newTokenCount: currentTokens,
                                    messagesCompressed: 0,
                                    messagesPreserved: messages.length,
                                    toolOutputsTruncated: false,
                                    failedAttempts: this.failedCompressionAttempts,
                                    timestamp: new Date().toISOString(),
                                    strategy: this.options.compactStrategy
                                } as CompressionMetadata
                            }
                        },
                        shouldExit: false
                    };
                }
            }

            // Also check metadata from previous compression (in case instance state was lost)
            const prevCompression = nextPrompt.metadata?.['compression'] as
                | { status?: string; newTokenCount?: number }
                | undefined;
            if (prevCompression?.status === 'COMPRESSED' && prevCompression.newTokenCount) {
                if (currentTokens < prevCompression.newTokenCount * 1.2) {
                    if (this.options.enableLogging) {
                        console.log(`[ConversationCompactor] Skipping - metadata indicates recent compression, tokens haven't grown significantly`);
                    }
                    return {
                        nextPrompt,
                        shouldExit: false
                    };
                }
            }

            // Check if compression is needed
            if (currentTokens < threshold) {
                return {
                    nextPrompt: {
                        ...nextPrompt,
                        metadata: {
                            ...nextPrompt.metadata,
                            compression: {
                                status: CompressionStatus.NOOP,
                                originalTokenCount: currentTokens,
                                newTokenCount: currentTokens,
                                messagesCompressed: 0,
                                messagesPreserved: messages.length,
                                toolOutputsTruncated: false,
                                failedAttempts: this.failedCompressionAttempts,
                                timestamp: new Date().toISOString(),
                                strategy: this.options.compactStrategy
                            } as CompressionMetadata
                        }
                    },
                    shouldExit: false
                };
            }

            // Skip if we've had too many failed attempts
            if (this.hasFailedCompression && this.failedCompressionAttempts >= 3) {
                if (this.options.enableLogging) {
                    console.warn('[ConversationCompactor] Skipping - too many failed attempts');
                }
                return {
                    nextPrompt: {
                        ...nextPrompt,
                        metadata: {
                            ...nextPrompt.metadata,
                            compressionSkipped: true,
                            compressionSkipReason: 'Too many failed attempts'
                        }
                    },
                    shouldExit: false
                };
            }

            // Apply compression based on strategy
            let result: { compressedMessages: MessageObject[]; metadata: Partial<CompressionMetadata> };

            switch (this.options.compactStrategy) {
                case 'simple':
                    result = await this.compressSimple(messages);
                    break;
                case 'smart':
                    result = await this.compressSmart(messages);
                    break;
                case 'summarize':
                    result = await this.compressSummarize(messages);
                    break;
                default:
                    result = await this.compressSmart(messages);
            }

            const newTokens = this.countMessageTokens(result.compressedMessages);

            // Verify compression was effective
            if (newTokens >= currentTokens) {
                this.failedCompressionAttempts++;
                this.hasFailedCompression = true;

                if (this.options.enableLogging) {
                    console.warn(`[ConversationCompactor] Compression inflated token count: ${currentTokens} -> ${newTokens}`);
                }

                return {
                    nextPrompt: {
                        ...nextPrompt,
                        metadata: {
                            ...nextPrompt.metadata,
                            compression: {
                                status: CompressionStatus.FAILED_INFLATED_TOKEN_COUNT,
                                originalTokenCount: currentTokens,
                                newTokenCount: newTokens,
                                messagesCompressed: 0,
                                messagesPreserved: messages.length,
                                toolOutputsTruncated: false,
                                failedAttempts: this.failedCompressionAttempts,
                                timestamp: new Date().toISOString(),
                                strategy: this.options.compactStrategy
                            } as CompressionMetadata
                        }
                    },
                    shouldExit: false
                };
            }

            // Build final compression metadata
            const compressionMetadata: CompressionMetadata = {
                status: CompressionStatus.COMPRESSED,
                originalTokenCount: currentTokens,
                newTokenCount: newTokens,
                messagesCompressed: result.metadata.messagesCompressed || 0,
                messagesPreserved: result.metadata.messagesPreserved || 0,
                toolOutputsTruncated: result.metadata.toolOutputsTruncated || false,
                failedAttempts: this.failedCompressionAttempts,
                timestamp: new Date().toISOString(),
                strategy: this.options.compactStrategy
            };

            // Track compression state for cooldown logic
            this.lastCompressionTokenCount = newTokens;
            this.stepsSinceLastCompression = 0;

            if (this.options.enableLogging) {
                console.log(`[ConversationCompactor] Compression complete: ${currentTokens} -> ${newTokens} tokens (saved ${currentTokens - newTokens})`);
            }

            return {
                nextPrompt: {
                    message: {
                        ...nextPrompt.message,
                        messages: result.compressedMessages
                    },
                    metadata: {
                        ...nextPrompt.metadata,
                        compression: compressionMetadata,
                        compactedBy: 'ConversationCompactorModifier',
                        compactedAt: compressionMetadata.timestamp
                    }
                },
                shouldExit: false
            };

        } catch (error) {
            console.error('[ConversationCompactor] Error during compression:', error);
            this.failedCompressionAttempts++;
            this.hasFailedCompression = true;

            return {
                nextPrompt: {
                    ...nextPrompt,
                    metadata: {
                        ...nextPrompt.metadata,
                        compression: {
                            status: CompressionStatus.FAILED_SUMMARIZATION_ERROR,
                            originalTokenCount: this.countMessageTokens(nextPrompt.message.messages),
                            newTokenCount: this.countMessageTokens(nextPrompt.message.messages),
                            messagesCompressed: 0,
                            messagesPreserved: nextPrompt.message.messages.length,
                            toolOutputsTruncated: false,
                            failedAttempts: this.failedCompressionAttempts,
                            timestamp: new Date().toISOString(),
                            strategy: this.options.compactStrategy
                        } as CompressionMetadata,
                        compressionError: error instanceof Error ? error.message : 'Unknown error'
                    }
                },
                shouldExit: false
            };
        }
    }

    // ========================================================================
    // Public Utility Methods
    // ========================================================================

    /**
     * Resets the compression state (useful for new conversations)
     */
    public resetCompressionState(): void {
        this.failedCompressionAttempts = 0;
        this.hasFailedCompression = false;
        this.lastCompressionTokenCount = 0;
        this.stepsSinceLastCompression = 0;
    }

    /**
     * Gets the current compression statistics
     */
    public getCompressionStats(): {
        failedAttempts: number;
        hasFailedCompression: boolean;
        options: Required<ConversationCompactorOptions>;
    } {
        return {
            failedAttempts: this.failedCompressionAttempts,
            hasFailedCompression: this.hasFailedCompression,
            options: this.options
        };
    }

    /**
     * Forces compression regardless of threshold (for testing or manual trigger)
     */
    public async forceCompress(messages: MessageObject[]): Promise<{
        messages: MessageObject[];
        metadata: Partial<CompressionMetadata>;
    }> {
        const result = await (this.options.compactStrategy === 'summarize'
            ? this.compressSummarize(messages)
            : this.compressSmart(messages));

        return {
            messages: result.compressedMessages,
            metadata: result.metadata
        };
    }
}
