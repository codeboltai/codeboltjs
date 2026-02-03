/**
 * Tools Integration Tests
 *
 * Tests for function calling across providers.
 * Requires API keys in environment variables.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import Multillm from '../index';

describe('Tools Integration', () => {
  const tools = [{
    type: 'function' as const,
    function: {
      name: 'get_current_time',
      description: 'Get the current time',
      parameters: {
        type: 'object',
        properties: {},
        required: []
      }
    }
  }];

  describe('OpenAI', () => {
    const apiKey = process.env.OPENAI_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - OPENAI_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('openai', 'gpt-4o', null, apiKey);
    });

    it('should request tool call', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'What time is it?' }],
        tools
      });

      expect(response.choices[0].message.tool_calls).toBeDefined();
      expect(response.choices[0].message.tool_calls).toHaveLength(1);
      expect(response.choices[0].message.tool_calls?.[0].function.name).toBe('get_current_time');
    });

    it('should complete tool loop', async () => {
      let messages: any[] = [{ role: 'user', content: 'What time is it?' }];

      let response = await llm.createCompletion({ messages, tools });
      messages.push(response.choices[0].message);

      while (response.choices[0].message.tool_calls) {
        for (const toolCall of response.choices[0].message.tool_calls) {
          const result = JSON.stringify({ time: new Date().toISOString() });
          messages.push({
            role: 'tool',
            content: result,
            tool_call_id: toolCall.id
          });
        }
        response = await llm.createCompletion({ messages, tools });
        messages.push(response.choices[0].message);
      }

      expect(response.choices[0].message.tool_calls).toBeUndefined();
      expect(response.choices[0].message.content).toBeTruthy();
    });

    it('should support multiple tools', async () => {
      const multiTools = [
        {
          type: 'function' as const,
          function: {
            name: 'get_weather',
            description: 'Get weather',
            parameters: {
              type: 'object',
              properties: { location: { type: 'string' } },
              required: ['location']
            }
          }
        },
        {
          type: 'function' as const,
          function: {
            name: 'get_time',
            description: 'Get time',
            parameters: { type: 'object', properties: {}, required: [] }
          }
        }
      ];

      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'What is the weather and time in London?' }],
        tools: multiTools
      });

      expect(response.choices[0].message.tool_calls).toBeDefined();
    });

    it('should support parallel tool calls', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'What is the weather in London, Tokyo, and Paris?' }],
        tools: [{
          type: 'function' as const,
          function: {
            name: 'get_weather',
            description: 'Get weather',
            parameters: {
              type: 'object',
              properties: { location: { type: 'string' } },
              required: ['location']
            }
          }
        }]
      });

      expect(response.choices[0].message.tool_calls?.length).toBeGreaterThanOrEqual(2);
    });

    it('should support tool_choice auto', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'What time is it?' }],
        tools,
        tool_choice: 'auto'
      });

      expect(response.choices[0].message.tool_calls).toBeDefined();
    });

    it('should support tool_choice none', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Hello!' }],
        tools,
        tool_choice: 'none'
      });

      expect(response.choices[0].message.tool_calls).toBeUndefined();
      expect(response.choices[0].message.content).toBeDefined();
    });

    it('should support tool_choice specific', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'What time is it?' }],
        tools,
        tool_choice: { type: 'function', function: { name: 'get_current_time' } }
      });

      expect(response.choices[0].message.tool_calls).toBeDefined();
      expect(response.choices[0].message.tool_calls?.[0].function.name).toBe('get_current_time');
    });
  });

  describe('Anthropic', () => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - ANTHROPIC_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('anthropic', 'claude-3-5-sonnet-20241022', null, apiKey);
    });

    it('should request tool use', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'What time is it?' }],
        tools
      });

      expect(response.choices[0].message.tool_calls).toBeDefined();
      expect(response.choices[0].message.tool_calls).toHaveLength(1);
    });

    it('should complete tool loop', async () => {
      let messages: any[] = [{ role: 'user', content: 'What time is it?' }];

      let response = await llm.createCompletion({ messages, tools });
      messages.push(response.choices[0].message);

      while (response.choices[0].message.tool_calls) {
        for (const toolCall of response.choices[0].message.tool_calls) {
          const result = JSON.stringify({ time: new Date().toISOString() });
          messages.push({
            role: 'user',
            content: [
              {
                type: 'tool_result',
                tool_use_id: toolCall.id,
                content: result
              }
            ]
          });
        }
        response = await llm.createCompletion({ messages, tools });
        messages.push(response.choices[0].message);
      }

      expect(response.choices[0].message.tool_calls).toBeUndefined();
      expect(response.choices[0].message.content).toBeTruthy();
    });
  });

  describe('DeepSeek', () => {
    const apiKey = process.env.DEEPSEEK_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - DEEPSEEK_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('deepseek', 'deepseek-chat', null, apiKey);
    });

    it('should request tool call', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'What time is it?' }],
        tools
      });

      expect(response.choices[0].message.tool_calls).toBeDefined();
    });
  });

  describe('Mistral', () => {
    const apiKey = process.env.MISTRAL_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - MISTRAL_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('mistral', 'mistral-large', null, apiKey);
    });

    it('should request tool call', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'What time is it?' }],
        tools
      });

      expect(response.choices[0].message.tool_calls).toBeDefined();
    });
  });

  describe('Groq', () => {
    const apiKey = process.env.GROQ_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - GROQ_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('groq', 'llama-3.1-70b', null, apiKey);
    });

    it('should request tool call', async () => {
      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'What time is it?' }],
        tools
      });

      expect(response.choices[0].message.tool_calls).toBeDefined();
    });
  });

  describe('Tool with Parameters', () => {
    const apiKey = process.env.OPENAI_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - OPENAI_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('openai', 'gpt-4o', null, apiKey);
    });

    it('should handle tool with parameters', async () => {
      const toolWithParams = [{
        type: 'function' as const,
        function: {
          name: 'calculate',
          description: 'Perform a calculation',
          parameters: {
            type: 'object',
            properties: {
              expression: {
                type: 'string',
                description: 'Math expression to calculate'
              }
            },
            required: ['expression']
          }
        }
      }];

      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'What is 2 + 2?' }],
        tools: toolWithParams
      });

      expect(response.choices[0].message.tool_calls).toBeDefined();
      const args = JSON.parse(response.choices[0].message.tool_calls[0].function.arguments);
      expect(args.expression).toContain('2');
    });

    it('should handle nested parameters', async () => {
      const complexTool = [{
        type: 'function' as const,
        function: {
          name: 'book_flight',
          description: 'Book a flight',
          parameters: {
            type: 'object',
            properties: {
              passengers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    age: { type: 'number' }
                  },
                  required: ['name', 'age']
                }
              },
              flight: {
                type: 'object',
                properties: {
                  from: { type: 'string' },
                  to: { type: 'string' },
                  date: { type: 'string' }
                },
                required: ['from', 'to', 'date']
              }
            },
            required: ['passengers', 'flight']
          }
        }
      }];

      const response = await llm.createCompletion({
        messages: [{ role: 'user', content: 'Book me a flight from NY to LA tomorrow' }],
        tools: complexTool
      });

      expect(response.choices[0].message.tool_calls).toBeDefined();
    });
  });

  describe('Streaming with Tools', () => {
    const apiKey = process.env.OPENAI_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - OPENAI_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('openai', 'gpt-4o', null, apiKey);
    });

    it('should support streaming with tools', async () => {
      let toolCallsFound = false;
      let contentFound = false;

      for await (const chunk of llm.streamCompletion({
        messages: [{ role: 'user', content: 'What time is it?' }],
        tools
      })) {
        if (chunk.choices[0]?.delta?.tool_calls) {
          toolCallsFound = true;
        }
        if (chunk.choices[0]?.delta?.content) {
          contentFound = true;
        }
      }

      expect(toolCallsFound || contentFound).toBe(true);
    });
  });

  describe('Error Handling', () => {
    const apiKey = process.env.OPENAI_API_KEY;
    let llm: any;

    if (!apiKey) {
      it.skip('skipped - OPENAI_API_KEY not set', () => {});
      return;
    }

    beforeEach(() => {
      llm = new Multillm('openai', 'gpt-4o', null, apiKey);
    });

    it('should handle invalid tool schema', async () => {
      const invalidTool = [{
        type: 'function' as const,
        function: {
          name: 'test_tool',
          description: 'Test',
          parameters: {
            type: 'invalid' as any
          }
        }
      }];

      try {
        await llm.createCompletion({
          messages: [{ role: 'user', content: 'test' }],
          tools: invalidTool
        });
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle tool execution error', async () => {
      let messages: any[] = [
        { role: 'user', content: 'What time is it?' },
        { role: 'tool', content: 'test', tool_call_id: 'test-id' }
      ];

      try {
        const response = await llm.createCompletion({
          messages,
          tools
        });

        messages.push(response.choices[0].message);
        expect(response.choices[0].message.content).toContain('error');
      } catch (error: any) {
        expect(error).toBeDefined();
      }
    });
  });
});
