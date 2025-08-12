# @codebolt/codeboltjs-mcp

Model Context Protocol (MCP) server implementation for Codebolt.

## Features

- Complete MCP server implementation with tools, resources, and prompts support
- Session management and authentication
- Image content handling with URL, file path, and buffer support
- Event emitter for session lifecycle management
- Support for both stdio and SSE transports
- Built-in error handling and logging

## Installation

```bash
npm install @codebolt/codeboltjs-mcp
```

## Usage

```typescript
import { MCPServer, imageContent } from '@codebolt/codeboltjs-mcp';

// Create a new MCP server
const server = new MCPServer({
  name: 'my-server',
  version: '1.0.0'
});

// Add a tool
server.addTool({
  name: 'hello',
  description: 'Say hello',
  execute: async (args, context) => {
    return `Hello, ${args.name || 'World'}!`;
  }
});

// Start the server
await server.start({ transportType: 'stdio' });
```

## API

### Classes

- `MCPServer<T>` - Main MCP server class
- `FastMCPSession<T>` - Session management class
- `UnexpectedStateError` - Error class for unexpected states
- `UserError` - Error class for user-facing errors

### Functions

- `imageContent(input)` - Generate image content from URL, file path, or buffer

### Types

- `Tool<T, Params>` - Tool interface
- `Resource` - Resource interface
- `ResourceTemplate<Arguments>` - Resource template interface
- `Prompt<Arguments>` - Prompt interface
- `Content` - Content union type (text or image)
- `ContentResult` - Tool execution result type
