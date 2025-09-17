# Unified Agent Framework - Self-Contained Structure

The Unified Agent Framework has been reorganized to be completely self-contained within the `@unified/` directory. This ensures that all dependencies are either from `@codebolt/codeboltjs` (which is acceptable) or are contained within the unified directory itself.

## Directory Structure

```
packages/agent/src/unified/
├── README.md                    # Comprehensive documentation
├── SELF_CONTAINED.md           # This file
├── index.ts                    # Main exports
├── types.ts                    # Core unified framework types
├── processorTypes.ts           # Processor interfaces and base classes
├── libTypes.ts                 # Library types (from libFunctionTypes.ts)
├── messageModifier.ts          # Message modification component
├── agentStep.ts               # Agent step execution component
├── responseExecutor.ts        # Response execution component
├── unifiedAgent.ts            # Main unified agent orchestrator
├── agent.ts                   # High-level Agent class
├── tool.ts                    # Tool creation utilities
├── processors/                # Processor implementations
│   ├── index.ts              # Processor exports
│   ├── conversationCompactorProcessor.ts
│   ├── followUpConversationProcessor.ts
│   ├── conversationContinuityProcessor.ts
│   ├── localToolInterceptorProcessor.ts
│   ├── toolValidationProcessor.ts
│   └── toolParameterModifierProcessor.ts
└── examples/                  # Usage examples
    ├── agentExample.ts
    ├── preToolCallProcessorsExample.ts
    └── followUpProcessorsExample.ts
```

## Self-Contained Components

### 1. Types and Interfaces
- **`processorTypes.ts`**: All processor-related interfaces, base classes, and error types
- **`libTypes.ts`**: Library types extracted from the original `libFunctionTypes.ts`
- **`types.ts`**: Core unified framework configuration and interface types

### 2. Core Framework Components
- **`messageModifier.ts`**: Message processing using processor chains
- **`agentStep.ts`**: LLM interaction and tool call analysis
- **`responseExecutor.ts`**: Tool execution and conversation management
- **`unifiedAgent.ts`**: Main orchestrator combining all components

### 3. High-Level Interface
- **`agent.ts`**: Simplified Agent class that uses the unified framework internally
- **`tool.ts`**: Comprehensive tool creation utilities with type safety

### 4. Processor Implementations
All processors have been moved to `processors/` directory with updated imports:
- Conversation management processors
- Pre-tool call processors (validation, interception, modification)
- Follow-up conversation processors

## Dependencies

### Allowed External Dependencies
- `@codebolt/codeboltjs`: Core CodeBolt functionality (acceptable)
- `zod`: Schema validation library (used for tool definitions)

### Eliminated Dependencies
- `../processor/`: All processor types and base classes moved to `processorTypes.ts`
- `../types/libFunctionTypes`: Types moved to `libTypes.ts`
- `../processor-pieces/`: Processors moved to `processors/` directory

## Key Features

### 1. Complete Self-Containment
- No imports from other packages in the agent src directory
- All required types and interfaces included
- All processor implementations included

### 2. High-Level Agent Class
```typescript
import { Agent, createAgent, createTool } from '@codebolt/agent/unified';

const agent = createAgent({
  name: 'My Agent',
  instructions: 'You are a helpful assistant',
  tools: [/* custom tools */],
  defaultProcessors: true // Automatic setup
});

const result = await agent.execute('Hello, world!');
```

### 3. Comprehensive Tool Creation
```typescript
import { createTool, createTextTool, createFileTool } from '@codebolt/agent/unified';

const customTool = createTool({
  id: 'my-tool',
  name: 'My Tool',
  description: 'Does something useful',
  inputSchema: z.object({ input: z.string() }),
  execute: async ({ input }) => `Processed: ${input.input}`
});
```

### 4. Flexible Processor System
```typescript
import { 
  ConversationCompactorProcessor,
  ToolValidationProcessor,
  LocalToolInterceptorProcessor 
} from '@codebolt/agent/unified';

const agent = createAgent({
  // ... config
  processors: {
    followUpConversation: [new ConversationCompactorProcessor()],
    preToolCall: [new ToolValidationProcessor(), new LocalToolInterceptorProcessor()]
  }
});
```

## Usage

### Installation (in workspace)
The unified framework is part of the `@codebolt/agent` package and can be imported directly:

```typescript
import { Agent, createAgent, createTool } from '@codebolt/agent/unified';
```

### Workspace Dependencies
For other packages in the turborepo that want to use the unified framework:

```json
{
  "dependencies": {
    "@codebolt/agent": "workspace:*"
  }
}
```

## Migration Path

### From Existing Patterns
1. **From ComposableAgent**: Use the new `Agent` class with similar configuration
2. **From Builder Pattern**: Use `createAgent()` factory function
3. **From Processor Pattern**: Import processors from `@codebolt/agent/unified`

### Example Migration
```typescript
// Old way
import { ComposableAgent } from '@codebolt/agent/composable';
import { SomeProcessor } from '@codebolt/agent/processor-pieces';

// New way
import { Agent, createAgent, SomeProcessor } from '@codebolt/agent/unified';
```

## Benefits

1. **Self-Contained**: No external dependencies within the agent package
2. **Type Safe**: Full TypeScript support with proper type inference
3. **Extensible**: Easy to add new processors and tools
4. **Simple**: High-level API for common use cases
5. **Powerful**: Access to full unified framework when needed
6. **Workspace Compatible**: Proper turborepo workspace dependencies

## Status

✅ **Complete**: The unified framework is now fully self-contained and ready for use.

### Completed Tasks
- [x] Move all processor types and base classes to `processorTypes.ts`
- [x] Move library types to `libTypes.ts`
- [x] Copy and update all processor implementations
- [x] Update all imports to use local files
- [x] Create high-level `Agent` class
- [x] Create comprehensive tool creation utilities
- [x] Update documentation and examples
- [x] Ensure workspace compatibility

### Remaining Tasks
- [ ] Fix remaining linting errors (type mismatches in responseExecutor.ts)
- [ ] Add comprehensive tests
- [ ] Create migration guide for existing users
- [ ] Performance optimization
