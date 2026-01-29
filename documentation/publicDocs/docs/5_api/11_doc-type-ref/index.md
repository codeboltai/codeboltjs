---
title: index
---

**@codebolt/codeboltjs**

***

# Codebolt Agent Library 

This library provides a set of tools and utilities for creating Codebolt agents, enabling seamless integration with the Codebolt platform with full TypeScript support.

## Features
- Create and manage Codebolt agents
- Interact with the Codebolt platform
- Utilize Codebolt's powerful API
- **Full TypeScript support with comprehensive type definitions**
- Type-safe API interactions
- IntelliSense support in TypeScript/JavaScript IDEs

## Installation

```bash
npm install @codebolt/codeboltjs
```

## Quick Start

### JavaScript
```javascript
const codebolt = require('@codebolt/codeboltjs');

// Set up message handling
codebolt.onMessage(async (userMessage) => {
  console.log('User said:', userMessage.userMessage);
  
  // Read a file
  const content = await codebolt.fs.readFile({ path: './example.txt' });
  console.log('File content:', content);
  
  return { status: 'completed' };
});
```

### TypeScript
```typescript
import codebolt from 'codeboltjs';
import type { 
  ChatMessageFromUser, 
  ReadFileOptions, 
  BrowserScreenshotOptions 
} from 'codeboltjs';

// Type-safe message handling
codebolt.onMessage(async (userMessage: ChatMessageFromUser) => {
  console.log('User said:', userMessage.userMessage);
  console.log('Mentioned files:', userMessage.mentionedFiles);
  
  // Type-safe file operations
  const readOptions: ReadFileOptions = {
    path: './config.json',
    encoding: 'utf8',
    askForPermission: true
  };
  
  const content = await codebolt.fs.readFile(readOptions);
  
  // Type-safe browser operations
  const screenshotOptions: BrowserScreenshotOptions = {
    fullPage: true,
    quality: 90,
    format: 'png'
  };
  
  const screenshot = await codebolt.browser.takeScreenshot(screenshotOptions);
  
  return { status: 'completed', data: content };
});
```

## TypeScript Support

This library provides comprehensive TypeScript support with over 200+ type definitions covering:

### Core Types
- **Message & Tool Types**: `Message`, `ToolCall`, `Tool`, `LLMInferenceParams`
- **API Response Types**: `APIResponse`, `SuccessResponse`, `FailureResponse`
- **Configuration Types**: `CodeboltConfig`, `AgentConfiguration`

### Module-Specific Types
- **File System**: `ReadFileOptions`, `WriteFileOptions`, `SearchFilesOptions`
- **Browser**: `BrowserNavigationOptions`, `BrowserScreenshotOptions`
- **Terminal**: `TerminalExecuteOptions`
- **Git**: `GitCommitOptions`, `GitLogOptions`
- **LLM**: `LLMChatOptions`, `OpenAIMessage`
- **Vector DB**: `VectorAddOptions`, `VectorQueryOptions`

### Import Strategies

#### From Main Package
```typescript
import codebolt, { type Message, type ToolCall } from 'codeboltjs';
```

#### From Types Barrel (Recommended)
```typescript
import codebolt from 'codeboltjs';
import type { Message, ToolCall, LLMChatOptions } from 'codeboltjs/types';
```

#### Namespace Import
```typescript
import codebolt from 'codeboltjs';
import type * as CodeboltTypes from 'codeboltjs/types';
```

For detailed type usage examples, see [TYPES.md](_media/TYPES).

## API Overview

### Core Modules

- `codebolt.fs` - File system operations
- `codebolt.git` - Git operations  
- `codebolt.browser` - Browser automation
- `codebolt.terminal` - Terminal/shell operations
- `codebolt.llm` - LLM interactions
- `codebolt.chat` - Chat management
- `codebolt.agent` - Agent operations
- `codebolt.vectordb` - Vector database operations
- `codebolt.mcp` - MCP (Model Context Protocol) tools
- `codebolt.codeparsers` - Code parsing and AST generation (migrated from internal module)

> **Note**: The `codeparsers` functions have been migrated to the `@codebolt/codeparser` package for better modularity. You can still access them through `codebolt.codeparsers` or import directly from `@codebolt/codeparser`. See [CODEPARSERS_MIGRATION.md](_media/CODEPARSERS_MIGRATION) for details.

### Example Usage

```typescript
// Wait for connection
await codebolt.waitForReady();

// File operations
const files = await codebolt.fs.listFiles({ path: './src', recursive: true });
const content = await codebolt.fs.readFile({ path: './package.json' });

// Browser operations  
await codebolt.browser.navigateTo({ url: 'https://example.com' });
const screenshot = await codebolt.browser.takeScreenshot({ fullPage: true });

// Terminal operations
const result = await codebolt.terminal.execute({ 
  command: 'npm install',
  cwd: './my-project' 
});

// LLM operations
const response = await codebolt.llm.chat({
  messages: [{ role: 'user', content: 'Explain TypeScript' }],
  temperature: 0.7
});
```

## Development

### Building the Project

```bash
# Install dependencies
npm install

# Build TypeScript to dist/ (recommended for development)
npm run build

# Build webpack bundle to build/bundle.js (single file for distribution)
npm run build:webpack

# Build both TypeScript and webpack versions
npm run build:all

# Clean all build artifacts
npm run clean

# Build documentation
npm run build:docs
```

### Build Outputs

The project supports two build methods:

1. **TypeScript Build** (`npm run build`)
   - Outputs to `dist/` directory
   - Preserves module structure
   - Includes separate `.js` and `.d.ts` files
   - **Recommended for npm publishing and development**

2. **Webpack Build** (`npm run build:webpack`)
   - Outputs to `build/bundle.js`
   - Single bundled file
   - Optimized for production deployment
   - **Works in Node.js environments**

### Project Structure

- `src/` - TypeScript source code
  - `core/` - Core library classes (Codebolt class, WebSocket management)
  - `modules/` - Feature modules (fs, git, browser, etc.)
  - `types/` - TypeScript type definitions
  - `utils/` - Utility functions
- `dist/` - Compiled JavaScript and type definitions (generated by TypeScript)
- `build/` - Webpack bundle (generated by webpack)
- `docs/` - Generated documentation

## Documentation

- **[Type Definitions Guide](_media/TYPES)** - Comprehensive TypeScript usage guide
- **[Codebolt Documentation](https://docs.codebolt.ai)** - Platform documentation
- **API Reference** - Generated from source code (coming soon)
