# Unified Agent Framework

The **Unified Agent Framework** is a comprehensive, self-contained system for building sophisticated AI agents with advanced capabilities. It provides a complete toolkit for creating agents that can handle complex workflows, multi-step processes, and dynamic orchestration of resources.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Components](#core-components)
4. [Getting Started](#getting-started)
5. [Agents](#agents)
6. [Tools](#tools)
7. [Workflows](#workflows)
8. [Orchestrators](#orchestrators)
9. [Processors](#processors)
10. [Examples](#examples)
11. [Best Practices](#best-practices)

## Overview

The Unified Agent Framework consolidates multiple agent patterns into a single, powerful system that provides:

- **🤖 Intelligent Agents** - High-level agents with conversation management and tool execution
- **🔧 Advanced Tools** - Type-safe tool creation with validation and error handling
- **📋 Structured Workflows** - Multi-step processes with dependencies and parallel execution
- **🎯 Smart Orchestration** - Dynamic coordination of agents, workflows, and tools
- **⚙️ Extensible Processors** - Pluggable components for customizing behavior
- **🔒 Type Safety** - Full TypeScript support with comprehensive type definitions

### Key Benefits

- **Self-Contained**: All dependencies are internal - no external package dependencies
- **Modular Design**: Use individual components or the complete system
- **Extensible**: Add custom processors, tools, and workflows
- **Production Ready**: Comprehensive error handling, logging, and monitoring
- **Developer Friendly**: Intuitive APIs with extensive documentation and examples

## Architecture

The Unified Framework follows a layered architecture:

```
┌─────────────────────────────────────────────────────────────┐
│                    ORCHESTRATOR LAYER                       │
│  Dynamic coordination of agents, workflows, and tools       │
├─────────────────────────────────────────────────────────────┤
│                     WORKFLOW LAYER                          │
│   Structured multi-step processes with dependencies        │
├─────────────────────────────────────────────────────────────┤
│                      AGENT LAYER                            │
│    Intelligent agents with conversation management         │
├─────────────────────────────────────────────────────────────┤
│                      TOOL LAYER                             │
│         Individual functions and capabilities               │
├─────────────────────────────────────────────────────────────┤
│                   PROCESSOR LAYER                           │
│     Extensible components for customizing behavior         │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. **Agent** - High-Level Intelligence
```typescript
import { createAgent, createTool } from '@codebolt/agent/unified';

const agent = createAgent({
  name: 'Research Assistant',
  instructions: 'You are a helpful research assistant.',
  tools: [/* custom tools */],
  defaultProcessors: true
});
```

### 2. **Tool** - Specific Functions
```typescript
import { createTool } from '@codebolt/agent/unified';

const calculatorTool = createTool({
  id: 'calculator',
  name: 'Calculator',
  description: 'Perform mathematical calculations',
  inputSchema: z.object({ expression: z.string() }),
  execute: async ({ input }) => ({ result: eval(input.expression) })
});
```

### 3. **Workflow** - Structured Processes
```typescript
import { createWorkflow, createAgentStep } from '@codebolt/agent/unified';

const workflow = createWorkflow({
  name: 'Research Pipeline',
  steps: [
    createAgentStep({
      id: 'research',
      name: 'Research Phase',
      agent: researchAgent,
      message: 'Research: {{topic}}'
    })
  ]
});
```

### 4. **Orchestrator** - Dynamic Coordination
```typescript
import { createOrchestrator } from '@codebolt/agent/unified';

const orchestrator = createOrchestrator({
  name: 'Smart Coordinator',
  instructions: 'Coordinate resources intelligently',
  agents: { researcher, analyst },
  workflows: { researchPipeline },
  tools: { calculator, summarizer }
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
import { createAgent, createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

// Create a simple tool
const weatherTool = createTool({
  id: 'weather',
  name: 'Get Weather',
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
const weatherAgent = createAgent({
  name: 'Weather Assistant',
  instructions: 'You help users get weather information.',
  tools: [weatherTool]
});

// Use the agent
const result = await weatherAgent.execute('What\'s the weather in New York?');
console.log(result.response);
```