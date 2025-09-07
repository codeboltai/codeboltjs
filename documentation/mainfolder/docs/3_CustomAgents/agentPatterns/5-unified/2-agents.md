# Agents

Agents are the primary interface for building intelligent AI systems. They handle conversation management, tool execution, and complex reasoning.

## Creating Agents

```typescript
import { createAgent } from '@codebolt/agent/unified';

const agent = createAgent({
  name: 'Customer Support Agent',
  instructions: 'You are a helpful customer support representative.',
  description: 'Handles customer inquiries and support requests',
  
  // Tools the agent can use
  tools: [searchTool, ticketTool, emailTool],
  
  // Configuration options
  maxIterations: 10,
  maxConversationLength: 50,
  enableLogging: true,
  
  // LLM configuration
  llmConfig: {
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000
  },
  
  // Custom processors
  processors: {
    followUpConversation: [new ConversationCompactorProcessor()],
    preToolCall: [new ToolValidationProcessor()]
  }
});
```

## Agent Execution

```typescript
// Simple execution
const result = await agent.execute('Help me with my order #12345');

// Advanced execution with options
const result = await agent.execute('Complex query', {
  maxIterations: 5,
  includeHistory: true,
  context: { userId: '123', sessionId: 'abc' }
});

console.log({
  success: result.success,
  response: result.response,
  iterations: result.iterations,
  toolsUsed: result.toolResults?.length || 0
});
```

## Agent as a Tool

Agents can be converted to tools for use by other agents or orchestrators:

```typescript
// Convert agent to tool
const agentTool = agent.toTool();

// Use in another agent
const supervisorAgent = createAgent({
  name: 'Supervisor',
  instructions: 'You coordinate multiple specialist agents.',
  tools: [agentTool]
});

// OpenAI-compatible tool format
const openAITool = agent.toOpenAITool();
```

## Managing Agent Tools

```typescript
// Add tools dynamically
agent.addTool(newTool);

// Remove tools
agent.removeTool('tool-id');

// List tools
const tools = agent.listTools();

// Clear all tools
agent.clearTools();
```

## Agent Workflows

Agents can execute workflows:

```typescript
// Add workflow to agent
agent.addWorkflow('research-pipeline', researchWorkflow);

// Execute workflow
const result = await agent.executeWorkflow('research-pipeline', {
  topic: 'AI trends',
  depth: 'comprehensive'
});

// List workflows
const workflows = agent.listWorkflows();
```

## Agent Configuration Options

### Basic Configuration

```typescript
const agent = createAgent({
  name: 'My Agent',                    // Required: Agent name
  instructions: 'You are helpful.',    // Required: System instructions
  description: 'Agent description',    // Optional: Agent description
  
  // Execution limits
  maxIterations: 10,                   // Max tool execution iterations
  maxConversationLength: 50,           // Max conversation history length
  
  // Logging and debugging
  enableLogging: true,                 // Enable console logging
  logLevel: 'info',                    // Log level: 'debug', 'info', 'warn', 'error'
  
  // Default processors
  defaultProcessors: true,             // Use sensible default processors
});
```

### LLM Configuration

```typescript
const agent = createAgent({
  name: 'Configured Agent',
  instructions: 'You are a helpful assistant.',
  
  llmConfig: {
    model: 'gpt-4-turbo',              // LLM model to use
    temperature: 0.7,                  // Response creativity (0-1)
    maxTokens: 4000,                   // Maximum response tokens
    topP: 0.9,                         // Nucleus sampling parameter
    frequencyPenalty: 0.0,             // Frequency penalty (-2 to 2)
    presencePenalty: 0.0,              // Presence penalty (-2 to 2)
    stopSequences: ['END'],            // Stop generation at these sequences
    
    // Advanced options
    stream: false,                     // Enable streaming responses
    timeout: 30000,                    // Request timeout in milliseconds
    retries: 3,                        // Number of retry attempts
  }
});
```

### Processor Configuration

```typescript
import {
  ConversationCompactorProcessor,
  ToolValidationProcessor,
  TelemetryProcessor
} from '@codebolt/agent/unified';

const agent = createAgent({
  name: 'Enhanced Agent',
  instructions: 'You are an enhanced agent.',
  
  processors: {
    // Follow-up conversation processors
    followUpConversation: [
      new ConversationCompactorProcessor({
        maxConversationLength: 30,
        compactionThreshold: 0.8
      }),
      new TelemetryProcessor({
        enableMetrics: true
      })
    ],
    
    // Pre-tool call processors
    preToolCall: [
      new ToolValidationProcessor({
        strictMode: true,
        enableInputValidation: true
      })
    ]
  }
});
```

## Advanced Agent Features

### Context Management

```typescript
// Execute with context
const result = await agent.execute('Query', {
  context: {
    userId: 'user123',
    sessionId: 'session456',
    preferences: {
      language: 'en',
      timezone: 'UTC'
    },
    customData: {
      department: 'support',
      priority: 'high'
    }
  }
});

// Access context in tools
const contextAwareTool = createTool({
  id: 'context-tool',
  name: 'Context Aware Tool',
  execute: async ({ input, context }) => {
    const userId = context?.userId;
    const preferences = context?.preferences;
    
    return {
      message: `Hello user ${userId}`,
      language: preferences?.language || 'en'
    };
  }
});
```

### Error Handling

```typescript
const result = await agent.execute('User message');

if (!result.success) {
  console.error('Agent failed:', result.error);
  
  // Check specific error types
  if (result.error?.includes('timeout')) {
    // Handle timeout
  } else if (result.error?.includes('validation')) {
    // Handle validation error
  }
}

// Access detailed execution info
console.log({
  iterations: result.iterations,
  conversationHistory: result.conversationHistory,
  toolResults: result.toolResults,
  executionTime: result.executionTime
});
```

### Conversation History

```typescript
// Get conversation history
const history = agent.getConversationHistory();

// Clear conversation history
agent.clearConversationHistory();

// Execute with history included
const result = await agent.execute('Follow-up question', {
  includeHistory: true
});

// Manage conversation length
const agent = createAgent({
  name: 'History Manager',
  maxConversationLength: 20,  // Keep last 20 messages
  processors: {
    followUpConversation: [
      new ConversationCompactorProcessor({
        maxConversationLength: 20,
        preserveRecentMessages: 5  // Always keep last 5 messages
      })
    ]
  }
});
```

## Agent Patterns

### Specialist Agents

```typescript
// Create domain-specific agents
const researchAgent = createAgent({
  name: 'Research Specialist',
  instructions: 'You are an expert researcher with access to academic databases and web search.',
  tools: [webSearchTool, academicSearchTool, citationTool],
  llmConfig: {
    temperature: 0.3,  // Lower temperature for factual accuracy
    maxTokens: 3000
  }
});

const analysisAgent = createAgent({
  name: 'Data Analyst',
  instructions: 'You are a data analysis expert specializing in statistical analysis and visualization.',
  tools: [dataAnalysisTool, chartTool, statisticsTool],
  llmConfig: {
    temperature: 0.2,  // Very low temperature for analytical work
    maxTokens: 2500
  }
});

const creativeAgent = createAgent({
  name: 'Creative Writer',
  instructions: 'You are a creative writing expert specializing in storytelling and content creation.',
  tools: [grammarTool, thesaurusTool, styleGuideTool],
  llmConfig: {
    temperature: 0.8,  // Higher temperature for creativity
    maxTokens: 4000
  }
});
```

### Supervisor Agents

```typescript
// Create a supervisor that coordinates specialist agents
const supervisorAgent = createAgent({
  name: 'Task Supervisor',
  instructions: `You are a supervisor that coordinates specialist agents:
  
  - For research tasks, use the research specialist
  - For data analysis, use the data analyst  
  - For creative writing, use the creative writer
  - For complex tasks, coordinate multiple specialists`,
  
  tools: [
    researchAgent.toTool(),
    analysisAgent.toTool(),
    creativeAgent.toTool()
  ]
});

// Use supervisor for complex tasks
const result = await supervisorAgent.execute(
  'Research AI trends, analyze the data, and write a creative summary report'
);
```

### Multi-Modal Agents

```typescript
import { ImageAttachmentMessageModifier } from '@codebolt/agent/unified';

const multiModalAgent = createAgent({
  name: 'Multi-Modal Assistant',
  instructions: 'You can process text, images, and other media types.',
  
  tools: [
    imageAnalysisTool,
    textExtractionTool,
    documentProcessingTool
  ],
  
  processors: {
    messageModifiers: [
      new ImageAttachmentMessageModifier({
        maxSize: 10 * 1024 * 1024,  // 10MB
        supportedFormats: ['jpg', 'png', 'pdf', 'docx']
      })
    ]
  }
});
```

## Agent Monitoring and Debugging

### Telemetry

```typescript
import { TelemetryProcessor } from '@codebolt/agent/unified';

const monitoredAgent = createAgent({
  name: 'Monitored Agent',
  instructions: 'You are a monitored agent.',
  
  processors: {
    followUpConversation: [
      new TelemetryProcessor({
        enableMetrics: true,
        enableTracing: true,
        metricsEndpoint: 'https://metrics.example.com',
        
        // Custom metrics
        customMetrics: {
          'agent.execution.duration': (context) => context.executionTime,
          'agent.tool.usage': (context) => context.toolResults?.length || 0,
          'agent.conversation.length': (context) => context.conversationHistory?.length || 0
        }
      })
    ]
  }
});
```

### Logging

```typescript
import { ChatRecordingProcessor } from '@codebolt/agent/unified';

const debugAgent = createAgent({
  name: 'Debug Agent',
  instructions: 'You are a debug agent.',
  enableLogging: true,
  logLevel: 'debug',
  
  processors: {
    followUpConversation: [
      new ChatRecordingProcessor({
        enableRecording: true,
        storageLocation: './agent-logs',
        includeMetadata: true,
        
        // Custom log format
        logFormat: 'json',
        includeTimestamps: true,
        includeContext: true
      })
    ]
  }
});
```

### Performance Monitoring

```typescript
import { 
  TokenManagementProcessor,
  ResponseValidationProcessor 
} from '@codebolt/agent/unified';

const optimizedAgent = createAgent({
  name: 'Optimized Agent',
  instructions: 'You are an optimized agent.',
  
  processors: {
    followUpConversation: [
      new TokenManagementProcessor({
        maxTokens: 3000,
        reserveTokens: 500,
        enableCompression: true,
        compressionRatio: 0.7
      }),
      
      new ResponseValidationProcessor({
        enableContentValidation: true,
        enableFormatValidation: true,
        maxResponseLength: 2000,
        
        customValidators: [
          (response) => ({
            isValid: response.length > 10,
            reason: response.length <= 10 ? 'Response too short' : undefined
          })
        ]
      })
    ]
  }
});
```
