---
title: MCP API Overview
sidebar_label: Overview
sidebar_position: 1
---

# MCP API Overview

List of MCP APIs available in CodeboltAI. These MCPs are wrappers on top of APIs that allow agents to directly call the APIs as MCP rather than calling an API directly.

## Available MCP Servers

1. [Browser](/docs/api/Mcp Access/browser) - `codebolt.browser` - Browser automation and web interaction tools
2. [Git](/docs/api/Mcp Access/git) - `codebolt.git` - Git repository management and version control
3. [Terminal](/docs/api/Mcp Access/terminal) - `codebolt.terminal` - Command execution and terminal operations
4. [File System](/docs/api/Mcp Access/fs) - `codebolt.fs` - File and directory operations
5. [Codebase](/docs/api/Mcp Access/codebase) - `codebolt.codebase` - Code search and analysis tools
6. [Agent](/docs/api/Mcp Access/agent) - `codebolt.agent` - Agent management and lifecycle operations
7. [Memory](/docs/api/Mcp Access/memory) - `codebolt.memory` - Memory storage and retrieval
8. [Vector](/docs/api/Mcp Access/vector) - `codebolt.vector` - Vector database operations
9. [RAG](/docs/api/Mcp Access/rag) - `codebolt.rag` - Retrieval Augmented Generation tools
10. [Notification](/docs/api/Mcp Access/notification) - `codebolt.notification` - Notification and messaging system
11. [Debug](/docs/api/Mcp Access/debug) - `codebolt.debug` - Debugging and logging utilities
12. [State](/docs/api/Mcp Access/state) - `codebolt.state` - Application state management
13. [Task](/docs/api/Mcp Access/task) - `codebolt.task` - Task management and tracking
14. [Tokenizer](/docs/api/Mcp Access/tokenizer) - `codebolt.tokenizer` - Text tokenization utilities
15. [Chat](/docs/api/Mcp Access/chat) - `codebolt.chat` - Chat and conversation management
16. [Problem Matcher](/docs/api/Mcp Access/problem_matcher) - `codebolt.problem_matcher` - Error and issue detection
17. [Config](/docs/api/Mcp Access/config) - `codebolt.config` - Configuration management
18. [Project](/docs/api/Mcp Access/project) - `codebolt.project` - Project management operations
19. [Message](/docs/api/Mcp Access/message) - `codebolt.message` - Message processing and communication
20. [Code Utils](/docs/api/Mcp Access/code_utils) - `codebolt.code_utils` - Code analysis and utility functions

## Sample Usage

```javascript
// List available tools from multiple MCP servers
const toolsList = await codeboltMCP.listToolsFromToolBoxes([
  "codebolt.browser",
  "codebolt.git",
  "codebolt.fs"
]);

// Execute a specific tool from an MCP server
const result = await codeboltMCP.executeTool(
  "codebolt.browser",
  "launch",
  { url: "https://example.com" }
);