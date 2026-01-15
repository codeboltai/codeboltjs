---
sidebar_position: 1
title: Codemap Module
---

# Codemap Module

The Codemap module provides functionality for managing codemaps - visual representations of code structure that help agents and users understand project organization.

## Overview

Codemaps are hierarchical documents that describe the structure, organization, and relationships within a codebase. They can include:
- File and folder organization
- Component relationships
- Architecture diagrams
- Navigation guides

## Quick Start

```typescript
import codebolt from '@codebolt/codeboltjs';

// List all existing codemaps
const codemaps = await codebolt.codemap.list();

// Create a new codemap placeholder
const placeholder = await codebolt.codemap.create({
  title: 'API Service Architecture',
  query: 'How is the API layer organized?'
});

// Save the complete codemap content
await codebolt.codemap.save(placeholder.codemap.id, {
  id: placeholder.codemap.id,
  title: 'API Service Architecture',
  sections: [
    {
      id: 'routes',
      title: 'API Routes',
      files: ['src/routes/users.ts', 'src/routes/products.ts']
    }
  ]
});

// Mark as complete
await codebolt.codemap.setStatus(placeholder.codemap.id, 'done');
```

## Available Methods

| Method | Description |
|--------|-------------|
| `list()` | List all codemaps for a project |
| `get(codemapId)` | Get a specific codemap by ID |
| `create(data)` | Create a placeholder codemap |
| `save(codemapId, codemap)` | Save complete codemap content |
| `setStatus(codemapId, status)` | Update codemap status |
| `update(codemapId, data)` | Update codemap info |
| `delete(codemapId)` | Delete a codemap |

## Status Lifecycle

Codemaps follow a status lifecycle:

1. **creating** - Placeholder created, content being generated
2. **done** - Codemap is complete and ready
3. **error** - Generation failed

## Common Use Cases

### Generate a Codemap
```typescript
// Create placeholder while generating
const map = await codebolt.codemap.create({
  title: 'Database Schema Overview'
});

try {
  // Generate content (your logic here)
  const content = { /* ... */ };
  
  // Save complete content
  await codebolt.codemap.save(map.codemap.id, content);
  await codebolt.codemap.setStatus(map.codemap.id, 'done');
} catch (error) {
  // Handle errors
  await codebolt.codemap.setStatus(map.codemap.id, 'error', error.message);
}
```

### Update Existing Codemap
```typescript
// Update description
await codebolt.codemap.update(codemapId, {
  description: 'Updated guide to the authentication system'
});
```
