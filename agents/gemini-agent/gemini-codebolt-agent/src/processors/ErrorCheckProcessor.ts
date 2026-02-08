/**
 * Error Check Processor — Detects critical errors in tool results and can halt the loop.
 * Runs as a PostToolCallProcessor after each tool execution batch.
 *
 * Equivalent to Gemini CLI's AfterTool hook error handling:
 *  - STOP_EXECUTION on critical errors
 *  - EXECUTION_FAILED on blocking errors
 */
import { BasePostToolCallProcessor } from '@codebolt/agent/processor-pieces/base';
import type {
  PostToolCallProcessorInput,
  PostToolCallProcessorOutput,
} from '@codebolt/types/agent';

/** Patterns that indicate a critical, unrecoverable error. */
const CRITICAL_ERROR_PATTERNS = [
  'FATAL ERROR',
  'ENOMEM',
  'out of memory',
  'segmentation fault',
  'stack overflow',
  'maximum call stack size exceeded',
];

/** Patterns that indicate the agent should pause and reassess. */
const BLOCKING_ERROR_PATTERNS = [
  'EACCES',
  'permission denied',
  'ENOSPC',
  'no space left on device',
];

export class ErrorCheckProcessor extends BasePostToolCallProcessor {
  async modify(input: PostToolCallProcessorInput): Promise<PostToolCallProcessorOutput> {
    const { nextPrompt, toolResults } = input;

    if (!toolResults || toolResults.length === 0) {
      return { nextPrompt, shouldExit: false };
    }

    for (const result of toolResults) {
      const content = typeof result.content === 'string' ? result.content : '';

      // Check for critical errors that should halt execution
      for (const pattern of CRITICAL_ERROR_PATTERNS) {
        if (content.toLowerCase().includes(pattern.toLowerCase())) {
          // Inject error context and exit
          nextPrompt.message.messages.push({
            role: 'system',
            content: `**CRITICAL ERROR DETECTED:** "${pattern}" found in tool output. Halt further tool calls and report the error to the user.`,
          });
          return { nextPrompt, shouldExit: true };
        }
      }

      // Check for blocking errors that warrant a warning
      for (const pattern of BLOCKING_ERROR_PATTERNS) {
        if (content.toLowerCase().includes(pattern.toLowerCase())) {
          nextPrompt.message.messages.push({
            role: 'system',
            content: `**WARNING:** "${pattern}" detected in tool output. Consider whether you need to take a different approach before continuing.`,
          });
          // Don't exit — let the LLM decide how to handle
          break;
        }
      }
    }

    return { nextPrompt, shouldExit: false };
  }
}
