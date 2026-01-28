# Unified Agent Framework

The **Unified Agent Framework** is a comprehensive, self-contained system for building sophisticated AI agents with advanced capabilities. It provides a complete toolkit for creating agents that can handle complex workflows, multi-step processes, and tool execution.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [Getting Started](#getting-started)
5. [Agents](#agents)
6. [Tools](#tools)
7. [Workflows](#workflows)
8. [Processors](#processors)
9. [Examples](#examples)
10. [Best Practices](#best-practices)

## Overview

The Unified Agent Framework consolidates multiple agent patterns into a single, powerful system that provides:

- **Intelligent Agents** - High-level agents with conversation management and tool execution
- **Advanced Tools** - Type-safe tool creation with validation and error handling
- **Structured Workflows** - Multi-step processes with context management
- **Extensible Processors** - Pluggable components for customizing behavior
- **Type Safety** - Full TypeScript support with comprehensive type definitions

### Key Benefits

- **Self-Contained**: All dependencies are internal - no external package dependencies
- **Modular Design**: Use individual components or the complete system
- **Extensible**: Add custom processors, tools, and workflows
- **Production Ready**: Comprehensive error handling and logging
- **Developer Friendly**: Intuitive APIs with extensive documentation and examples

## Architecture

The Unified Framework follows a layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                     WORKFLOW LAYER                          │
│   Structured multi-step processes with context management   │
├─────────────────────────────────────────────────────────────┤
│                      AGENT LAYER                            │
│    Intelligent agents with conversation management          │
├─────────────────────────────────────────────────────────────┤
│                      TOOL LAYER                             │
│         Individual functions and capabilities               │
├─────────────────────────────────────────────────────────────┤
│                   PROCESSOR LAYER                           │
│     Extensible components for customizing behavior          │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. **Agent** - High-Level Intelligence

```typescript
import { CodeboltAgent, createCodeboltAgent, createTool } from '@codebolt/agent/unified';

// Using the factory function
const agent = createCodeboltAgent({
  systemPrompt: 'You are a helpful research assistant.',
  tools: [/* custom tools */]
});

// Or using the class directly
const agent = new CodeboltAgent({
  instructions: 'You are a helpful research assistant.',
  tools: [/* custom tools */]
});
```

### 2. **Tool** - Specific Functions

```typescript
import { createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

const calculatorTool = createTool({
  id: 'calculator',
  description: 'Perform mathematical calculations',
  inputSchema: z.object({ expression: z.string() }),
  execute: async ({ input }) => ({ result: eval(input.expression) })
});
```

### 3. **Workflow** - Structured Processes

```typescript
import { Workflow, AgentStep } from '@codebolt/agent/unified';

const workflow = new Workflow({
  name: 'Research Pipeline',
  steps: [
    new AgentStep({
      id: 'research',
      name: 'Research Phase',
      agent: researchAgent,
      message: 'Research: {{topic}}'
    })
  ]
});
```

## Getting Started

### Installation

The Unified Framework is part of the `@codebolt/agent` package:

```bash
npm install @codebolt/agent
# or
pnpm add @codebolt/agent
```

### Basic Example

```typescript
import { CodeboltAgent, createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

// Create a simple tool
const weatherTool = createTool({
  id: 'weather',
  description: 'Get current weather for a location',
  inputSchema: z.object({
    location: z.string()
  }),
  execute: async ({ input }) => {
    // Your weather API logic here
    return {
      location: input.location,
      temperature: '72°F',
      condition: 'Sunny'
    };
  }
});

// Create an agent with the tool
const weatherAgent = new CodeboltAgent({
  instructions: 'You help users get weather information.',
  tools: [weatherTool]
});

// Use the agent
const result = await weatherAgent.execute({
  role: 'user',
  content: 'What\'s the weather in New York?'
});
console.log(result);
```

## Available Exports

### From `@codebolt/agent/unified`

**Classes:**
- `Agent` - Base agent class
- `CodeboltAgent` - Full-featured Codebolt agent
- `Tool` - Tool wrapper class
- `Workflow` - Workflow orchestration
- `AgentStep` - Workflow step definition
- `InitialPromptGenerator` - Message preprocessing
- `ResponseExecutor` - Tool execution handler

**Factory Functions:**
- `createCodeboltAgent()` - Create a CodeboltAgent instance
- `createTool()` - Create a Tool instance
- `createDefaultMessageProcessor()` - Create default message processor

**Types:**
- `UnifiedAgentConfig`, `UnifiedMessageOutput`, `UnifiedStepInput`, `UnifiedStepOutput`
- `UnifiedResponseInput`, `UnifiedResponseOutput`, `UnifiedAgentInput`, `UnifiedAgentOutput`
- `UnifiedMessageModifier`, `UnifiedResponseExecutor`
- `UnifiedAgentEvent`, `UnifiedAgentEventHandler`, `UnifiedAgentEventType`
- `OpenAIMessage`, `OpenAITool`, `ToolResult`, `CodeboltAPI`
- `AgentExecutionResult`, `StreamChunk`, `StreamCallback`, `LLMConfig`

**Error Types:**
- `UnifiedAgentError`
- `UnifiedMessageProcessingError`
- `UnifiedStepExecutionError`
- `UnifiedResponseExecutionError`
- `UnifiedToolExecutionError`

### From `@codebolt/agent/processor-pieces`

**Message Modifiers:**
- `EnvironmentContextModifier` - Add environment context
- `CoreSystemPromptModifier` - Core system prompt handling
- `DirectoryContextModifier` - Working directory context
- `IdeContextModifier` - IDE integration context
- `AtFileProcessorModifier` - Process @file references
- `ArgumentProcessorModifier` - Process command arguments
- `MemoryImportModifier` - Import memory context
- `ToolInjectionModifier` - Inject tools into prompts
- `ChatRecordingModifier` - Record chat history
- `ChatHistoryMessageModifier` - Include chat history

**PreToolCall Processors:**
- `ToolParameterModifier` - Modify tool parameters
- `ToolValidationModifier` - Validate tool calls

**PostToolCall Processors:**
- `ConversationCompactorModifier` - Compact long conversations
- `ShellProcessorModifier` - Process shell commands

**PreInference Processors:**
- `ChatCompressionModifier` - Compress chat history

**PostInference Processors:**
- `LoopDetectionModifier` - Detect execution loops
