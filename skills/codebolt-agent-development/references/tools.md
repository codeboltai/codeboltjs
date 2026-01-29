# Tools & Custom MCP Servers

Extend agent capabilities with local tools or custom MCP servers.

---

## Two Approaches to Custom Tools

| Approach | Package | Use Case |
|----------|---------|----------|
| **Local Tools** | `@codebolt/agent` | Tools used within your agent code |
| **MCP Servers** | `@codebolt/mcp` | Standalone tool servers, shared across agents |

---

## Approach 1: Local Tools

Create tools directly in your agent using the Tool class.

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

// Convert to OpenAI format for LLM
const openAITool = tool.toOpenAI();
```

### Tool Configuration

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

### Execution Flow

1. **Input Validation** - Validates against `inputSchema`
2. **Execution** - Calls the `execute` function
3. **Output Validation** - Validates against `outputSchema` (if provided)
4. **Return** - Returns `{ success: boolean, result?: any, error?: string }`

---

## Approach 2: Custom MCP Servers

Create standalone MCP servers for tools shared across multiple agents.

### Basic MCP Server

```typescript
import { MCPServer } from '@codebolt/mcp';
import { z } from 'zod';

// 1. Create server
const server = new MCPServer({
  name: 'my-tools-server',
  version: '1.0.0'
});

// 2. Add tools
server.addTool({
  name: 'greet',
  description: 'Greet someone',
  parameters: z.object({
    name: z.string().describe('Name to greet'),
    language: z.enum(['en', 'es', 'fr']).optional()
  }),
  execute: async (args, context) => {
    const greetings = { en: 'Hello', es: 'Hola', fr: 'Bonjour' };
    return greetings[args.language || 'en'] + ', ' + args.name + '!';
  }
});

// 3. Start server
await server.start({ transportType: 'stdio' });
```

### MCP Tool with Context

```typescript
server.addTool({
  name: 'process-file',
  description: 'Process a file with progress reporting',
  parameters: z.object({
    filePath: z.string(),
    operation: z.enum(['analyze', 'transform', 'validate'])
  }),
  execute: async (args, context) => {
    // Logging
    context.log.info('Starting file processing', { file: args.filePath });

    // Progress reporting
    await context.reportProgress({ progress: 0, total: 100 });

    const result = await processFile(args.filePath, args.operation);

    await context.reportProgress({ progress: 100, total: 100 });

    context.log.info('Processing complete');
    return JSON.stringify(result);
  }
});
```

### MCP Server with Authentication

```typescript
type UserAuth = {
  userId: string;
  permissions: string[];
};

const server = new MCPServer<UserAuth>({
  name: 'authenticated-server',
  version: '1.0.0',
  authenticate: async (request) => {
    const token = request.headers['authorization'];
    if (!token) throw new Error('No auth token');

    const user = await verifyToken(token);
    return {
      userId: user.id,
      permissions: user.permissions
    };
  }
});

// Tools can access session data
server.addTool({
  name: 'get-user-data',
  parameters: z.object({ dataType: z.string() }),
  execute: async (args, context) => {
    const userId = context.session?.userId;
    if (!context.session?.permissions.includes('read:data')) {
      throw new UserError('Permission denied');
    }
    return await fetchUserData(userId, args.dataType);
  }
});
```

### MCP Resources

```typescript
// Static resource
server.addResource({
  uri: 'config://app-settings',
  name: 'Application Settings',
  mimeType: 'application/json',
  load: async () => {
    const config = await loadConfig();
    return { text: JSON.stringify(config) };
  }
});

// Dynamic resource template
server.addResourceTemplate({
  uriTemplate: 'file://{path}',
  name: 'File Reader',
  mimeType: 'text/plain',
  arguments: [{ name: 'path', description: 'File path' }],
  load: async ({ path }) => {
    const content = await readFile(path, 'utf-8');
    return { text: content };
  }
});
```

### MCP Prompts

```typescript
server.addPrompt({
  name: 'code-review',
  description: 'Request a code review',
  arguments: [
    { name: 'language', enum: ['javascript', 'typescript', 'python'] },
    { name: 'code', required: true }
  ],
  load: async ({ language, code }) => {
    return `Please review this ${language} code:\n\n${code}`;
  }
});
```

### Transport Options

```typescript
// Stdio (default) - for CLI tools
await server.start({ transportType: 'stdio' });

// SSE - for web-based integration
await server.start({
  transportType: 'sse',
  sse: { endpoint: '/mcp', port: 3000 }
});
```

---

## Supported Zod Types

Both approaches use Zod for schema validation:

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

## Tool Examples

### File Operations

```typescript
const readFileTool = createTool({
  id: 'read-file',
  description: 'Read the contents of a file',
  inputSchema: z.object({
    path: z.string().describe('Absolute file path')
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

### API Integration

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

### Database Query

```typescript
const queryDbTool = createTool({
  id: 'query-database',
  description: 'Execute a database query',
  inputSchema: z.object({
    query: z.string().describe('SQL query'),
    params: z.array(z.any()).optional()
  }),
  execute: async ({ input }) => {
    const result = await db.query(input.query, input.params);
    return { rows: result.rows, rowCount: result.rowCount };
  }
});
```

---

## Error Handling

### Local Tools

```typescript
const safeTool = createTool({
  id: 'safe-operation',
  inputSchema: z.object({ data: z.string() }),
  execute: async ({ input }) => {
    try {
      const result = await riskyOperation(input.data);
      return { success: true, data: result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
});
```

### MCP Tools

```typescript
import { UserError } from '@codebolt/mcp';

server.addTool({
  name: 'validate-input',
  parameters: z.object({ value: z.string() }),
  execute: async (args) => {
    if (!isValid(args.value)) {
      throw new UserError(`Invalid value: ${args.value}`);
    }
    return 'Valid';
  }
});
```

---

## Using Tools with Agents

### Local Tools via ToolInjectionModifier

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import { ToolInjectionModifier } from '@codebolt/agent/processor-pieces';

const agent = new CodeboltAgent({
  instructions: 'You can use file and search tools.',
  processors: {
    messageModifiers: [
      new ToolInjectionModifier({
        toolsLocation: 'Tool',
        includeToolDescriptions: true,
        maxToolsInMessage: 30
      })
    ]
  }
});
```

### MCP Tools via codebolt.mcp

```typescript
// MCP tools are automatically available via ToolInjectionModifier
// They are fetched from registered MCP servers

// You can also execute MCP tools directly:
const result = await codebolt.mcp.executeTool(
  'my-tools-server',
  'greet',
  { name: 'World', language: 'en' }
);
```

---

## When to Use Which

| Use Case | Approach |
|----------|----------|
| Tools for a single agent | Local Tools |
| Tools shared across agents | MCP Server |
| Complex tool with state | MCP Server |
| Simple utility function | Local Tool |
| Tools needing authentication | MCP Server |
| Tools with progress reporting | MCP Server |
| Quick prototyping | Local Tools |
| Production deployment | MCP Server |
