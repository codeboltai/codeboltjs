# codebolt.mcp - MCP (Model Context Protocol) Tools

The `codebolt.mcp` module provides methods for discovering, listing, configuring, and executing MCP (Model Context Protocol) tools and servers. It handles both local Codebolt tools and remote MCP toolboxes.

## Response Types

All responses extend a base response with common fields:

```typescript
interface BaseMCPSDKResponse {
  success?: boolean;  // Whether the operation succeeded
  message?: string;   // Optional status message
  error?: string;     // Error details if operation failed
}
```

### MCPUserMessage

Used for passing user context to extract mentioned MCPs:

```typescript
interface MCPUserMessage {
  type: string;
  userMessage: string;
  currentFile: string;
  mentionedFiles: string[];
  mentionedFullPaths: string[];
  mentionedMCPs: string[];
  mentionedFolders: string[];
  uploadedImages: string[];
  selectedAgent: {
    id: string;
    name: string;
  };
  messageId: string;
  threadId: string;
  selection?: {
    start: number;
    end: number;
    text: string;
  };
  remixPrompt?: string;
  mentionedAgents?: string[];
}
```

### MCPConfiguration

Used for configuring MCP servers:

```typescript
interface MCPConfiguration {
  serverName: string;
  enabled?: boolean;
  config?: Record<string, unknown>;
  [key: string]: unknown;
}
```

### ToolParameters

Used for passing parameters to tools:

```typescript
interface ToolParameters {
  [key: string]: unknown;
}
```

### ToolExecutionTuple

Standard tuple format for tool execution responses:
- `[false, result]` => success
- `[true, error]` => error

```typescript
type ToolExecutionTuple<TSuccess = unknown, TError = string> =
  | [false, TSuccess]
  | [true, TError];
```

### OpenAITool

OpenAI function format used for tool listings:

```typescript
interface OpenAITool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}
```

### ToolBoxEntry

Represents a MCP toolbox with its tools:

```typescript
interface ToolBoxEntry {
  name: string;
  enabled: boolean;
  tools?: Array<{
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  }>;
}
```

### ToolDetail

Detailed information about a specific tool:

```typescript
interface ToolDetail {
  toolbox: string;
  toolName: string;
  description?: string;
  parameters?: Record<string, unknown>;
}
```

## Methods

### `getEnabledMCPServers()`

Gets the list of currently enabled MCP toolboxes.

No parameters.

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  data?: Array<{
    name: string;
    enabled: boolean;
    tools?: Array<{
      name: string;
      description?: string;
      parameters?: Record<string, unknown>;
    }>;
  }>;
}
```

```typescript
const result = await codebolt.mcp.getEnabledMCPServers();
if (result.success !== false && result.data) {
  console.log(`Enabled servers: ${result.data.map(t => t.name).join(', ')}`);
}
```

---

### `getLocalMCPServers()`

Gets the list of locally available MCP toolboxes.

No parameters.

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  data?: Array<{
    name: string;
    enabled: boolean;
    tools?: Array<{
      name: string;
      description?: string;
      parameters?: Record<string, unknown>;
    }>;
  }>;
}
```

```typescript
const result = await codebolt.mcp.getLocalMCPServers();
if (result.success !== false && result.data) {
  console.log(`Local servers: ${result.data.map(t => t.name).join(', ')}`);
}
```

---

### `getMentionedMCPServers(userMessage)`

Gets toolboxes mentioned in a user message.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| userMessage | MCPUserMessage | Yes | User message object containing context and mentions |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  data?: Array<{
    name: string;
    enabled: boolean;
    tools?: Array<{
      name: string;
      description?: string;
      parameters?: Record<string, unknown>;
    }>;
  }>;
}
```

```typescript
const result = await codebolt.mcp.getMentionedMCPServers({
  type: 'user',
  userMessage: 'Use @github to fetch repo info',
  currentFile: '/project/src/index.ts',
  mentionedFiles: [],
  mentionedFullPaths: [],
  mentionedMCPs: ['github'],
  mentionedFolders: [],
  uploadedImages: [],
  selectedAgent: { id: '1', name: 'default' },
  messageId: 'msg-123',
  threadId: 'thread-456'
});
if (result.success !== false && result.data) {
  console.log(`Mentioned MCPs: ${result.data.map(t => t.name).join(', ')}`);
}
```

---

### `searchAvailableMCPServers(query)`

Searches for available toolboxes matching a query.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | Search query string |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  data?: Record<string, {
    name: string;
    description?: string;
    tools?: Array<{
      name: string;
      description?: string;
      parameters?: Record<string, unknown>;
    }>;
  }>;
}
```

```typescript
const result = await codebolt.mcp.searchAvailableMCPServers('github');
if (result.success !== false && result.data) {
  Object.values(result.data).forEach(server => {
    console.log(`Found: ${server.name} - ${server.description}`);
  });
}
```

---

### `listMcpFromServers(toolBoxes)`

Lists all tools from the specified toolboxes in OpenAI function format.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| toolBoxes | string[] | Yes | Array of toolbox names (e.g., ['codebolt', 'github']) |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  data?: {
    tools: Array<{
      type: 'function';
      function: {
        name: string;
        description: string;
        parameters: Record<string, unknown>;
      };
    }>;
  };
}
```

```typescript
const result = await codebolt.mcp.listMcpFromServers(['codebolt', 'github']);
if (result.success !== false && result.data) {
  result.data.tools.forEach(tool => {
    console.log(`Tool: ${tool.function.name} - ${tool.function.description}`);
  });
}
```

---

### `configureMCPServer(name, config)`

Configures a specific toolbox with provided configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Name of the toolbox to configure |
| config | MCPConfiguration | Yes | Configuration object for the toolbox |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  configuration?: MCPConfiguration;
  data?: {
    success: boolean;
    message?: string;
  };
}
```

```typescript
const result = await codebolt.mcp.configureMCPServer('github', {
  serverName: 'github',
  enabled: true,
  config: { token: 'your-token' }
});
if (result.data?.success) {
  console.log('GitHub MCP configured successfully');
}
```

---

### `getTools(toolRequests)`

Gets detailed information about specific tools.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| toolRequests | { toolbox: string; toolName: string }[] | Yes | Array of toolbox and tool name pairs |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  data?: Array<{
    toolbox: string;
    toolName: string;
    description?: string;
    parameters?: Record<string, unknown>;
  }>;
}
```

```typescript
const result = await codebolt.mcp.getTools([
  { toolbox: 'codebolt', toolName: 'read_file' },
  { toolbox: 'github', toolName: 'get_repository' }
]);
if (result.success !== false && result.data) {
  result.data.forEach(tool => {
    console.log(`${tool.toolbox}/${tool.toolName}: ${tool.description}`);
  });
}
```

---

### `executeTool(toolbox, toolName, params)`

Executes a specific tool with provided parameters.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| toolbox | string | Yes | Name of the toolbox containing the tool |
| toolName | string | Yes | Name of the tool to execute |
| params | ToolParameters | Yes | Parameters to pass to the tool |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  toolName?: string;
  serverName?: string;
  params?: ToolParameters;
  data?: ToolExecutionTuple | { error?: string };
  result?: unknown;
  status?: 'pending' | 'executing' | 'success' | 'error' | 'rejected';
}
```

```typescript
const result = await codebolt.mcp.executeTool(
  'codebolt',
  'read_file',
  { filePath: '/path/to/file.txt' }
);
if (result.success) {
  console.log('Tool result:', result.result);
} else {
  console.error('Tool execution failed:', result.error);
}
```

---

### `getMcpTools(mcpNames?)`

Gets MCP tools from the specified servers. If no names provided, gets all available.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mcpNames | string[] | No | Array of MCP server names (optional - gets all if omitted) |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }>;
}
```

```typescript
const result = await codebolt.mcp.getMcpTools(['github', 'filesystem']);
if (result.success !== false && result.tools) {
  console.log(`Found ${result.tools.length} tools`);
}
```

---

### `getMcpList()`

Gets the list of available MCP servers.

No parameters.

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  data?: Array<{
    name: string;
    enabled: boolean;
    tools?: Array<{
      name: string;
      description?: string;
      parameters?: Record<string, unknown>;
    }>;
  }>;
}
```

```typescript
const result = await codebolt.mcp.getMcpList();
if (result.success !== false && result.data) {
  result.data.forEach(server => {
    console.log(`${server.name}: ${server.enabled ? 'enabled' : 'disabled'}`);
  });
}
```

---

### `getAllMcpTools()`

Gets all tools from all enabled MCP servers.

No parameters.

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  tools?: Array<{
    type: 'function';
    function: {
      name: string;
      description: string;
      parameters: Record<string, unknown>;
    };
  }>;
}
```

```typescript
const result = await codebolt.mcp.getAllMcpTools();
if (result.success !== false && result.tools) {
  console.log(`Total tools available: ${result.tools.length}`);
}
```

---

### `getEnabledMcps()`

Gets the list of enabled MCP servers.

No parameters.

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  data?: Array<{
    name: string;
    enabled: boolean;
    tools?: Array<{
      name: string;
      description?: string;
      parameters?: Record<string, unknown>;
    }>;
  }>;
}
```

```typescript
const result = await codebolt.mcp.getEnabledMcps();
if (result.success !== false && result.data) {
  console.log(`Enabled MCPs: ${result.data.map(m => m.name).join(', ')}`);
}
```

---

### `configureMcpTool(mcpName, toolName, config)`

Configures a specific MCP tool with provided configuration.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| mcpName | string | Yes | Name of the MCP server |
| toolName | string | Yes | Name of the tool to configure |
| config | Record<string, unknown> | Yes | Configuration object for the tool |

**Response:**
```typescript
{
  success?: boolean;
  message?: string;
  error?: string;
  data?: {
    success: boolean;
    message?: string;
    configuration?: MCPConfiguration;
  };
}
```

```typescript
const result = await codebolt.mcp.configureMcpTool(
  'github',
  'get_repository',
  { cacheResults: true, timeout: 30000 }
);
if (result.data?.success) {
  console.log('Tool configured successfully');
}
```

---

## Examples

### Discovering and Using MCP Tools

```typescript
async function discoverAndUseTool() {
  const enabledServers = await codebolt.mcp.getEnabledMcps();
  
  if (enabledServers.data && enabledServers.data.length > 0) {
    const allTools = await codebolt.mcp.listMcpFromServers(
      enabledServers.data.map(s => s.name)
    );
    
    if (allTools.data) {
      console.log(`Found ${allTools.data.tools.length} tools available`);
      
      const readTool = allTools.data.tools.find(
        t => t.function.name.includes('read')
      );
      
      if (readTool) {
        const result = await codebolt.mcp.executeTool(
          'codebolt',
          'read_file',
          { filePath: '/project/README.md' }
        );
        
        if (result.success) {
          console.log('File content:', result.result);
        }
      }
    }
  }
}
```

### Searching and Configuring MCPs

```typescript
async function searchAndConfigureMCP() {
  const searchResults = await codebolt.mcp.searchAvailableMCPServers('database');
  
  if (searchResults.data) {
    const available = Object.values(searchResults.data);
    
    if (available.length > 0) {
      const mcpName = available[0].name;
      
      const configResult = await codebolt.mcp.configureMCPServer(mcpName, {
        serverName: mcpName,
        enabled: true,
        config: { connectionString: 'postgresql://...' }
      });
      
      if (configResult.data?.success) {
        const tools = await codebolt.mcp.getMcpTools([mcpName]);
        console.log(`Configured ${mcpName} with ${tools.tools?.length || 0} tools`);
      }
    }
  }
}
```

### Working with User Context

```typescript
async function handleUserMentions(userMessage: MCPUserMessage) {
  const mentionedMCPs = await codebolt.mcp.getMentionedMCPServers(userMessage);
  
  if (mentionedMCPs.data && mentionedMCPs.data.length > 0) {
    const mcpNames = mentionedMCPs.data.map(m => m.name);
    const tools = await codebolt.mcp.listMcpFromServers(mcpNames);
    
    if (tools.data) {
      console.log('Available tools from mentioned MCPs:');
      tools.data.tools.forEach(tool => {
        console.log(`  - ${tool.function.name}: ${tool.function.description}`);
      });
    }
  }
}
```

### Executing Multiple Tools

```typescript
async function executeToolWorkflow() {
  const toolsToExecute = [
    { toolbox: 'codebolt', toolName: 'read_file', params: { filePath: '/config.json' } },
    { toolbox: 'github', toolName: 'get_issue', params: { owner: 'user', repo: 'project', number: 42 } }
  ];
  
  const results = await Promise.all(
    toolsToExecute.map(async (tool) => {
      const result = await codebolt.mcp.executeTool(
        tool.toolbox,
        tool.toolName,
        tool.params
      );
      return { tool: tool.toolName, success: result.success, result: result.result };
    })
  );
  
  results.forEach(r => {
    console.log(`${r.tool}: ${r.success ? 'success' : 'failed'}`);
    if (r.result) console.log('  ', r.result);
  });
}
```
