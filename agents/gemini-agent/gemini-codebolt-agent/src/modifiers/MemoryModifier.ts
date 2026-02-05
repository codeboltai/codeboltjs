/**
 * Custom modifier that injects user and project memory into the prompt.
 * Equivalent to Gemini CLI's GEMINI.md file system:
 *   - User memory  (~/.gemini/GEMINI.md)  → user preferences
 *   - Project memory (<project>/GEMINI.md) → project conventions
 *
 * Uses codebolt.memory APIs for persistent storage.
 */
import { BaseMessageModifier } from '@codebolt/agent/processor-pieces/base';
import type { ProcessedMessage } from '@codebolt/types/agent';
import type { FlatUserMessage } from '@codebolt/types/sdk';
import codebolt from '@codebolt/codeboltjs';

export class MemoryModifier extends BaseMessageModifier {
  async modify(
    _originalRequest: FlatUserMessage,
    createdMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    const memoryParts: string[] = [];

    // Load user-level memory (preferences, workflow, style)
    const userMemory = await this.safeLoadMemory('gemini_user_memory');
    if (userMemory) {
      memoryParts.push(`## User Preferences\n${userMemory}`);
    }

    // Load project-level memory (conventions, architecture, key files)
    const projectMemory = await this.safeLoadMemory('gemini_project_memory');
    if (projectMemory) {
      memoryParts.push(`## Project Context\n${projectMemory}`);
    }

    if (memoryParts.length > 0) {
      createdMessage.message.messages.push({
        role: 'system',
        content: `---\n\n${memoryParts.join('\n\n')}`,
      });
    }

    return createdMessage;
  }

  private async safeLoadMemory(key: string): Promise<string | null> {
    try {
      const response = await codebolt.memory.json.list({ key });
      if (response && response.items && response.items.length > 0) {
        return JSON.stringify(response.items, null, 2);
      }
      return null;
    } catch {
      return null;
    }
  }
}
