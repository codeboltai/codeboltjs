---
sidebar_position: 1
title: Codebase Search Module
---

# Codebase Search Module

The Codebase Search module provides semantic code search capabilities, allowing agents to find relevant code snippets by natural language queries.

## Overview

This module uses AI-powered semantic search to find code based on intent and meaning rather than exact text matches. It's ideal for:
- Finding implementations of specific features
- Locating related code patterns
- Understanding how functionality is implemented
- Discovering code examples

## Quick Start

```typescript
import codebolt from '@codebolt/codeboltjs';

// Search for authentication-related code
const results = await codebolt.codebaseSearch.search(
  'user authentication login flow'
);

// Display results
for (const result of results.results) {
  console.log(`File: ${result.file}`);
  console.log(`Content: ${result.content}`);
  console.log('---');
}
```

## Available Methods

| Method | Description |
|--------|-------------|
| `search(query, targetDirectories?)` | Perform semantic code search |
| `searchMcpTool(query, tags?)` | Search for MCP tools by query |

## Method Details

### search

Performs a semantic search across the codebase.

```typescript
const results = await codebolt.codebaseSearch.search(
  'database connection handling',
  ['src/db', 'src/services']  // Optional: limit to specific directories
);
```

**Parameters:**
- `query` (string) - Natural language search query
- `targetDirectories` (string[], optional) - Directories to limit the search

**Returns:**
```typescript
{
  success: boolean;
  results: CodeSearchResult[];
  message?: string;
}
```

**Result item:**
```typescript
{
  file: string;       // Path to the file
  content: string;    // Matching code snippet
  language: string;   // Programming language
  startLine?: number; // Starting line number
  endLine?: number;   // Ending line number
  score?: number;     // Relevance score
}
```

### searchMcpTool

Search for MCP tools by query and optional tags.

```typescript
const tools = await codebolt.codebaseSearch.searchMcpTool(
  'file operations',
  ['filesystem', 'io']
);
```

## Common Use Cases

### Find Implementation
```typescript
// Find how error handling is implemented
const results = await codebolt.codebaseSearch.search(
  'global error handler middleware exception'
);
```

### Explore Patterns
```typescript
// Find validation patterns
const validation = await codebolt.codebaseSearch.search(
  'input validation sanitize user data'
);
```

### Scoped Search
```typescript
// Search only in test files
const tests = await codebolt.codebaseSearch.search(
  'user registration test',
  ['tests', '__tests__', 'spec']
);
```
