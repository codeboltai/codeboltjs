import {
  AskAIMessage
} from './../../types';

/**
 * Handles ask AI messages by forwarding them to agents
 */
export class AskAIHandler {
  constructor() {
  }

  handleAskAI(message: AskAIMessage): { success: boolean; message?: string; error?: string; type: string; id: string } {
    // AskAI requests are typically forwarded to agents, not processed directly
    // This handler just validates the request format
    try {
      if (!message.prompt || message.prompt.trim() === '') {
        return {
          success: false,
          error: 'Invalid prompt. Prompt cannot be empty.',
          type: 'askAIResponse',
          id: message.id
        };
      }

      return {
        success: true,
        message: 'AI request received and will be forwarded to agent',
        type: 'askAIResponse',
        id: message.id
      };
    } catch (error) {
      return {
        success: false,
        error: `Failed to process AI request: ${error}`,
        type: 'askAIResponse',
        id: message.id
      };
    }
  }
}