# Gemini Agent API Documentation

## Table of Contents

- [Core API](#core-api)
- [Message Processing](#message-processing)
- [Tool System](#tool-system)
- [Configuration](#configuration)
- [Error Handling](#error-handling)
- [Events and Notifications](#events-and-notifications)

## Core API

### Agent Entry Point

The Gemini agent automatically registers a message handler with the CodeBolt system:

```typescript
import codebolt from '@codebolt/codeboltjs';

// The agent listens for messages automatically
codebolt.onMessage(async (message: any): Promise<any> => {
    // Processing logic here
});
```

### Message Structure

#### Input Message Format

```typescript
interface InputMessage {
    content: string;
    role?: 'user' | 'system' | 'assistant';
    attachments?: Array<{
        type: 'file' | 'image' | 'url';
        content: string;
        metadata?: Record<string, any>;
    }>;
    context?: {
        workingDirectory?: string;
        projectType?: string;
        language?: string;
        framework?: string;
    };
    metadata?: Record<string, any>;
}
```

#### Response Message Format

```typescript
interface ResponseMessage {
    success: boolean;
    iterations: number;
    response: {
        messages: Array<{
            role: 'user' | 'system' | 'assistant' | 'tool';
            content: string | object;
            name?: string;
            tool_calls?: Array<ToolCall>;
        }>;
    };
    error?: string;
    metadata?: {
        tokenUsage?: number;
        processingTime?: number;
        toolsExecuted?: string[];
    };
}
```

## Message Processing

### Message Modifiers

#### BaseContextMessageModifier

Adds system context and metadata to messages.

```typescript
new BaseContextMessageModifier({
    prependmessage: string;      // Message to prepend
    datetime: boolean;           // Include current datetime
    osInfo: boolean;            // Include OS information
    workingdir: boolean;        // Include working directory
})
```

**Example:**
```typescript
const modifier = new BaseContextMessageModifier({
    prependmessage: "This is Codebolt Agent. Setting up the Context.",
    datetime: true,
    osInfo: true,
    workingdir: true
});
```

#### WorkingDirectoryMessageModifier

Provides detailed directory structure and file information.

```typescript
new WorkingDirectoryMessageModifier({
    showFolderStructureSummary: boolean;    // Show folder summary
    listFiles: boolean;                     // List files in directory
    listFilesDepth: number;                 // Depth of file listing
    listFilesLimit: number;                 // Maximum files to list
    listFilesIgnoreFromGitignore: boolean;  // Respect .gitignore
    listFilesIgnore: string[];              // Additional ignore patterns
})
```

**Example:**
```typescript
const modifier = new WorkingDirectoryMessageModifier({
    showFolderStructureSummary: true,
    listFiles: true,
    listFilesDepth: 2,
    listFilesLimit: 200,
    listFilesIgnoreFromGitignore: true,
    listFilesIgnore: ["node_modules", "dist", ".git"]
});
```

#### HandleUrlMessageModifier

Processes URLs in messages and fetches their content.

```typescript
new HandleUrlMessageModifier({
    fetchUrlContent: boolean;    // Whether to fetch URL content
    maxContentLength?: number;   // Maximum content length to fetch
    timeout?: number;           // Request timeout in milliseconds
})
```

#### ImageAttachmentMessageModifier

Handles image attachments in messages.

```typescript
new ImageAttachmentMessageModifier({
    passImageAs: "URL" | "Base64";    // How to pass images to LLM
    maxImageSize?: number;            // Maximum image size
    supportedFormats?: string[];      // Supported image formats
})
```

#### AddToolsListMessageModifier

Adds information about available tools to the message.

```typescript
new AddToolsListMessageModifier({
    toolsList: ToolList;              // Tool list instance
    addToolsLocation: "InsidePrompt" | "Tool";  // Where to add tools info
    giveToolExamples: boolean;        // Include tool usage examples
    maxToolExamples: number;          // Maximum examples per tool
})
```

### Input Processors

#### AdvancedLoopDetectionProcessor

Detects and prevents infinite loops in agent processing.

```typescript
new AdvancedLoopDetectionProcessor({
    toolCallThreshold: number;        // Max tool calls before loop detection
    contentLoopThreshold: number;     // Max similar content before loop detection
    enableLLMDetection: boolean;      // Use LLM for loop detection
    similarityThreshold?: number;     // Content similarity threshold (0-1)
})
```

**Example:**
```typescript
const processor = new AdvancedLoopDetectionProcessor({
    toolCallThreshold: 5,
    contentLoopThreshold: 10,
    enableLLMDetection: false,
    similarityThreshold: 0.85
});
```

#### TokenManagementProcessor

Manages token usage and optimization.

```typescript
new TokenManagementProcessor({
    maxTokens: number;              // Maximum token limit
    warningThreshold: number;       // Warning threshold (0-1)
    enableCompression: boolean;     // Enable automatic compression
    compressionRatio?: number;      // Target compression ratio
})
```

#### ContextManagementProcessor

Manages project and IDE context information.

```typescript
new ContextManagementProcessor({
    enableProjectContext: boolean;    // Include project context
    enableIdeContext: boolean;        // Include IDE context
    enableDirectoryContext: boolean;  // Include directory context
    maxContextSize?: number;          // Maximum context size
})
```

#### ChatCompressionProcessor

Compresses conversation history to manage token usage.

```typescript
new ChatCompressionProcessor({
    compressionThreshold: number;     // Threshold for compression (0-1)
    tokenLimit: number;              // Token limit for compression
    preserveImportant?: boolean;     // Preserve important messages
    compressionStrategy?: string;     // Compression strategy
})
```

### Output Processors

#### ResponseValidationProcessor

Validates agent responses and tool calls.

```typescript
new ResponseValidationProcessor({
    validateToolCalls: boolean;      // Validate tool call format
    validateContent: boolean;        // Validate response content
    validateStructure: boolean;      // Validate message structure
    strictMode?: boolean;           // Enable strict validation
})
```

#### ChatRecordingProcessor

Records conversation history for analysis.

```typescript
new ChatRecordingProcessor({
    enableTokenTracking: boolean;    // Track token usage
    exportFormat: 'json' | 'csv';   // Export format
    autoExport: boolean;            // Automatically export logs
    exportPath?: string;            // Custom export path
})
```

#### TelemetryProcessor

Tracks performance and usage metrics.

```typescript
new TelemetryProcessor({
    enablePerformanceTracking: boolean;  // Track performance metrics
    enableErrorTracking: boolean;        // Track errors
    enableUsageTracking: boolean;        // Track usage statistics
    sampleRate: number;                  // Sampling rate (0-1)
})
```

## Tool System

### ToolList Class

Manages the collection of available tools.

```typescript
class ToolList {
    constructor(tools: BaseTool[]);
    
    // Methods
    addTool(tool: BaseTool): void;
    removeTool(toolName: string): void;
    getTool(toolName: string): BaseTool | undefined;
    getAllTools(): BaseTool[];
    getToolNames(): string[];
    getToolSchema(): object;
}
```

### ToolExecutor Class

Executes tools with retry logic and error handling.

```typescript
class ToolExecutor {
    constructor(toolList: ToolList, options: ToolExecutorOptions);
    
    async executeTools(params: ToolExecutionParams): Promise<ToolExecutionResult>;
}

interface ToolExecutorOptions {
    maxRetries: number;
    enableLogging: boolean;
    timeout?: number;
    retryDelay?: number;
}

interface ToolExecutionParams {
    toolCalls: ToolCall[];
    tools: ToolList;
    context: Record<string, any>;
}

interface ToolExecutionResult {
    success: boolean;
    results: ToolResult[];
    errors?: Error[];
    metadata: {
        executionTime: number;
        retriesUsed: number;
    };
}
```

### Built-in Tools

#### FileReadTool

Reads file contents from the filesystem.

```typescript
interface FileReadParams {
    filePath: string;
    encoding?: string;  // Default: 'utf8'
}

interface FileReadResult {
    success: boolean;
    content: string;
    metadata: {
        size: number;
        lastModified: Date;
        encoding: string;
    };
}
```

#### FileWriteTool

Writes content to files.

```typescript
interface FileWriteParams {
    filePath: string;
    content: string;
    encoding?: string;    // Default: 'utf8'
    createDirs?: boolean; // Create directories if they don't exist
}

interface FileWriteResult {
    success: boolean;
    bytesWritten: number;
    metadata: {
        created: boolean;
        lastModified: Date;
    };
}
```

#### FileDeleteTool

Deletes files from the filesystem.

```typescript
interface FileDeleteParams {
    filePath: string;
    force?: boolean;  // Force deletion
}

interface FileDeleteResult {
    success: boolean;
    deleted: boolean;
    metadata: {
        fileExisted: boolean;
        deletedAt: Date;
    };
}
```

#### FileMoveTool

Moves files between locations.

```typescript
interface FileMoveParams {
    sourcePath: string;
    destinationPath: string;
    overwrite?: boolean;
}

interface FileMoveResult {
    success: boolean;
    moved: boolean;
    metadata: {
        sourceExists: boolean;
        destinationExists: boolean;
        movedAt: Date;
    };
}
```

#### FileCopyTool

Copies files between locations.

```typescript
interface FileCopyParams {
    sourcePath: string;
    destinationPath: string;
    overwrite?: boolean;
}

interface FileCopyResult {
    success: boolean;
    copied: boolean;
    metadata: {
        sourceSize: number;
        destinationSize: number;
        copiedAt: Date;
    };
}
```

### Custom Tool Development

Create custom tools by extending the base tool class:

```typescript
import { BaseTool } from '@codebolt/agent/processor';

class CustomTool extends BaseTool {
    constructor() {
        super(
            'CustomToolName',
            'Tool description',
            {
                param1: {
                    type: 'string',
                    description: 'Parameter description',
                    required: true
                },
                param2: {
                    type: 'number',
                    description: 'Optional parameter',
                    required: false,
                    default: 42
                }
            }
        );
    }

    async execute(params: any, context?: any): Promise<any> {
        try {
            // Validate parameters
            this.validateParams(params);
            
            // Implement tool logic
            const result = await this.performOperation(params);
            
            return {
                success: true,
                result: result,
                metadata: {
                    executedAt: new Date(),
                    params: params
                }
            };
        } catch (error) {
            return {
                success: false,
                error: error.message,
                metadata: {
                    executedAt: new Date(),
                    params: params
                }
            };
        }
    }
    
    private validateParams(params: any): void {
        // Parameter validation logic
        if (!params.param1) {
            throw new Error('param1 is required');
        }
    }
    
    private async performOperation(params: any): Promise<any> {
        // Tool implementation
        return `Processed: ${params.param1}`;
    }
}
```

## Configuration

### LLM Configuration

```typescript
interface LLMConfig {
    llmname: string;        // LLM provider name
    model: string;          // Specific model to use
    temperature: number;    // Response creativity (0-1)
    maxTokens: number;      // Maximum token limit
    topP?: number;         // Nucleus sampling parameter
    frequencyPenalty?: number;  // Frequency penalty
    presencePenalty?: number;   // Presence penalty
}
```

### Agent Step Configuration

```typescript
interface AgentStepConfig {
    inputProcessors: Processor[];
    outputProcessors: Processor[];
    toolList: ToolList;
    toolExecutor: ToolExecutor;
    llmconfig: LLMConfig;
    maxIterations: number;
    enableLogging?: boolean;
    timeout?: number;
}
```

## Error Handling

### Error Types

#### AgentError

Base error class for agent-related errors.

```typescript
class AgentError extends Error {
    code: string;
    context?: Record<string, any>;
    
    constructor(message: string, code: string, context?: Record<string, any>);
}
```

#### ToolExecutionError

Error during tool execution.

```typescript
class ToolExecutionError extends AgentError {
    toolName: string;
    toolParams: any;
    retryCount: number;
}
```

#### ProcessingError

Error during message processing.

```typescript
class ProcessingError extends AgentError {
    processor: string;
    stage: string;
}
```

### Error Handling Patterns

```typescript
try {
    const result = await agentStep.step(message);
} catch (error) {
    if (error instanceof ToolExecutionError) {
        console.error(`Tool ${error.toolName} failed:`, error.message);
        // Handle tool-specific error
    } else if (error instanceof ProcessingError) {
        console.error(`Processing failed at ${error.stage}:`, error.message);
        // Handle processing error
    } else {
        console.error('Unexpected error:', error);
        // Handle generic error
    }
}
```

## Events and Notifications

### Event Types

The agent emits various events during processing:

#### Message Events

- `message:received` - When a message is received
- `message:modified` - After message modification
- `message:processed` - After message processing

#### Tool Events

- `tool:called` - When a tool is called
- `tool:executed` - After tool execution
- `tool:failed` - When tool execution fails

#### Processing Events

- `processing:started` - When processing begins
- `processing:iteration` - At each processing iteration
- `processing:completed` - When processing completes

### Event Handlers

```typescript
// Listen for events (conceptual - actual implementation may vary)
agent.on('tool:called', (event) => {
    console.log(`Tool called: ${event.toolName}`);
});

agent.on('processing:completed', (event) => {
    console.log(`Processing completed in ${event.iterations} iterations`);
});
```

### Notification Integration

The agent integrates with CodeBolt's notification system:

```typescript
// Send notifications through CodeBolt
codebolt.chat.sendMessage(message, options);

// Send notifications with metadata
codebolt.chat.sendMessage(message, {
    type: 'success' | 'error' | 'info' | 'warning',
    metadata: {
        agentId: 'geminiagent',
        timestamp: new Date(),
        context: additionalContext
    }
});
```