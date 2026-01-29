# Type Centralization in CodeBolt

This document explains how types are now centralized in the `@codebolt/types` package to avoid duplication and maintain consistency across the CodeBolt ecosystem.

## Overview

All ComposableAgent and workflow-related types are now defined in `@codebolt/types/sdktypes` and imported by other packages. This provides:

- **Single Source of Truth**: All types defined in one place
- **Consistency**: Same types used across all packages
- **Maintainability**: Updates in one place propagate everywhere
- **No Duplication**: Eliminates duplicate type definitions

## Type Organization

### Core Types in `@codebolt/types/sdktypes`

```typescript
// ComposableAgent Core Types
export interface ComposableAgent { ... }
export interface ComposableAgentConfig { ... }
export interface AgentProcessingConfig { ... }

// Tool System Types
export interface Tool<TInput, TOutput> { ... }
export interface ToolConfig<TInput, TOutput> { ... }

// Memory and Storage Types
export interface Memory { ... }
export interface MemoryConfig { ... }
export interface StorageProvider { ... }
export interface LibSQLStoreConfig { ... }

// Message Types
export interface Message { ... }
export interface MessageContent { ... }
export interface ToolCall { ... }
export interface CodeBoltMessage { ... }

// Execution Types
export interface ExecutionResult { ... }
export interface StreamChunk { ... }
export type StreamCallback = (...) => ...

// Document Types
export interface DocumentConfig { ... }
export interface ProcessedDocument { ... }

// Workflow Types
export interface WorkflowContext { ... }
export interface WorkflowStep { ... }
export interface WorkflowStepResult { ... }
export interface WorkflowConfig { ... }
export interface WorkflowResult { ... }
export interface AgentStepConfig { ... }

// Model Provider Types
export interface ModelProvider { ... }
```

### Package-Specific Type Usage

#### `@codebolt/agent/composable`

```typescript
// Re-exports types from @codebolt/types
export type {
  ComposableAgent,
  ComposableAgentConfig,
  Tool,
  ToolConfig,
  Memory,
  // ... all other types
} from '@codebolt/types/sdktypes';

// Only defines package-specific types
export interface ExecutionContext {
  messages: Message[];
  tools: Record<string, Tool>;
  config: ComposableAgentConfig;
  metadata?: Record<string, any>;
}
```

#### `@codebolt/codeboltjs`

```typescript
import type { 
  UserMessage, 
  AgentProcessingConfig 
} from '@codebolt/types/sdktypes';

// Uses types directly from @codebolt/types
export type UserProcessingConfig = AgentProcessingConfig;
```

## Import Patterns

### For Package Consumers

```typescript
// Users import from the specific package
import { 
  ComposableAgent, 
  createTool, 
  Memory,
  type ComposableAgentConfig,
  type Tool
} from '@codebolt/agent/composable';

// Types are automatically available and consistent
const agent: ComposableAgent = new ComposableAgent({...});
```

### For Package Developers

```typescript
// Import types from @codebolt/types
import type {
  ComposableAgentConfig,
  Tool,
  ExecutionResult
} from '@codebolt/types/sdktypes';

// Use types consistently across packages
export class MyAgent implements ComposableAgent {
  constructor(private config: ComposableAgentConfig) {}
  // ...
}
```

## Benefits

### 1. Type Consistency

All packages use the exact same type definitions:

```typescript
// In @codebolt/agent
const agent: ComposableAgent = new ComposableAgent(config);

// In @codebolt/codeboltjs  
const userMsg: UserMessage = codebolt.userMessage.getCurrent();

// In custom workflows
const workflow: WorkflowConfig = createWorkflow({...});
```

### 2. Easy Updates

Update a type in one place and it propagates everywhere:

```typescript
// Update in @codebolt/types/sdktypes/index.ts
export interface ComposableAgentConfig {
  name: string;
  instructions: string;
  model: ModelProvider;
  tools?: Record<string, Tool>;
  memory?: Memory;
  maxTurns?: number;
  processing?: AgentProcessingConfig;
  metadata?: Record<string, any>;
  newFeature?: boolean; // <- Add this once
}

// Automatically available in all packages that import it
```

### 3. No Duplication

Previously:
```
packages/agent/src/composablepattern/types.ts     (200+ lines of types)
packages/codeboltjs/src/modules/user-manager.ts  (50+ lines of types)
packages/types/src/codeboltjstypes/sdktypes/      (Some overlapping types)
```

Now:
```
packages/types/src/codeboltjstypes/sdktypes/      (All types defined here)
packages/agent/src/composablepattern/types.ts    (Re-exports + minimal additions)
packages/codeboltjs/src/modules/user-manager.ts  (Imports from types package)
```

### 4. Better IntelliSense

TypeScript IntelliSense works better with centralized types:
- Consistent documentation across packages
- Better auto-completion
- Accurate type checking
- Clear import suggestions

## Migration Guide

### For Existing Code

Old way:
```typescript
import type { 
  ComposableAgentConfig, 
  Tool 
} from '@codebolt/agent/composable/types';
```

New way:
```typescript
import type { 
  ComposableAgentConfig, 
  Tool 
} from '@codebolt/agent/composable';
// or directly from types:
import type { 
  ComposableAgentConfig, 
  Tool 
} from '@codebolt/types/sdktypes';
```

### For New Code

Always import types from the appropriate package:

```typescript
// For ComposableAgent usage
import { 
  ComposableAgent, 
  type ComposableAgentConfig 
} from '@codebolt/agent/composable';

// For lower-level usage
import type { 
  ComposableAgentConfig,
  Tool,
  WorkflowConfig 
} from '@codebolt/types/sdktypes';
```

## Adding New Types

### 1. Core Types (Used by Multiple Packages)

Add to `@codebolt/types/src/codeboltjstypes/sdktypes/index.ts`:

```typescript
/**
 * New feature configuration
 */
export interface NewFeatureConfig {
  enabled: boolean;
  options: Record<string, any>;
}
```

### 2. Package-Specific Types

Add to the package's local types file:

```typescript
// In packages/agent/src/composablepattern/types.ts
export interface AgentSpecificType {
  agentId: string;
  localData: any;
}
```

### 3. Re-export if Needed

```typescript
// In packages/agent/src/composablepattern/index.ts
export type { AgentSpecificType } from './types';
```

## Validation

The centralized types ensure:

1. **Compile-time Safety**: TypeScript catches type mismatches
2. **Runtime Consistency**: Same interfaces across all packages
3. **Documentation Accuracy**: JSDoc comments in one place
4. **Refactoring Safety**: Changes propagate automatically

## Future Benefits

With centralized types, we can easily:

1. **Add Package-Agnostic Utilities**: Type guards, validators, etc.
2. **Generate Documentation**: Auto-generate docs from single source
3. **Create Type-Safe APIs**: Ensure consistency across HTTP/WS APIs
4. **Support Multiple Languages**: Generate types for other languages

This centralization makes the CodeBolt ecosystem more maintainable, consistent, and developer-friendly.
