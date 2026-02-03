/**
 * Type Tests for Multillm
 *
 * Verifies type definitions work correctly
 */

import { describe, it, expect } from 'vitest';
import type {
  ContentPart,
  TextContentPart,
  ImageContentPart,
  FileContentPart,
  MessageContent,
  ReasoningConfig,
  ReasoningContent,
  ChatMessage,
  ChatCompletionOptions,
  ChatCompletionResponse,
  ProviderCapabilities
} from '../../types';

describe('Multimodal Content Types', () => {
  describe('TextContentPart', () => {
    it('should accept valid text content', () => {
      const part: TextContentPart = {
        type: 'text',
        text: 'Hello world'
      };
      expect(part.type).toBe('text');
      expect(part.text).toBe('Hello world');
    });
  });

  describe('ImageContentPart', () => {
    it('should accept URL string', () => {
      const part: ImageContentPart = {
        type: 'image',
        image: 'https://example.com/image.jpg'
      };
      expect(part.type).toBe('image');
    });

    it('should accept base64 string', () => {
      const part: ImageContentPart = {
        type: 'image',
        image: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAAB...'
      };
      expect(part.type).toBe('image');
    });

    it('should accept URL object', () => {
      const part: ImageContentPart = {
        type: 'image',
        image: new URL('https://example.com/image.jpg')
      };
      expect(part.type).toBe('image');
    });

    it('should accept ArrayBuffer', () => {
      const buffer = new ArrayBuffer(16);
      const part: ImageContentPart = {
        type: 'image',
        image: buffer
      };
      expect(part.type).toBe('image');
    });

    it('should accept Uint8Array', () => {
      const bytes = new Uint8Array([137, 80, 78, 71]);
      const part: ImageContentPart = {
        type: 'image',
        image: bytes
      };
      expect(part.type).toBe('image');
    });

    it('should accept optional mimeType', () => {
      const part: ImageContentPart = {
        type: 'image',
        image: 'https://example.com/image.jpg',
        mimeType: 'image/jpeg'
      };
      expect(part.mimeType).toBe('image/jpeg');
    });

    it('should accept optional detail', () => {
      const part: ImageContentPart = {
        type: 'image',
        image: 'https://example.com/image.jpg',
        detail: 'high'
      };
      expect(part.detail).toBe('high');
    });
  });

  describe('FileContentPart', () => {
    it('should accept file with mimeType', () => {
      const part: FileContentPart = {
        type: 'file',
        file: 'JVBERi0xLjQK...',
        mimeType: 'application/pdf'
      };
      expect(part.type).toBe('file');
      expect(part.mimeType).toBe('application/pdf');
    });

    it('should accept optional filename', () => {
      const part: FileContentPart = {
        type: 'file',
        file: 'JVBERi0xLjQK...',
        mimeType: 'application/pdf',
        filename: 'document.pdf'
      };
      expect(part.filename).toBe('document.pdf');
    });
  });

  describe('ContentPart', () => {
    it('should accept all content part types', () => {
      const parts: ContentPart[] = [
        { type: 'text', text: 'Hello' },
        { type: 'image', image: 'https://example.com/image.jpg' },
        { type: 'file', file: 'base64...', mimeType: 'application/pdf' }
      ];
      expect(parts.length).toBe(3);
    });
  });

  describe('MessageContent', () => {
    it('should accept string', () => {
      const content: MessageContent = 'Hello world';
      expect(content).toBe('Hello world');
    });

    it('should accept null', () => {
      const content: MessageContent = null;
      expect(content).toBeNull();
    });

    it('should accept array of content parts', () => {
      const content: MessageContent = [
        { type: 'text', text: 'Hello' },
        { type: 'image', image: 'https://example.com/image.jpg' }
      ];
      expect(Array.isArray(content)).toBe(true);
    });
  });
});

describe('Reasoning Types', () => {
  describe('ReasoningConfig', () => {
    it('should accept empty config', () => {
      const config: ReasoningConfig = {};
      expect(config).toBeDefined();
    });

    it('should accept thinkingBudget', () => {
      const config: ReasoningConfig = {
        thinkingBudget: 50000
      };
      expect(config.thinkingBudget).toBe(50000);
    });

    it('should accept includeReasoning', () => {
      const config: ReasoningConfig = {
        includeReasoning: true
      };
      expect(config.includeReasoning).toBe(true);
    });

    it('should accept reasoningEffort', () => {
      const config: ReasoningConfig = {
        reasoningEffort: 'high'
      };
      expect(config.reasoningEffort).toBe('high');
    });

    it('should accept all options', () => {
      const config: ReasoningConfig = {
        thinkingBudget: 50000,
        includeReasoning: true,
        reasoningEffort: 'medium'
      };
      expect(config.thinkingBudget).toBe(50000);
      expect(config.includeReasoning).toBe(true);
      expect(config.reasoningEffort).toBe('medium');
    });
  });

  describe('ReasoningContent', () => {
    it('should accept thinking content', () => {
      const content: ReasoningContent = {
        thinking: 'Let me think about this...'
      };
      expect(content.thinking).toBe('Let me think about this...');
    });

    it('should accept optional signature', () => {
      const content: ReasoningContent = {
        thinking: 'Let me think...',
        signature: 'abc123'
      };
      expect(content.signature).toBe('abc123');
    });
  });
});

describe('ChatMessage', () => {
  it('should accept string content', () => {
    const message: ChatMessage = {
      role: 'user',
      content: 'Hello world'
    };
    expect(message.content).toBe('Hello world');
  });

  it('should accept null content', () => {
    const message: ChatMessage = {
      role: 'assistant',
      content: null
    };
    expect(message.content).toBeNull();
  });

  it('should accept multimodal content', () => {
    const message: ChatMessage = {
      role: 'user',
      content: [
        { type: 'text', text: 'What is in this image?' },
        { type: 'image', image: 'https://example.com/image.jpg' }
      ]
    };
    expect(Array.isArray(message.content)).toBe(true);
  });

  it('should accept reasoning content', () => {
    const message: ChatMessage = {
      role: 'assistant',
      content: 'The answer is 42',
      reasoning: {
        thinking: 'Let me think about this problem...'
      }
    };
    expect(message.reasoning?.thinking).toBe('Let me think about this problem...');
  });
});

describe('ChatCompletionOptions', () => {
  it('should accept reasoning config', () => {
    const options: ChatCompletionOptions = {
      messages: [{ role: 'user', content: 'Hello' }],
      reasoning: {
        thinkingBudget: 50000,
        reasoningEffort: 'high'
      }
    };
    expect(options.reasoning?.thinkingBudget).toBe(50000);
  });
});

describe('ChatCompletionResponse', () => {
  it('should include reasoning_tokens in usage', () => {
    const response: ChatCompletionResponse = {
      id: 'test-id',
      object: 'chat.completion',
      created: Date.now(),
      model: 'o1',
      choices: [{
        index: 0,
        message: { role: 'assistant', content: 'Hello' },
        finish_reason: 'stop'
      }],
      usage: {
        prompt_tokens: 10,
        completion_tokens: 20,
        total_tokens: 30,
        reasoning_tokens: 15
      }
    };
    expect(response.usage.reasoning_tokens).toBe(15);
  });
});

describe('ProviderCapabilities', () => {
  it('should include supportsReasoning', () => {
    const capabilities: ProviderCapabilities = {
      supportsStreaming: true,
      supportsTools: true,
      supportsVision: true,
      supportsReasoning: true,
      supportsMultimodal: true
    };
    expect(capabilities.supportsReasoning).toBe(true);
  });

  it('should include supportsMultimodal', () => {
    const capabilities: ProviderCapabilities = {
      supportsStreaming: true,
      supportsMultimodal: true
    };
    expect(capabilities.supportsMultimodal).toBe(true);
  });
});
