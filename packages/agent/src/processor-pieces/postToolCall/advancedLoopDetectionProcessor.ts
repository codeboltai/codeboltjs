import { BaseProcessor, ProcessorInput, ProcessorOutput } from '../../processor';
import { createHash } from 'crypto';

export interface AdvancedLoopDetectionProcessorOptions {
    toolCallThreshold?: number;
    contentLoopThreshold?: number;
    contentChunkSize?: number;
    maxHistoryLength?: number;
    enableLLMDetection?: boolean;
    llmCheckAfterTurns?: number;
    defaultLLMCheckInterval?: number;
}

export class AdvancedLoopDetectionProcessor extends BaseProcessor {
    private readonly toolCallThreshold: number;
    private readonly contentLoopThreshold: number;
    private readonly contentChunkSize: number;
    private readonly maxHistoryLength: number;
    private readonly enableLLMDetection: boolean;
    private readonly llmCheckAfterTurns: number;
    private readonly defaultLLMCheckInterval: number;

    // Tool call tracking
    private lastToolCallKey: string | null = null;
    private toolCallRepetitionCount: number = 0;

    // Content streaming tracking
    private streamContentHistory = '';
    private contentStats = new Map<string, number[]>();
    private lastContentIndex = 0;
    private loopDetected = false;
    private inCodeBlock = false;

    // Turn tracking
    private turnsInCurrentPrompt = 0;
    private llmCheckInterval: number;
    private lastCheckTurn = 0;

    constructor(options: AdvancedLoopDetectionProcessorOptions = {}) {
        super();
        this.toolCallThreshold = options.toolCallThreshold || 5;
        this.contentLoopThreshold = options.contentLoopThreshold || 10;
        this.contentChunkSize = options.contentChunkSize || 50;
        this.maxHistoryLength = options.maxHistoryLength || 1000;
        this.enableLLMDetection = options.enableLLMDetection || false;
        this.llmCheckAfterTurns = options.llmCheckAfterTurns || 30;
        this.defaultLLMCheckInterval = options.defaultLLMCheckInterval || 3;
        this.llmCheckInterval = this.defaultLLMCheckInterval;
    }

    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        const { message, context } = input;
        
        // Increment turn counter
        this.turnsInCurrentPrompt++;

        // Check for tool call loops in the last message
        const lastMessage = message.messages[message.messages.length - 1];
        if (lastMessage.tool_calls && lastMessage.tool_calls.length > 0) {
            for (const toolCall of lastMessage.tool_calls) {
                const isLoop = this.checkToolCallLoop({
                    name: toolCall.function.name,
                    args: typeof toolCall.function.arguments === 'string' 
                        ? JSON.parse(toolCall.function.arguments)
                        : toolCall.function.arguments
                });
                
                if (isLoop) {
                    this.loopDetected = true;
                    return [this.createEvent('LoopDetected', {
                        type: 'tool_call_loop',
                        toolCall: toolCall.function.name,
                        repetitionCount: this.toolCallRepetitionCount,
                        threshold: this.toolCallThreshold
                    })];
                }
            }
        }

        // Check for content loops
        if (lastMessage.content && typeof lastMessage.content === 'string') {
            const isContentLoop = this.checkContentLoop(lastMessage.content);
            if (isContentLoop) {
                this.loopDetected = true;
                return [this.createEvent('LoopDetected', {
                    type: 'content_loop',
                    contentLength: this.streamContentHistory.length,
                    threshold: this.contentLoopThreshold
                })];
            }
        }

        // LLM-based loop detection (if enabled)
        if (this.enableLLMDetection && 
            this.turnsInCurrentPrompt >= this.llmCheckAfterTurns &&
            this.turnsInCurrentPrompt - this.lastCheckTurn >= this.llmCheckInterval) {
            
            this.lastCheckTurn = this.turnsInCurrentPrompt;
            // For now, just log that LLM check would happen
            // In a real implementation, this would call an LLM to analyze the conversation
            console.log('[AdvancedLoopDetection] LLM-based loop check would be performed here');
        }

        return [this.createEvent('LoopCheckCompleted', {
            loopDetected: this.loopDetected,
            turnsInPrompt: this.turnsInCurrentPrompt,
            toolCallCount: this.toolCallRepetitionCount
        })];
    }

    private getToolCallKey(toolCall: { name: string; args: object }): string {
        const argsString = JSON.stringify(toolCall.args);
        const keyString = `${toolCall.name}:${argsString}`;
        return createHash('sha256').update(keyString).digest('hex');
    }

    private checkToolCallLoop(toolCall: { name: string; args: object }): boolean {
        const key = this.getToolCallKey(toolCall);
        if (this.lastToolCallKey === key) {
            this.toolCallRepetitionCount++;
        } else {
            this.lastToolCallKey = key;
            this.toolCallRepetitionCount = 1;
        }
        
        return this.toolCallRepetitionCount >= this.toolCallThreshold;
    }

    private checkContentLoop(content: string): boolean {
        // Different content elements can often contain repetitive syntax that is not indicative of a loop.
        // To avoid false positives, we detect when we encounter different content types and
        // reset tracking to avoid analyzing content that spans across different element boundaries.
        const numFences = (content.match(/```/g) ?? []).length;
        const hasTable = /(^|\n)\s*(\|.*\||[|+-]{3,})/.test(content);
        const hasListItem = /(^|\n)\s*[*-+]\s/.test(content) || /(^|\n)\s*\d+\.\s/.test(content);
        const hasHeading = /(^|\n)#+\s/.test(content);
        const hasBlockquote = /(^|\n)>\s/.test(content);

        if (numFences || hasTable || hasListItem || hasHeading || hasBlockquote) {
            // Reset tracking when different content elements are detected
            this.resetContentTracking();
        }

        const wasInCodeBlock = this.inCodeBlock;
        this.inCodeBlock = numFences % 2 === 0 ? this.inCodeBlock : !this.inCodeBlock;
        if (wasInCodeBlock || this.inCodeBlock) {
            return false;
        }

        this.streamContentHistory += content;
        this.truncateAndUpdate();
        return this.analyzeContentChunksForLoop();
    }

    private truncateAndUpdate(): void {
        if (this.streamContentHistory.length <= this.maxHistoryLength) {
            return;
        }

        const truncationAmount = this.streamContentHistory.length - this.maxHistoryLength;
        this.streamContentHistory = this.streamContentHistory.slice(truncationAmount);
        this.lastContentIndex = Math.max(0, this.lastContentIndex - truncationAmount);

        // Update all stored chunk indices to account for the truncation
        for (const [hash, oldIndices] of this.contentStats.entries()) {
            const adjustedIndices = oldIndices
                .map((index) => index - truncationAmount)
                .filter((index) => index >= 0);

            if (adjustedIndices.length > 0) {
                this.contentStats.set(hash, adjustedIndices);
            } else {
                this.contentStats.delete(hash);
            }
        }
    }

    private analyzeContentChunksForLoop(): boolean {
        while (this.hasMoreChunksToProcess()) {
            const currentChunk = this.streamContentHistory.substring(
                this.lastContentIndex,
                this.lastContentIndex + this.contentChunkSize,
            );
            const chunkHash = createHash('sha256').update(currentChunk).digest('hex');

            if (this.isLoopDetectedForChunk(currentChunk, chunkHash)) {
                return true;
            }

            this.lastContentIndex++;
        }

        return false;
    }

    private hasMoreChunksToProcess(): boolean {
        return this.lastContentIndex + this.contentChunkSize <= this.streamContentHistory.length;
    }

    private isLoopDetectedForChunk(chunk: string, hash: string): boolean {
        const existingIndices = this.contentStats.get(hash);

        if (!existingIndices) {
            this.contentStats.set(hash, [this.lastContentIndex]);
            return false;
        }

        if (!this.isActualContentMatch(chunk, existingIndices[0])) {
            return false;
        }

        existingIndices.push(this.lastContentIndex);

        if (existingIndices.length < this.contentLoopThreshold) {
            return false;
        }

        // Analyze the most recent occurrences to see if they're clustered closely together
        const recentIndices = existingIndices.slice(-this.contentLoopThreshold);
        const totalDistance = recentIndices[recentIndices.length - 1] - recentIndices[0];
        const averageDistance = totalDistance / (this.contentLoopThreshold - 1);
        const maxAllowedDistance = this.contentChunkSize * 1.5;

        return averageDistance <= maxAllowedDistance;
    }

    private isActualContentMatch(currentChunk: string, originalIndex: number): boolean {
        const originalChunk = this.streamContentHistory.substring(
            originalIndex,
            originalIndex + this.contentChunkSize,
        );
        return originalChunk === currentChunk;
    }

    private resetContentTracking(resetHistory = true): void {
        if (resetHistory) {
            this.streamContentHistory = '';
        }
        this.contentStats.clear();
        this.lastContentIndex = 0;
    }

    reset(): void {
        this.lastToolCallKey = null;
        this.toolCallRepetitionCount = 0;
        this.resetContentTracking();
        this.turnsInCurrentPrompt = 0;
        this.llmCheckInterval = this.defaultLLMCheckInterval;
        this.lastCheckTurn = 0;
        this.loopDetected = false;
        this.inCodeBlock = false;
    }
}
