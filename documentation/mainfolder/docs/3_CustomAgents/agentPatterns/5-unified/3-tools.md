# Tools

Tools are the building blocks that provide specific functionality to agents. The framework provides a comprehensive tool creation system with type safety and validation.

## Creating Tools

### Basic Tool Creation

```typescript
import { createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

const basicTool = createTool({
  id: 'text-processor',
  name: 'Text Processor',
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

### Specialized Tool Creators

#### Text Tools
```typescript
// Text-based tool
const textTool = createTextTool({
  id: 'summarizer',
  name: 'Text Summarizer',
  description: 'Summarize long text content',
  execute: (text) => `Summary: ${text.substring(0, 100)}...`
});

// Advanced text processing
const advancedTextTool = createTextTool({
  id: 'advanced-text-processor',
  name: 'Advanced Text Processor',
  description: 'Advanced text processing with multiple operations',
  operations: ['summarize', 'translate', 'sentiment', 'keywords'],
  execute: async (text, operation) => {
    switch (operation) {
      case 'summarize':
        return { summary: `Summary of: ${text.substring(0, 50)}...` };
      case 'translate':
        return { translation: `Translated: ${text}` };
      case 'sentiment':
        return { sentiment: 'positive', confidence: 0.85 };
      case 'keywords':
        return { keywords: text.split(' ').slice(0, 5) };
      default:
        return { result: text };
    }
  }
});
```

#### File Tools
```typescript
// File operation tool
const fileTool = createFileTool({
  id: 'file-reader',
  name: 'File Reader',
  description: 'Read file contents',
  operation: 'read',
  execute: async (filePath) => {
    // File reading logic
    return await fs.readFile(filePath, 'utf-8');
  }
});

// Multiple file operations
const fileManagerTool = createFileTool({
  id: 'file-manager',
  name: 'File Manager',
  description: 'Comprehensive file management',
  operations: ['read', 'write', 'delete', 'copy', 'move'],
  execute: async (operation, filePath, content) => {
    switch (operation) {
      case 'read':
        return await fs.readFile(filePath, 'utf-8');
      case 'write':
        await fs.writeFile(filePath, content);
        return { success: true, message: 'File written successfully' };
      case 'delete':
        await fs.unlink(filePath);
        return { success: true, message: 'File deleted successfully' };
      // ... other operations
    }
  }
});
```

#### HTTP Tools
```typescript
// HTTP request tool
const httpTool = createHttpTool({
  id: 'api-client',
  name: 'API Client',
  description: 'Make HTTP requests',
  method: 'GET',
  baseUrl: 'https://api.example.com',
  execute: async (endpoint, options) => {
    // HTTP request logic
    return await fetch(`${baseUrl}${endpoint}`, options);
  }
});

// REST API client
const restApiTool = createHttpTool({
  id: 'rest-client',
  name: 'REST API Client',
  description: 'Full REST API client with all HTTP methods',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  baseUrl: 'https://api.example.com',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ${API_TOKEN}'
  },
  execute: async (method, endpoint, data, headers) => {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      method,
      headers: { ...defaultHeaders, ...headers },
      body: data ? JSON.stringify(data) : undefined
    });
    
    return {
      status: response.status,
      statusText: response.statusText,
      data: await response.json(),
      headers: Object.fromEntries(response.headers.entries())
    };
  }
});
```

#### Validation Tools
```typescript
// Validation tool
const validationTool = createValidationTool({
  id: 'email-validator',
  name: 'Email Validator',
  description: 'Validate email addresses',
  schema: z.string().email(),
  execute: (email) => ({ isValid: true, email })
});

// Complex validation
const dataValidatorTool = createValidationTool({
  id: 'data-validator',
  name: 'Data Validator',
  description: 'Validate complex data structures',
  schemas: {
    user: z.object({
      id: z.string().uuid(),
      email: z.string().email(),
      age: z.number().min(0).max(120),
      preferences: z.object({
        theme: z.enum(['light', 'dark']),
        notifications: z.boolean()
      })
    }),
    product: z.object({
      name: z.string().min(1),
      price: z.number().positive(),
      category: z.string(),
      inStock: z.boolean()
    })
  },
  execute: (data, schemaName) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return { isValid: false, error: 'Unknown schema' };
    }
    
    try {
      const validated = schema.parse(data);
      return { isValid: true, data: validated };
    } catch (error) {
      return { isValid: false, error: error.message };
    }
  }
});
```

#### Transform Tools
```typescript
// Transform tool
const transformTool = createTransformTool({
  id: 'data-transformer',
  name: 'Data Transformer',
  description: 'Transform data structures',
  inputSchema: z.object({ data: z.array(z.unknown()) }),
  outputSchema: z.object({ transformed: z.array(z.unknown()) }),
  execute: (data) => ({ transformed: data.map(item => ({ ...item, processed: true })) })
});

// Advanced data transformation
const advancedTransformTool = createTransformTool({
  id: 'advanced-transformer',
  name: 'Advanced Data Transformer',
  description: 'Advanced data transformation with multiple operations',
  transformations: {
    normalize: (data) => data.map(item => ({ ...item, normalized: true })),
    aggregate: (data) => ({ count: data.length, items: data }),
    filter: (data, condition) => data.filter(condition),
    sort: (data, key) => data.sort((a, b) => a[key] - b[key]),
    group: (data, key) => data.reduce((groups, item) => {
      const group = item[key];
      groups[group] = groups[group] || [];
      groups[group].push(item);
      return groups;
    }, {})
  },
  execute: (data, operation, ...args) => {
    const transform = transformations[operation];
    if (!transform) {
      throw new Error(`Unknown transformation: ${operation}`);
    }
    return { result: transform(data, ...args) };
  }
});
```

## Tool Execution

```typescript
// Execute tool directly
const result = await executeTool(tool, { text: 'Hello World', operation: 'uppercase' });

// Execute with context
const result = await executeTool(tool, input, codeboltAPI);

// Execute with error handling
try {
  const result = await executeTool(tool, input);
  console.log('Tool result:', result);
} catch (error) {
  console.error('Tool execution failed:', error);
}
```

## Tool Conversion

```typescript
// Convert to OpenAI format
const openAITools = toolsToOpenAIFormat([tool1, tool2, tool3]);

// Use in agent
const agent = createAgent({
  name: 'Tool User',
  tools: openAITools
});

// Convert single tool
const openAITool = tool.toOpenAITool();
```

## Built-in Tools

The framework includes several built-in tools from the processor-pieces library:

### File Tools
```typescript
import { 
  FileReadTool, 
  FileWriteTool, 
  FileDeleteTool, 
  FileMoveTool, 
  FileCopyTool 
} from '@codebolt/agent/unified';

// Use built-in file tools
const agent = createAgent({
  name: 'File Manager Agent',
  instructions: 'You help users manage files.',
  tools: [
    new FileReadTool(),
    new FileWriteTool(),
    new FileDeleteTool(),
    new FileMoveTool(),
    new FileCopyTool()
  ]
});

// Example usage
const result = await agent.execute('Read the contents of config.json');
```

### Web Tools
```typescript
// Web scraping and URL handling
const webAgent = createAgent({
  name: 'Web Assistant',
  instructions: 'You help users with web-related tasks.',
  processors: {
    messageModifiers: [
      new HandleUrlMessageModifier({
        extractContent: true,
        includeMetadata: true,
        maxContentLength: 10000
      })
    ]
  }
});

// The agent can now automatically handle URLs in messages
const result = await webAgent.execute('Summarize the content from https://example.com/article');
```

## Advanced Tool Features

### Tool Chaining

```typescript
// Create tools that work together
const dataFetchTool = createTool({
  id: 'data-fetcher',
  name: 'Data Fetcher',
  description: 'Fetch data from API',
  execute: async ({ input }) => {
    const response = await fetch(input.url);
    return await response.json();
  }
});

const dataProcessorTool = createTool({
  id: 'data-processor',
  name: 'Data Processor',
  description: 'Process fetched data',
  execute: async ({ input }) => {
    return {
      processed: input.data.map(item => ({
        ...item,
        timestamp: Date.now()
      }))
    };
  }
});

const dataVisualizerTool = createTool({
  id: 'data-visualizer',
  name: 'Data Visualizer',
  description: 'Create visualizations from processed data',
  execute: async ({ input }) => {
    return {
      chart: `Chart for ${input.processed.length} items`,
      type: 'bar',
      data: input.processed
    };
  }
});

// Agent can chain these tools automatically
const dataAgent = createAgent({
  name: 'Data Analysis Agent',
  instructions: 'You fetch, process, and visualize data.',
  tools: [dataFetchTool, dataProcessorTool, dataVisualizerTool]
});
```

### Conditional Tools

```typescript
// Tools with conditional execution
const conditionalTool = createTool({
  id: 'conditional-processor',
  name: 'Conditional Processor',
  description: 'Process data based on conditions',
  inputSchema: z.object({
    data: z.unknown(),
    condition: z.string(),
    trueAction: z.string(),
    falseAction: z.string()
  }),
  execute: async ({ input }) => {
    // Evaluate condition (simplified)
    const conditionMet = eval(input.condition);
    
    if (conditionMet) {
      return { action: input.trueAction, result: 'Condition met' };
    } else {
      return { action: input.falseAction, result: 'Condition not met' };
    }
  }
});
```

### Async Tools

```typescript
// Long-running async tool
const longRunningTool = createTool({
  id: 'long-runner',
  name: 'Long Running Process',
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

// Tool with progress reporting
const progressTool = createTool({
  id: 'progress-reporter',
  name: 'Progress Reporter',
  description: 'Tool that reports progress during execution',
  execute: async ({ input, context }) => {
    const steps = 10;
    const results = [];
    
    for (let i = 0; i < steps; i++) {
      // Simulate work
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Report progress (if context supports it)
      if (context?.reportProgress) {
        context.reportProgress({
          step: i + 1,
          total: steps,
          percentage: ((i + 1) / steps) * 100
        });
      }
      
      results.push(`Step ${i + 1} completed`);
    }
    
    return { results, completed: true };
  }
});
```

### Error Handling in Tools

```typescript
// Tool with comprehensive error handling
const robustTool = createTool({
  id: 'robust-tool',
  name: 'Robust Tool',
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
      // Log error for debugging
      console.error('Tool execution failed:', error);
      
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

async function performOperation(operation: string, data: unknown) {
  switch (operation) {
    case 'process':
      return { processed: data };
    case 'validate':
      return { valid: true, data };
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
```

### Tool Middleware

```typescript
// Tool with middleware-like functionality
const middlewareTool = createTool({
  id: 'middleware-tool',
  name: 'Middleware Tool',
  description: 'Tool with pre/post processing',
  execute: async ({ input, context }) => {
    // Pre-processing
    const startTime = Date.now();
    console.log('Tool execution started:', input);
    
    try {
      // Main processing
      const result = await mainProcess(input);
      
      // Post-processing
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      return {
        ...result,
        metadata: {
          executionTime: duration,
          timestamp: new Date().toISOString(),
          success: true
        }
      };
      
    } catch (error) {
      // Error post-processing
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      return {
        error: error.message,
        metadata: {
          executionTime: duration,
          timestamp: new Date().toISOString(),
          success: false
        }
      };
    }
  }
});
```

## Tool Testing

```typescript
// Test tools in isolation
describe('Text Processor Tool', () => {
  const tool = createTool({
    id: 'test-tool',
    name: 'Test Tool',
    inputSchema: z.object({ text: z.string() }),
    execute: async ({ input }) => ({ result: input.text.toUpperCase() })
  });
  
  it('should convert text to uppercase', async () => {
    const result = await executeTool(tool, { text: 'hello world' });
    expect(result.result).toBe('HELLO WORLD');
  });
  
  it('should handle empty input', async () => {
    const result = await executeTool(tool, { text: '' });
    expect(result.result).toBe('');
  });
});

// Integration testing with agents
describe('Agent with Tools', () => {
  const agent = createAgent({
    name: 'Test Agent',
    instructions: 'You are a test agent.',
    tools: [textProcessorTool]
  });
  
  it('should use tools correctly', async () => {
    const result = await agent.execute('Convert "hello world" to uppercase');
    expect(result.success).toBe(true);
    expect(result.response).toContain('HELLO WORLD');
  });
});
```

## Tool Performance Optimization

```typescript
// Cached tool results
const cachedTool = createTool({
  id: 'cached-tool',
  name: 'Cached Tool',
  description: 'Tool with result caching',
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

// Batched tool execution
const batchTool = createTool({
  id: 'batch-tool',
  name: 'Batch Tool',
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
