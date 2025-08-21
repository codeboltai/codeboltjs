# CodeBolt Integration Guide

This guide shows how to use the ComposableAgent within the CodeBolt ecosystem using the `codebolt.onMessage()` pattern.

## Quick Start

```javascript
const codebolt = require('@codebolt/codeboltjs');
const { ComposableAgent, openai } = require('@codebolt/agent/composable');

// Create your agent
const myAgent = new ComposableAgent({
  name: 'My Assistant',
  instructions: 'You are a helpful assistant.',
  model: openai('gpt-4o-mini'),
  processing: {
    processMentionedMCPs: true,    // Auto-add mentioned MCPs as tools
    processRemixPrompt: true,      // Use remix prompt to enhance instructions
    processMentionedFiles: true,   // Include mentioned file contents
    processMentionedAgents: true   // Add mentioned agents as sub-agents
  }
});

// CodeBolt integration - SUPER SIMPLE!
codebolt.onMessage(async (reqMessage) => {
  try {
    // codeboltjs automatically saves the user message!
    // Just run the agent - it gets the context automatically
    const result = await myAgent.run();
    
    return result.success ? result.message : 'Error occurred';
  } catch (error) {
    console.error('Error:', error);
    return 'Sorry, something went wrong.';
  }
});
```

## How It Works

### 1. User Message Structure

When CodeBolt calls `onMessage`, it passes a message with this structure:

```typescript
interface CodeBoltMessage {
  userMessage: string;                                    // The actual text
  mentionedFiles?: string[];                             // @file references
  mentionedMCPs: { toolbox: string, toolName: string }[]; // @mcp references
  mentionedAgents: any[];                                // @agent references
  remixPrompt?: string;                                  // Enhanced instructions
}
```

### 2. Automatic Context Management

**CodeBoltJS automatically saves the user message** when `onMessage` is called. You can access it through `codebolt.userMessage.*`:

```javascript
codebolt.onMessage(async (reqMessage) => {
  // Access user message components anytime
  const messageText = codebolt.userMessage.getText();
  const files = codebolt.userMessage.getMentionedFiles();
  const mcps = codebolt.userMessage.getMentionedMCPs();
  const agents = codebolt.userMessage.getMentionedAgents();
  const remixPrompt = codebolt.userMessage.getRemixPrompt();
  
  // Optional: Update processing configuration
  codebolt.userMessage.updateProcessingConfig({
    processMentionedMCPs: true,
    processRemixPrompt: false,
    processMentionedFiles: true,
    processMentionedAgents: false
  });
  
  const result = await agent.run();
  return result.message;
});
```

### 3. Agent Processing Configuration

Configure what your agent should automatically process:

```javascript
const agent = new ComposableAgent({
  name: 'Smart Agent',
  instructions: 'Base instructions...',
  model: openai('gpt-4o-mini'),
  processing: {
    processMentionedMCPs: true,    // Add MCPs as tools
    processRemixPrompt: true,      // Enhance system prompt
    processMentionedFiles: true,   // Include file content
    processMentionedAgents: true   // Add as sub-agents
  }
});
```

## Configuration Options

### Agent-Level Configuration

Set default processing behavior in the agent configuration:

```javascript
const agent = new ComposableAgent({
  // ... other config
  processing: {
    processMentionedMCPs: true,     // Always process MCPs
    processRemixPrompt: false,      // Never use remix prompts
    processMentionedFiles: true,    // Always include files
    processMentionedAgents: false   // Never use sub-agents
  }
});
```

### Global Configuration Override

Override agent configuration globally per message:

```javascript
codebolt.onMessage(async (reqMessage) => {
  // Override agent config for this message
  saveUserMessage(reqMessage, {
    processMentionedMCPs: false,    // Don't process MCPs this time
    processRemixPrompt: true,       // But do use remix prompt
    processMentionedFiles: true,    // Include files
    processMentionedAgents: true    // Use sub-agents
  });
  
  const result = await agent.run();
  return result.message;
});
```

### Precedence

Configuration precedence (highest to lowest):
1. Global override in `saveUserMessage()`
2. Agent-level `processing` configuration
3. Auto-detection based on message content

## Advanced Usage

### Multiple Agents with Shared Context

```javascript
const researchAgent = new ComposableAgent({
  name: 'Researcher',
  instructions: 'Research and gather information.',
  model: openai('gpt-4o-mini'),
  processing: { processMentionedFiles: true }
});

const writingAgent = new ComposableAgent({
  name: 'Writer', 
  instructions: 'Write content based on research.',
  model: openai('gpt-4o-mini'),
  processing: { processRemixPrompt: true }
});

codebolt.onMessage(async (reqMessage) => {
  // Save once for all agents
  saveUserMessage(reqMessage);
  
  let result;
  if (reqMessage.userMessage.includes('research')) {
    result = await researchAgent.run();
  } else {
    result = await writingAgent.run();
  }
  
  return result.message;
});
```

### Conditional Processing

```javascript
codebolt.onMessage(async (reqMessage) => {
  // Analyze message to determine processing
  const shouldProcessFiles = reqMessage.mentionedFiles?.some(file => 
    file.endsWith('.json') || file.endsWith('.yaml')
  );
  
  saveUserMessage(reqMessage, {
    processMentionedMCPs: true,
    processRemixPrompt: true,
    processMentionedFiles: shouldProcessFiles,
    processMentionedAgents: false
  });
  
  const result = await agent.run();
  return result.message;
});
```

### Workflow Integration

```javascript
const { createWorkflow, createAgentStep } = require('@codebolt/agent/composable');

const workflow = createWorkflow({
  name: 'Research and Write',
  steps: [
    createAgentStep({
      id: 'research',
      name: 'Research',
      agent: researchAgent,
      messageTemplate: 'Research: {{userMessage}}' // Will get user text automatically
    }),
    createAgentStep({
      id: 'write',
      name: 'Write',
      agent: writingAgent,
      messageTemplate: 'Write based on: {{researchData}}'
    })
  ]
});

codebolt.onMessage(async (reqMessage) => {
  saveUserMessage(reqMessage);
  
  if (reqMessage.userMessage.includes('complex')) {
    const result = await workflow.execute();
    return result.data.finalContent;
  } else {
    const result = await simpleAgent.run();
    return result.message;
  }
});
```

## Utility Functions

### Access User Context

```javascript
import { 
  getUserMessage,
  getMentionedFiles,
  getMentionedMCPs,
  getRemixPrompt,
  getMessageText 
} from '@codebolt/agent/composable';

// Get the full user message object
const userMsg = getUserMessage();

// Get specific parts
const files = getMentionedFiles();
const mcps = getMentionedMCPs();
const remix = getRemixPrompt();
const text = getMessageText();
```

### Session Data

```javascript
import { setSessionData, getSessionData } from '@codebolt/agent/composable';

codebolt.onMessage(async (reqMessage) => {
  // Store data across message turns
  setSessionData('conversationId', generateId());
  setSessionData('userPreferences', { theme: 'dark' });
  
  // Retrieve data
  const convId = getSessionData('conversationId');
  
  saveUserMessage(reqMessage);
  const result = await agent.run();
  return result.message;
});
```

## Processing Details

### Mentioned MCPs

When `processMentionedMCPs` is enabled:
- MCPs mentioned in the message are automatically added as tools
- Tool names follow the format: `{toolbox}--{toolName}`
- Tools are executed using CodeBolt's MCP system

### Remix Prompts

When `processRemixPrompt` is enabled:
- Remix prompt is appended to the system message
- Enhanced instructions are applied before agent execution

### Mentioned Files

When `processMentionedFiles` is enabled:
- File contents are read and included in the user message
- Files are formatted with headers: `--- File: {path} ---`
- Uses CodeBolt's file system for reading

### Mentioned Agents

When `processMentionedAgents` is enabled:
- Agents are added as sub-agent tools
- Tool names follow the format: `subagent--{unique_id}`
- Sub-agents are executed using CodeBolt's agent system

## Error Handling

```javascript
codebolt.onMessage(async (reqMessage) => {
  try {
    saveUserMessage(reqMessage);
    
    const result = await agent.run();
    
    if (result.success) {
      return result.message;
    } else {
      console.error('Agent failed:', result.error);
      return 'I encountered an error processing your request.';
    }
    
  } catch (error) {
    console.error('Execution error:', error);
    return 'Something went wrong. Please try again.';
  }
});
```

## Migration from Builder Pattern

If you're using the existing builder pattern:

```javascript
// Old way
const { UserMessage, SystemPrompt, TaskInstruction, Agent } = require("@codebolt/codeboltjs/utils");

codebolt.onMessage(async (reqMessage) => {
  const userMessage = new UserMessage(reqMessage.message);
  const systemPrompt = new SystemPrompt("./agent.yaml", "test");
  const { data } = await codebolt.tools.listToolsFromToolBoxes(["codebolt"]);
  const task = new TaskInstruction(data, userMessage, "./task.yaml", "main_task");
  const agent = new Agent(data, systemPrompt);
  const { message } = await agent.run(task);
  return message;
});

// New way
const { ComposableAgent, saveUserMessage, openai } = require('@codebolt/agent/composable');

const agent = new ComposableAgent({
  name: 'My Agent',
  instructions: 'Your instructions here',
  model: openai('gpt-4o-mini'),
  processing: { processMentionedMCPs: true }
});

codebolt.onMessage(async (reqMessage) => {
  saveUserMessage(reqMessage);
  const result = await agent.run();
  return result.message;
});
```

## Best Practices

1. **Always call `saveUserMessage()`** before running any agent
2. **Configure processing once** in agent config, override only when needed
3. **Handle errors gracefully** and provide user-friendly messages
4. **Use session data** to maintain state across message turns
5. **Test with different message types** (with/without files, MCPs, etc.)

## Example Agent Files

### Simple Weather Agent

```javascript
// weather-agent.js
const codebolt = require('@codebolt/codeboltjs');
const { ComposableAgent, createTool, saveUserMessage, openai, z } = require('@codebolt/agent/composable');

const weatherTool = createTool({
  id: 'get-weather',
  description: 'Get weather for a location',
  inputSchema: z.object({ location: z.string() }),
  outputSchema: z.object({ temperature: z.number(), conditions: z.string() }),
  execute: async ({ context }) => ({ temperature: 22, conditions: 'Sunny' })
});

const agent = new ComposableAgent({
  name: 'Weather Agent',
  instructions: 'Provide weather information using the weather tool.',
  model: openai('gpt-4o-mini'),
  tools: { weatherTool }
});

codebolt.onMessage(async (reqMessage) => {
  saveUserMessage(reqMessage);
  const result = await agent.run();
  return result.message;
});
```

### Multi-Agent System

```javascript
// multi-agent.js
const codebolt = require('@codebolt/codeboltjs');
const { 
  ComposableAgent, 
  saveUserMessage, 
  createWorkflow, 
  createAgentStep,
  openai 
} = require('@codebolt/agent/composable');

const agents = {
  research: new ComposableAgent({
    name: 'Researcher',
    instructions: 'Research topics thoroughly.',
    model: openai('gpt-4o-mini')
  }),
  
  write: new ComposableAgent({
    name: 'Writer',
    instructions: 'Write engaging content.',
    model: openai('gpt-4o-mini')
  }),
  
  review: new ComposableAgent({
    name: 'Reviewer',
    instructions: 'Review and improve content.',
    model: openai('gpt-4o-mini')
  })
};

codebolt.onMessage(async (reqMessage) => {
  saveUserMessage(reqMessage, {
    processMentionedMCPs: true,
    processRemixPrompt: true,
    processMentionedFiles: true
  });
  
  const message = reqMessage.userMessage.toLowerCase();
  
  if (message.includes('research')) {
    const result = await agents.research.run();
    return result.message;
  } else if (message.includes('write')) {
    const result = await agents.write.run();
    return result.message;
  } else if (message.includes('review')) {
    const result = await agents.review.run();
    return result.message;
  } else {
    return 'Please specify if you want me to research, write, or review something.';
  }
});
```

This integration provides a seamless way to use ComposableAgent within the existing CodeBolt ecosystem while automatically handling mentioned files, MCPs, agents, and remix prompts.
