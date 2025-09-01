# Processors

Processors are extensible components that customize and enhance the behavior of agents, workflows, and orchestrators. The framework includes a comprehensive set of built-in processors from the `@processor-pieces` library.

## Processor Categories

### 1. Message Processors
Modify and enhance messages before they're processed by agents.

#### HandleUrlMessageModifier
Automatically extracts content from URLs in messages.

```typescript
import { HandleUrlMessageModifier } from '@codebolt/agent/unified';

const urlModifier = new HandleUrlMessageModifier({
  extractContent: true,        // Extract webpage content
  includeMetadata: true,       // Include page metadata
  maxContentLength: 10000,     // Max content length to extract
  timeout: 30000,              // Request timeout
  userAgent: 'CodeboltAgent',  // Custom user agent
  followRedirects: true        // Follow HTTP redirects
});

const agent = createAgent({
  name: 'Web Assistant',
  instructions: 'You can process web content from URLs.',
  processors: {
    messageModifiers: [urlModifier]
  }
});

// Usage: Agent automatically processes URLs
await agent.execute('Summarize the content from https://example.com/article');
```

#### BaseContextMessageModifier
Adds contextual information to messages.

```typescript
import { BaseContextMessageModifier } from '@codebolt/agent/unified';

const contextModifier = new BaseContextMessageModifier({
  includeTimestamp: true,      // Add current timestamp
  includeUserInfo: true,       // Include user information
  includeSessionInfo: true,    // Include session details
  customContext: {             // Custom context data
    environment: 'production',
    version: '1.0.0'
  }
});

const agent = createAgent({
  name: 'Context-Aware Agent',
  processors: {
    messageModifiers: [contextModifier]
  }
});
```

#### WorkingDirectoryMessageModifier
Adds working directory context to messages.

```typescript
import { WorkingDirectoryMessageModifier } from '@codebolt/agent/unified';

const workdirModifier = new WorkingDirectoryMessageModifier({
  includePath: true,           // Include current working directory
  includeFileList: false,      // Include file listing (optional)
  maxFiles: 50,                // Max files to list
  excludePatterns: [           // Patterns to exclude
    'node_modules',
    '.git',
    '*.log'
  ]
});

const agent = createAgent({
  name: 'File System Agent',
  instructions: 'You help users with file system operations.',
  processors: {
    messageModifiers: [workdirModifier]
  }
});
```

#### BaseSystemInstructionMessageModifier
Enhances system instructions with additional context.

```typescript
import { BaseSystemInstructionMessageModifier } from '@codebolt/agent/unified';

const systemModifier = new BaseSystemInstructionMessageModifier({
  instructions: `Additional system context:
  - Current date: ${new Date().toISOString()}
  - Available tools: file operations, web search, calculations
  - Response format: Always provide clear, actionable responses`,
  
  appendToExisting: true,      // Append to existing instructions
  priority: 'high'             // Instruction priority
});
```

#### ImageAttachmentMessageModifier
Processes image attachments in messages.

```typescript
import { ImageAttachmentMessageModifier } from '@codebolt/agent/unified';

const imageModifier = new ImageAttachmentMessageModifier({
  maxSize: 10 * 1024 * 1024,   // 10MB max file size
  supportedFormats: [          // Supported image formats
    'jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'
  ],
  enableOCR: true,             // Enable text extraction from images
  enableAnalysis: true,        // Enable image analysis
  compressionQuality: 0.8      // Image compression quality
});

const multiModalAgent = createAgent({
  name: 'Multi-Modal Agent',
  instructions: 'You can analyze images and extract text from them.',
  processors: {
    messageModifiers: [imageModifier]
  }
});
```

#### AddToolsListMessageModifier
Adds available tools list to messages.

```typescript
import { AddToolsListMessageModifier } from '@codebolt/agent/unified';

const toolsModifier = new AddToolsListMessageModifier({
  includeDescriptions: true,   // Include tool descriptions
  formatAsMarkdown: true,      // Format as markdown
  groupByCategory: true,       // Group tools by category
  showOnlyRelevant: false,     // Show only relevant tools
  maxToolsToShow: 20          // Maximum tools to display
});

const agent = createAgent({
  name: 'Tool-Aware Agent',
  tools: [calculatorTool, weatherTool, fileReadTool],
  processors: {
    messageModifiers: [toolsModifier]
  }
});
```

### 2. Conversation Management Processors
Handle conversation flow, compression, and continuity.

#### ConversationCompactorProcessor
Compacts long conversations to stay within token limits.

```typescript
import { ConversationCompactorProcessor } from '@codebolt/agent/unified';

const compactorProcessor = new ConversationCompactorProcessor({
  maxConversationLength: 50,    // Max messages to keep
  compactionThreshold: 0.8,     // When to trigger compaction (80% of max)
  preserveRecentMessages: 10,   // Always keep last 10 messages
  enableSummarization: true,    // Summarize removed messages
  enableSmartRemoval: true,     // Intelligently remove less important messages
  
  // Advanced options
  priorityMessages: [           // Message types to prioritize
    'system', 'error', 'important'
  ],
  compressionRatio: 0.6,        // Target compression ratio
  semanticSimilarityThreshold: 0.8  // Remove similar messages
});

const agent = createAgent({
  name: 'Long Conversation Agent',
  maxConversationLength: 100,
  processors: {
    followUpConversation: [compactorProcessor]
  }
});
```

#### FollowUpConversationProcessor
Enhances follow-up conversations with context and suggestions.

```typescript
import { FollowUpConversationProcessor } from '@codebolt/agent/unified';

const followUpProcessor = new FollowUpConversationProcessor({
  enhanceToolResults: true,     // Enhance tool result presentation
  addGuidedPrompts: true,       // Add suggested follow-up questions
  includeContextualHints: true, // Include contextual hints
  maxSuggestions: 3,            // Max follow-up suggestions
  
  // Customization options
  suggestionTemplates: [        // Custom suggestion templates
    "Would you like me to {action} the {object}?",
    "Should I also {action}?",
    "Do you need help with {related_topic}?"
  ],
  contextWindow: 5,             // Messages to consider for context
  enablePersonalization: true   // Personalize based on user history
});

const agent = createAgent({
  name: 'Helpful Assistant',
  processors: {
    followUpConversation: [followUpProcessor]
  }
});
```

#### ConversationContinuityProcessor
Maintains conversation continuity and resolves references.

```typescript
import { ConversationContinuityProcessor } from '@codebolt/agent/unified';

const continuityProcessor = new ConversationContinuityProcessor({
  enableContextLinking: true,      // Link related conversation parts
  enableReferenceResolution: true, // Resolve pronouns and references
  enableGapDetection: true,        // Detect conversation gaps
  maxContextWindow: 20,            // Max messages for context
  
  // Reference resolution
  pronounResolution: true,         // Resolve "it", "this", "that"
  entityTracking: true,            // Track mentioned entities
  topicTracking: true,             // Track conversation topics
  
  // Gap detection
  timeGapThreshold: 300000,        // 5 minutes gap detection
  topicChangeThreshold: 0.7        // Topic change detection threshold
});

const agent = createAgent({
  name: 'Continuous Conversation Agent',
  processors: {
    followUpConversation: [continuityProcessor]
  }
});
```

#### ChatCompressionProcessor
Compresses chat history using various strategies.

```typescript
import { ChatCompressionProcessor } from '@codebolt/agent/unified';

const compressionProcessor = new ChatCompressionProcessor({
  compressionRatio: 0.6,           // Target compression ratio
  preserveImportantMessages: true, // Keep important messages
  useSemanticCompression: true,    // Use semantic similarity
  
  // Compression strategies
  strategies: [
    'remove_duplicates',    // Remove duplicate messages
    'summarize_blocks',     // Summarize message blocks
    'remove_filler',        // Remove filler words/messages
    'merge_similar'         // Merge semantically similar messages
  ],
  
  // Advanced options
  importanceThreshold: 0.7,        // Importance score threshold
  semanticSimilarityThreshold: 0.8, // Semantic similarity threshold
  maxCompressionPasses: 3          // Max compression iterations
});
```

### 3. Tool Execution Processors
Enhance and control tool execution behavior.

#### LocalToolInterceptorProcessor
Intercepts and handles custom local tools.

```typescript
import { LocalToolInterceptorProcessor } from '@codebolt/agent/unified';

const interceptorProcessor = new LocalToolInterceptorProcessor({
  localTools: new Map([
    ['calculator', {
      name: 'Local Calculator',
      description: 'Local math operations',
      execute: async (input) => {
        // Custom local implementation
        return { result: eval(input.expression) };
      }
    }],
    ['file-reader', {
      name: 'Local File Reader',
      description: 'Read files locally',
      execute: async (input) => {
        const fs = require('fs').promises;
        return { content: await fs.readFile(input.path, 'utf-8') };
      }
    }]
  ]),
  
  enableInterception: true,        // Enable tool interception
  fallbackToOriginal: true,        // Fallback to original if local fails
  interceptAll: false,             // Intercept all tools (not recommended)
  
  // Interception rules
  interceptRules: [
    {
      toolName: 'calculator',
      condition: (input) => input.expression.length < 100,
      priority: 'high'
    }
  ]
});

const agent = createAgent({
  name: 'Local Tool Agent',
  processors: {
    preToolCall: [interceptorProcessor]
  }
});
```

#### ToolValidationProcessor
Validates tool inputs and outputs.

```typescript
import { ToolValidationProcessor } from '@codebolt/agent/unified';

const validationProcessor = new ToolValidationProcessor({
  enableInputValidation: true,     // Validate tool inputs
  enableOutputValidation: true,    // Validate tool outputs
  strictMode: false,               // Strict validation mode
  
  // Custom validators
  customValidators: new Map([
    ['email-tool', {
      validateInput: (input) => ({
        isValid: /\S+@\S+\.\S+/.test(input.email),
        error: 'Invalid email format'
      }),
      validateOutput: (output) => ({
        isValid: output.success !== undefined,
        error: 'Missing success field'
      })
    }]
  ]),
  
  // Validation rules
  globalRules: [
    {
      rule: 'no_empty_strings',
      message: 'String inputs cannot be empty'
    },
    {
      rule: 'max_input_size',
      limit: 10000,
      message: 'Input too large'
    }
  ]
});

const agent = createAgent({
  name: 'Validated Agent',
  processors: {
    preToolCall: [validationProcessor]
  }
});
```

#### ToolParameterModifierProcessor
Modifies tool parameters before execution.

```typescript
import { ToolParameterModifierProcessor } from '@codebolt/agent/unified';

const parameterProcessor = new ToolParameterModifierProcessor({
  enableParameterTransformation: true, // Enable parameter transformation
  enableParameterEnrichment: true,     // Enable parameter enrichment
  
  // Parameter transformations
  transformations: [
    {
      toolName: 'search-tool',
      parameterName: 'query',
      transformation: (value) => `Enhanced: ${value}`,
      condition: (value) => value.length < 50
    },
    {
      toolName: 'file-tool',
      parameterName: 'path',
      transformation: (value) => path.resolve(value),
      description: 'Convert to absolute path'
    }
  ],
  
  // Parameter enrichment
  enrichments: [
    {
      toolName: 'api-tool',
      enrichWith: {
        timestamp: () => new Date().toISOString(),
        userAgent: 'CodeboltAgent/1.0'
      }
    }
  ],
  
  // Global transformations
  globalTransformations: {
    trim_strings: (value) => typeof value === 'string' ? value.trim() : value,
    normalize_paths: (value, paramName) => 
      paramName.includes('path') ? path.normalize(value) : value
  }
});
```

### 4. System Monitoring Processors
Monitor performance, detect issues, and collect telemetry.

#### LoopDetectionProcessor
Detects and prevents infinite loops in agent execution.

```typescript
import { LoopDetectionProcessor } from '@codebolt/agent/unified';

const loopDetector = new LoopDetectionProcessor({
  maxIterations: 10,               // Max allowed iterations
  detectionWindow: 5,              // Window size for loop detection
  similarityThreshold: 0.8,        // Similarity threshold for loop detection
  
  // Detection strategies
  enableTextSimilarity: true,      // Detect text similarity loops
  enableActionSimilarity: true,    // Detect action pattern loops
  enableOutputSimilarity: true,    // Detect output similarity loops
  
  // Response strategies
  onLoopDetected: 'stop',          // 'stop', 'warn', 'modify'
  loopBreakingStrategies: [
    'add_randomness',              // Add randomness to break loops
    'modify_prompt',               // Modify the prompt
    'change_temperature'           // Adjust LLM temperature
  ]
});

const agent = createAgent({
  name: 'Loop-Safe Agent',
  processors: {
    followUpConversation: [loopDetector]
  }
});
```

#### AdvancedLoopDetectionProcessor
Advanced loop detection with semantic analysis.

```typescript
import { AdvancedLoopDetectionProcessor } from '@codebolt/agent/unified';

const advancedLoopDetector = new AdvancedLoopDetectionProcessor({
  enableSemanticAnalysis: true,    // Use semantic similarity
  enablePatternDetection: true,    // Detect behavioral patterns
  maxLoopLength: 5,                // Max loop sequence length
  confidenceThreshold: 0.9,        // Detection confidence threshold
  
  // Semantic analysis
  embeddingModel: 'text-embedding-ada-002',
  semanticThreshold: 0.85,         // Semantic similarity threshold
  
  // Pattern detection
  patternTypes: [
    'repetitive_actions',          // Same actions repeated
    'circular_reasoning',          // Circular logic patterns
    'oscillating_behavior'         // Back-and-forth behavior
  ],
  
  // Advanced features
  learningEnabled: true,           // Learn from detected loops
  adaptiveThresholds: true,        // Adapt thresholds over time
  contextAware: true              // Consider conversation context
});
```

#### TokenManagementProcessor
Manages token usage and implements compression strategies.

```typescript
import { TokenManagementProcessor } from '@codebolt/agent/unified';

const tokenManager = new TokenManagementProcessor({
  maxTokens: 4000,                 // Max tokens allowed
  reserveTokens: 500,              // Reserve tokens for response
  enableCompression: true,         // Enable automatic compression
  compressionRatio: 0.7,           // Target compression ratio
  
  // Token counting
  tokenCounter: 'tiktoken',        // Token counting method
  model: 'gpt-4',                  // Model for accurate counting
  
  // Compression strategies
  compressionStrategies: [
    'remove_redundancy',           // Remove redundant content
    'summarize_history',           // Summarize old messages
    'truncate_content',            // Truncate long content
    'prioritize_recent'            // Prioritize recent messages
  ],
  
  // Monitoring
  enableTokenTracking: true,       // Track token usage
  warningThreshold: 0.8,           // Warn at 80% usage
  alertCallback: (usage) => {
    console.log(`Token usage: ${usage.used}/${usage.max}`);
  }
});
```

#### ResponseValidationProcessor
Validates agent responses for quality and safety.

```typescript
import { ResponseValidationProcessor } from '@codebolt/agent/unified';

const responseValidator = new ResponseValidationProcessor({
  enableContentValidation: true,   // Validate response content
  enableFormatValidation: true,    // Validate response format
  enableSafetyCheck: true,         // Check for unsafe content
  
  // Content validation
  minResponseLength: 10,           // Minimum response length
  maxResponseLength: 2000,         // Maximum response length
  requiredElements: [              // Required response elements
    'greeting', 'answer', 'conclusion'
  ],
  
  // Format validation
  allowedFormats: [                // Allowed response formats
    'text', 'markdown', 'json'
  ],
  validateMarkdown: true,          // Validate markdown syntax
  validateJSON: true,              // Validate JSON syntax
  
  // Safety checks
  safetyFilters: [
    'profanity',                   // Filter profanity
    'harmful_content',             // Filter harmful content
    'personal_info'                // Filter personal information
  ],
  
  // Custom validators
  customValidators: [
    (response) => ({
      isValid: response.length > 10,
      reason: response.length <= 10 ? 'Response too short' : undefined
    }),
    (response) => ({
      isValid: !response.includes('ERROR'),
      reason: response.includes('ERROR') ? 'Contains error message' : undefined
    })
  ]
});
```

#### TelemetryProcessor
Collects telemetry data and metrics.

```typescript
import { TelemetryProcessor } from '@codebolt/agent/unified';

const telemetryProcessor = new TelemetryProcessor({
  enableMetrics: true,             // Enable metrics collection
  enableTracing: true,             // Enable execution tracing
  enableLogging: true,             // Enable detailed logging
  
  // Metrics configuration
  metricsEndpoint: 'https://metrics.example.com',
  metricsInterval: 60000,          // Send metrics every minute
  batchSize: 100,                  // Batch size for metrics
  
  // Custom metrics
  customMetrics: {
    'agent.execution.duration': (context) => context.executionTime,
    'agent.tool.usage': (context) => context.toolResults?.length || 0,
    'agent.conversation.length': (context) => context.conversationHistory?.length || 0,
    'agent.success.rate': (context) => context.success ? 1 : 0
  },
  
  // Tracing
  tracingEndpoint: 'https://tracing.example.com',
  sampleRate: 0.1,                 // Sample 10% of traces
  
  // Privacy settings
  excludePersonalData: true,       // Exclude personal information
  hashUserIds: true,               // Hash user identifiers
  dataRetentionDays: 30           // Retain data for 30 days
});
```

#### ChatRecordingProcessor
Records chat conversations for analysis and debugging.

```typescript
import { ChatRecordingProcessor } from '@codebolt/agent/unified';

const chatRecorder = new ChatRecordingProcessor({
  enableRecording: true,           // Enable chat recording
  storageLocation: './chat-logs',  // Storage directory
  includeMetadata: true,           // Include conversation metadata
  compressionEnabled: true,        // Compress stored chats
  
  // File management
  fileFormat: 'json',              // Storage format: 'json', 'csv', 'txt'
  rotationPolicy: 'daily',         // Rotation: 'daily', 'weekly', 'monthly'
  maxFileSize: 10 * 1024 * 1024,   // Max file size (10MB)
  
  // Content filtering
  excludeSystemMessages: false,    // Exclude system messages
  excludeToolCalls: false,         // Exclude tool calls
  excludePersonalInfo: true,       // Exclude personal information
  
  // Privacy and security
  encryptionEnabled: true,         // Encrypt stored data
  encryptionKey: process.env.CHAT_ENCRYPTION_KEY,
  accessControl: {
    allowedUsers: ['admin', 'developer'],
    requireAuth: true
  },
  
  // Custom processing
  preprocessor: (message) => {
    // Custom message preprocessing
    return {
      ...message,
      processed: true,
      timestamp: new Date().toISOString()
    };
  }
});
```

### 5. Context Management Processors
Manage context, memory, and state across conversations.

#### ContextManagementProcessor
Comprehensive context management across conversations.

```typescript
import { ContextManagementProcessor } from '@codebolt/agent/unified';

const contextManager = new ContextManagementProcessor({
  enableContextPersistence: true,  // Persist context across sessions
  maxContextSize: 10000,           // Max context size in tokens
  enableContextCompression: true,  // Compress context when needed
  contextTTL: 3600000,            // Context TTL (1 hour)
  
  // Context storage
  storageType: 'memory',           // 'memory', 'file', 'database'
  storageLocation: './context',    // Storage location
  
  // Context organization
  enableSemanticSearch: true,      // Enable semantic context search
  contextCategories: [             // Context categories
    'user_preferences',
    'conversation_history',
    'task_context',
    'domain_knowledge'
  ],
  
  // Context retrieval
  retrievalStrategy: 'hybrid',     // 'recency', 'relevance', 'hybrid'
  maxRetrievalItems: 20,          // Max items to retrieve
  relevanceThreshold: 0.7,        // Relevance threshold
  
  // Context updates
  updateStrategy: 'incremental',   // 'full', 'incremental', 'selective'
  conflictResolution: 'merge',     // 'overwrite', 'merge', 'keep_existing'
  
  // Advanced features
  enableContextLearning: true,     // Learn from context usage
  enableContextSuggestions: true,  // Suggest relevant context
  enableContextValidation: true    // Validate context integrity
});
```

## Using Processors

### In Agents
```typescript
const agent = createAgent({
  name: 'Enhanced Agent',
  instructions: 'You are an enhanced agent with custom processors.',
  processors: {
    followUpConversation: [
      new ConversationCompactorProcessor(),
      new FollowUpConversationProcessor()
    ],
    preToolCall: [
      new ToolValidationProcessor(),
      new LocalToolInterceptorProcessor()
    ]
  }
});

// Add processors dynamically
agent.addFollowUpProcessor(new ConversationContinuityProcessor());
agent.addPreToolCallProcessor(new ToolParameterModifierProcessor());
```

### In Workflows
```typescript
const workflow = createWorkflow({
  name: 'Enhanced Workflow',
  processors: [
    new TelemetryProcessor(),
    new LoopDetectionProcessor()
  ],
  steps: [/* workflow steps */]
});
```

### In Orchestrators
```typescript
const orchestrator = createOrchestrator({
  name: 'Enhanced Orchestrator',
  processors: [
    new ContextManagementProcessor(),
    new ResponseValidationProcessor()
  ],
  agents: { /* agents */ },
  workflows: { /* workflows */ }
});
```

## Custom Processors

Create custom processors by extending the base processor classes:

```typescript
import { BaseProcessor, ProcessorInput, ProcessorOutput } from '@codebolt/agent/unified';

class CustomAnalyticsProcessor extends BaseProcessor {
  constructor(private config: { analyticsEndpoint: string }) {
    super();
  }

  async processInput(input: ProcessorInput): Promise<ProcessorOutput[]> {
    // Custom analytics logic
    const analytics = {
      messageLength: input.message.messages[0].content.length,
      timestamp: new Date().toISOString(),
      userId: input.context?.userId
    };
    
    // Send to analytics service
    await this.sendAnalytics(analytics);
    
    return [
      this.createEvent('AnalyticsCollected', analytics)
    ];
  }
  
  private async sendAnalytics(data: any) {
    try {
      await fetch(this.config.analyticsEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
    } catch (error) {
      console.error('Failed to send analytics:', error);
    }
  }
}

// Use custom processor
const customProcessor = new CustomAnalyticsProcessor({
  analyticsEndpoint: 'https://analytics.example.com'
});

const agent = createAgent({
  name: 'Analytics-Enabled Agent',
  processors: {
    followUpConversation: [customProcessor]
  }
});
```

## Processor Configuration Best Practices

### Development vs Production
```typescript
const isDevelopment = process.env.NODE_ENV === 'development';

const agent = createAgent({
  name: 'Configurable Agent',
  processors: {
    followUpConversation: [
      // Always include essential processors
      new ConversationCompactorProcessor(),
      
      // Development-specific processors
      ...(isDevelopment ? [
        new ChatRecordingProcessor({ storageLocation: './dev-logs' }),
        new TelemetryProcessor({ enableLogging: true })
      ] : []),
      
      // Production-specific processors
      ...(!isDevelopment ? [
        new TelemetryProcessor({ 
          metricsEndpoint: 'https://prod-metrics.com',
          enableLogging: false 
        }),
        new ResponseValidationProcessor({ enableSafetyCheck: true })
      ] : [])
    ]
  }
});
```

### Performance Optimization
```typescript
// Lightweight processor configuration for performance
const performanceAgent = createAgent({
  name: 'Performance Agent',
  processors: {
    followUpConversation: [
      new ConversationCompactorProcessor({
        maxConversationLength: 20,  // Smaller conversation window
        enableSummarization: false, // Disable expensive summarization
        enableSmartRemoval: false   // Disable complex analysis
      }),
      new TokenManagementProcessor({
        maxTokens: 2000,           // Lower token limit
        enableCompression: true,    // Enable compression
        compressionRatio: 0.8      // Aggressive compression
      })
    ],
    preToolCall: [
      new ToolValidationProcessor({
        strictMode: false,         // Less strict validation
        enableOutputValidation: false // Skip output validation
      })
    ]
  }
});
```
