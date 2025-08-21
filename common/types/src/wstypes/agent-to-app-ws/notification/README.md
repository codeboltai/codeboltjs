# Notification Schemas

This directory contains Zod schemas for all notification events that can be sent from agents to the application. These schemas are based on the notification types defined in `src/types/notification/`.

## Schema Structure

Each notification schema follows a consistent pattern:

```typescript
{
  toolUseId: string,
  type: string, // notification category (e.g., 'fsnotify', 'gitnotify')
  action: string, // specific action (e.g., 'createFileRequest', 'readFileResult')
  data?: object, // request data (for request notifications)
  content?: string | any, // response content (for response notifications)
  isError?: boolean // error flag (for response notifications)
}
```

## Available Notification Categories

### File System Notifications (`fsnotify`)
- **File Operations**: create, read, update, delete files
- **Folder Operations**: create, delete folders
- **Directory Operations**: list directory contents
- **File Manipulation**: copy, move, append to files

### Git Notifications (`gitnotify`)
- **Repository Operations**: init, clone
- **Version Control**: add, commit, push, pull
- **Branch Operations**: checkout, branch management
- **Information**: status, logs, diff
- **Remote Operations**: add/remove remotes

### Browser Notifications (`browsernotify`)
- **Web Fetch**: HTTP requests with custom headers and methods
- **Web Search**: search operations with filtering and pagination

### Terminal Notifications (`terminalnotify`)
- **Command Execution**: execute shell commands with various options

### LLM Notifications (`llmnotify`)
- **Inference Requests**: LLM inference with various parameters
- **Token Counting**: get token counts for text

### Task Notifications (`tasknotify`)
- **Task Management**: add, get, update todo tasks
- **Task Organization**: filtering, categorization, prioritization

### Chat Notifications (`chatnotify`)
- **Message Handling**: send messages, get chat history
- **Agent Responses**: text responses with metadata

### Agent Notifications (`agentnotify`)
- **Subagent Management**: start subagent tasks, handle completions
- **Task Coordination**: manage dependencies and priorities

### MCP Notifications (`mcpnotify`)
- **Server Management**: get enabled MCP servers
- **Tool Operations**: list tools, get tool definitions, execute tools

### Search Notifications (`searchnotify`)
- **Search Operations**: initialize search, perform searches
- **Codebase Search**: search within codebase with directory targeting

### System Notifications (`chatnotify`)
- **Process Management**: agent initialization and completion events

### History Notifications (`historynotify`)
- **Conversation Management**: summarize conversations and messages

### Crawler Notifications (`crawlernotify`)
- **Web Crawling**: crawl websites with depth and page limits
- **Crawler Sessions**: start crawler sessions with custom options

### Code Utils Notifications (`codeutilsnotify`)
- **Pattern Matching**: grep searches with various options
- **File Discovery**: glob searches for files and directories

### Database Memory Notifications (`dbmemorynotify`)
- **Knowledge Management**: add and retrieve knowledge entries

## Usage

Import the schemas you need:

```typescript
import { 
  fsNotificationSchema,
  FileCreateRequestNotification,
  FileCreateResponseNotification 
} from './notification/fsNotificationSchemas';

// Validate a notification
const notification = fsNotificationSchema.parse(data);

// Type-safe notification handling
function handleFileCreate(notification: FileCreateRequestNotification) {
  // notification.data.fileName is typed as string
  // notification.data.source is typed as string
  // notification.data.filePath is typed as string
}
```

## Schema Validation

All schemas use Zod for runtime validation and TypeScript type inference:

```typescript
// Runtime validation
const result = notificationEventSchema.safeParse(unknownData);
if (result.success) {
  // result.data is properly typed
  handleNotification(result.data);
} else {
  // result.error contains validation errors
  console.error(result.error);
}
```

## Extending Schemas

To add new notification types:

1. Add the notification type to the appropriate file in `src/types/notification/`
2. Create or update the corresponding schema file in this directory
3. Add the new schema to the union in `index.ts`
4. Update this documentation

## Error Handling

Response notifications include an optional `isError` field to indicate whether the operation succeeded or failed. When `isError` is true, the `content` field typically contains error information rather than successful results. 