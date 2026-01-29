# Tools

Create custom tools with Zod schema validation for type-safe agent capabilities.

---

## Creating Tools

### Using createTool()

```typescript
import { createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

const myTool = createTool({
  id: 'search-files',
  description: 'Search for files matching a glob pattern',
  inputSchema: z.object({
    pattern: z.string().describe('Glob pattern to match'),
    directory: z.string().optional().describe('Starting directory'),
    maxResults: z.number().default(10).describe('Maximum results')
  }),
  outputSchema: z.object({
    files: z.array(z.string()),
    count: z.number()
  }),
  execute: async ({ input, context }) => {
    // Implementation
    const files = await findFiles(input.pattern, input.directory);
    return {
      files: files.slice(0, input.maxResults),
      count: files.length
    };
  }
});
```

### Using Tool Class

```typescript
import { Tool } from '@codebolt/agent/unified';
import { z } from 'zod';

const tool = new Tool({
  id: 'calculator',
  description: 'Perform mathematical calculations',
  inputSchema: z.object({
    operation: z.enum(['add', 'subtract', 'multiply', 'divide']),
    a: z.number(),
    b: z.number()
  }),
  outputSchema: z.number(),
  execute: async ({ input }) => {
    switch (input.operation) {
      case 'add': return input.a + input.b;
      case 'subtract': return input.a - input.b;
      case 'multiply': return input.a * input.b;
      case 'divide': return input.a / input.b;
    }
  }
});

// Convert to OpenAI format
const openAITool = tool.toOpenAI();
```

---

## Tool Configuration

```typescript
interface ToolConfig {
  id: string;                              // Unique identifier
  description: string;                     // Human-readable description
  inputSchema: ZodType<any, any, any>;    // Zod schema for input validation
  outputSchema?: ZodType<any, any, any>;  // Optional output validation
  execute: (context: ToolContext) => Promise<any>;  // Execution function
}

interface ToolContext {
  input: T;                    // Validated input
  threadId?: string;
  messageId?: string;
  [key: string]: unknown;      // Additional context
}
```

---

## Supported Zod Types

The tool system converts Zod schemas to JSON Schema for OpenAI compatibility:

| Zod Type | JSON Schema | Notes |
|----------|-------------|-------|
| `z.string()` | `string` | Supports `.email()`, `.url()`, `.regex()`, `.min()`, `.max()` |
| `z.number()` | `number` | Supports `.min()`, `.max()`, `.int()` |
| `z.boolean()` | `boolean` | |
| `z.array()` | `array` | Supports `.min()`, `.max()` |
| `z.object()` | `object` | Nested objects supported |
| `z.enum()` | `string` with `enum` | |
| `z.literal()` | `const` value | |
| `z.union()` | `anyOf` | |
| `z.optional()` | Removes from `required` | |
| `z.nullable()` | Adds `null` to type | |
| `z.default()` | Sets `default` value | |

---

## Tool Execution

### Execute Method

```typescript
const result = await tool.execute(input, context);

// Result structure
interface ToolExecutionResult {
  success: boolean;
  result?: any;
  error?: string;
}
```

### Execution Flow

1. **Input Validation** - Validates against `inputSchema`
2. **Execution** - Calls the `execute` function
3. **Output Validation** - Validates against `outputSchema` (if provided)
4. **Return** - Returns structured result with success flag

---

## Examples

### File Operations Tool

```typescript
import codebolt from '@codebolt/codeboltjs';

const readFileTool = createTool({
  id: 'read-file',
  description: 'Read the contents of a file',
  inputSchema: z.object({
    path: z.string().describe('Absolute file path')
  }),
  outputSchema: z.object({
    content: z.string(),
    exists: z.boolean()
  }),
  execute: async ({ input }) => {
    try {
      const result = await codebolt.fs.readFile(input.path);
      return { content: result.data, exists: true };
    } catch {
      return { content: '', exists: false };
    }
  }
});
```

### API Call Tool

```typescript
const fetchDataTool = createTool({
  id: 'fetch-api',
  description: 'Fetch data from an API endpoint',
  inputSchema: z.object({
    url: z.string().url(),
    method: z.enum(['GET', 'POST']).default('GET'),
    headers: z.record(z.string()).optional(),
    body: z.any().optional()
  }),
  execute: async ({ input }) => {
    const response = await fetch(input.url, {
      method: input.method,
      headers: input.headers,
      body: input.body ? JSON.stringify(input.body) : undefined
    });
    return response.json();
  }
});
```

### Database Query Tool

```typescript
const queryDbTool = createTool({
  id: 'query-database',
  description: 'Execute a database query',
  inputSchema: z.object({
    query: z.string().describe('SQL query'),
    params: z.array(z.any()).optional().describe('Query parameters')
  }),
  outputSchema: z.object({
    rows: z.array(z.record(z.any())),
    rowCount: z.number()
  }),
  execute: async ({ input }) => {
    const result = await db.query(input.query, input.params);
    return { rows: result.rows, rowCount: result.rowCount };
  }
});
```

### Validation Tool

```typescript
const validateJsonTool = createTool({
  id: 'validate-json',
  description: 'Validate JSON against a schema',
  inputSchema: z.object({
    json: z.string().describe('JSON string to validate'),
    schemaType: z.enum(['config', 'user', 'product'])
  }),
  outputSchema: z.object({
    valid: z.boolean(),
    errors: z.array(z.string())
  }),
  execute: async ({ input }) => {
    const schemas = {
      config: configSchema,
      user: userSchema,
      product: productSchema
    };
    const result = schemas[input.schemaType].safeParse(JSON.parse(input.json));
    return {
      valid: result.success,
      errors: result.success ? [] : result.error.errors.map(e => e.message)
    };
  }
});
```

---

## Error Handling

```typescript
const safeTool = createTool({
  id: 'safe-operation',
  description: 'An operation with proper error handling',
  inputSchema: z.object({
    data: z.string()
  }),
  execute: async ({ input }) => {
    try {
      // Risky operation
      const result = await riskyOperation(input.data);
      return { success: true, data: result };
    } catch (error) {
      // Return error in a structured way
      return {
        success: false,
        error: error.message,
        code: error.code || 'UNKNOWN'
      };
    }
  }
});
```

---

## Using Tools with Agents

Tools are automatically available to agents via the `ToolInjectionModifier`:

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import { ToolInjectionModifier } from '@codebolt/agent/processor-pieces';

// Tools registered via MCP are automatically available
const agent = new CodeboltAgent({
  instructions: 'You can use file and search tools.',
  processors: {
    messageModifiers: [
      new ToolInjectionModifier({
        toolsLocation: 'Tool',           // Inject as function calls
        includeToolDescriptions: true,
        maxToolsInMessage: 30
      })
    ]
  }
});
```
