# Tools

Tools are the building blocks that provide specific functionality to agents. The framework provides a comprehensive tool creation system with type safety and validation using Zod schemas.

## Creating Tools

### Basic Tool Creation

```typescript
import { createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

const basicTool = createTool({
  id: 'text-processor',
  description: 'Process and transform text',
  inputSchema: z.object({
    text: z.string(),
    operation: z.enum(['uppercase', 'lowercase', 'reverse'])
  }),
  outputSchema: z.object({
    result: z.string(),
    originalLength: z.number(),
    newLength: z.number()
  }),
  execute: async ({ input, context }) => {
    let result = input.text;

    switch (input.operation) {
      case 'uppercase':
        result = input.text.toUpperCase();
        break;
      case 'lowercase':
        result = input.text.toLowerCase();
        break;
      case 'reverse':
        result = input.text.split('').reverse().join('');
        break;
    }

    return {
      result,
      originalLength: input.text.length,
      newLength: result.length
    };
  }
});
```

### Using the Tool Class

```typescript
import { Tool } from '@codebolt/agent/unified';
import { z } from 'zod';

const tool = new Tool({
  id: 'calculator',
  description: 'Perform basic math operations',
  inputSchema: z.object({
    a: z.number(),
    b: z.number(),
    operation: z.enum(['add', 'subtract', 'multiply', 'divide'])
  }),
  executionFunction: async ({ input }) => {
    switch (input.operation) {
      case 'add': return { result: input.a + input.b };
      case 'subtract': return { result: input.a - input.b };
      case 'multiply': return { result: input.a * input.b };
      case 'divide': return { result: input.a / input.b };
    }
  }
});
```

## Tool Configuration

### Required Fields

- `id` - Unique identifier for the tool
- `description` - What the tool does (shown to the LLM)
- `inputSchema` - Zod schema defining expected inputs
- `execute` or `executionFunction` - The function to execute

### Optional Fields

- `outputSchema` - Zod schema for output validation

## Tool Execution

Tools can be executed directly:

```typescript
// Direct execution
const result = await tool.execute(
  { text: 'Hello World', operation: 'uppercase' },
  context // optional context
);

console.log(result);
// { success: true, result: { result: 'HELLO WORLD', ... } }
// or
// { success: false, error: 'Error message' }
```

## OpenAI Format Conversion

Tools can be converted to OpenAI function format for use with LLM APIs:

```typescript
// Convert a single tool
const openAITool = tool.toOpenAITool();

console.log(openAITool);
// {
//   type: 'function',
//   function: {
//     name: 'calculator',
//     description: 'Perform basic math operations',
//     parameters: { ... JSON Schema ... }
//   }
// }
```

## Supported Schema Types

The tool system supports the following Zod types for automatic JSON Schema conversion:

- `z.string()` - String values
- `z.number()` - Numeric values
- `z.boolean()` - Boolean values
- `z.array()` - Arrays
- `z.object()` - Objects with nested properties
- `z.enum()` - Enumerated values
- `z.literal()` - Literal values
- `z.union()` - Union types
- `z.optional()` - Optional fields
- `z.nullable()` - Nullable fields

## Advanced Tool Features

### Tool Chaining

Create tools that work together:

```typescript
const dataFetchTool = createTool({
  id: 'data-fetcher',
  description: 'Fetch data from API',
  inputSchema: z.object({ url: z.string() }),
  execute: async ({ input }) => {
    const response = await fetch(input.url);
    return await response.json();
  }
});

const dataProcessorTool = createTool({
  id: 'data-processor',
  description: 'Process fetched data',
  inputSchema: z.object({
    data: z.array(z.unknown())
  }),
  execute: async ({ input }) => {
    return {
      processed: input.data.map(item => ({
        ...item,
        timestamp: Date.now()
      }))
    };
  }
});

// Agent can chain these tools automatically
const dataAgent = new CodeboltAgent({
  instructions: 'You fetch and process data.',
  tools: [dataFetchTool, dataProcessorTool]
});
```

### Async Tools

```typescript
const longRunningTool = createTool({
  id: 'long-runner',
  description: 'Execute long-running processes',
  inputSchema: z.object({
    task: z.string(),
    duration: z.number().optional().default(5000)
  }),
  execute: async ({ input }) => {
    // Simulate long-running process
    await new Promise(resolve => setTimeout(resolve, input.duration));

    return {
      task: input.task,
      completed: true,
      duration: input.duration,
      timestamp: new Date().toISOString()
    };
  }
});
```

### Error Handling in Tools

```typescript
const robustTool = createTool({
  id: 'robust-tool',
  description: 'Tool with comprehensive error handling',
  inputSchema: z.object({
    operation: z.string(),
    data: z.unknown()
  }),
  execute: async ({ input }) => {
    try {
      // Validate input
      if (!input.operation) {
        throw new Error('Operation is required');
      }

      // Perform operation
      const result = await performOperation(input.operation, input.data);

      return {
        success: true,
        result,
        operation: input.operation
      };

    } catch (error) {
      // Return structured error response
      return {
        success: false,
        error: error.message,
        operation: input.operation,
        timestamp: new Date().toISOString()
      };
    }
  }
});
```

### Context-Aware Tools

```typescript
const contextAwareTool = createTool({
  id: 'context-tool',
  description: 'Tool that uses context',
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ input, context }) => {
    // Access context passed from agent
    const userId = context?.userId;
    const sessionId = context?.sessionId;

    return {
      query: input.query,
      userId,
      sessionId,
      timestamp: Date.now()
    };
  }
});
```

## Tool Testing

```typescript
import { createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

describe('Text Processor Tool', () => {
  const tool = createTool({
    id: 'test-tool',
    description: 'Test tool',
    inputSchema: z.object({ text: z.string() }),
    execute: async ({ input }) => ({ result: input.text.toUpperCase() })
  });

  it('should convert text to uppercase', async () => {
    const result = await tool.execute({ text: 'hello world' }, {});
    expect(result.success).toBe(true);
    expect(result.result.result).toBe('HELLO WORLD');
  });

  it('should handle empty input', async () => {
    const result = await tool.execute({ text: '' }, {});
    expect(result.success).toBe(true);
    expect(result.result.result).toBe('');
  });
});
```

## Tool Performance Optimization

### Caching Results

```typescript
const cache = new Map();

const cachedTool = createTool({
  id: 'cached-tool',
  description: 'Tool with result caching',
  inputSchema: z.object({ query: z.string() }),
  execute: async ({ input }) => {
    const cacheKey = JSON.stringify(input);

    // Check cache
    if (cache.has(cacheKey)) {
      return { ...cache.get(cacheKey), fromCache: true };
    }

    // Perform expensive operation
    const result = await expensiveOperation(input);

    // Cache result
    cache.set(cacheKey, result);

    return { ...result, fromCache: false };
  }
});
```

### Batched Execution

```typescript
const batchTool = createTool({
  id: 'batch-tool',
  description: 'Tool that processes items in batches',
  inputSchema: z.object({
    items: z.array(z.unknown()),
    batchSize: z.number().optional().default(10)
  }),
  execute: async ({ input }) => {
    const { items, batchSize } = input;
    const results = [];

    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => processItem(item))
      );
      results.push(...batchResults);
    }

    return { results, totalProcessed: items.length };
  }
});
```

## Best Practices

1. **Clear Descriptions**: Write clear, concise descriptions that help the LLM understand when to use the tool.

2. **Strict Input Schemas**: Use specific Zod schemas to validate inputs and catch errors early.

3. **Meaningful IDs**: Use descriptive, unique IDs that indicate the tool's purpose.

4. **Error Handling**: Always handle errors gracefully and return meaningful error messages.

5. **Type Safety**: Leverage TypeScript and Zod for full type safety.

6. **Single Responsibility**: Each tool should do one thing well.
