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
     * Calibrated characters-per-token ratio.
     * Starts at 4 (rough default) but gets refined when actual API usage data is available.
     */
    private charsPerToken: number = 4;

    /**
     * Estimates token count for a string
     * Uses calibrated chars-per-token ratio (refined by actual API usage when available)
     */
    private estimateTokens(text: string): number {
        if (!text) return 0;
        return Math.ceil(text.length / this.charsPerToken);
    }

    /**
     * Calibrates the chars-per-token ratio using actual API usage data.
     * Called when rawLLMResponseMessage.usage is available to improve estimation accuracy.
     */
    private calibrateTokenEstimation(messages: MessageObject[], usage: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number }): void {
        if (!usage?.prompt_tokens || usage.prompt_tokens <= 0) return;

        // Calculate total characters in messages that were sent as the prompt
        // (exclude the last assistant message which is the completion)
        let promptChars = 0;
        for (const msg of messages) {
            if (!msg) continue;
            const content = typeof msg.content === 'string'
                ? msg.content
                : (msg.content ? JSON.stringify(msg.content) : '');
            promptChars += content.length;
        }

        if (promptChars > 0) {
            // Calculate actual ratio, but clamp to reasonable bounds (2-6 chars per token)
            const actualRatio = promptChars / usage.prompt_tokens;
            this.charsPerToken = Math.max(2, Math.min(6, actualRatio));

            if (this.options.enableLogging) {
                console.log(`[ConversationCompactor] Calibrated chars/token ratio to ${this.charsPerToken.toFixed(2)} (from API usage: ${usage.prompt_tokens} tokens, ${promptChars} chars)`);
            }
        }
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
     * Finds the original user request (first non-system, non-tool user message)
     */
    private getOriginalUserMessage(messages: MessageObject[]): MessageObject | null {
        return messages.find(m => m.role === 'user' && !this.isToolResponseMessage(m)) || null;
    }

    /**
     * Inserts the original user message right after system messages if it's
     * not already present in the preserved messages.
     */
    private ensureOriginalUserMessage(
        compressedMessages: MessageObject[],
        originalMessages: MessageObject[]
    ): MessageObject[] {
        const originalUserMessage = this.getOriginalUserMessage(originalMessages);
        if (!originalUserMessage) return compressedMessages;

        // Check if the original user message is already in compressed messages
        if (compressedMessages.includes(originalUserMessage)) return compressedMessages;

        // Find insertion point: right after the last system message (or at index 0)
        let insertIndex = 0;
        for (let i = 0; i < compressedMessages.length; i++) {
            if (compressedMessages[i]?.role === 'system') {
                insertIndex = i + 1;
            } else {
                break;
            }
        }

        const result = [...compressedMessages];
        result.splice(insertIndex, 0, {
            role: 'user' as const,
            content: `[Original user request]: ${this.getMessageContent(originalUserMessage)}`
        });
        return result;
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
            if (!msg) { index++; continue; }

            // Never split right after an assistant with tool_calls
            // (tool responses must follow)
            if (index > 0) {
                const prevMsg = messages[index - 1];
                if (prevMsg?.role === 'assistant' && prevMsg.tool_calls && prevMsg.tool_calls.length > 0) {
                    index++;
                    continue;
                }
            }

            // Never split on a tool response message
            if (msg.role === 'tool' || this.isToolResponseMessage(msg)) {
                index++;
                continue;
            }

            // Safe to split at user message (non-tool) or assistant without pending tool calls
            if (msg.role === 'user' && !this.isToolResponseMessage(msg)) {
                break;
            }
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

        // Identify turn boundaries (each turn starts with a user message)
        const turnStartIndices: number[] = [];
        for (let i = 0; i < processableMessages.length; i++) {
            const msg = processableMessages[i];
            if (msg && msg.role === 'user' && !this.isToolResponseMessage(msg)) {
                turnStartIndices.push(i);
            }
        }

        if (turnStartIndices.length <= this.options.minPreservedUserMessages) {
            // Too few turns to compress
            return 0;
        }

        // Calculate how many turns to preserve based on preserveThreshold
        const turnsToPreserve = Math.max(
            this.options.minPreservedUserMessages,
            Math.ceil(turnStartIndices.length * this.options.preserveThreshold)
        );

        // The split point is at the start of the first preserved turn
        // We always keep the first user message (original task) separately via ensureOriginalUserMessage,
        // so we split to keep the last N turns
        const turnsToRemove = turnStartIndices.length - turnsToPreserve;

        if (turnsToRemove <= 0) {
            return 0;
        }

        // Split at the boundary of the last turn to remove
        let splitIndex = turnStartIndices[turnsToRemove];
        if (splitIndex === undefined) {
            splitIndex = Math.floor(processableMessages.length * (1 - this.options.preserveThreshold));
        }

        // Adjust to turn boundary for safety (handles tool response edge cases)
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
            return `[${i + 1}] ${msg.role}: ${content}`;
        }).join('\n\n');

        return `You are a conversation compression assistant. Your job is to create a detailed, structured summary that preserves ALL critical context so work can continue seamlessly.

CONVERSATION HISTORY TO COMPRESS:
${historyText}

First, analyze the conversation in a <thinking> block to identify what information is essential for continuing the work. Then produce the summary.

<thinking>
Analyze: What is the user's core task? What technical decisions were made? What files were read/modified? What problems were encountered and how were they solved? What is the current state of work?
</thinking>

Then generate the summary with ALL of the following sections. If a section is not applicable, write "N/A" but do NOT omit the section.

<summary>
1. PRIMARY REQUEST
[The user's original, complete request — use verbatim quotes where possible]

2. TASK EVOLUTION
[How the task evolved through the conversation. Include verbatim quotes of key user instructions or clarifications that changed the direction of work]

3. KEY TECHNICAL CONCEPTS
[Technical details critical for continuing: architecture decisions, design patterns chosen, algorithms, data structures, API contracts, configuration values]

4. FILES AND CODE
[Every file that was read, created, or modified. For each file include:
- Full file path
- What was done (read/created/modified)
- Key content or changes made (include exact code snippets for critical changes)
- Current state of the file]

5. PROBLEM SOLVING
[Problems encountered and their solutions:
- Error messages (verbatim)
- Root causes identified
- Solutions applied
- Workarounds in place]

6. PENDING TASKS
[Tasks that were mentioned but NOT yet completed. Be specific about what remains.]

7. CURRENT WORK STATE
[Exactly where the work left off — what was the last action taken and what was its result?]

8. NEXT STEP
[The single most logical next action to take to continue the work]

9. REQUIRED FILES
[List of file paths that the agent will need to re-read to continue working effectively. These are files whose contents were important context but will be lost after compression.]
</summary>

CRITICAL RULES:
- Preserve ALL file paths exactly as they appeared
- Preserve ALL code snippets, function names, variable names, error messages verbatim
- Include the FULL original user request, not a paraphrase
- Do not summarize away technical details — they are needed to continue work
- Focus on facts and specifics, not general descriptions`;
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

    /**
     * Extracts file paths from the "Required Files" section of a summary.
     * Looks for section 9 (REQUIRED FILES) and extracts paths listed there.
     */
    private extractRequiredFiles(summary: string): string[] {
        const files: string[] = [];

        // Match section "9. REQUIRED FILES" through the next section or end of summary
        const sectionMatch = summary.match(/9\.\s*REQUIRED FILES\s*\n([\s\S]*?)(?=\n\d+\.\s|\n<\/summary>|$)/i);
        if (!sectionMatch || !sectionMatch[1]) return files;

        const sectionContent = sectionMatch[1].trim();
        if (sectionContent === 'N/A' || sectionContent === 'None') return files;

        // Extract file paths: lines starting with -, *, or just paths starting with /
        const lines = sectionContent.split('\n');
        for (const line of lines) {
            const trimmed = line.trim().replace(/^[-*•]\s*/, '');
            // Match file paths (absolute or relative)
            const pathMatch = trimmed.match(/^[`'"]*([^\s`'"]+\.[a-zA-Z0-9]+)[`'"]*/) ||
                              trimmed.match(/^[`'"]*([/~][^\s`'"]+)[`'"]*/) ||
                              trimmed.match(/^[`'"]*([a-zA-Z][^\s`'"]*\/[^\s`'"]+)[`'"]*$/);
            if (pathMatch && pathMatch[1]) {
                files.push(pathMatch[1]);
            }
        }

        return files;
    }

    // ========================================================================
    // File-Read Deduplication (Pre-compression)
    // ========================================================================

    /**
     * Deduplicates repeated file reads in conversation history.
     * When the same file is read multiple times, older reads are replaced with
     * a short note, keeping only the latest read for each file path.
     * This reduces token count before full compression kicks in.
     */
    private deduplicateFileReads(messages: MessageObject[]): {
        messages: MessageObject[];
        deduplicatedCount: number;
    } {
        // Track the last occurrence index of each file path
        const fileReadIndices: Map<string, number[]> = new Map();

        // Common patterns for file read tool results
        const filePathPatterns = [
            /(?:read_file|readFile|cat|file_read)\s*[:\-]?\s*(.+)/i,
            /(?:Content of|Reading|File:)\s+['"`]?([^\s'"`]+)['"`]?/i,
            /^(['"`]?\/[^\s'"`]+['"`]?)/m,
        ];

        for (let i = 0; i < messages.length; i++) {
            const msg = messages[i];
            if (!msg || !this.isToolResponseMessage(msg)) continue;

            const content = this.getMessageContent(msg);
            if (!content) continue;

            // Try to extract a file path from the tool result
            let filePath: string | null = null;
            for (const pattern of filePathPatterns) {
                const match = content.match(pattern);
                if (match && match[1]) {
                    filePath = match[1].trim().replace(/['"`]/g, '');
                    break;
                }
            }

            // Also check the message name field (often contains the tool name + path)
            if (!filePath && msg.name) {
                const nameMatch = msg.name.match(/read[_-]?file/i);
                if (nameMatch) {
                    // Path might be in tool_call arguments of the preceding assistant message
                    if (i > 0) {
                        const prevMsg = messages[i - 1];
                        if (prevMsg?.tool_calls) {
                            for (const tc of prevMsg.tool_calls) {
                                const args = typeof tc.function?.arguments === 'string'
                                    ? tc.function.arguments
                                    : JSON.stringify(tc.function?.arguments || '');
                                const pathMatch = args.match(/['"]?path['"]?\s*:\s*['"]([^'"]+)['"]/);
                                if (pathMatch && pathMatch[1]) {
                                    filePath = pathMatch[1];
                                    break;
                                }
                            }
                        }
                    }
                }
            }

            if (filePath) {
                const indices = fileReadIndices.get(filePath) || [];
                indices.push(i);
                fileReadIndices.set(filePath, indices);
            }
        }

        // Replace older duplicate reads with a short note
        let deduplicatedCount = 0;
        const result = [...messages];

        fileReadIndices.forEach((indices, filePath) => {
            if (indices.length <= 1) return;

            // Keep the last read (most recent), replace older ones
            for (let j = 0; j < indices.length - 1; j++) {
                const idx = indices[j];
                if (idx === undefined) continue;
                const msg = result[idx];
                if (!msg) continue;

                result[idx] = {
                    ...msg,
                    content: `[NOTE: Duplicate file read removed for "${filePath}". See latest read below.]`
                };
                deduplicatedCount++;
            }
        });

        if (this.options.enableLogging && deduplicatedCount > 0) {
            console.log(`[ConversationCompactor] Deduplicated ${deduplicatedCount} file reads`);
        }

        return { messages: result, deduplicatedCount };
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
        let compressedMessages: MessageObject[] = [
            ...systemMessages.filter(sm => !preservedMessages.includes(sm)),
            {
                role: 'user' as const,
                content: `[Previous conversation context has been compressed. ${splitIndex} messages were removed to manage context length.\nThe original user task has been retained above. Pay special attention to recent messages as they contain the most current state of work.\nIf you need the contents of any files that were previously read, please re-read them before making changes.]`
            },
            ...preservedMessages
        ];

        // Ensure original user request is preserved
        compressedMessages = this.ensureOriginalUserMessage(compressedMessages, messages);

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

        let compressedMessages: MessageObject[] = [
            ...systemMessages.filter(sm => !preservedMessages.includes(sm)),
            {
                role: 'user' as const,
                content: `[Conversation compressed. ${splitIndex} older messages were removed and tool outputs may have been truncated.\nThe original user task has been retained above. Pay special attention to recent messages as they contain the most current state of work.\nIf you need the contents of any files that were previously read, please re-read them before making changes.]`
            },
            ...preservedMessages
        ];

        // Ensure original user request is preserved
        compressedMessages = this.ensureOriginalUserMessage(compressedMessages, messages);

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

            // Build compressed message array with continuation framing
            const continuationWrappedSummary = `This session is being continued from a previous conversation that ran out of context. Below is a summary of the conversation so far.

${summary}

Please continue from where the previous conversation left off. Do not ask the user to re-explain what they already told you — the summary above contains all the context you need. If you need to read any files mentioned in the summary, do so before making changes.`;

            let compressedMessages: MessageObject[] = [
                ...systemMessages.filter(sm => !preservedMessages.includes(sm)),
                {
                    role: 'user' as const,
                    content: continuationWrappedSummary
                },
                ...preservedMessages
            ];

            // Ensure original user request is preserved
            compressedMessages = this.ensureOriginalUserMessage(compressedMessages, messages);

            // Parse "Required Files" from summary and inject a hint for the agent
            const requiredFiles = this.extractRequiredFiles(summary);
            if (requiredFiles.length > 0) {
                compressedMessages.push({
                    role: 'user' as const,
                    content: `[IMPORTANT: The following files were being actively worked on before context compression and their contents are no longer in context. You should re-read these files before making any changes:\n${requiredFiles.map((f: string) => `- ${f}`).join('\n')}]`
                });
            }

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

            // Calibrate token estimation using actual API usage data when available.
            // This improves the chars/4 approximation with real tokenizer data.
            // Note: We still count the ACTUAL messages array (not usage.prompt_tokens directly)
            // because the messages array has grown since the LLM call (tool results appended).
            const usage = rawLLMResponseMessage?.usage as { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number } | undefined;
            if (usage) {
                this.calibrateTokenEstimation(messages, usage);
            }

            const currentTokens = this.countMessageTokens(messages);

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

            // Pre-compression: deduplicate file reads to reduce token waste
            const { messages: dedupedMessages } = this.deduplicateFileReads(messages);

            // Apply compression based on strategy
            let result: { compressedMessages: MessageObject[]; metadata: Partial<CompressionMetadata> };

            switch (this.options.compactStrategy) {
                case 'simple':
                    result = await this.compressSimple(dedupedMessages);
                    break;
                case 'smart':
                    result = await this.compressSmart(dedupedMessages);
                    break;
                case 'summarize':
                    result = await this.compressSummarize(dedupedMessages);
                    break;
                default:
                    result = await this.compressSmart(dedupedMessages);
            }

            const newTokens = this.countMessageTokens(result.compressedMessages);

            // Ensure system message is preserved after compression
            const hasSystemMessage = result.compressedMessages.some(m => m.role === 'system');
            if (!hasSystemMessage) {
                const originalSystemMsg = messages.find(m => m.role === 'system');
                if (originalSystemMsg) {
                    result.compressedMessages.unshift(originalSystemMsg);
                }
            }

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
