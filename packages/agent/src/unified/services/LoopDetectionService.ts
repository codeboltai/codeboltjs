import { createHash } from 'node:crypto';

export enum LoopType {
    CONSECUTIVE_IDENTICAL_TOOL_CALLS = 'CONSECUTIVE_IDENTICAL_TOOL_CALLS',
    CHANTING_IDENTICAL_SENTENCES = 'CHANTING_IDENTICAL_SENTENCES'
}

export interface LoopDetectedEvent {
    type: LoopType;
    threshold: number;
    count: number;
}

export interface LoopDetectionOptions {
    toolCallLoopThreshold?: number;
    contentLoopThreshold?: number;
    debug?: boolean;
}

/**
 * Service for detecting and preventing infinite loops in AI responses.
 * Monitors tool call repetitions and content sentence repetitions.
 * 
 * Ported from gemini-cli/packages/core/src/services/loopDetectionService.ts
 */
export class LoopDetectionService {
    // Configuration
    private readonly toolCallLoopThreshold: number;
    private readonly debug: boolean;

    // State
    private lastToolCallKey: string | null = null;
    private toolCallRepetitionCount: number = 0;
    private loopDetected = false;

    constructor(options: LoopDetectionOptions = {}) {
        this.toolCallLoopThreshold = options.toolCallLoopThreshold || 5;
        this.debug = options.debug || false;
    }

    /**
     * Resets the loop detection state. Call this when a "fresh" start is needed
     * or a user explicitly interrupts.
     */
    reset(): void {
        this.lastToolCallKey = null;
        this.toolCallRepetitionCount = 0;
        this.loopDetected = false;
    }

    /**
     * Generates a unique hash for a tool call based on name and arguments.
     */
    private getToolCallKey(toolName: string, toolArgs: any): string {
        const argsString = typeof toolArgs === 'string' ? toolArgs : JSON.stringify(toolArgs);
        const keyString = `${toolName}:${argsString}`;
        return createHash('sha256').update(keyString).digest('hex');
    }

    /**
     * Checks if the given tool call constitutes a loop.
     * @param toolName Name of the tool
     * @param toolArgs Arguments passed to the tool
     * @returns LoopDetectedEvent if a loop is detected, null otherwise
     */
    checkToolCallLoop(toolName: string, toolArgs: any): LoopDetectedEvent | null {
        if (this.loopDetected) {
            // Already caught a loop, stick to it until reset
            return {
                type: LoopType.CONSECUTIVE_IDENTICAL_TOOL_CALLS,
                threshold: this.toolCallLoopThreshold,
                count: this.toolCallRepetitionCount
            };
        }

        const key = this.getToolCallKey(toolName, toolArgs);

        if (this.lastToolCallKey === key) {
            this.toolCallRepetitionCount++;
        } else {
            this.lastToolCallKey = key;
            this.toolCallRepetitionCount = 1;
        }

        if (this.toolCallRepetitionCount >= this.toolCallLoopThreshold) {
            this.loopDetected = true;
            if (this.debug) {
                console.warn(`[LoopDetection] Detected consecutive identical tool calls: ${toolName} (${this.toolCallRepetitionCount})`);
            }
            return {
                type: LoopType.CONSECUTIVE_IDENTICAL_TOOL_CALLS,
                threshold: this.toolCallLoopThreshold,
                count: this.toolCallRepetitionCount
            };
        }

        return null;
    }
}
