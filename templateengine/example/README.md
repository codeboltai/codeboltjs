# EPOML Examples

This package contains comprehensive examples and tests for the EPOML library. It demonstrates various features and use cases of the EPOML template engine.

## Available Examples

### 1. Custom Component Example (`src/index.ts`)
Demonstrates how to create and register custom components with EPOML.

**Run:**
```bash
npm run dev
```

### 2. Basic Example Usage (`src/example-usage.ts`)
Shows basic template parsing with variable substitution and FileTree component usage.

**Run:**
```bash
npm run example:basic
```

### 3. Template Variables Demo (`src/demo-variables.ts`)
Comprehensive demonstration of template variable features including:
- Basic text substitution
- FileTree with variable directory paths
- Multiple variables in complex templates

**Run:**
```bash
npm run example:demo
```

### 4. Template Variables Test Suite (`src/test-variables.ts`)
Complete test suite for template variable functionality including:
- Simple variable substitution tests
- FileTree component tests
- Multiple variable tests
- Error handling tests
- Complex template tests

**Run:**
```bash
npm run example:test
```

### 5. New Components Example (`src/new-components-example.ts`)
Demonstrates the newly added components including:
- Text formatting components (Italic, Strikethrough, Underline)
- Structure components (Paragraph, List, ListItem, SubContent, Newline)
- Container components (Folder)
- Messaging components (Conversation, AiMessage, HumanMessage, SystemMessage)
- Utility components (ToolRequest, ToolResponse)

**Run:**
```bash
npm run example:new
```

### 6. Tool Components Example (`src/tool-components-example.ts`)
Demonstrates the newly added tool-related components including:
- CodeboltToolServer and MCPToolServer for listing tool servers
- CodeboltToolFunction and MCPToolFunction for individual tool documentation
- Support for foreach/for loop statements in components

**Run:**
```bash
npm run example:tool
```

## Getting Started

1. Install dependencies:
```bash
pnpm install
```

2. Run any example:
```bash
# Custom component example
pnpm run dev

# Basic usage example
pnpm run example:basic

# Template variables demo
pnpm run example:demo

# Template variables test suite
pnpm run example:test

# New components example
pnpm run example:new

# Tool components example
pnpm run example:tool
```

## Building

```bash
pnpm run build
```

This will compile TypeScript files to the `dist/` directory.

## Available Scripts

- `pnpm run dev` - Run the custom component example
- `pnpm run build` - Compile TypeScript to JavaScript
- `pnpm start` - Run the compiled JavaScript
- `pnpm run example:basic` - Run basic usage example
- `pnpm run example:demo` - Run template variables demo
- `pnpm run example:test` - Run template variables test suite
- `pnpm run example:new` - Run new components example
- `pnpm run example:tool` - Run tool components example