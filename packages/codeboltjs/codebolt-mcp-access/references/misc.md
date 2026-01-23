# Utility Tools

Specialized utility namespaces for code analysis, vectors, tokenization, and debugging.

---

## codebolt.vector

Vector database operations.

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `add_item` | Add item to vector DB | item (req) |
| `query` | Query similar items | query (req), topK |
| `get_vector` | Retrieve vector by item | item (req) |

```javascript
await codebolt.tools.executeTool("codebolt.vector", "query", {
  query: "authentication flow", topK: 5
});
```

---

## codebolt.tokenizer

Text tokenization operations.

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `tokenizer_encode` | Encode text into tokens | text (req) |
| `tokenizer_decode` | Decode tokens into text | tokens (req) |

```javascript
await codebolt.tools.executeTool("codebolt.tokenizer", "tokenizer_encode", {
  text: "Hello world"
});
```

---

## codebolt.code_utils

Code analysis and AST utilities.

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `get_files_markdown` | Get files as markdown | (none) |
| `get_js_tree` | Get JS/TS AST tree | filePath (req) |
| `perform_match` | Pattern matching | matcherDefinition (req), pattern (req), problems (req) |
| `get_matcher_list` | Get available matchers | (none) |
| `get_match_detail` | Get matcher details | matcherId (req) |

```javascript
await codebolt.tools.executeTool("codebolt.code_utils", "get_js_tree", {
  filePath: "./src/app.ts"
});
```

---

## codebolt.debug

Debugging utilities.

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `debug_open_browser` | Open browser for debugging | url (req), port (req) |
| `debug_add_log` | Add debug log message | log (req), type (req): info/error/warning |

```javascript
await codebolt.tools.executeTool("codebolt.debug", "debug_add_log", {
  log: "Debug message", type: "info"
});
```

---

## codebolt.notification

Event-based notifications.

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `notification_send` | Send notification | message (req), eventType (req): debug/git/planner/browser/editor/terminal/console/preview |

```javascript
await codebolt.tools.executeTool("codebolt.notification", "notification_send", {
  message: "Build complete", eventType: "terminal"
});
```

---

## codebolt.message

Message handling and process management.

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `message_send` | Send message | message (req) |
| `message_process_start` | Start processing | process (req), message (req) |
| `message_process_stop` | Stop processing | process (req), message (req) |

```javascript
await codebolt.tools.executeTool("codebolt.message", "message_send", {
  message: "Hello MCP"
});
```

---

## codebolt.config

MCP server configuration.

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `mcp_configure_server` | Configure MCP server | serverName (req), config (req): {command, args[]} |

```javascript
await codebolt.tools.executeTool("codebolt.config", "mcp_configure_server", {
  serverName: "filesystem",
  config: { command: "npx", args: ["-y", "@modelcontextprotocol/server-filesystem", "/path"] }
});
```

---

## codebolt.task

Task CRUD operations.

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `task_create` | Create task | title (req), description, thread_id |
| `task_list` | List all tasks | (none) |
| `task_update` | Update task | task_id (req), name, completed, status |

```javascript
await codebolt.tools.executeTool("codebolt.task", "task_create", {
  title: "New task", description: "Task description"
});
```

---

## codebolt.problem

Error and issue detection.

| Tool | Description | Key Parameters |
|------|-------------|----------------|
| `problem_matcher_analyze` | Analyze for problems | content (req), language (req), filePath (req), expectedSeverity |
| `problem_matcher_get_patterns` | Get patterns | language (req) |
| `problem_matcher_add_pattern` | Add custom pattern | name (req), language (req), pattern (req) |
| `problem_matcher_remove_pattern` | Remove pattern | name (req), language (req) |
| `problem_matcher_list_problems` | List problems | filePath, severity, language, limit |

```javascript
await codebolt.tools.executeTool("codebolt.problem", "problem_matcher_analyze", {
  content: 'Error: Cannot find module',
  language: 'javascript', filePath: './src/app.js'
});
```
