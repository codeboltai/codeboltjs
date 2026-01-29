# Processors & Modifiers

Customize agent behavior at every stage of the processing pipeline.

---

## Pipeline Overview

```
User Message
    ↓
[Message Modifiers] ← Add context, history, tools, etc.
    ↓
[Pre-Inference Processors] ← Final adjustments before LLM
    ↓
LLM Inference
    ↓
[Post-Inference Processors] ← Analyze/modify LLM response
    ↓
[Pre-Tool Call Processors] ← Validate/intercept tool calls
    ↓
Tool Execution
    ↓
[Post-Tool Call Processors] ← Process results, compact conversation
```

---

## Message Modifiers

Transform user messages before LLM inference. Applied by `InitialPromptGenerator`.

### Base Class

```typescript
import { BaseMessageModifier } from '@codebolt/agent/processor-pieces';

class CustomModifier extends BaseMessageModifier {
  async modify(
    originalRequest: FlatUserMessage,
    createdMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    // Add or modify messages
    const messages = [...createdMessage.message.messages];
    messages.push({ role: 'system', content: 'Custom context' });

    return {
      message: { ...createdMessage.message, messages },
      metadata: { ...createdMessage.metadata, customApplied: true }
    };
  }
}
```

### Built-in Modifiers

| Modifier | Purpose | Options |
|----------|---------|---------|
| `CoreSystemPromptModifier` | Inject system instructions | `customSystemPrompt`, `includeUserMemory` |
| `ChatHistoryMessageModifier` | Add conversation history | `enableChatHistory`, `maxHistoryMessages`, `includeSystemMessages` |
| `ToolInjectionModifier` | Add available tools | `toolsLocation`, `maxToolsInMessage`, `toolFilter` |
| `EnvironmentContextModifier` | Add OS, date, time | `includeOS`, `includeDateTime`, `includeTimezone` |
| `DirectoryContextModifier` | Add project structure | `maxDepth`, `includeHidden`, `excludePatterns` |
| `IdeContextModifier` | Add IDE state | `includeActiveFile`, `includeOpenFiles`, `includeCursorPosition` |
| `AtFileProcessorModifier` | Process @file mentions | `maxFileSize`, `supportedExtensions` |
| `MemoryImportModifier` | Import stored memory | `memoryKeys`, `scope` |
| `ImageAttachmentMessageModifier` | Handle image attachments | `maxImages`, `maxImageSize` |

### Examples

#### Custom Context Modifier

```typescript
class ProjectRulesModifier extends BaseMessageModifier {
  constructor(private rules: string[]) {
    super();
  }

  async modify(originalRequest, createdMessage) {
    const rulesText = this.rules.map((r, i) => `${i + 1}. ${r}`).join('\n');

    return {
      message: {
        ...createdMessage.message,
        messages: [
          { role: 'system', content: `Project Rules:\n${rulesText}` },
          ...createdMessage.message.messages
        ]
      },
      metadata: createdMessage.metadata
    };
  }
}

// Usage
new ProjectRulesModifier([
  'Use TypeScript strict mode',
  'All functions must have JSDoc',
  'No console.log in production'
])
```

#### Conditional Context Modifier

```typescript
class ConditionalContextModifier extends BaseMessageModifier {
  async modify(originalRequest, createdMessage) {
    const userMsg = originalRequest.userMessage.toLowerCase();

    // Add context based on user message
    if (userMsg.includes('test') || userMsg.includes('testing')) {
      createdMessage.message.messages.push({
        role: 'system',
        content: 'Testing context: Use Jest, aim for 80% coverage.'
      });
    }

    if (userMsg.includes('deploy') || userMsg.includes('production')) {
      createdMessage.message.messages.push({
        role: 'system',
        content: 'Deployment context: Check security, use environment variables.'
      });
    }

    return createdMessage;
  }
}
```

---

## Pre-Inference Processors

Process messages immediately before LLM inference.

### Base Class

```typescript
import { BasePreInferenceProcessor } from '@codebolt/agent/processor-pieces';

class CustomPreProcessor extends BasePreInferenceProcessor {
  async process(
    originalMessage: FlatUserMessage,
    processedMessage: ProcessedMessage
  ): Promise<ProcessedMessage> {
    // Validate or modify before LLM call
    return processedMessage;
  }
}
```

### Examples

#### Input Validation

```typescript
class InputValidationProcessor extends BasePreInferenceProcessor {
  private maxLength = 10000;
  private blockedPatterns = [/password/i, /secret/i];

  async process(originalMessage, processedMessage) {
    const userMsg = originalMessage.userMessage;

    if (userMsg.length > this.maxLength) {
      throw new Error(`Message exceeds ${this.maxLength} characters`);
    }

    for (const pattern of this.blockedPatterns) {
      if (pattern.test(userMsg)) {
        throw new Error('Message contains blocked content');
      }
    }

    return processedMessage;
  }
}
```

#### Message Enhancement

```typescript
class MessageEnhancementProcessor extends BasePreInferenceProcessor {
  async process(originalMessage, processedMessage) {
    // Add final reminders before LLM call
    processedMessage.message.messages.push({
      role: 'system',
      content: 'Remember: Be concise, use code blocks, explain your reasoning.'
    });

    return processedMessage;
  }
}
```

---

## Post-Inference Processors

Process LLM responses after inference, before tool execution.

### Base Class

```typescript
import { BasePostInferenceProcessor } from '@codebolt/agent/processor-pieces';

class CustomPostProcessor extends BasePostInferenceProcessor {
  async modify(
    llmMessageSent: ProcessedMessage,
    llmResponseMessage: LLMResponse,
    nextPrompt: ProcessedMessage
  ): Promise<ProcessedMessage> {
    // Analyze or modify response
    return nextPrompt;
  }
}
```

### Built-in Processors

| Processor | Purpose |
|-----------|---------|
| `LoopDetectionModifier` | Detect and prevent conversational loops |

### Examples

#### Response Filtering

```typescript
class ResponseFilterProcessor extends BasePostInferenceProcessor {
  private sensitivePatterns = [/API_KEY_\w+/g, /password:\s*\S+/gi];

  async modify(llmMessageSent, llmResponseMessage, nextPrompt) {
    const message = llmResponseMessage.choices?.[0]?.message;

    if (typeof message?.content === 'string') {
      let filtered = message.content;
      for (const pattern of this.sensitivePatterns) {
        filtered = filtered.replace(pattern, '[REDACTED]');
      }
      message.content = filtered;
    }

    return nextPrompt;
  }
}
```

#### Response Analysis

```typescript
class ResponseAnalyzer extends BasePostInferenceProcessor {
  async modify(llmMessageSent, llmResponseMessage, nextPrompt) {
    const message = llmResponseMessage.choices?.[0]?.message;

    return {
      ...nextPrompt,
      metadata: {
        ...nextPrompt.metadata,
        analysis: {
          hasToolCalls: !!message?.tool_calls?.length,
          responseLength: message?.content?.length || 0,
          finishReason: llmResponseMessage.choices?.[0]?.finish_reason
        }
      }
    };
  }
}
```

---

## Pre-Tool Call Processors

Validate or intercept tool calls before execution.

### Base Class

```typescript
import { BasePreToolCallProcessor } from '@codebolt/agent/processor-pieces';

class CustomToolValidator extends BasePreToolCallProcessor {
  async modify(input: PreToolCallProcessorInput): Promise<{
    nextPrompt: ProcessedMessage;
    shouldExit: boolean;
  }> {
    // Validate tool calls
    // Return shouldExit: true to skip tool execution
    return { nextPrompt: input.nextPrompt, shouldExit: false };
  }
}
```

### Built-in Processors

| Processor | Purpose |
|-----------|---------|
| `ToolValidationModifier` | Validate tool call parameters |
| `ToolParameterModifier` | Transform tool parameters |

### Examples

#### Permission Gate

```typescript
class PermissionGateProcessor extends BasePreToolCallProcessor {
  private allowedTools = new Set(['codebolt--fs--read_file', 'codebolt--search--grep']);
  private dangerousTools = new Set(['codebolt--fs--delete_file', 'codebolt--terminal--execute']);

  async modify(input) {
    const toolCalls = input.rawLLMOutput.choices?.[0]?.message?.tool_calls || [];

    for (const call of toolCalls) {
      const toolName = call.function.name;

      if (this.dangerousTools.has(toolName)) {
        // Add warning and ask for confirmation
        input.nextPrompt.message.messages.push({
          role: 'system',
          content: `Warning: Tool "${toolName}" requires explicit user approval.`
        });
        return { nextPrompt: input.nextPrompt, shouldExit: true };
      }
    }

    return { nextPrompt: input.nextPrompt, shouldExit: false };
  }
}
```

#### Tool Argument Sanitization

```typescript
class ArgumentSanitizer extends BasePreToolCallProcessor {
  async modify(input) {
    const toolCalls = input.rawLLMOutput.choices?.[0]?.message?.tool_calls || [];

    for (const call of toolCalls) {
      if (call.function.name.includes('fs')) {
        const args = JSON.parse(call.function.arguments);
        // Ensure paths are within project directory
        if (args.path && !args.path.startsWith('/project/')) {
          args.path = `/project/${args.path}`;
          call.function.arguments = JSON.stringify(args);
        }
      }
    }

    return { nextPrompt: input.nextPrompt, shouldExit: false };
  }
}
```

---

## Post-Tool Call Processors

Process tool results after execution.

### Base Class

```typescript
import { BasePostToolCallProcessor } from '@codebolt/agent/processor-pieces';

class CustomResultProcessor extends BasePostToolCallProcessor {
  async modify(input: PostToolCallProcessorInput): Promise<{
    nextPrompt: ProcessedMessage;
    shouldExit: boolean;
  }> {
    // Process tool results
    return { nextPrompt: input.nextPrompt, shouldExit: false };
  }
}
```

### Built-in Processors

| Processor | Purpose |
|-----------|---------|
| `ShellProcessorModifier` | Execute shell commands in results |
| `ConversationCompactorModifier` | Compress long conversations |

### Examples

#### Result Logger

```typescript
class ToolResultLogger extends BasePostToolCallProcessor {
  async modify(input) {
    const { toolResults } = input;

    for (const result of toolResults) {
      console.log('Tool executed:', {
        id: result.tool_call_id,
        success: !result.content.includes('Error'),
        contentLength: result.content.length
      });
    }

    return { nextPrompt: input.nextPrompt, shouldExit: false };
  }
}
```

#### Result Summarization

```typescript
class ResultSummarizer extends BasePostToolCallProcessor {
  async modify(input) {
    const { toolResults, nextPrompt } = input;

    // Add summary of tool executions
    const summary = toolResults.map(r => {
      const preview = r.content.slice(0, 100);
      return `- ${r.tool_call_id}: ${preview}...`;
    }).join('\n');

    nextPrompt.message.messages.push({
      role: 'system',
      content: `Tool execution summary:\n${summary}`
    });

    return { nextPrompt, shouldExit: false };
  }
}
```

---

## Combining Processors

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';

const agent = new CodeboltAgent({
  instructions: 'You are a secure coding assistant.',
  processors: {
    messageModifiers: [
      new CoreSystemPromptModifier(),
      new ProjectRulesModifier(['Use TypeScript', 'No eval()']),
      new ChatHistoryMessageModifier({ maxHistoryMessages: 10 }),
      new ToolInjectionModifier()
    ],
    preInferenceProcessors: [
      new InputValidationProcessor()
    ],
    postInferenceProcessors: [
      new LoopDetectionModifier(),
      new ResponseFilterProcessor()
    ],
    preToolCallProcessors: [
      new PermissionGateProcessor()
    ],
    postToolCallProcessors: [
      new ToolResultLogger(),
      new ConversationCompactorModifier()
    ]
  }
});
```
