/**
 * Custom modifier that injects the full Gemini-style system prompt.
 * Replaces Codebolt's built-in CoreSystemPromptModifier with the
 * multi-section Gemini prompt (~15 sections).
 */
import { BaseMessageModifier } from '@codebolt/agent/processor-pieces/base';
import type { ProcessedMessage } from '@codebolt/types/agent';
import type { FlatUserMessage } from '@codebolt/types/sdk';
import { buildGeminiSystemPrompt, type GeminiPromptOptions } from '../prompt/systemPrompt';

export class GeminiSystemPromptModifier extends BaseMessageModifier {
  private options: GeminiPromptOptions;
  private cachedPrompt: string | null = null;

  constructor(options: GeminiPromptOptions) {
    super();
    this.options = options;
  }

  async modify(
    _originalRequest: FlatUserMessage,
    createdMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    // Cache the prompt since options don't change per-message
    if (!this.cachedPrompt) {
      this.cachedPrompt = buildGeminiSystemPrompt(this.options);
    }

    // Inject as the first system message
    createdMessage.message.messages.unshift({
      role: 'system',
      content: this.cachedPrompt,
    });

    return createdMessage;
  }

  /** Invalidate cache when options change (e.g., plan mode toggle). */
  updateOptions(newOptions: Partial<GeminiPromptOptions>): void {
    this.options = { ...this.options, ...newOptions };
    this.cachedPrompt = null;
  }
}
