# @codebolt/codeboltjs-mcp

> Deprecated legacy MCP authoring framework.
>
> Do not use `@codebolt/mcp` for new MCP servers. CodeBolt now recommends writing standard MCP servers with `fastmcp` or the official `@modelcontextprotocol/sdk`, then registering them with CodeBolt through normal MCP configuration or the project-local `.codebolt/tools/<name>/codebolttool.yaml` discovery convention.
>
> This package remains available only for existing projects that already depend on its legacy `MCPServer` / `FastMCPSession` API.

Legacy Model Context Protocol (MCP) server implementation for Codebolt.

## Features

- Complete MCP server implementation with tools, resources, and prompts support
- Session management and authentication
- Image content handling with URL, file path, and buffer support
- Event emitter for session lifecycle management
- Support for both stdio and SSE transports
- Built-in error handling and logging

## Installation

For new projects, prefer:

```bash
npm install fastmcp zod
```

or:

```bash
npm install @modelcontextprotocol/sdk zod
```

Install this package only for legacy compatibility:

```bash
npm install @codebolt/mcp
```

## Usage

The following example is legacy-only. New CodeBolt local tools should expose a standard MCP stdio server from `.codebolt/tools/<name>/index.js`.

```typescript
import { MCPServer, imageContent } from '@codebolt/mcp';

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
