# Level 1: Direct APIs

Build agents from scratch using raw Codebolt APIs without any framework.

## When to Use

- You need complete control over every aspect of the agent
- You're building a highly specialized agent with unique requirements
- You want to understand how agents work at the lowest level
- You're integrating with existing systems that have their own loop

## Related Skills

For detailed API documentation, use these skills:

- **`codebolt-api-access`** - TypeScript SDK APIs for `codebolt.fs`, `codebolt.llm`, `codebolt.terminal`, etc.
- **`codebolt-mcp-access`** - MCP tool execution via `codebolt.tools.executeTool()`

## Core APIs for Agent Development

### Message Handling

```typescript
import codebolt from '@codebolt/codeboltjs';

// Listen for user messages
codebolt.onMessage(async (userMessage: FlatUserMessage) => {
  const text = userMessage.userMessage;
  const threadId = userMessage.threadId;
  const messageId = userMessage.messageId;
  // Process message...
});

// Listen for action block invocations (sub-agent calls)
codebolt.onActionBlockInvocation(async (threadContext, metadata) => {
  // Handle sub-agent invocation...
});

// Wait for connection
await codebolt.waitForReady();
```

### LLM Inference

```typescript
const response = await codebolt.llm.inference({
  messages: [
    { role: 'system', content: 'System prompt...' },
    { role: 'user', content: 'User message...' }
  ],
  tools: [...],           // Available tools
  tool_choice: 'auto',    // How to use tools
  max_tokens: 4096,
  temperature: 0.7
});

// Access response
const content = response.completion.choices[0].message.content;
const toolCalls = response.completion.choices[0].message.tool_calls;
```

### Tool Execution

```typescript
// Execute MCP tool
const result = await codebolt.mcp.executeTool(
  'codebolt',           // Toolbox name
  'read_file',          // Tool name
  { path: '/file.ts' }  // Arguments
);

// List available tools
const tools = await codebolt.mcp.listMcpFromServers(['codebolt']);
```

### Chat Communication

```typescript
// Send message to user
codebolt.chat.sendMessage('Processing complete!');

// Ask for confirmation
const answer = await codebolt.chat.askQuestion('Proceed?', ['Yes', 'No']);

// Send notification
codebolt.chat.sendNotificationEvent('File saved', 'editor');
```

## Manual Agent Loop Pattern

> **Recommendation:** The manual pattern below is for learning and understanding how agents work at the lowest level.
>
> **For production code, use Level 2's `ResponseExecutor`** which:
> - Automatically handles MCP tools, subagents, and thread management
> - Provides processor hooks for custom tool logic via `PreToolCallProcessor`
> - Handles error recovery, user rejection, and message formatting
> - Supports adding custom/local tools without reimplementing execution logic
>
> See [Level 2: Adding Custom Tools](level2-base-components.md#adding-customlocal-tools) for extending with local tools.

```typescript
import codebolt from '@codebolt/codeboltjs';
import type { FlatUserMessage } from '@codebolt/types/sdk';

const MAX_ITERATIONS = 10;

codebolt.onMessage(async (userMessage: FlatUserMessage) => {
  // 1. Initialize conversation
  const messages = [
    { role: 'system', content: 'You are a helpful coding assistant.' },
    { role: 'user', content: userMessage.userMessage }
  ];

  // 2. Get available tools
  const toolsResponse = await codebolt.mcp.listMcpFromServers(['codebolt']);
  const tools = toolsResponse?.data?.tools || [];

  // 3. Agent loop
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    // Call LLM
    const response = await codebolt.llm.inference({
      messages,
      tools,
      tool_choice: 'auto'
    });

    const assistantMessage = response.completion.choices[0].message;
    messages.push(assistantMessage);

    // Check for tool calls
    if (!assistantMessage.tool_calls || assistantMessage.tool_calls.length === 0) {
      // No tool calls - task complete
      codebolt.chat.sendMessage(assistantMessage.content);
      return;
    }

    // Execute tool calls
    for (const toolCall of assistantMessage.tool_calls) {
      const [toolbox, toolName] = toolCall.function.name.split('--');
      const args = JSON.parse(toolCall.function.arguments);

      try {
        const result = await codebolt.mcp.executeTool(toolbox, toolName, args);
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: JSON.stringify(result.data)
        });
      } catch (error) {
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          content: `Error: ${error.message}`
        });
      }
    }
  }

  codebolt.chat.sendMessage('Max iterations reached');
});
```

## Key Types

Import these types from `@codebolt/types`:

```typescript
// Import types for type-safe development
import type {
  FlatUserMessage,
  MessageObject,
  LLMCompletion,
  ToolCall,
  Attachment,
  ContentBlock
} from '@codebolt/types/sdk';
```

**Type Definitions (for reference):**

```typescript
// FlatUserMessage - Input from user
interface FlatUserMessage {
  userMessage: string;
  threadId: string;
  messageId: string;
  mentionedFiles?: string[];
  mentionedFolders?: string[];
  attachments?: Attachment[];
  metadata?: Record<string, unknown>;
}

// MessageObject - Messages in conversation
interface MessageObject {
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: string | ContentBlock[];
  tool_call_id?: string;
  tool_calls?: ToolCall[];
}

// LLMCompletion - Response from LLM inference
interface LLMCompletion {
  choices: Array<{
    message: MessageObject;
    finish_reason: 'stop' | 'tool_calls' | 'length';
  }>;
  usage?: { prompt_tokens: number; completion_tokens: number };
}

// ToolCall - Tool invocation request
interface ToolCall {
  id: string;
  type: 'function';
  function: {
    name: string;
    arguments: string;
  };
}
```

## When to Move to Level 2

Consider moving to Level 2 (base components) when:
- You're repeating the same message preprocessing logic
- You need standard modifiers (chat history, environment context)
- Tool execution handling becomes complex
- You want processor hooks for custom behavior
