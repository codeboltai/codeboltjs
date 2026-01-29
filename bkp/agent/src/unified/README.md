# Unified Agent Framework

The Unified Agent Framework provides a comprehensive, modular approach to building AI agents that combines the best aspects of different architectural patterns from the existing codebase.

## Overview

This framework unifies:
- **Message Modification** using the processor pattern from `BaseMessageModifier`
- **Agent Step Execution** with LLM integration from `LLMAgentStep`
- **Response Execution** combining tool handling from `LLMOutputHandler` and conversation management from `FollowUpPromptBuilder`

## Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────────┐
│ Message         │    │ Agent Step       │    │ Response            │
│ Modifier        │───▶│ Executor         │───▶│ Executor            │
│                 │    │                  │    │                     │
│ - Processors    │    │ - LLM Integration│    │ - Tool Execution    │
│ - Context Mgmt  │    │ - Tool Analysis  │    │ - Conversation Mgmt │
└─────────────────┘    └──────────────────┘    └─────────────────────┘
```

## Key Components

### 1. UnifiedMessageModifier
Processes and transforms input messages using the processor pattern:
- Applies multiple processors in sequence
- Manages context across processing steps
- Converts between different message formats
- Determines appropriate tool choice strategy

### 2. UnifiedAgentStep
Handles LLM interaction and tool call analysis:
- Generates LLM responses
- Analyzes messages for tool calls (LLM-based or heuristic)
- Determines when processing is complete
- Supports both mock and real LLM integration

### 3. UnifiedResponseExecutor
Manages tool execution and conversation flow:
- Executes tools from LLM responses with retry logic
- Handles conversation summarization when needed
- Manages follow-up conversation building with processor support
- Supports both MCP tools and subagent calls
- **NEW**: Follow-up conversation processors for enhanced conversation management

### 4. UnifiedAgent
Main orchestrator that combines all components:
- Provides single-step and loop execution modes
- Manages event emission for monitoring
- Supports configuration updates
- Handles error recovery

## Follow-Up Conversation Processors

The `UnifiedResponseExecutor` now supports processors that run during the follow-up conversation building phase. These processors can:

- **Compact conversations** when they become too long
- **Enhance tool results** with better formatting and context
- **Add follow-up prompts** to guide continued interaction
- **Maintain conversation continuity** by linking related messages
- **Detect and fill conversation gaps**

### Available Follow-Up Processors

1. **ConversationCompactorProcessor** - Compacts long conversations using summarization, smart removal, or truncation
2. **FollowUpConversationProcessor** - Enhances conversations with prompts, tool result formatting, and contextual hints
3. **ConversationContinuityProcessor** - Maintains continuity by linking contexts and resolving references

### Using Follow-Up Processors

```typescript
import { 
    createUnifiedResponseExecutor,
    ConversationCompactorProcessor,
    FollowUpConversationProcessor 
} from './unified';

// Create processors
const compactorProcessor = new ConversationCompactorProcessor({
    maxConversationLength: 30,
    enableSummarization: true,
    enableSmartRemoval: true
});

const followUpProcessor = new FollowUpConversationProcessor({
    processingMode: 'guided',
    enableToolResultEnhancement: true,
    addFollowUpPrompts: true
});

// Create response executor with processors
const responseExecutor = createUnifiedResponseExecutor({
    codebolt,
    followUpConversationProcessors: [
        compactorProcessor,
        followUpProcessor
    ]
});

// Use with unified agent
const agent = createUnifiedAgent({ codebolt });
agent.setResponseExecutor(responseExecutor);
```

### Dynamic Processor Management

```typescript
// Add processors dynamically
responseExecutor.addFollowUpConversationProcessor(newProcessor);

// Remove processors
responseExecutor.removeFollowUpConversationProcessor(oldProcessor);

// Get active processors
const activeProcessors = responseExecutor.getFollowUpConversationProcessors();

// Clear all processors
responseExecutor.clearFollowUpConversationProcessors();
```

## Usage Examples

### Basic Usage

```typescript
import { createBasicUnifiedAgent } from './unified';

const agent = createBasicUnifiedAgent(codebolt);

const result = await agent.execute({
    userMessage: "Read the file config.json and summarize its contents",
    tools: availableTools
});

console.log(result.response);
```

### Advanced Usage

```typescript
import { 
    createUnifiedAgent, 
    createUnifiedMessageModifier,
    UnifiedAgentConfig 
} from './unified';

const config: UnifiedAgentConfig = {
    maxIterations: 15,
    maxConversationLength: 100,
    llmConfig: {
        llmname: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000
    },
    codebolt,
    enableLogging: true
};

const agent = createUnifiedAgent(config);

// Add custom message modifier with processors
const messageModifier = createUnifiedMessageModifier({
    processors: [customProcessor1, customProcessor2],
    enableLogging: true
});
agent.addMessageModifier(messageModifier);

// Execute with loop until completion
const result = await agent.loop({
    userMessage: "Complex multi-step task",
    tools: availableTools,
    maxIterations: 20
});
```

### Event Handling

```typescript
agent.addEventListener('tool_execution_started', (event) => {
    console.log('Tool execution started:', event.data);
});

agent.addEventListener('agent_completed', (event) => {
    console.log('Agent completed:', event.data.output);
});

agent.addEventListener('agent_error', (event) => {
    console.error('Agent error:', event.data.error);
});
```

### Custom Components with Follow-Up Processors

```typescript
import { 
    createCustomAgent,
    UnifiedMessageModifierImpl,
    UnifiedAgentStepImpl,
    UnifiedResponseExecutorImpl,
    ConversationCompactorProcessor,
    FollowUpConversationProcessor
} from './unified';

const customMessageModifier = new UnifiedMessageModifierImpl({
    processors: [myCustomProcessor],
    enableLogging: true
});

const customAgentStep = new UnifiedAgentStepImpl({
    llmConfig: { llmname: 'custom-llm' },
    codebolt,
    enableLogging: true
});

// Create response executor with follow-up processors
const customResponseExecutor = new UnifiedResponseExecutorImpl({
    codebolt,
    maxConversationLength: 200,
    maxRetries: 5,
    followUpConversationProcessors: [
        new ConversationCompactorProcessor({ maxConversationLength: 50 }),
        new FollowUpConversationProcessor({ processingMode: 'guided' })
    ]
});

const agent = createCustomAgent({
    messageModifier: customMessageModifier,
    agentStep: customAgentStep,
    responseExecutor: customResponseExecutor,
    agentConfig: { maxIterations: 25 }
});
```

## Configuration Options

### UnifiedAgentConfig

```typescript
interface UnifiedAgentConfig {
    maxIterations?: number;              // Default: 10
    maxConversationLength?: number;      // Default: 50
    llmConfig?: LLMConfig;              // LLM configuration
    codebolt?: CodeboltAPI;             // Codebolt API instance
    enableLogging?: boolean;            // Default: true
    retryConfig?: {                     // Retry configuration
        maxRetries?: number;            // Default: 3
        retryDelay?: number;            // Default: 1000ms
    };
}
```

### Follow-Up Processor Configuration

#### ConversationCompactorProcessor Options

```typescript
interface ConversationCompactorProcessorOptions {
    maxConversationLength?: number;      // Default: 50
    compactionThreshold?: number;        // Default: 0.8 (80%)
    preserveRecentMessages?: number;     // Default: 10
    preserveSystemMessages?: boolean;    // Default: true
    preserveToolMessages?: boolean;      // Default: true
    enableSummarization?: boolean;       // Default: true
    enableSmartRemoval?: boolean;        // Default: true
    compressionRatio?: number;           // Default: 0.6 (60%)
}
```

#### FollowUpConversationProcessor Options

```typescript
interface FollowUpConversationProcessorOptions {
    addFollowUpPrompts?: boolean;        // Default: true
    enhanceToolResults?: boolean;        // Default: true
    addContextualHints?: boolean;        // Default: true
    processingMode?: 'automatic' | 'guided' | 'minimal';  // Default: 'automatic'
    maxFollowUpMessages?: number;        // Default: 3
    enableToolResultEnhancement?: boolean;  // Default: true
    enableConversationGuidance?: boolean;   // Default: true
}
```

#### ConversationContinuityProcessor Options

```typescript
interface ConversationContinuityProcessorOptions {
    enableContextLinking?: boolean;      // Default: true
    enableReferenceResolution?: boolean; // Default: true
    enableGapDetection?: boolean;        // Default: true
    maxContextLinks?: number;            // Default: 5
    contextLookbackWindow?: number;      // Default: 20
    enableProactiveContext?: boolean;    // Default: true
}
```

### LLMConfig

```typescript
interface LLMConfig {
    llmname?: string;                   // LLM service name
    model?: string;                     // Model name
    temperature?: number;               // Response randomness (0-2)
    maxTokens?: number;                 // Maximum tokens to generate
    apiKey?: string;                    // API key for LLM service
    baseUrl?: string;                   // Base URL for LLM service
}
```

## Event Types

The framework emits various events for monitoring and debugging:

- `message_processed` - Message processing completed
- `step_started` - Agent step started
- `step_completed` - Agent step completed
- `tool_call_detected` - Tool calls detected in LLM response
- `tool_execution_started` - Tool execution started
- `tool_execution_completed` - Tool execution completed
- `response_generated` - Response generated
- `conversation_summarized` - Conversation was summarized
- `agent_completed` - Agent execution completed
- `agent_error` - Error occurred during execution
- `iteration_started` - Loop iteration started
- `iteration_completed` - Loop iteration completed

## Error Handling

The framework provides specific error types for different failure scenarios:

- `UnifiedAgentError` - Base error class
- `UnifiedMessageProcessingError` - Message processing failures
- `UnifiedStepExecutionError` - Agent step execution failures
- `UnifiedResponseExecutionError` - Response execution failures
- `UnifiedToolExecutionError` - Tool execution failures

## Utility Functions

### Quick Agent Creation

```typescript
import { createQuickAgent } from './unified/utils';

const response = await createQuickAgent({
    userMessage: "Simple task",
    tools: availableTools,
    codebolt
});
```

### Development Agent

```typescript
import { createDevelopmentAgent } from './unified/utils';

const devAgent = createDevelopmentAgent(codebolt);
// Includes verbose logging and development event handlers
```

### Configuration Validation

```typescript
import { validateAgentConfig } from './unified/utils';

const validation = validateAgentConfig(myConfig);
if (!validation.valid) {
    console.error('Config errors:', validation.errors);
}
```

### Performance Benchmarking

```typescript
import { benchmarkAgent } from './unified/utils';

const benchmark = await benchmarkAgent(agent, testCases);
console.log('Performance summary:', benchmark.summary);
```

## Integration with Existing Patterns

The unified framework is designed to work alongside existing patterns:

### With Processor Pattern
```typescript
import { BaseProcessor } from '@codebolt/agent/unified';

class MyCustomProcessor extends BaseProcessor {
    async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
        // Custom processing logic
        return [{ type: 'ProcessedMessage', value: processedMessage }];
    }
}

const messageModifier = createUnifiedMessageModifier({
    processors: [new MyCustomProcessor()]
});
```

### With Builder Pattern
```typescript
// The unified framework can be used alongside existing builders
const agent = createUnifiedAgent(config);
const builderResult = await someExistingBuilder.build();

// Combine results as needed
const finalResult = await agent.execute({
    userMessage: builderResult.message,
    tools: builderResult.tools
});
```

## Best Practices

1. **Use appropriate factory functions** - Start with `createBasicUnifiedAgent` for simple use cases
2. **Configure logging appropriately** - Enable in development, disable in production
3. **Set reasonable iteration limits** - Prevent infinite loops while allowing complex tasks
4. **Handle events for monitoring** - Use event handlers to track agent behavior
5. **Validate configurations** - Use `validateAgentConfig` to catch configuration issues early
6. **Use custom processors wisely** - Add processors for specific message transformation needs
7. **Monitor conversation length** - Set appropriate `maxConversationLength` to manage memory usage

## Migration from Existing Patterns

### From BaseMessageModifier + RequestMessage
```typescript
// Old approach
const modifier = new BaseMessageModifier(options);
const requestMessage = new RequestMessage({ messageModifiers: [modifier] });

// New unified approach
const messageModifier = createUnifiedMessageModifier({
    processors: [customProcessor],
    context: options.context
});
const agent = createUnifiedAgent({ /* config */ });
agent.addMessageModifier(messageModifier);
```

### From LLMAgentStep
```typescript
// Old approach
const agentStep = new LLMAgentStep(options);
const result = await agentStep.generateOneStep(input);

// New unified approach
const agent = createUnifiedAgent({
    llmConfig: options.llmconfig,
    codebolt: options.codebolt
});
const result = await agent.step(input);
```

### From LLMOutputHandler + FollowUpPromptBuilder
```typescript
// Old approach
const outputHandler = new LLMOutputHandler(llmResponse, codebolt);
const toolResults = await outputHandler.runTools();
const followUpBuilder = new FollowUpPromptBuilder(codebolt);
const nextPrompt = await followUpBuilder.addPreviousConversation(prompt, llmResponse)
    .addToolResult(toolResults)
    .build();

// New unified approach
const agent = createUnifiedAgent({ codebolt });
const result = await agent.execute({
    userMessage: originalMessage,
    tools: availableTools,
    conversationHistory: previousConversation
});
// All tool execution and conversation management handled automatically
```

## Contributing

When extending the unified framework:

1. Follow the existing interface patterns
2. Add appropriate error handling with specific error types
3. Include comprehensive logging for debugging
4. Write tests for new components
5. Update documentation with examples
6. Consider backward compatibility with existing patterns

## High-Level Agent Class

The `Agent` class provides a simplified interface to the unified framework, making it easy to create and use agents without dealing with the underlying complexity.

### Basic Usage

```typescript
import { Agent, createAgent, createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

// Create a simple tool
const calculatorTool = createTool({
  id: 'calculator',
  name: 'Calculator',
  description: 'Performs mathematical calculations',
  inputSchema: z.object({
    expression: z.string().describe('Mathematical expression')
  }),
  execute: async ({ input }) => {
    const result = eval(input.expression); // Use a proper parser in production
    return { result, expression: input.expression };
  }
});

// Create agent with default processors
const agent = createAgent({
  name: 'Math Assistant',
  instructions: 'You are a helpful math assistant.',
  model: 'gpt-4',
  tools: [calculatorTool],
  defaultProcessors: true // Enables conversation management, validation, etc.
});

// Execute tasks
const result = await agent.execute('Calculate 15 * 8 + 32');
console.log(result.message);
```

### Advanced Configuration

```typescript
import {
  ConversationCompactorProcessor,
  ToolValidationProcessor,
  LocalToolInterceptorProcessor
} from '@codebolt/agent/unified';

const agent = createAgent({
  name: 'Advanced Agent',
  instructions: 'You are an advanced assistant.',
  model: 'gpt-4',
  tools: [/* your tools */],
  processors: {
    followUpConversation: [
      new ConversationCompactorProcessor({
        maxConversationLength: 30,
        enableSummarization: true
      })
    ],
    preToolCall: [
      new ToolValidationProcessor({
        enableSecurityValidation: true,
        strictMode: true
      }),
      new LocalToolInterceptorProcessor({
        enableCustomToolHandling: true
      })
    ]
  },
  maxIterations: 10,
  enableLogging: true
});
```

### Dynamic Management

```typescript
// Add tools dynamically
const newTool = createTool({ /* tool config */ });
agent.addTool(newTool);

// Add processors dynamically
const validator = new ToolValidationProcessor({ /* config */ });
agent.addProcessor('preToolCall', validator);

// Execute with different modes
const stepResult = await agent.step('Single step execution');
const loopResult = await agent.loop('Execute until completion');
const basicResult = await agent.execute('Basic execution');
```

## Tool Creation

The framework provides multiple ways to create tools with full type safety and validation.

### Basic Tool Creation

```typescript
import { createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

const weatherTool = createTool({
  id: 'get_weather',
  name: 'Weather Tool',
  description: 'Gets weather information',
  inputSchema: z.object({
    location: z.string().describe('City name'),
    units: z.enum(['celsius', 'fahrenheit']).optional()
  }),
  outputSchema: z.object({
    temperature: z.number(),
    condition: z.string(),
    humidity: z.number()
  }),
  execute: async ({ input, context, agent }) => {
    // Tool implementation
    return {
      temperature: 22,
      condition: 'Sunny',
      humidity: 65
    };
  },
  timeout: 30000,
  retries: 3
});
```

### Specialized Tool Creators

```typescript
import {
  createTextTool,
  createFileTool,
  createHttpTool,
  createValidationTool,
  createTransformTool
} from '@codebolt/agent/unified';

// Text processing tool
const textAnalyzer = createTextTool({
  id: 'analyze_text',
  name: 'Text Analyzer',
  description: 'Analyzes text content',
  execute: async (text) => {
    return `Analysis: ${text.length} characters, ${text.split(' ').length} words`;
  }
});

// File operation tool
const fileReader = createFileTool({
  id: 'read_file',
  name: 'File Reader',
  description: 'Reads file content',
  operation: 'read',
  execute: async (params) => {
    // File reading implementation
    return `Content of ${params.filePath}`;
  }
});

// HTTP request tool
const apiClient = createHttpTool({
  id: 'api_request',
  name: 'API Client',
  description: 'Makes HTTP requests',
  method: 'GET',
  defaultHeaders: { 'User-Agent': 'MyAgent/1.0' },
  execute: async ({ input }) => {
    // HTTP request implementation
    return { status: 200, data: 'Success' };
  }
});

// Validation tool
const userValidator = createValidationTool({
  id: 'validate_user',
  name: 'User Validator',
  description: 'Validates user data',
  schema: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    age: z.number().min(18)
  }),
  onValid: (data) => ({ ...data, id: generateId() }),
  onInvalid: (errors) => ({ errors, message: 'Validation failed' })
});

// Transformation tool
const dataTransformer = createTransformTool({
  id: 'transform_data',
  name: 'Data Transformer',
  description: 'Transforms data formats',
  inputSchema: z.object({
    data: z.any(),
    format: z.enum(['json', 'csv', 'xml'])
  }),
  transform: async (input) => {
    // Transformation logic
    return { transformed: true, format: input.format };
  }
});
```

### Tool Utilities

```typescript
import { toolsToOpenAIFormat, executeTool } from '@codebolt/agent/unified';

// Convert tools to OpenAI format
const openAITools = toolsToOpenAIFormat([weatherTool, textAnalyzer]);

// Execute tool with validation
const result = await executeTool(weatherTool, {
  location: 'New York',
  units: 'celsius'
}, { sessionId: '123' });
```

## Complete Example

```typescript
import {
  Agent,
  createAgent,
  createTool,
  createTextTool
} from '@codebolt/agent/unified';
import {
  ConversationCompactorProcessor,
  ToolValidationProcessor
} from '@codebolt/agent/unified';
import { z } from 'zod';

// Create tools
const calculator = createTool({
  id: 'calculator',
  name: 'Calculator',
  description: 'Mathematical calculations',
  inputSchema: z.object({
    expression: z.string()
  }),
  execute: async ({ input }) => {
    const result = eval(input.expression);
    return { result, expression: input.expression };
  }
});

const textProcessor = createTextTool({
  id: 'text_processor',
  name: 'Text Processor',
  description: 'Text analysis and processing',
  execute: async (text) => {
    return `Processed: ${text} (${text.length} chars)`;
  }
});

// Create agent
const agent = createAgent({
  name: 'Multi-Tool Assistant',
  instructions: `You are a helpful assistant that can perform calculations and process text.
  Use the appropriate tools for each task.`,
  model: 'gpt-4',
  tools: [calculator, textProcessor],
  processors: {
    followUpConversation: [
      new ConversationCompactorProcessor({
        maxConversationLength: 20,
        enableSummarization: true
      })
    ],
    preToolCall: [
      new ToolValidationProcessor({
        enableParameterValidation: true,
        enableSecurityValidation: true
      })
    ]
  },
  maxIterations: 8,
  enableLogging: true,
  defaultProcessors: true
});

// Use the agent
async function main() {
  // Single execution
  const result1 = await agent.execute('Calculate 25 * 4 and process the text "Hello World"');
  console.log('Result:', result1.message);
  
  // Loop execution (continues until completion)
  const result2 = await agent.loop('Solve this step by step: (10 + 5) * 3 - 8');
  console.log('Loop result:', result2.message);
  
  // Step execution (single step)
  const result3 = await agent.step('What is 2 + 2?');
  console.log('Step result:', result3.message);
  
  // Dynamic tool addition
  const newTool = createTool({
    id: 'random_number',
    name: 'Random Number Generator',
    description: 'Generates random numbers',
    inputSchema: z.object({
      min: z.number(),
      max: z.number()
    }),
    execute: async ({ input }) => {
      const random = Math.floor(Math.random() * (input.max - input.min + 1)) + input.min;
      return { number: random, range: `${input.min}-${input.max}` };
    }
  });
  
  agent.addTool(newTool);
  
  const result4 = await agent.execute('Generate a random number between 1 and 100');
  console.log('With new tool:', result4.message);
}

main().catch(console.error);
```

This high-level interface makes it easy to create powerful agents while still providing access to the full flexibility of the unified framework when needed.
