# Migration Guide: Composable Pattern to New Unified Library

This document describes how to migrate from the composable pattern (`bkp/agent/src/composablepattern/`) to the new unified library (`packages/agent/src/unified/`) with processor-pieces (`packages/agent/src/processor-pieces/`).

## Feature Comparison: Composable Pattern vs New Unified Library

### Agent Creation

| Composable Pattern Feature | New Unified Library Equivalent | Status |
|---------------------------|-------------------------------|--------|
| `ComposableAgent` class | `CodeboltAgent` class | ✅ Available |
| `createAgent(config)` factory | `new CodeboltAgent(config)` | ✅ Available |
| `agent.execute(message)` | `agent.processMessage(userMessage)` | ✅ Available |
| `agent.executeMessage(codeboltMessage)` | `agent.processMessage(flatUserMessage)` | ✅ Available |
| `agent.run()` (uses global context) | `agent.processMessage(reqMessage)` | ✅ Available (pass message explicitly) |
| `agent.addMessage(message)` | Automatic via processors | ✅ Automatic |
| `agent.getConversation()` | Via `ChatHistoryMessageModifier` | ✅ Available |
| `agent.clearConversation()` | Create new agent instance | ✅ Available |
| `agent.saveConversation()` | `ChatRecordingModifier` | ✅ Available |
| `agent.loadConversation()` | `ChatHistoryMessageModifier` | ✅ Available |
| `agent.addTool(name, tool)` | Via `ToolInjectionModifier` + MCP | ✅ Available |
| `agent.removeTool(name)` | Configure `ToolInjectionModifier` | ✅ Available |
| `agent.getTools()` | Via `ToolInjectionModifier` | ✅ Available |
| `agent.getExecutionContext()` | Via `ResponseExecutor` | ✅ Available |
| `config.name` | `config.instructions` (agent identity in prompt) | ✅ Available |
| `config.instructions` | `config.instructions` | ✅ Available |
| `config.model` | `llmRole` in `AgentStep` | ✅ Available |
| `config.tools` | `ToolInjectionModifier` + MCP servers | ✅ Available |
| `config.memory` | `ChatHistoryMessageModifier` + `ChatRecordingModifier` | ✅ Available |
| `config.maxTurns` | Loop control in `CodeboltAgent` | ✅ Available |
| `config.processing` | Various message modifiers | ✅ Available |
| `config.metadata` | Via `ProcessedMessage.metadata` | ✅ Available |

### Tool System

| Composable Pattern Feature | New Unified Library Equivalent | Status |
|---------------------------|-------------------------------|--------|
| `createTool<TInput, TOutput>()` | MCP tool definitions | ✅ Available |
| `Tool.inputSchema` (Zod) | `ToolValidationModifier` | ✅ Available |
| `Tool.outputSchema` (Zod) | `ToolValidationModifier` | ✅ Available |
| `Tool.execute(params)` | MCP tool execution via `ResponseExecutor` | ✅ Available |
| `toolToOpenAIFunction(tool)` | `ToolInjectionModifier` handles conversion | ✅ Automatic |
| `toolsToOpenAIFunctions(tools)` | `ToolInjectionModifier` handles conversion | ✅ Automatic |
| `executeTool(tool, input)` | `ResponseExecutor.executeTool()` | ✅ Available |
| `attemptCompletionTool` | Built-in `attempt_completion` handling | ✅ Automatic |
| `askFollowUpTool` | Custom tool via MCP | ✅ Available |
| Tool validation | `ToolValidationModifier` | ✅ Available |
| Tool interception | `BasePreToolCallProcessor.interceptTool()` | ✅ Available |

### Workflow System

| Composable Pattern Feature | New Unified Library Equivalent | Status |
|---------------------------|-------------------------------|--------|
| `Workflow` class | `Workflow` class in unified | ✅ Available |
| `createWorkflow(config)` | `new Workflow(config)` | ✅ Available |
| `workflow.execute()` | `workflow.execute()` | ✅ Available |
| `workflow.getContext()` | `workflow.getContext()` | ✅ Available |
| `workflow.updateContext(data)` | `workflow.updateContext(data)` | ✅ Available |
| `createAgentStep()` | Agent step in workflow | ✅ Available |
| `createTransformStep()` | Transform step in workflow | ✅ Available |
| `createConditionalStep()` | Conditional step in workflow | ✅ Available |
| `createDelayStep()` | Delay step in workflow | ✅ Available |
| `createStep()` | Custom step | ✅ Available |
| `createSimpleStep()` | Simple step | ✅ Available |
| `createAsyncStep()` | Async step | ✅ Available |
| `createValidationStep()` | Validation step | ✅ Available |
| `createLoggingStep()` | Logging step | ✅ Available |
| Step dependencies | Workflow step dependencies | ✅ Available |
| Parallel execution | Parallel step execution | ✅ Available |
| Retry logic | Retry configuration | ✅ Available |

### Memory & Storage System

| Composable Pattern Feature | New Unified Library Equivalent | Status |
|---------------------------|-------------------------------|--------|
| `Memory` class | `ChatHistoryMessageModifier` + `ChatRecordingModifier` | ✅ Available |
| `memory.saveMessages()` | `ChatRecordingModifier` | ✅ Available |
| `memory.loadMessages()` | `ChatHistoryMessageModifier` | ✅ Available |
| `memory.addMessage()` | Automatic in agent loop | ✅ Automatic |
| `memory.clearMessages()` | Create new thread | ✅ Available |
| `memory.setConversationKey()` | `threadId` in `FlatUserMessage` | ✅ Available |
| `memory.listConversations()` | Via `codebolt.chat` API | ✅ Available |
| `createCodeBoltMemory(config)` | `ChatHistoryMessageModifier` config | ✅ Available |
| `createCodeBoltAgentMemory()` | `codebolt.cbstate.getAgentState()` | ✅ Available |
| `createCodeBoltProjectMemory()` | `codebolt.cbstate.getProjectState()` | ✅ Available |
| `createCodeBoltDbMemory()` | `codebolt.dbmemory` | ✅ Available |
| `StorageProvider` interface | Codebolt state APIs | ✅ Available |
| `CodeBoltAgentStore` | `codebolt.cbstate.getAgentState()` | ✅ Available |
| `CodeBoltMemoryStore` | `codebolt.dbmemory` | ✅ Available |
| `CodeBoltProjectStore` | `codebolt.cbstate.getProjectState()` | ✅ Available |

### Document Processing

| Composable Pattern Feature | New Unified Library Equivalent | Status |
|---------------------------|-------------------------------|--------|
| `MDocument` class | `AtFileProcessorModifier` | ✅ Available |
| `MDocument.fromText()` | Direct text in message | ✅ Available |
| `MDocument.fromMarkdown()` | `AtFileProcessorModifier` | ✅ Available |
| `MDocument.fromFile()` | `AtFileProcessorModifier` with @file | ✅ Available |
| `document.chunk()` | N/A (chunking not in new lib) | ❌ Missing |
| `document.getChunks()` | N/A | ❌ Missing |
| `document.setEmbeddings()` | N/A | ❌ Missing |
| `document.getEmbeddings()` | N/A | ❌ Missing |
| `document.extractText()` | `AtFileProcessorModifier` | ✅ Available |
| Chunking strategies | N/A | ❌ Missing |

### User Context Management

| Composable Pattern Feature | New Unified Library Equivalent | Status |
|---------------------------|-------------------------------|--------|
| `saveUserMessage(message)` | `FlatUserMessage` passed to agent | ✅ Available |
| `getUserMessage()` | `FlatUserMessage.content` | ✅ Available |
| `getUserConfig()` | `FlatUserMessage` properties | ✅ Available |
| `getMentionedMCPs()` | `FlatUserMessage.mentionedMCPs` | ✅ Available |
| `getMentionedFiles()` | `FlatUserMessage.mentionedFiles` | ✅ Available |
| `getMentionedAgents()` | `FlatUserMessage.mentionedAgents` | ✅ Available |
| `getRemixPrompt()` | N/A (handled differently) | ⚠️ Changed |
| `getMessageText()` | `FlatUserMessage.content` | ✅ Available |
| `setSessionData(key, value)` | `ProcessedMessage.metadata` | ✅ Available |
| `getSessionData(key)` | `ProcessedMessage.metadata` | ✅ Available |
| `clearUserContext()` | Create new agent/thread | ✅ Available |

### Processing Configuration

| Composable Pattern Feature | New Unified Library Equivalent | Status |
|---------------------------|-------------------------------|--------|
| `processMentionedMCPs` | `ToolInjectionModifier` | ✅ Available |
| `processRemixPrompt` | `CoreSystemPromptModifier` | ✅ Available |
| `processMentionedFiles` | `AtFileProcessorModifier` | ✅ Available |
| `processMentionedAgents` | `ToolInjectionModifier` with agents | ✅ Available |
| `fileContentProcessor` | `AtFileProcessorModifier` options | ✅ Available |
| `mcpToolProcessor` | `ToolInjectionModifier` options | ✅ Available |

---

## New Features in Unified Library (Not in Composable Pattern)

| Feature | Description |
|---------|-------------|
| `ChatCompressionModifier` | Automatically compress long conversations |
| `LoopDetectionModifier` | Detect and prevent conversation loops |
| `EnvironmentContextModifier` | Add OS, date, directory context |
| `DirectoryContextModifier` | Add project file tree |
| `IdeContextModifier` | Add IDE state (active file, cursor, selection) |
| `MemoryImportModifier` | Import @file memory references |
| `ArgumentProcessorModifier` | Process command-line arguments |
| `ShellProcessorModifier` | Process shell command injections |
| `ConversationCompactorModifier` | Compact conversation after tool calls |
| `ToolParameterModifier` | Transform tool parameters |
| Pre-inference processing | Process before LLM call |
| Post-inference processing | Process after LLM response |
| Pre-tool-call processing | Intercept and validate tool calls |
| Post-tool-call processing | Process tool results |

---

## Missing Features in New Library

### 1. Document Chunking & Embeddings ❌

The old `MDocument.chunk()` with various strategies (fixed, sentence, paragraph, semantic) and `setEmbeddings()`/`getEmbeddings()` are not available.

**Workaround:** Use external chunking libraries or implement as a custom pre-processor:

```typescript
import { BaseMessageModifier } from '@codebolt/agent/processor-pieces';

class DocumentChunkingModifier extends BaseMessageModifier {
    private chunkSize: number;
    private overlap: number;

    constructor(options: { chunkSize?: number; overlap?: number } = {}) {
        super(options);
        this.chunkSize = options.chunkSize || 1000;
        this.overlap = options.overlap || 100;
    }

    async modify(originalRequest: FlatUserMessage, createdMessage: ProcessedMessage): Promise<ProcessedMessage> {
        // Implement your chunking logic here
        const content = createdMessage.message.messages
            .filter(m => m.role === 'user')
            .map(m => m.content)
            .join('\n');

        const chunks = this.chunkText(content, this.chunkSize, this.overlap);

        // Add chunks to metadata or modify messages
        createdMessage.metadata = {
            ...createdMessage.metadata,
            chunks
        };

        return createdMessage;
    }

    private chunkText(text: string, size: number, overlap: number): string[] {
        const chunks: string[] = [];
        let start = 0;
        while (start < text.length) {
            chunks.push(text.slice(start, start + size));
            start += size - overlap;
        }
        return chunks;
    }
}
```

### 2. Remix Prompt Enhancement ❌

The old `processRemixPrompt` and `getRemixPrompt()` are not directly available.

**Workaround:** Use `CoreSystemPromptModifier` with custom logic:

```typescript
new CoreSystemPromptModifier({
    customSystemPrompt: basePrompt + '\n\n' + remixEnhancement
})
```

---

## Migration Examples

### Old Composable Pattern: Basic Agent

```typescript
import { ComposableAgent, createTool, createCodeBoltDbMemory } from './composablepattern';
import { z } from 'zod';

// Create a tool with Zod validation
const myTool = createTool({
    id: 'calculate',
    description: 'Perform a calculation',
    inputSchema: z.object({
        expression: z.string().describe('Math expression to evaluate')
    }),
    outputSchema: z.object({
        result: z.number()
    }),
    execute: async ({ context }) => {
        const result = eval(context.expression);
        return { result };
    }
});

// Create agent with memory
const agent = new ComposableAgent({
    name: 'Calculator',
    instructions: 'You are a helpful calculator assistant.',
    model: 'gpt-4o-mini',
    tools: { calculate: myTool },
    memory: createCodeBoltDbMemory('calc-agent'),
    maxTurns: 10,
    processing: {
        processMentionedMCPs: true,
        processMentionedFiles: true
    }
});

// Load previous conversation
await agent.loadConversation();

// Execute
const result = await agent.execute('What is 2 + 2?');
console.log(result.message);

// Save conversation
await agent.saveConversation();
```

### New Unified Library: Basic Agent

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import {
    ChatHistoryMessageModifier,
    EnvironmentContextModifier,
    CoreSystemPromptModifier,
    ToolInjectionModifier,
    AtFileProcessorModifier,
    ChatRecordingModifier,
    ChatCompressionModifier,
    ToolValidationModifier
} from '@codebolt/agent/processor-pieces';
import type { FlatUserMessage } from '@codebolt/types/sdk';

// Tools are now defined via MCP servers or injected via ToolInjectionModifier
// For custom tools, register them as MCP tools

// Create agent with processors
const agent = new CodeboltAgent({
    instructions: `You are Calculator, a helpful calculator assistant.`,

    processors: {
        // Message modifiers (replaces processing config)
        messageModifiers: [
            new ChatHistoryMessageModifier({
                enableChatHistory: true,
                maxHistoryMessages: 50
            }),
            new EnvironmentContextModifier({ enableFullContext: false }),
            new CoreSystemPromptModifier({
                customSystemPrompt: 'You are a helpful calculator assistant.'
            }),
            new ToolInjectionModifier({
                toolsLocation: 'Tool',
                giveToolExamples: true
            }),
            new AtFileProcessorModifier({}),  // Replaces processMentionedFiles
            new ChatRecordingModifier({       // Replaces memory.saveConversation()
                enableRecording: true,
                recordingPath: '.chat-recordings/calc-agent'
            })
        ],

        // Pre-inference processing
        preInferenceProcessors: [
            new ChatCompressionModifier({ enableCompression: true })
        ],

        // Post-inference processing
        postInferenceProcessors: [],

        // Pre-tool-call processing (replaces tool validation)
        preToolCallProcessors: [
            new ToolValidationModifier({ strictMode: false })
        ],

        // Post-tool-call processing
        postToolCallProcessors: []
    },
    enableLogging: true
});

// Create user message
const userMessage: FlatUserMessage = {
    content: 'What is 2 + 2?',
    id: 'msg-1',
    threadId: 'calc-thread-1',  // Replaces conversation key
    mentionedMCPs: [],          // MCPs automatically injected
    mentionedFiles: []          // Files automatically processed
};

// Execute (chat history automatically loaded via ChatHistoryMessageModifier)
const result = await agent.processMessage(userMessage);

if (result.success) {
    console.log(result.result);
}
// Conversation automatically recorded via ChatRecordingModifier
```

### Old Composable Pattern: With CodeBolt Integration

```typescript
import { ComposableAgent, saveUserMessage } from './composablepattern';
import codebolt from '@anthropic/codeboltjs';

codebolt.onMessage(async (reqMessage) => {
    // Save user context globally
    saveUserMessage(reqMessage);

    const agent = new ComposableAgent({
        name: 'Handler',
        instructions: 'You are a helpful assistant.',
        model: 'gpt-4o-mini',
        processing: {
            processMentionedMCPs: true,
            processMentionedFiles: true,
            processMentionedAgents: true
        }
    });

    // Uses global user context
    const result = await agent.run();

    await codebolt.chat.sendMessage(result.message, reqMessage.id);
});
```

### New Unified Library: With CodeBolt Integration

```typescript
import { CodeboltAgent } from '@codebolt/agent/unified';
import {
    ChatHistoryMessageModifier,
    EnvironmentContextModifier,
    DirectoryContextModifier,
    IdeContextModifier,
    CoreSystemPromptModifier,
    ToolInjectionModifier,
    AtFileProcessorModifier
} from '@codebolt/agent/processor-pieces';
import codebolt from '@anthropic/codeboltjs';

codebolt.onMessage(async (reqMessage) => {
    const agent = new CodeboltAgent({
        instructions: 'You are a helpful assistant.',

        processors: {
            messageModifiers: [
                new ChatHistoryMessageModifier({ enableChatHistory: true }),
                new EnvironmentContextModifier({ enableFullContext: false }),
                new DirectoryContextModifier({}),
                new IdeContextModifier({
                    includeActiveFile: true,
                    includeOpenFiles: true
                }),
                new CoreSystemPromptModifier({
                    customSystemPrompt: 'You are a helpful assistant.'
                }),
                new ToolInjectionModifier({    // Replaces processMentionedMCPs
                    toolsLocation: 'Tool',
                    giveToolExamples: true
                }),
                new AtFileProcessorModifier({}) // Replaces processMentionedFiles
            ]
        },
        enableLogging: true
    });

    // Pass message directly (no global context needed)
    const result = await agent.processMessage(reqMessage);

    if (result.success) {
        await codebolt.chat.sendMessage(result.result, reqMessage.id);
    }
});
```

### Old Composable Pattern: Workflow

```typescript
import {
    createWorkflow,
    createAgentStep,
    createTransformStep,
    createConditionalStep,
    ComposableAgent
} from './composablepattern';

const researchAgent = new ComposableAgent({
    name: 'Researcher',
    instructions: 'Research topics thoroughly.',
    model: 'gpt-4o-mini'
});

const writerAgent = new ComposableAgent({
    name: 'Writer',
    instructions: 'Write clear content.',
    model: 'gpt-4o-mini'
});

const workflow = createWorkflow({
    name: 'Content Pipeline',
    steps: [
        createAgentStep({
            id: 'research',
            name: 'Research Topic',
            agent: researchAgent,
            messageTemplate: 'Research this topic: {{topic}}',
            outputKey: 'researchResults'
        }),

        createTransformStep({
            id: 'format',
            name: 'Format Results',
            transform: (ctx) => ({
                formattedResearch: `Research Summary:\n${ctx.data.researchResults}`
            })
        }),

        createConditionalStep({
            id: 'review',
            name: 'Conditional Review',
            condition: (ctx) => ctx.data.researchResults.length > 500,
            trueSteps: [
                createAgentStep({
                    id: 'summarize',
                    name: 'Summarize',
                    agent: writerAgent,
                    messageTemplate: 'Summarize: {{formattedResearch}}'
                })
            ],
            falseSteps: []
        }),

        createAgentStep({
            id: 'write',
            name: 'Write Content',
            agent: writerAgent,
            messageTemplate: 'Write article based on: {{formattedResearch}}',
            outputKey: 'finalArticle'
        })
    ],
    initialContext: {
        topic: 'AI in Healthcare'
    }
});

const result = await workflow.execute();
console.log(result.data.finalArticle);
```

### New Unified Library: Workflow

```typescript
import { Workflow } from '@codebolt/agent/unified';
import { CodeboltAgent } from '@codebolt/agent/unified';
import {
    CoreSystemPromptModifier,
    ToolInjectionModifier
} from '@codebolt/agent/processor-pieces';
import type { FlatUserMessage } from '@codebolt/types/sdk';

// Create agents
const researchAgent = new CodeboltAgent({
    instructions: 'Research topics thoroughly.',
    processors: {
        messageModifiers: [
            new CoreSystemPromptModifier({
                customSystemPrompt: 'You are a thorough researcher.'
            }),
            new ToolInjectionModifier({ toolsLocation: 'Tool' })
        ]
    }
});

const writerAgent = new CodeboltAgent({
    instructions: 'Write clear content.',
    processors: {
        messageModifiers: [
            new CoreSystemPromptModifier({
                customSystemPrompt: 'You are a clear and concise writer.'
            }),
            new ToolInjectionModifier({ toolsLocation: 'Tool' })
        ]
    }
});

// Create workflow with steps
const workflow = new Workflow({
    name: 'Content Pipeline',
    steps: [
        {
            id: 'research',
            name: 'Research Topic',
            execute: async (context) => {
                const message: FlatUserMessage = {
                    content: `Research this topic: ${context.data.topic}`,
                    id: 'research-msg',
                    threadId: 'workflow-thread'
                };
                const result = await researchAgent.processMessage(message);
                return {
                    success: result.success,
                    output: { researchResults: result.result }
                };
            }
        },

        {
            id: 'format',
            name: 'Format Results',
            execute: async (context) => {
                return {
                    success: true,
                    output: {
                        formattedResearch: `Research Summary:\n${context.data.researchResults}`
                    }
                };
            }
        },

        {
            id: 'review',
            name: 'Conditional Review',
            condition: (ctx) => ctx.data.researchResults?.length > 500,
            execute: async (context) => {
                const message: FlatUserMessage = {
                    content: `Summarize: ${context.data.formattedResearch}`,
                    id: 'summarize-msg',
                    threadId: 'workflow-thread'
                };
                const result = await writerAgent.processMessage(message);
                return {
                    success: result.success,
                    output: { summary: result.result }
                };
            }
        },

        {
            id: 'write',
            name: 'Write Content',
            execute: async (context) => {
                const message: FlatUserMessage = {
                    content: `Write article based on: ${context.data.formattedResearch}`,
                    id: 'write-msg',
                    threadId: 'workflow-thread'
                };
                const result = await writerAgent.processMessage(message);
                return {
                    success: result.success,
                    output: { finalArticle: result.result }
                };
            }
        }
    ],
    initialContext: {
        topic: 'AI in Healthcare'
    }
});

const result = await workflow.execute();
console.log(result.context.data.finalArticle);
```

### Old Composable Pattern: Custom Tool with Zod

```typescript
import { createTool, ComposableAgent } from './composablepattern';
import { z } from 'zod';

const weatherTool = createTool({
    id: 'get_weather',
    description: 'Get current weather for a location',
    inputSchema: z.object({
        location: z.string().describe('City name'),
        units: z.enum(['celsius', 'fahrenheit']).default('celsius')
    }),
    outputSchema: z.object({
        temperature: z.number(),
        condition: z.string(),
        humidity: z.number()
    }),
    execute: async ({ context }) => {
        // Fetch weather data
        const data = await fetchWeather(context.location, context.units);
        return {
            temperature: data.temp,
            condition: data.condition,
            humidity: data.humidity
        };
    }
});

const agent = new ComposableAgent({
    name: 'Weather Bot',
    instructions: 'Help users with weather information.',
    model: 'gpt-4o-mini',
    tools: { get_weather: weatherTool }
});
```

### New Unified Library: Custom Tool via MCP

```typescript
// In new pattern, tools are defined as MCP servers or via the tool system
// Register your tool as an MCP tool that the agent can use

// Option 1: Define as MCP tool (recommended)
// Create an MCP server that exposes the weather tool

// Option 2: Use ToolValidationModifier for validation
import { CodeboltAgent } from '@codebolt/agent/unified';
import {
    CoreSystemPromptModifier,
    ToolInjectionModifier,
    ToolValidationModifier
} from '@codebolt/agent/processor-pieces';
import { z } from 'zod';

// Define validation rules for the tool
const weatherValidationRules = [
    {
        toolName: 'get_weather',
        inputSchema: z.object({
            location: z.string(),
            units: z.enum(['celsius', 'fahrenheit']).default('celsius')
        }),
        validateInput: (input: any) => {
            return input.location && typeof input.location === 'string';
        }
    }
];

const agent = new CodeboltAgent({
    instructions: 'Help users with weather information.',
    processors: {
        messageModifiers: [
            new CoreSystemPromptModifier({
                customSystemPrompt: 'You are a weather assistant.'
            }),
            new ToolInjectionModifier({
                toolsLocation: 'Tool',
                giveToolExamples: true
            })
        ],
        preToolCallProcessors: [
            new ToolValidationModifier({
                validationRules: weatherValidationRules,
                strictMode: true
            })
        ]
    }
});
```

---

## Key Architectural Differences

| Aspect | Composable Pattern | New Unified Library |
|--------|-------------------|---------------------|
| **Philosophy** | Functional composition | Processor pipeline |
| **Agent Creation** | `createAgent(config)` | `new CodeboltAgent(config)` |
| **Tool Definition** | `createTool()` with Zod | MCP tools + `ToolValidationModifier` |
| **Memory** | Separate `Memory` class | `ChatHistoryMessageModifier` + `ChatRecordingModifier` |
| **User Context** | Global singleton | Passed via `FlatUserMessage` |
| **Processing Config** | `config.processing` object | Individual message modifiers |
| **File Processing** | `MDocument` class | `AtFileProcessorModifier` |
| **Tool Execution** | Direct in agent | Via `ResponseExecutor` |
| **Conversation** | Manual save/load | Automatic via modifiers |
| **Extensibility** | Factory functions | Base classes to extend |
| **Validation** | Zod schemas in tools | `ToolValidationModifier` |

---

## Processing Configuration Mapping

| Composable `processing` Option | New Unified Modifier |
|-------------------------------|---------------------|
| `processMentionedMCPs: true` | `ToolInjectionModifier` |
| `processRemixPrompt: true` | `CoreSystemPromptModifier` with custom prompt |
| `processMentionedFiles: true` | `AtFileProcessorModifier` |
| `processMentionedAgents: true` | `ToolInjectionModifier` with agents |
| `fileContentProcessor` | `AtFileProcessorModifier` options |
| `mcpToolProcessor` | `ToolInjectionModifier` options |

---

## Summary

**All core functionality is available** in the new unified library:

1. **Agent execution** - `CodeboltAgent.processMessage()` replaces `ComposableAgent.execute()`
2. **Tool system** - MCP tools + `ToolValidationModifier` replace `createTool()`
3. **Workflows** - `Workflow` class available with similar step-based execution
4. **Memory/Storage** - `ChatHistoryMessageModifier` + `ChatRecordingModifier` replace `Memory` class
5. **User context** - Passed directly via `FlatUserMessage` instead of global singleton
6. **Processing configuration** - Individual modifiers replace processing config object

The only missing pieces are:
1. **Document chunking strategies** - Implement as custom modifier if needed
2. **Embeddings support** - Not built-in, use external libraries

The new library provides **significantly more functionality** through:
- Pre/post inference processing
- Pre/post tool-call processing
- Loop detection
- Chat compression
- IDE context integration
- Environment context
- Directory tree context
