/**
 * Loop Detection Processor — Detects unproductive agent loops.
 * Equivalent to Gemini CLI's LoopDetectionService with 3 methods:
 *
 * Method 1: Tool Call Loop — SHA256 hash of consecutive identical tool calls (threshold: 5)
 * Method 2: Content Chunk Loop — Sliding window of 50-char chunks, detect 10+ repetitions
 * Method 3: LLM-Based Loop — After 30 turns, periodically ask LLM if state is unproductive
 *
 * Runs as a PreInferenceProcessor — checked before each LLM call.
 */
import { BasePreInferenceProcessor } from '@codebolt/agent/processor-pieces/base';
import type { ProcessedMessage } from '@codebolt/types/agent';
import type { FlatUserMessage } from '@codebolt/types/sdk';
import codebolt from '@codebolt/codeboltjs';
import { createHash } from 'crypto';

export interface LoopDetectionConfig {
  toolCallThreshold: number;
  contentChunkThreshold: number;
  contentChunkSize: number;
  maxHistoryLength: number;
  llmCheckAfterTurns: number;
  llmCheckInterval: number;
  llmConfidenceThreshold: number;
}

const DEFAULT_CONFIG: LoopDetectionConfig = {
  toolCallThreshold: 5,
  contentChunkThreshold: 10,
  contentChunkSize: 50,
  maxHistoryLength: 5000,
  llmCheckAfterTurns: 30,
  llmCheckInterval: 3,
  llmConfidenceThreshold: 0.9,
};

export class LoopDetectionProcessor extends BasePreInferenceProcessor {
  private config: LoopDetectionConfig;

  // Method 1 state
  private lastToolCallHash: string = '';
  private consecutiveIdenticalTools: number = 0;

  // Method 2 state
  private contentHistory: string = '';

  // Method 3 state
  private turnCount: number = 0;

  constructor(config: Partial<LoopDetectionConfig> = {}) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async modify(
    _originalRequest: FlatUserMessage,
    createdMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    this.turnCount++;
    let loopDetected = false;
    let loopMethod = '';

    // Method 1: Tool call loop detection
    const toolLoop = this.checkToolCallLoop(createdMessage);
    if (toolLoop) {
      loopDetected = true;
      loopMethod = 'repeated tool calls';
    }

    // Method 2: Content chunk loop detection
    if (!loopDetected) {
      const contentLoop = this.checkContentChunkLoop(createdMessage);
      if (contentLoop) {
        loopDetected = true;
        loopMethod = 'repetitive content';
      }
    }

    // Method 3: LLM-based loop detection (expensive — periodic only)
    if (
      !loopDetected &&
      this.turnCount >= this.config.llmCheckAfterTurns &&
      this.turnCount % this.config.llmCheckInterval === 0
    ) {
      const llmLoop = await this.checkLLMLoop(createdMessage);
      if (llmLoop) {
        loopDetected = true;
        loopMethod = 'unproductive state (LLM analysis)';
      }
    }

    // Inject loop warning if detected
    if (loopDetected) {
      createdMessage.message.messages.push({
        role: 'system',
        content: [
          `**LOOP DETECTED** (${loopMethod}): The conversation appears to be stuck in an unproductive loop.`,
          '',
          'You MUST take a different approach immediately:',
          '1. Stop repeating the same tool call or pattern.',
          '2. Try a completely different strategy to solve the problem.',
          '3. If stuck, explain the difficulty to the user and ask for guidance.',
          '4. Use attempt_completion to report what you have found so far.',
        ].join('\n'),
      });
    }

    return createdMessage;
  }

  /**
   * Method 1: Tool Call Loop Detection
   * Tracks SHA256 hashes of tool calls. If the same hash appears
   * N consecutive times, a loop is detected.
   */
  private checkToolCallLoop(msg: ProcessedMessage): boolean {
    const messages = msg.message.messages;
    // Scan backwards for the most recent assistant message with tool calls
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === 'assistant' && m.tool_calls && m.tool_calls.length > 0) {
        const tc = m.tool_calls[0];
        const fn = tc.function;
        if (!fn) break;

        const hashInput = `${fn.name || ''}:${fn.arguments || ''}`;
        const hash = createHash('sha256').update(hashInput).digest('hex');

        if (hash === this.lastToolCallHash) {
          this.consecutiveIdenticalTools++;
          return this.consecutiveIdenticalTools >= this.config.toolCallThreshold;
        } else {
          this.lastToolCallHash = hash;
          this.consecutiveIdenticalTools = 1;
          return false;
        }
      }
    }
    return false;
  }

  /**
   * Method 2: Content Chunk Loop Detection
   * Builds a sliding window of N-character chunks from assistant content.
   * If any chunk hash appears M+ times within a short average distance, loop detected.
   */
  private checkContentChunkLoop(msg: ProcessedMessage): boolean {
    const messages = msg.message.messages;
    // Accumulate latest assistant content
    for (let i = messages.length - 1; i >= 0; i--) {
      const m = messages[i];
      if (m.role === 'assistant' && typeof m.content === 'string') {
        this.contentHistory += m.content;
        break;
      }
    }

    // Truncate history if too long
    if (this.contentHistory.length > this.config.maxHistoryLength) {
      this.contentHistory = this.contentHistory.slice(-this.config.maxHistoryLength);
    }

    // Need enough content to analyze
    if (this.contentHistory.length < this.config.contentChunkSize * 3) {
      return false;
    }

    return this.analyzeContentChunks();
  }

  private analyzeContentChunks(): boolean {
    const chunkSize = this.config.contentChunkSize;
    const chunkPositions: Map<string, number[]> = new Map();

    for (let i = 0; i <= this.contentHistory.length - chunkSize; i += chunkSize) {
      const chunk = this.contentHistory.slice(i, i + chunkSize);
      const hash = createHash('sha256').update(chunk).digest('hex').slice(0, 16);

      const positions = chunkPositions.get(hash);
      if (positions) {
        positions.push(i);
      } else {
        chunkPositions.set(hash, [i]);
      }
    }

    // Check for highly repeated chunks
    for (const [, positions] of chunkPositions) {
      if (positions.length >= this.config.contentChunkThreshold) {
        // Calculate average distance between occurrences
        let totalDistance = 0;
        for (let i = 1; i < positions.length; i++) {
          totalDistance += positions[i] - positions[i - 1];
        }
        const avgDistance = totalDistance / (positions.length - 1);
        // If repetitions are close together, it's a loop
        if (avgDistance <= 250) {
          return true;
        }
      }
    }

    return false;
  }

  /**
   * Method 3: LLM-Based Loop Detection
   * Uses a lightweight LLM call to analyze recent turns for unproductive patterns.
   * Only runs after N turns and at intervals to minimize cost.
   */
  private async checkLLMLoop(msg: ProcessedMessage): Promise<boolean> {
    try {
      // Take last 20 messages for analysis
      const recentMessages = msg.message.messages.slice(-20);
      const summary = recentMessages.map((m) => {
        const content = typeof m.content === 'string' ? m.content.slice(0, 300) : '[non-text]';
        return `${m.role}: ${content}`;
      }).join('\n---\n');

      const analysis = await codebolt.llm.inference({
        messages: [
          {
            role: 'system',
            content: [
              'Analyze the following conversation excerpt for unproductive loop patterns.',
              'Look for: repeated identical actions, oscillating between two states, same errors recurring,',
              'or the agent making no meaningful progress.',
              '',
              'Return ONLY a JSON object: { "unproductive": true/false, "confidence": 0.0-1.0 }',
            ].join('\n'),
          },
          {
            role: 'user',
            content: summary,
          },
        ],
      });

      const responseText = analysis.completion?.choices?.[0]?.message?.content?.trim() || '{}';
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/\{[^}]+\}/);
      if (!jsonMatch) return false;

      const result = JSON.parse(jsonMatch[0]);
      return (
        result.unproductive === true &&
        typeof result.confidence === 'number' &&
        result.confidence >= this.config.llmConfidenceThreshold
      );
    } catch {
      return false;
    }
  }

  /** Reset all loop detection state (call on new user message). */
  reset(): void {
    this.lastToolCallHash = '';
    this.consecutiveIdenticalTools = 0;
    this.contentHistory = '';
    this.turnCount = 0;
  }
}
