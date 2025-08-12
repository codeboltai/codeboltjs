# Design Document

## Overview

The notification functions feature will extend the Codeboltjs library with comprehensive notification capabilities. This system will provide wrapper functions for all 15 notification categories defined in the src/types/notifications directory, allowing developers to send structured notifications through the WebSocket connection to the Codebolt application.

The design follows the existing architectural patterns in Codeboltjs, providing a clean API through `codebolt.notify.*` that mirrors the structure of existing modules like `codebolt.fs.*`, `codebolt.llm.*`, etc.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Codebolt Main Class                          │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                  notify Property                            ││
│  │  ┌─────────────┬─────────────┬─────────────┬──────────────┐ ││
│  │  │   agent     │   browser   │    chat     │     ...      │ ││
│  │  │ functions   │ functions   │ functions   │  (15 total)  │ ││
│  │  └─────────────┴─────────────┴─────────────┴──────────────┘ ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                WebSocket Message Manager                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │  Handles notification message formatting and transmission   ││
│  │  - Generates unique toolUseId                              ││
│  │  - Validates message structure                             ││
│  │  - Sends via WebSocket connection                          ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Module Structure

The notification system will be organized into the following structure:

```
src/notificationfunctions/
├── index.ts                 # Main export file
├── agent.ts                 # Agent notification functions
├── browser.ts               # Browser notification functions
├── chat.ts                  # Chat notification functions
├── codeutils.ts             # Code utilities notification functions
├── crawler.ts               # Crawler notification functions
├── dbmemory.ts              # Database memory notification functions
├── fs.ts                    # File system notification functions
├── git.ts                   # Git notification functions
├── history.ts               # History notification functions
├── llm.ts                   # LLM notification functions
├── mcp.ts                   # MCP notification functions
├── search.ts                # Search notification functions
├── system.ts                # System notification functions
├── terminal.ts              # Terminal notification functions
├── todo.ts                  # Todo/Task notification functions
└── utils.ts                 # Shared utilities
```

## Components and Interfaces

### Core Components

#### 1. Notification Base Interface

```typescript
interface BaseNotificationFunction {
  toolUseId?: string;
  waitForConnection?: boolean;
  timeout?: number;
}
```

#### 2. WebSocket Message Sender

```typescript
interface NotificationSender {
  send<T>(notification: T): void;
  generateToolUseId(): string;
  validateNotification<T>(notification: T): boolean;
}
```

#### 3. Individual Notification Modules

Each notification module will export functions that correspond to the notification types defined in the respective typing files. For example:

**Agent Module (src/notificationfunctions/agent.ts)**
```typescript
export interface AgentNotifications {
  startSubagentTask(data: StartSubagentTaskData): void;
  sendSubagentTaskResponse(content: string | any, isError?: boolean, toolUseId?: string): void;
  notifySubagentTaskCompleted(data: SubagentTaskCompletedData): void;
}
```

**File System Module (src/notificationfunctions/fs.ts)**
```typescript
export interface FsNotifications {
  createFile(data: FileCreateData): void;
  sendFileCreateResponse(content: string | any, isError?: boolean, toolUseId?: string): void;
  createFolder(data: FolderCreateData): void;
  readFile(data: FileReadData): void;
  editFile(data: FileEditData): void;
  deleteFile(data: FileDeleteData): void;
  listDirectory(data: ListDirectoryData): void;
  writeToFile(data: WriteToFileData): void;
  appendToFile(data: AppendToFileData): void;
  copyFile(data: CopyFileData): void;
  moveFile(data: MoveFileData): void;
  // Response functions for each request type
}
```

#### 4. Main Notification Interface

```typescript
export interface NotificationFunctions {
  agent: AgentNotifications;
  browser: BrowserNotifications;
  chat: ChatNotifications;
  codeutils: CodeutilsNotifications;
  crawler: CrawlerNotifications;
  dbmemory: DbmemoryNotifications;
  fs: FsNotifications;
  git: GitNotifications;
  history: HistoryNotifications;
  llm: LlmNotifications;
  mcp: McpNotifications;
  search: SearchNotifications;
  system: SystemNotifications;
  terminal: TerminalNotifications;
  todo: TodoNotifications;
}
```

### Function Naming Convention

The notification functions will follow a consistent naming pattern:

1. **Request Functions**: Use descriptive action names
   - `startSubagentTask()` → sends StartSubagentTaskRequestNotification
   - `webFetch()` → sends WebFetchRequestNotification
   - `createFile()` → sends FileCreateRequestNotification

2. **Response Functions**: Prefix with "send" + descriptive name
   - `sendSubagentTaskResponse()` → sends StartSubagentTaskResponseNotification
   - `sendWebFetchResponse()` → sends WebFetchResponseNotification
   - `sendFileCreateResponse()` → sends FileCreateResponseNotification

## Data Models

### Notification Message Structure

All notification messages will follow this base structure:

```typescript
interface BaseNotification {
  toolUseId: string;
  type: string;
  action: string;
  data?: any;
  content?: string | any;
  isError?: boolean;
}
```

### Parameter Data Types

Each notification function will accept strongly-typed parameters based on the corresponding notification type definitions. For example:

```typescript
// Agent notification data types
interface StartSubagentTaskData {
  parentAgentId: string;
  subagentId: string;
  task: string;
  priority?: string;
  dependencies?: string[];
}

// File system notification data types
interface FileCreateData {
  fileName: string;
  source: string;
  filePath: string;
}

// Git notification data types
interface GitCommitData {
  path?: string;
  message?: string;
}
```

### Utility Functions

#### ToolUseId Generation

```typescript
function generateToolUseId(): string {
  return `tool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```

#### Message Validation

```typescript
function validateNotificationStructure<T extends BaseNotification>(notification: T): boolean {
  return !!(notification.toolUseId && notification.type && notification.action);
}
```

## Error Handling

### Error Types

1. **Connection Errors**: When WebSocket is not available or ready
2. **Validation Errors**: When notification data is invalid or incomplete
3. **Timeout Errors**: When notification sending times out
4. **Type Errors**: When incorrect data types are passed

### Error Handling Strategy

```typescript
class NotificationError extends Error {
  constructor(
    message: string,
    public code: string,
    public category: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'NotificationError';
  }
}

// Error codes
enum NotificationErrorCodes {
  CONNECTION_NOT_READY = 'CONNECTION_NOT_READY',
  INVALID_DATA = 'INVALID_DATA',
  TIMEOUT = 'TIMEOUT',
  WEBSOCKET_ERROR = 'WEBSOCKET_ERROR',
  VALIDATION_FAILED = 'VALIDATION_FAILED'
}
```

### Error Recovery

1. **Graceful Degradation**: Log errors but don't crash the application or block execution
2. **Non-blocking Warnings**: Warn about connection issues but still attempt to send
3. **Detailed Error Messages**: Provide context about what went wrong for debugging purposes

## Testing Strategy

### Unit Testing

1. **Function Testing**: Test each notification function individually
   - Verify correct message structure generation
   - Validate parameter handling
   - Test error conditions

2. **Integration Testing**: Test with mock WebSocket connections
   - Verify message sending through WebSocket
   - Test connection state handling
   - Validate toolUseId generation

3. **Type Testing**: Ensure TypeScript types are correctly applied
   - Test parameter type validation
   - Verify return type accuracy
   - Test IntelliSense support

### Test Structure

```typescript
describe('Notification Functions', () => {
  describe('Agent Notifications', () => {
    it('should send StartSubagentTaskRequestNotification', async () => {
      // Test implementation
    });
    
    it('should handle invalid data gracefully', async () => {
      // Test error handling
    });
  });
  
  describe('File System Notifications', () => {
    it('should send FileCreateRequestNotification', async () => {
      // Test implementation
    });
  });
  
  // Tests for all 15 notification categories
});
```

### Mock Strategy

```typescript
// Mock WebSocket for testing
class MockWebSocket {
  messages: any[] = [];
  
  send(message: any) {
    this.messages.push(message);
  }
  
  getLastMessage() {
    return this.messages[this.messages.length - 1];
  }
}
```

## Implementation Details

### WebSocket Integration

The notification functions will integrate with the existing WebSocket infrastructure:

```typescript
// In each notification function
function sendNotification<T>(notification: T): void {
  // Generate toolUseId if not provided
  if (!notification.toolUseId) {
    notification.toolUseId = generateToolUseId();
  }
  
  // Validate notification structure
  if (!validateNotificationStructure(notification)) {
    console.error('Invalid notification structure:', notification);
    return;
  }
  
  // Check if WebSocket is ready, if not, log warning but don't block
  if (!codebolt.ready) {
    console.warn('WebSocket not ready, notification may not be sent:', notification);
  }
  
  // Send via WebSocket (fire and forget)
  try {
    cbws.messageManager.send(notification);
  } catch (error) {
    console.error('Failed to send notification:', error, notification);
  }
}
```

### Type Safety Implementation

All functions will be strongly typed using the existing notification type definitions:

```typescript
import {
  StartSubagentTaskRequestNotification,
  StartSubagentTaskResponseNotification,
  SubagentTaskCompletedNotification
} from '../types/notifications/agent';

export function startSubagentTask(
  data: StartSubagentTaskRequestNotification['data'],
  toolUseId?: string
): void {
  const notification: StartSubagentTaskRequestNotification = {
    toolUseId: toolUseId || generateToolUseId(),
    type: "agentnotify",
    action: "startSubagentTaskRequest",
    data
  };
  
  sendNotification(notification);
}
```

### Performance Considerations

1. **Lazy Loading**: Notification modules will be loaded only when needed
2. **Connection Pooling**: Reuse existing WebSocket connection
3. **Message Batching**: Consider batching multiple notifications if needed
4. **Memory Management**: Avoid memory leaks in long-running applications

### Backward Compatibility

The notification system will be additive and won't break existing functionality:

1. **Non-breaking**: All existing Codebolt functionality remains unchanged
2. **Optional**: Notification functions are opt-in
3. **Extensible**: New notification types can be added without breaking changes

## Security Considerations

1. **Input Validation**: All notification data will be validated before sending
2. **Type Safety**: TypeScript types prevent many security issues
3. **Error Sanitization**: Error messages won't expose sensitive information
4. **Connection Security**: Leverage existing WebSocket security measures

## Deployment Strategy

1. **Incremental Rollout**: Deploy notification categories one by one
2. **Feature Flags**: Allow enabling/disabling notification categories
3. **Monitoring**: Track notification usage and error rates
4. **Documentation**: Comprehensive API documentation and examples