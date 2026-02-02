/**
 * Backward Compatibility Tests
 *
 * Ensures existing code using string content continues to work
 */

import { describe, it, expect } from 'vitest';
import { extractTextContent } from '../../utils/contentTransformer';
import type { ChatMessage, MessageContent, ContentPart } from '../../types';

describe('Backward Compatibility', () => {
  describe('String Content', () => {
    it('should handle string content in ChatMessage', () => {
      const message: ChatMessage = {
        role: 'user',
        content: 'Hello, how are you?'
      };

      expect(typeof message.content).toBe('string');
      expect(message.content).toBe('Hello, how are you?');
    });

    it('should extract text from string content', () => {
      const content: MessageContent = 'Hello world';
      const text = extractTextContent(content);
      expect(text).toBe('Hello world');
    });

    it('should handle assistant message with string content', () => {
      const message: ChatMessage = {
        role: 'assistant',
        content: 'I am fine, thank you!'
      };

      expect(message.content).toBe('I am fine, thank you!');
    });

    it('should handle system message with string content', () => {
      const message: ChatMessage = {
        role: 'system',
        content: 'You are a helpful assistant.'
      };

      expect(message.content).toBe('You are a helpful assistant.');
    });
  });

  describe('Null Content', () => {
    it('should handle null content in ChatMessage', () => {
      const message: ChatMessage = {
        role: 'assistant',
        content: null,
        tool_calls: [{
          id: 'call_123',
          type: 'function',
          function: {
            name: 'get_weather',
            arguments: '{"city": "London"}'
          }
        }]
      };

      expect(message.content).toBeNull();
      expect(message.tool_calls).toBeDefined();
    });

    it('should extract empty string from null content', () => {
      const content: MessageContent = null;
      const text = extractTextContent(content);
      expect(text).toBe('');
    });
  });

  describe('Mixed Usage', () => {
    it('should work with array of messages mixing old and new formats', () => {
      const messages: ChatMessage[] = [
        // Old format - string content
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'What is the weather?' },
        { role: 'assistant', content: null, tool_calls: [{
          id: 'call_1',
          type: 'function',
          function: { name: 'get_weather', arguments: '{}' }
        }]},
        { role: 'tool', content: '{"temp": 20}', tool_call_id: 'call_1' },
        { role: 'assistant', content: 'The temperature is 20 degrees.' },
        // New format - multimodal content
        { role: 'user', content: [
          { type: 'text', text: 'What is in this image?' },
          { type: 'image', image: 'https://example.com/image.jpg' }
        ]}
      ];

      expect(messages.length).toBe(6);

      // String content still works
      expect(messages[0].content).toBe('You are a helpful assistant.');

      // Null content still works
      expect(messages[2].content).toBeNull();

      // Multimodal content works
      expect(Array.isArray(messages[5].content)).toBe(true);
    });

    it('should extract text from mixed content array', () => {
      const messages: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
        { role: 'user', content: [
          { type: 'text', text: 'World' }
        ]}
      ];

      const text1 = extractTextContent(messages[0].content);
      const text2 = extractTextContent(messages[1].content);

      expect(text1).toBe('Hello');
      expect(text2).toBe('World');
    });
  });

  describe('Tool Calls', () => {
    it('should work with existing tool call patterns', () => {
      const message: ChatMessage = {
        role: 'assistant',
        content: null,
        tool_calls: [{
          id: 'call_abc123',
          type: 'function',
          function: {
            name: 'search',
            arguments: JSON.stringify({ query: 'latest news' })
          }
        }]
      };

      expect(message.tool_calls?.length).toBe(1);
      expect(message.tool_calls?.[0].function.name).toBe('search');
    });

    it('should work with tool response messages', () => {
      const message: ChatMessage = {
        role: 'tool',
        content: JSON.stringify({ results: ['news1', 'news2'] }),
        tool_call_id: 'call_abc123'
      };

      expect(message.role).toBe('tool');
      expect(message.tool_call_id).toBe('call_abc123');
      expect(typeof message.content).toBe('string');
    });
  });

  describe('Function Messages', () => {
    it('should work with legacy function role', () => {
      const message: ChatMessage = {
        role: 'function',
        content: '{"result": "success"}',
        name: 'my_function'
      };

      expect(message.role).toBe('function');
      expect(message.name).toBe('my_function');
      expect(typeof message.content).toBe('string');
    });
  });

  describe('Empty and Edge Cases', () => {
    it('should handle empty string content', () => {
      const message: ChatMessage = {
        role: 'user',
        content: ''
      };

      const text = extractTextContent(message.content);
      expect(text).toBe('');
    });

    it('should handle empty array content', () => {
      const content: ContentPart[] = [];
      const text = extractTextContent(content);
      expect(text).toBe('');
    });

    it('should handle content with only images', () => {
      const content: ContentPart[] = [
        { type: 'image', image: 'https://example.com/image.jpg' }
      ];
      const text = extractTextContent(content);
      expect(text).toBe('');
    });

    it('should handle content with only files', () => {
      const content: ContentPart[] = [
        { type: 'file', file: 'base64...', mimeType: 'application/pdf' }
      ];
      const text = extractTextContent(content);
      expect(text).toBe('');
    });
  });
});

describe('API Compatibility', () => {
  describe('Request Format', () => {
    it('should maintain same request structure', () => {
      const request = {
        messages: [
          { role: 'user' as const, content: 'Hello' }
        ],
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 100
      };

      expect(request.messages[0].content).toBe('Hello');
      expect(request.model).toBe('gpt-4');
      expect(request.temperature).toBe(0.7);
    });
  });

  describe('Response Format', () => {
    it('should maintain same response structure', () => {
      const response = {
        id: 'chatcmpl-123',
        object: 'chat.completion',
        created: Date.now(),
        model: 'gpt-4',
        choices: [{
          index: 0,
          message: {
            role: 'assistant' as const,
            content: 'Hello there!'
          },
          finish_reason: 'stop' as const
        }],
        usage: {
          prompt_tokens: 10,
          completion_tokens: 5,
          total_tokens: 15
        }
      };

      expect(response.choices[0].message.content).toBe('Hello there!');
      expect(response.usage.total_tokens).toBe(15);
    });
  });
});
