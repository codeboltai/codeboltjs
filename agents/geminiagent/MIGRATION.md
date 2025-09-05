# Gemini Agent Migration to Unified Framework

This document outlines the migration of the Gemini Agent from the legacy processor pattern to the new **Unified Agent Framework**.

## Migration Summary

The Gemini Agent has been successfully migrated to use the unified framework, providing:

- **Simplified API** - Single `execute()` method instead of manual step management
- **Integrated Processors** - All processors configured during agent creation
- **Better Error Handling** - Comprehensive error management and recovery
- **Enhanced Monitoring** - Built-in telemetry and performance tracking
- **Type Safety** - Full TypeScript support with proper type definitions

## Key Changes

### 1. Import Changes

**Before:**
```typescript
import { 
    RequestMessage, 
    LLMAgentStep, 
    ToolExecutor, 
    ToolListClass as ToolList 
} from '@codebolt/agent/processor';
```

**After:**
```typescript
import {
    createAgent,
    createTool,
    HandleUrlMessageModifier,
    // ... other processors
} from '@codebolt/agent/unified';
```

### 2. Agent Creation

**Before:**
```typescript
const toolList = new ToolList([...]);
const toolExecutor = new ToolExecutor(toolList, {...});
const messageModifier = new RequestMessage({...});
const agentStep = new LLMAgentStep({...});
```

**After:**
```typescript
const geminiAgent = createAgent({
  name: 'Gemini Agent',
  instructions: '...',
  tools: [...],
  processors: {
    messageModifiers: [...],
    followUpConversation: [...],
    preToolCall: [...]
  }
});
```

### 3. Execution Logic

**Before:**
```typescript
// Manual execution loop
let currentMessage = InitialPrompt;
let iteration = 0;
while (iteration < maxIterations) {
    const response = await agentStep.step(currentMessage);
    // Manual tool execution logic...
}
```

**After:**
```typescript
// Simple execution
const result = await geminiAgent.execute(userMessage, {
  maxIterations: 10,
  includeHistory: true,
  context: { ... }
});
```

### 4. Processor Configuration

**Before:**
```typescript
const agentStep = new LLMAgentStep({
    inputProcessors: [
        new AdvancedLoopDetectionProcessor({...}),
        new TokenManagementProcessor({...})
    ],
    outputProcessors: [
        new ResponseValidationProcessor({...})
    ]
});
```

**After:**
```typescript
const geminiAgent = createAgent({
  processors: {
    followUpConversation: [
        new AdvancedLoopDetectionProcessor({...}),
        new TokenManagementProcessor({...})
    ],
    preToolCall: [
        new ResponseValidationProcessor({...})
    ]
  }
});
```

## Benefits of Migration

### 1. Simplified Usage

**Before:**
```typescript
// Complex setup and manual loop management
const messageModifier = new RequestMessage({...});
const agentStep = new LLMAgentStep({...});
// 50+ lines of manual execution logic
```

**After:**
```typescript
// Simple one-line execution
const result = await geminiAgent.execute(message);
```

### 2. Better Error Handling

**Before:**
```typescript
// Manual error handling in execution loop
try {
    // Complex error handling logic
} catch (error) {
    // Manual error response
}
```

**After:**
```typescript
// Automatic error handling with structured results
const result = await geminiAgent.execute(message);
if (!result.success) {
    console.error('Error:', result.error);
}
```

### 3. Enhanced Monitoring

**Before:**
```typescript
// Manual metrics collection
console.log('Processing iteration', iteration);
```

**After:**
```typescript
// Automatic metrics collection
console.log('Execution metrics:', {
    iterations: result.iterations,
    executionTime: result.executionTime,
    toolsUsed: result.toolResults?.length
});
```

## Usage Examples

### Basic Usage
```typescript
import { executeGeminiAgent } from '@codebolt/geminiagent';

const result = await executeGeminiAgent('Help me with my project');
console.log(result.response);
```

### Advanced Usage
```typescript
const result = await executeGeminiAgent('Analyze my code', {
  maxIterations: 8,
  includeHistory: true,
  context: {
    projectType: 'web-application',
    language: 'typescript'
  }
});
```

### Direct Agent Usage
```typescript
import { geminiAgent } from '@codebolt/geminiagent';

const result = await geminiAgent.execute('What tools do you have?');
const tools = geminiAgent.listTools();
```

## Compatibility

The migrated agent maintains full compatibility with:

- **CodeBolt Integration** - Automatic message handling through `codebolt.onMessage()`
- **File Operations** - All existing file tools (read, write, delete, move, copy)
- **Web Content Processing** - URL content extraction and analysis
- **Image Processing** - Image attachment handling and analysis
- **Conversation Management** - Advanced conversation compression and continuity

## Testing

The migration includes comprehensive examples in `examples/basic-usage.ts`:

```bash
# Run migration examples
cd agents/geminiagent
npm run build
node dist/examples/basic-usage.js
```

## Performance Improvements

The unified framework provides:

- **Reduced Memory Usage** - Automatic conversation compaction
- **Better Token Management** - Smart token usage optimization  
- **Faster Execution** - Streamlined processing pipeline
- **Enhanced Monitoring** - Built-in performance metrics

## Conclusion

The migration to the Unified Agent Framework significantly improves the Gemini Agent's:

- **Developer Experience** - Simpler API and better documentation
- **Maintainability** - Cleaner code structure and better error handling
- **Performance** - Optimized execution and resource management
- **Extensibility** - Easy addition of custom tools and processors

The agent now provides a production-ready, scalable foundation for AI-powered applications while maintaining all existing functionality.
