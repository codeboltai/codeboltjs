# Tool / Function Calling

Tool calling allows AI models to request execution of external functions, enabling them to interact with your APIs, databases, and systems.

## Overview

With Multillm, tool calling works **consistently across all supported providers**. You define tools using a unified schema, and the model decides when and how to use them.

### Supported Providers

| Provider | Support |
|----------|----------|
| OpenAI | ✅ |
| Anthropic | ✅ |
| DeepSeek | ✅ |
| Gemini | ✅ |
| Mistral | ✅ |
| Groq | ✅ |

## Quick Start

```typescript
import Multillm from '@arrowai/multillm';

// Define a tool
const tools = [{
  type: 'function',
  function: {
    name: 'get_weather',
    description: 'Get the current weather for a location',
    parameters: {
      type: 'object',
      properties: {
        location: {
          type: 'string',
          description: 'City name (e.g., London, Tokyo)'
        },
        unit: {
          type: 'string',
          enum: ['celsius', 'fahrenheit'],
          description: 'Temperature unit'
        }
      },
      required: ['location']
    }
  }
}];

// Use with any provider
const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'What is the weather in London?' }],
  tools
});

// Model requests tool call
console.log(response.choices[0].message.tool_calls);
// Output: [{ id: 'call_...', type: 'function', function: { name: 'get_weather', arguments: '{"location":"London"}' } }]
```

## Tool Schema

Define tools using a simple, provider-agnostic structure:

```typescript
const tool = {
  type: 'function' as const,
  function: {
    name: string,           // Function name (required)
    description: string,     // What the function does (required)
    parameters: {            // JSON Schema (required)
      type: 'object',
      properties: {
        // Your parameters here
      },
      required: string[]
    }
  }
};
```

### Parameter Types

```typescript
{
  type: 'object',
  properties: {
    stringParam: { type: 'string' },
    numberParam: { type: 'number' },
    booleanParam: { type: 'boolean' },
    arrayParam: { type: 'array', items: { type: 'string' } },
    objectParam: {
      type: 'object',
      properties: {
        nested: { type: 'string' }
      },
      required: ['nested']
    },
    enumParam: {
      type: 'string',
      enum: ['option1', 'option2', 'option3']
    }
  },
  required: ['stringParam', 'numberParam']
}
```

## Complete Tool Loop

A complete interaction involves:

1. Send message with tools
2. Model requests tool call
3. Execute tool locally
4. Send tool result back
5. Model provides final answer

```typescript
async function runWithTools(userMessage: string) {
  const llm = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);
  
  const tools = [{
    type: 'function' as const,
    function: {
      name: 'get_weather',
      description: 'Get current weather',
      parameters: {
        type: 'object',
        properties: {
          location: { type: 'string', description: 'City' }
        },
        required: ['location']
      }
    }
  }];

  let messages: any[] = [{ role: 'user', content: userMessage }];

  while (true) {
    const response = await llm.createCompletion({ messages, tools });
    const message = response.choices[0].message;
    messages.push(message);

    // Check if model wants to call a tool
    if (!message.tool_calls) {
      return message.content; // Final answer
    }

    // Execute tools
    for (const toolCall of message.tool_calls) {
      const functionName = toolCall.function.name;
      const args = JSON.parse(toolCall.function.arguments);
      
      console.log(`Calling ${functionName} with:`, args);
      
      // Execute your function
      const result = await executeTool(functionName, args);
      
      // Send tool result back
      messages.push({
        role: 'tool',
        content: JSON.stringify(result),
        tool_call_id: toolCall.id
      });
    }
  }
}

async function executeTool(name: string, args: any) {
  if (name === 'get_weather') {
    return { temp: 22, condition: 'sunny', location: args.location };
  }
  throw new Error(`Unknown tool: ${name}`);
}

// Usage
const answer = await runWithTools('What is the weather in Paris?');
console.log(answer);
```

## Multiple Tools

Define multiple tools and let the model choose:

```typescript
const tools = [
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
      name: 'search_web',
      description: 'Search the web',
      parameters: {
        type: 'object',
        properties: { query: { type: 'string' } },
        required: ['query']
      }
    }
  },
  {
    type: 'function' as const,
    function: {
      name: 'calculate',
      description: 'Perform calculations',
      parameters: {
        type: 'object',
        properties: {
          expression: { type: 'string', description: 'Math expression' }
        },
        required: ['expression']
      }
    }
  }
];

const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'What is 2+2 and the weather in Tokyo?' }],
  tools
});

// Model will request get_weather and calculate tools
```

## Parallel Tool Calls

Models can call multiple tools simultaneously:

```typescript
const response = await llm.createCompletion({
  messages: [{ role: 'user', content: 'What is the weather in London, Tokyo, and New York?' }],
  tools
});

// Multiple tool_calls in one response
console.log(response.choices[0].message.tool_calls);
// Output:
// [
//   { id: 'call_1', type: 'function', function: { name: 'get_weather', arguments: '{"location":"London"}' } },
//   { id: 'call_2', type: 'function', function: { name: 'get_weather', arguments: '{"location":"Tokyo"}' } },
//   { id: 'call_3', type: 'function', function: { name: 'get_weather', arguments: '{"location":"New York"}' } }
// ]
```

## Tool Choice Control

Control when and how tools are used:

```typescript
// Auto: Model decides (default)
await llm.createCompletion({
  messages: [...],
  tools,
  tool_choice: 'auto'
});

// None: Never use tools
await llm.createCompletion({
  messages: [...],
  tools,
  tool_choice: 'none'
});

// Specific: Force specific tool
await llm.createCompletion({
  messages: [...],
  tools,
  tool_choice: { type: 'function', function: { name: 'get_weather' } }
});
```

## Switching Providers

Switch between providers with minimal changes:

```typescript
// OpenAI
const openai = new Multillm('openai', 'gpt-4o', null, process.env.OPENAI_API_KEY);

// Anthropic (same tools, same response format!)
const anthropic = new Multillm('anthropic', 'claude-3-5-sonnet-20241022', null, process.env.ANTHROPIC_API_KEY);

// DeepSeek (same tools!)
const deepseek = new Multillm('deepseek', 'deepseek-chat', null, process.env.DEEPSEEK_API_KEY);

// Use the exact same code
for (const llm of [openai, anthropic, deepseek]) {
  const response = await llm.createCompletion({ messages, tools });
  console.log(llm.provider, ':', response.choices[0].message.content);
}
```

## Provider Differences

While the API is unified, there are minor differences:

| Feature | OpenAI | Anthropic | DeepSeek |
|---------|---------|-----------|-----------|
| Tool format | `tool_calls` | `tool_use` | `tool_calls` |
| Tool result role | `tool` | `user` with `tool_result` | `tool` |
| Parallel calls | ✅ | ✅ | ✅ |
| Streaming with tools | ✅ | ✅ | ✅ |

**Note**: Multillm handles these differences automatically. You always use the same request/response format.

## Error Handling

Handle tool execution errors gracefully:

```typescript
for (const toolCall of message.tool_calls) {
  try {
    const args = JSON.parse(toolCall.function.arguments);
    const result = await executeTool(toolCall.function.name, args);
    
    messages.push({
      role: 'tool',
      content: JSON.stringify(result),
      tool_call_id: toolCall.id
    });
  } catch (error) {
    // Send error back to model
    messages.push({
      role: 'tool',
      content: JSON.stringify({ error: error.message }),
      tool_call_id: toolCall.id,
      is_error: true
    });
  }
}
```

## Best Practices

1. **Clear Descriptions**: Help the model understand when to use each tool
2. **JSON Schema Validation**: Use proper schema types
3. **Timeout Handling**: Set timeouts for tool execution
4. **Idempotency**: Tools should be safe to retry
5. **Error Messages**: Return helpful error information
6. **Tool Choice**: Use `tool_choice` when you know which tool to use

## Examples

### Database Query Tool

```typescript
const tools = [{
  type: 'function' as const,
  function: {
    name: 'query_database',
    description: 'Query user database',
    parameters: {
      type: 'object',
      properties: {
        table: {
          type: 'string',
          enum: ['users', 'products', 'orders']
        },
        filters: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            status: { type: 'string' }
          }
        },
        limit: { type: 'number', default: 10 }
      },
      required: ['table']
    }
  }
}];
```

### API Call Tool

```typescript
const tools = [{
  type: 'function' as const,
  function: {
    name: 'send_email',
    description: 'Send an email to a recipient',
    parameters: {
      type: 'object',
      properties: {
        to: {
          type: 'string',
          format: 'email'
        },
        subject: { type: 'string' },
        body: { type: 'string' }
      },
      required: ['to', 'subject', 'body']
    }
  }
}];
```

### Complex Nested Parameters

```typescript
const tools = [{
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
              age: { type: 'number' },
              seat_preference: {
                type: 'string',
                enum: ['window', 'aisle']
              }
            },
            required: ['name', 'age']
          }
        },
        flight: {
          type: 'object',
          properties: {
            from: { type: 'string' },
            to: { type: 'string' },
            date: { type: 'string', format: 'date' },
            class: {
              type: 'string',
              enum: ['economy', 'business', 'first']
            }
          },
          required: ['from', 'to', 'date']
        }
      },
      required: ['passengers', 'flight']
    }
  }
}];
```

## Streaming with Tools

```typescript
const response = await llm.createCompletionStream({
  messages: [{ role: 'user', content: 'Get the weather' }],
  tools,
  onChunk: (chunk) => {
    if (chunk.choices[0]?.delta?.tool_calls) {
      console.log('Tool call:', chunk.choices[0].delta.tool_calls);
    }
    if (chunk.choices[0]?.delta?.content) {
      console.log('Content:', chunk.choices[0].delta.content);
    }
  },
  onComplete: (response) => {
    console.log('Complete:', response.choices[0].message);
  }
});
```
