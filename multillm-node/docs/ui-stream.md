# UI Streaming

Stream AI responses to user interfaces in real-time with a unified API.

## Overview

UI streaming provides **structured chunk types** for real-time updates in web applications. Works consistently across all providers.

## Quick Start

```typescript
import { createUIMessageStreamResponse } from '@arrowai/multillm/ui-stream';
import Multillm from '@arrowai/multillm';

// Next.js API route example
export async function POST(req: Request) {
  const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);

  return createUIMessageStreamResponse(async ({ writer, messageId }) => {
    writer.write({ type: 'message-start', messageId, model: 'gpt-4o' });
    writer.write({ type: 'text-start' });

    for await (const chunk of llm.streamCompletion({
      messages: [{ role: 'user', content: 'Tell me a story' }]
    })) {
      if (chunk.choices[0]?.delta?.content) {
        writer.write({
          type: 'text-delta',
          content: chunk.choices[0].delta.content,
          messageId
        });
      }
    }

    writer.write({ type: 'text-end' });
    writer.write({ type: 'message-end', messageId, finishReason: 'stop' });
  });
}
```

## Chunk Types

### Text Chunks

```typescript
interface TextStartChunk {
  type: 'text-start';
  messageId?: string;
}

interface TextDeltaChunk {
  type: 'text-delta';
  content: string;
  messageId?: string;
}

interface TextEndChunk {
  type: 'text-end';
  messageId?: string;
}
```

### Reasoning Chunks

```typescript
interface ReasoningStartChunk {
  type: 'reasoning-start';
  messageId?: string;
}

interface ReasoningDeltaChunk {
  type: 'reasoning-delta';
  content: string;
  messageId?: string;
}

interface ReasoningEndChunk {
  type: 'reasoning-end';
  messageId?: string;
}
```

### Tool Call Chunks

```typescript
interface ToolCallStartChunk {
  type: 'tool-call-start';
  toolCallId: string;
  toolName: string;
  messageId?: string;
}

interface ToolCallDeltaChunk {
  type: 'tool-call-delta';
  toolCallId: string;
  argsTextDelta: string;
  messageId?: string;
}

interface ToolCallEndChunk {
  type: 'tool-call-end';
  toolCallId: string;
  args: Record<string, unknown>;
  messageId?: string;
}

interface ToolResultChunk {
  type: 'tool-result';
  toolCallId: string;
  result: unknown;
  isError?: boolean;
  messageId?: string;
}
```

### Message Lifecycle Chunks

```typescript
interface MessageStartChunk {
  type: 'message-start';
  messageId: string;
  model?: string;
}

interface MessageEndChunk {
  type: 'message-end';
  messageId: string;
  finishReason?: 'stop' | 'length' | 'tool_calls' | 'content_filter' | 'error';
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
```

### Error Chunk

```typescript
interface ErrorChunk {
  type: 'error';
  error: string;
  code?: string;
  messageId?: string;
}
```

## Complete UI Stream Example

```typescript
import { createUIMessageStreamResponse } from '@arrowai/multillm/ui-stream';

export async function POST(req: Request) {
  const { messages, tools } = await req.json();

  const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);
  const messageId = `msg-${Date.now()}`;

  return createUIMessageStreamResponse(async ({ writer }) => {
    try {
      writer.write({ type: 'message-start', messageId });

      // Stream text
      writer.write({ type: 'text-start', messageId });

      let fullContent = '';

      for await (const chunk of llm.streamCompletion({ messages, tools })) {
        if (chunk.choices[0]?.delta?.content) {
          const content = chunk.choices[0].delta.content;
          fullContent += content;
          writer.write({
            type: 'text-delta',
            content,
            messageId
          });
        }

        // Handle tool calls
        if (chunk.choices[0]?.delta?.tool_calls) {
          for (const toolCall of chunk.choices[0].delta.tool_calls) {
            writer.write({
              type: 'tool-call-start',
              toolCallId: toolCall.id,
              toolName: toolCall.function.name,
              messageId
            });
          }
        }
      }

      writer.write({ type: 'text-end' });

      // Get final response for usage
      const finalResponse = await llm.createCompletion({ messages, tools });

      writer.write({
        type: 'message-end',
        messageId,
        finishReason: finalResponse.choices[0].finish_reason,
        usage: {
          promptTokens: finalResponse.usage.prompt_tokens,
          completionTokens: finalResponse.usage.completion_tokens,
          totalTokens: finalResponse.usage.total_tokens
        }
      });

    } catch (error: any) {
      writer.write({
        type: 'error',
        error: error.message,
        messageId
      });
    }
  });
}
```

## React Component Example

```typescript
import { useState, useEffect } from 'react';

export default function ChatComponent() {
  const [messages, setMessages] = useState<any[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);

  async function sendMessage(userMessage: string) {
    setIsStreaming(true);
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({
        messages: [...messages, { role: 'user', content: userMessage }]
      })
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let fullContent = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n').filter(line => line.trim());

      for (const line of lines) {
        const data = JSON.parse(line);

        switch (data.type) {
          case 'text-start':
            console.log('Text streaming started');
            break;

          case 'text-delta':
            fullContent += data.content;
            setMessages(prev => {
              const updated = [...prev];
              if (updated[updated.length - 1]?.role === 'assistant') {
                updated[updated.length - 1].content = fullContent;
              } else {
                updated.push({ role: 'assistant', content: fullContent });
              }
              return updated;
            });
            break;

          case 'text-end':
            console.log('Text streaming ended');
            setIsStreaming(false);
            break;

          case 'tool-call-start':
            setMessages(prev => [...prev, {
              role: 'assistant',
              tool_calls: [{ id: data.toolCallId, function: { name: data.toolName, arguments: '{}' } }],
              content: null
            }]);
            break;

          case 'error':
            console.error('Error:', data.error);
            setIsStreaming(false);
            break;
        }
      }
    }
  }

  return (
    <div>
      {messages.map((msg, i) => (
        <div key={i}>
          <strong>{msg.role}:</strong>
          <p>{msg.content}</p>
          {msg.tool_calls && <p>Tool: {msg.tool_calls[0].function.name}</p>}
        </div>
      ))}

      <input
        type="text"
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            sendMessage((e.target as HTMLInputElement).value);
            (e.target as HTMLInputElement).value = '';
          }
        }}
        disabled={isStreaming}
      />
    </div>
  );
}
```

## Streaming with Reasoning

```typescript
export async function POST(req: Request) {
  const llm = new Multillm('openai', 'o1', null, process.env.OPENAI_API_KEY);
  const messageId = `msg-${Date.now()}`;

  return createUIMessageStreamResponse(async ({ writer }) => {
    writer.write({ type: 'message-start', messageId, model: 'o1' });

    // Stream reasoning
    writer.write({ type: 'reasoning-start', messageId });

    for await (const chunk of llm.streamCompletion({
      messages: [{ role: 'user', content: 'Solve this step by step...' }],
      reasoning: { thinkingBudget: 50000 }
    })) {
      if (chunk.choices[0]?.delta?.content) {
        // Check if this is reasoning content
        writer.write({
          type: 'reasoning-delta',
          content: chunk.choices[0].delta.content,
          messageId
        });
      }
    }

    writer.write({ type: 'reasoning-end' });

    // Stream final answer
    writer.write({ type: 'text-start', messageId });

    for await (const chunk of llm.streamCompletion({
      messages: [{ role: 'user', content: 'What is the answer?' }]
    })) {
      if (chunk.choices[0]?.delta?.content) {
        writer.write({
          type: 'text-delta',
          content: chunk.choices[0].delta.content,
          messageId
        });
      }
    }

    writer.write({ type: 'text-end' });
    writer.write({ type: 'message-end', messageId });
  });
}
```

## Streaming with Tools

```typescript
export async function POST(req: Request) {
  const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);
  const messageId = `msg-${Date.now()}`;

  return createUIMessageStreamResponse(async ({ writer }) => {
    writer.write({ type: 'message-start', messageId });

    let currentToolCalls: any[] = [];

    for await (const chunk of llm.streamCompletion({
      messages: [{ role: 'user', content: 'What time is it?' }],
      tools: [{
        type: 'function' as const,
        function: {
          name: 'get_time',
          description: 'Get current time',
          parameters: { type: 'object', properties: {}, required: [] }
        }
      }]
    })) {
      if (chunk.choices[0]?.delta?.tool_calls) {
        for (const toolCall of chunk.choices[0].delta.tool_calls) {
          currentToolCalls.push(toolCall);
          writer.write({
            type: 'tool-call-start',
            toolCallId: toolCall.id,
            toolName: toolCall.function.name,
            messageId
          });
        }
      }
    }

    // Execute tools and stream results
    for (const toolCall of currentToolCalls) {
      const result = await executeTool(toolCall.function.name, JSON.parse(toolCall.function.arguments));

      writer.write({
        type: 'tool-result',
        toolCallId: toolCall.id,
        result,
        messageId
      });
    }

    writer.write({ type: 'message-end', messageId });
  });
}

async function executeTool(name: string, args: any) {
  if (name === 'get_time') {
    return { time: new Date().toISOString() };
  }
  return null;
}
```

## SSE Headers

```typescript
import { UI_STREAM_HEADERS } from '@arrowai/multillm/ui-stream';

export async function POST(req: Request) {
  return new Response(stream, {
    headers: UI_STREAM_HEADERS
  });
}

// Headers include:
// Content-Type: text/event-stream
// Cache-Control: no-cache, no-transform
// Connection: keep-alive
// X-Accel-Buffering: no  // Disables nginx buffering
```

## Custom Message ID

```typescript
import { randomUUID } from 'crypto';

export async function POST(req: Request) {
  return createUIMessageStreamResponse(async ({ writer }) => {
    const messageId = randomUUID();

    writer.write({
      type: 'message-start',
      messageId
    });

    // ... stream content ...

    writer.write({
      type: 'message-end',
      messageId
    });
  }, {
    generateId: randomUUID  // Custom ID generator
  });
}
```

## Type Guards

```typescript
import {
  isTextChunk,
  isToolCallChunk,
  isReasoningChunk
} from '@arrowai/multillm/ui-stream';

function handleChunk(chunk: UIMessageChunk) {
  if (isTextChunk(chunk)) {
    console.log('Text chunk:', chunk);
  } else if (isToolCallChunk(chunk)) {
    console.log('Tool call chunk:', chunk);
  } else if (isReasoningChunk(chunk)) {
    console.log('Reasoning chunk:', chunk);
  } else {
    console.log('Other chunk:', chunk);
  }
}
```

## Best Practices

1. **Message IDs**: Use unique IDs for each message
2. **Error Handling**: Always send error chunks on failures
3. **Resource Cleanup**: Close streams properly
4. **Timeout Handling**: Abort long-running streams
5. **Rate Limiting**: Respect provider rate limits
6. **Connection State**: Track connection state in UI
7. **Reconnection**: Handle connection drops gracefully
