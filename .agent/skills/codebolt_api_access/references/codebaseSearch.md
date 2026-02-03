# codebolt.codebaseSearch - Codebase Search Module

Provides semantic code search functionality across the project using semantic search techniques. Supports searching for code snippets and MCP tools.

## Response Types

All responses include common fields:

```typescript
interface BaseResponse {
  success: boolean;  // Whether the operation succeeded
  message?: string;  // Optional status or error message
}
```

### CodeSearchResult

Represents a single code search result:

```typescript
interface CodeSearchResult {
  file: string;           // Path to the file containing the match
  content: string;        // The matching code content
  language: string;       // Programming language of the file
  startLine?: number;     // Starting line number of the match
  endLine?: number;       // Ending line number of the match
  score?: number;         // Relevance score of the match
}
```

### McpToolResult

Represents a single MCP tool search result (structure depends on tool metadata):

```typescript
interface McpToolResult {
  name: string;           // Tool name
  description?: string;   // Tool description
  tags?: string[];        // Associated tags
  [key: string]: any;     // Additional tool-specific metadata
}
```

## Methods

### `search(query, targetDirectories?)`

Performs a semantic search across the codebase to find relevant code snippets.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | The search query describing what to find |
| targetDirectories | string[] | No | Optional directories to limit the search scope |

**Response:**
```typescript
{
  success: boolean;
  results: CodeSearchResult[];
  message?: string;
}
```

```typescript
const result = await codebolt.codebaseSearch.search('database connection pool');
if (result.success) {
  result.results.forEach(item => {
    console.log(`${item.file}:${item.startLine} - ${item.language}`);
    console.log(item.content);
  });
}
```

---

### `searchMcpTool(query, tags?)`

Searches for MCP (Model Context Protocol) tools by query and optional tags.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| query | string | Yes | The search query for finding tools |
| tags | string[] | No | Optional tags to filter tool results |

**Response:**
```typescript
{
  success: boolean;
  results: McpToolResult[];
  message?: string;
}
```

```typescript
const result = await codebolt.codebaseSearch.searchMcpTool('file operations', ['filesystem']);
if (result.success) {
  result.results.forEach(tool => {
    console.log(`Tool: ${tool.name}`);
    console.log(`Description: ${tool.description}`);
  });
}
```

## Examples

### Search for Authentication Code

```typescript
const authResults = await codebolt.codebaseSearch.search('authentication middleware', ['src/auth']);

if (authResults.success) {
  authResults.results.forEach(result => {
    console.log(`Found in: ${result.file} (lines ${result.startLine}-${result.endLine})`);
    console.log(`Relevance: ${result.score}`);
    console.log(result.content);
  });
}
```

### Search API Endpoints Across Multiple Directories

```typescript
const apiResults = await codebolt.codebaseSearch.search('REST API endpoints', [
  'src/api',
  'src/controllers',
  'src/routes'
]);

if (apiResults.success) {
  console.log(`Found ${apiResults.results.length} endpoints`);
  const typescriptApis = apiResults.results.filter(r => r.language === 'TypeScript');
  console.log(`TypeScript endpoints: ${typescriptApis.length}`);
}
```

### Find Database Migration Tools

```typescript
const migrationTools = await codebolt.codebaseSearch.searchMcpTool('database migration', ['db', 'migration']);

if (migrationTools.success) {
  migrationTools.results.forEach(tool => {
    console.log(`Tool: ${tool.name}`);
    if (tool.tags) {
      console.log(`Tags: ${tool.tags.join(', ')}`);
    }
  });
} else {
  console.error('Search failed:', migrationTools.message);
}
```

### Search with Error Handling

```typescript
const searchCodebase = async (query, dirs) => {
  try {
    const result = await codebolt.codebaseSearch.search(query, dirs);
    
    if (!result.success) {
      console.error('Search failed:', result.message);
      return [];
    }
    
    return result.results;
  } catch (error) {
    console.error('Exception during search:', error);
    return [];
  }
};

const results = await searchCodebase('error handling patterns', ['src/utils']);
