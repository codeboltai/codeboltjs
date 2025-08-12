# CodeBolt Types

A comprehensive TypeScript type definitions package for the CodeBolt ecosystem, providing type safety and schema validation for WebSocket communication between agents and applications.

## Overview

This package contains TypeScript type definitions, Zod schemas, and factory functions for:
- Agent-to-Application WebSocket communication
- Application-to-Agent WebSocket communication
- SDK module interfaces
- Notification system types and schemas
- LLM helper mappings

## Package Structure

```
src/
├── agent-to-app-ws-schema.ts      # Zod schemas for agent → app messages
├── agent-to-app-ws-types.ts       # TypeScript types for agent → app messages
├── app-to-agent-ws-schema.ts      # Zod schemas for app → agent messages
├── app-to-agent-ws-types.ts       # TypeScript types for app → agent messages
├── index.ts                       # Main export file
├── codeboltjstypes/
│   └── sdktypes/                  # SDK module interface definitions
├── factory/
│   ├── agent-to-app-factory/      # Factory functions for agent → app messages
│   └── app-to-agent-factory/      # Factory functions for app → agent messages
├── llmhelper/
│   ├── mapping.ts                 # Comprehensive API mapping with notifications
│   └── codeboltjs-api-detail/     # JSON API specifications
├── validators/
│   ├── agent-from-app-validator/  # Validation for messages from app
│   └── app-from-agent-validator/  # Validation for messages from agent
└── wstypes/
    ├── agent-to-app-ws/           # Detailed agent → app WebSocket types
    │   ├── actions/               # Action event schemas and types
    │   └── notification/          # Notification schemas and types
    └── app-to-agent-ws/           # Detailed app → agent WebSocket types
```

## Key Features

### 1. WebSocket Communication Types

- **Agent-to-App**: Types for messages sent from agents to the application
- **App-to-Agent**: Types for messages sent from the application to agents
- Full Zod schema validation for runtime type checking
- Comprehensive action and notification event types

### 2. Notification System

The package includes a complete notification system with:
- Request/Response notification patterns
- Module-specific notifications (FS, Git, Browser, Chat, etc.)
- Type-safe notification schemas and handlers

### 3. SDK Module Interfaces

Type definitions for all CodeBolt SDK modules:
- File System operations
- Git operations
- Browser automation
- Chat and messaging
- Terminal commands
- LLM inference
- Vector database operations
- Memory management
- Task planning
- MCP (Model Context Protocol) operations

### 4. API Mapping

The `llmhelper/mapping.ts` file provides a comprehensive mapping of all CodeBolt APIs including:
- Function signatures
- WebSocket message types (send/receive)
- Zod schemas for validation
- **Notification schemas and types** (newly added)

## Usage

### Installation

```bash
npm install @codebolt/types
```

### Basic Usage

```typescript
import { 
  CreateFileEvent, 
  CreateFileSuccessResponse,
  fileCreateRequestNotificationSchema,
  FileCreateRequestNotification 
} from '@codebolt/types';

// Use types for WebSocket messages
const createFileMessage: CreateFileEvent = {
  type: 'fs',
  action: 'createFile',
  data: {
    fileName: 'example.txt',
    filePath: '/path/to/file',
    content: 'Hello World'
  }
};

// Use notification types
const notification: FileCreateRequestNotification = {
  toolUseId: 'tool-123',
  type: 'fsnotify',
  action: 'createFileRequest',
  data: {
    fileName: 'example.txt',
    source: 'agent',
    filePath: '/path/to/file'
  }
};

// Validate with schemas
const isValid = fileCreateRequestNotificationSchema.safeParse(notification);
```

### API Mapping Usage

```typescript
import { codeboltApiMapping } from '@codebolt/types';

// Access API information
const fsCreateFile = codeboltApiMapping['fs.createFile'];
console.log(fsCreateFile.notificationSchemas); // Array of notification schemas
console.log(fsCreateFile.notificationTypes);   // Array of notification types
```

## Notification System

The notification system enables agents to notify the application about local actions:

### File System Notifications
- File creation, reading, updating, deletion
- Folder operations
- Directory listing

### Git Notifications
- Repository initialization
- Commit, push, pull operations
- Branch management
- Status and diff operations

### Browser Notifications
- Web fetch requests/responses
- Web search operations
- Page navigation events

### Chat Notifications
- User message handling
- Agent responses
- Chat history operations

### And many more...

## Development

### Building

```bash
npm run build
```

### Type Checking

```bash
npm run type-check
```

## Integration with CodeBolt SDK

This package is designed to work seamlessly with:
- `@codeboltjs/sdk` - The main CodeBolt JavaScript SDK
- CodeBolt Application - The desktop/web application
- CodeBolt Agents - AI agents built with the platform

## Recent Updates

- ✅ Added comprehensive notification schemas and types to all API mappings
- ✅ Enhanced type safety for WebSocket communication
- ✅ Improved validation with Zod schemas
- ✅ Better organization of notification types by module

## Contributing

When adding new APIs or modifying existing ones:

1. Add/update the TypeScript types in the appropriate files
2. Create/update corresponding Zod schemas
3. Update the API mapping in `llmhelper/mapping.ts`
4. Include appropriate notification schemas and types
5. Add factory functions if needed
6. Update documentation

## License

This package is part of the CodeBolt ecosystem and follows the same licensing terms.
