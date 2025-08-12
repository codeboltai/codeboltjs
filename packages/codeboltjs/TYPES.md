# CodeboltJS Type Definitions Guide

This guide explains how to use TypeScript types provided by the `codeboltjs` library for better type safety and IntelliSense support.

## Quick Start

```typescript
import codebolt from 'codeboltjs';
import type { 
  Message, 
  ToolCall, 
  UserMessage,
  LLMChatOptions, 
  BrowserScreenshotOptions 
} from 'codeboltjs';

// Or import from the types barrel
import type { 
  Message, 
  ToolCall, 
  UserMessage,
  LLMChatOptions 
} from 'codeboltjs/types';
```

## Type Categories

### Core Library Types

These are the primary types that most users will need:

#### Message & Tool Types
```typescript
import type { 
  Message, 
  ToolCall, 
  Tool, 
  UserMessage,
  LLMInferenceParams,
  APIResponse 
} from 'codeboltjs';

// Example usage
const message: Message = {
  role: 'user',
  content: 'Hello, I need help with my code'
};

// Handler for incoming user messages
const messageHandler = (userMessage: UserMessage) => {
  console.log('User said:', userMessage.userMessage);
  console.log('Current file:', userMessage.currentFile);
  console.log('Mentioned files:', userMessage.mentionedFiles);
};

codebolt.onMessage(messageHandler);
```

#### OpenAI Compatible Types
```typescript
import type { 
  OpenAIMessage, 
  OpenAITool, 
  ConversationEntry 
} from 'codeboltjs';

// Use with LLM functions
const messages: OpenAIMessage[] = [
  { role: 'user', content: 'Explain this code' }
];
```

### Module-Specific Types

Each module has its own set of configuration types:

#### File System Types
```typescript
import type { 
  ReadFileOptions, 
  WriteFileOptions, 
  SearchFilesOptions 
} from 'codeboltjs';

// Reading a file
const readOptions: ReadFileOptions = {
  path: './src/app.ts',
  encoding: 'utf8'
};

const content = await codebolt.fs.readFile(readOptions);
```

#### Browser Types
```typescript
import type { 
  BrowserNavigationOptions, 
  BrowserScreenshotOptions 
} from 'codeboltjs';

// Taking a screenshot
const screenshotOptions: BrowserScreenshotOptions = {
  fullPage: true,
  format: 'png'
};

await codebolt.browser.screenshot(screenshotOptions);
```

#### Git Types
```typescript
import type { 
  GitCommitOptions, 
  GitLogOptions,
  CommitSummary,
  StatusResult
} from 'codeboltjs';

// Making a commit
const commitOptions: GitCommitOptions = {
  message: 'Add new feature',
  addAll: true
};

await codebolt.git.commit(commitOptions);

// Git status result
const status: StatusResult = await codebolt.git.status();
```

#### LLM Types
```typescript
import type { 
  LLMChatOptions,
  Message,
  Tool
} from 'codeboltjs';

// Chat with LLM
const chatOptions: LLMChatOptions = {
  messages: [
    { role: 'user', content: 'Help me debug this function' }
  ],
  temperature: 0.7,
  maxTokens: 1000
};

const response = await codebolt.llm.chat(chatOptions);
```

#### Vector Database Types
```typescript
import type { 
  VectorAddOptions, 
  VectorQueryOptions,
  VectorItem,
  VectorQueryResult
} from 'codeboltjs';

// Adding vectors
const addOptions: VectorAddOptions = {
  id: 'doc-1',
  vector: [0.1, 0.2, 0.3, ...],
  content: 'Document content',
  metadata: { source: 'readme.md' }
};

await codebolt.vectordb.addItem(addOptions);
```

#### Agent & Task Types
```typescript
import type { 
  AgentConfiguration,
  AgentMessageHandler,
  TaskCreateOptions,
  Task
} from 'codeboltjs';

// Agent configuration
const agentConfig: AgentConfiguration = {
  name: 'Code Assistant',
  description: 'Helps with code analysis',
  systemPrompt: 'You are a helpful coding assistant'
};

// Task creation
const taskOptions: TaskCreateOptions = {
  title: 'Refactor authentication module',
  description: 'Extract common auth logic',
  priority: 'high'
};

const task: Task = await codebolt.taskplaner.createTask(taskOptions);
```

### Data Structure Types

These types represent the data returned by various operations:

#### File System Results
```typescript
import type { 
  FileEntry, 
  SearchMatch, 
  SearchResult 
} from 'codeboltjs';

// File listing results
const files: FileEntry[] = await codebolt.fs.listFiles({ path: './src' });

// Search results
const searchResults: SearchResult[] = await codebolt.fs.searchFiles({
  query: 'function authenticate'
});
```

#### Browser Results
```typescript
import type { BrowserElement } from 'codeboltjs';

// Browser elements
const elements: BrowserElement[] = await codebolt.browser.getElements({
  selector: '.button'
});
```

#### Code Analysis Results
```typescript
import type { 
  CodeIssue, 
  CodeAnalysis, 
  ASTNode 
} from 'codeboltjs';

// Code analysis results
const analysis: CodeAnalysis = await codebolt.codeutils.analyze({
  path: './src/utils.ts'
});

// AST parsing results
const ast: ASTNode[] = await codebolt.codeparsers.parse({
  input: './src/app.ts',
  language: 'typescript',
  isFilePath: true
});
```

## Utility Types

For advanced usage, these utility types help with generic programming:

```typescript
import type { 
  DeepPartial, 
  DeepRequired, 
  Optional, 
  Required 
} from 'codeboltjs';

// Make all properties optional
type PartialConfig = DeepPartial<AgentConfiguration>;

// Make specific properties optional
type FlexibleTask = Optional<TaskCreateOptions, 'priority' | 'dueDate'>;
```

## Complete Example

Here's a complete example showing how to use types effectively:

```typescript
import codebolt, { Codebolt } from 'codeboltjs';
import type {
  UserMessage,
  LLMChatOptions,
  ReadFileOptions,
  GitCommitOptions,
  BrowserScreenshotOptions,
  TaskCreateOptions,
  Task,
  Message,
  APIResponse
} from 'codeboltjs';

class MyCodeAssistant {
  private codebolt: Codebolt;

  constructor() {
    this.codebolt = codebolt;
    this.setupMessageHandler();
  }

  private setupMessageHandler(): void {
    this.codebolt.onMessage(async (userMessage: UserMessage) => {
      console.log(`Processing message: ${userMessage.userMessage}`);
      
      if (userMessage.mentionedFiles.length > 0) {
        await this.analyzeFiles(userMessage.mentionedFiles);
      }
      
      return { 
        response: 'Message processed successfully',
        timestamp: new Date().toISOString()
      };
    });
  }

  private async analyzeFiles(files: string[]): Promise<void> {
    for (const file of files) {
      const readOptions: ReadFileOptions = {
        path: file,
        encoding: 'utf8'
      };
      
      try {
        const content = await this.codebolt.fs.readFile(readOptions);
        console.log(`Analyzed file: ${file} (${content.length} characters)`);
      } catch (error) {
        console.error(`Failed to read file ${file}:`, error);
      }
    }
  }

  async generateResponse(userInput: string): Promise<string> {
    const chatOptions: LLMChatOptions = {
      messages: [
        { role: 'user', content: userInput }
      ],
      temperature: 0.7,
      maxTokens: 500
    };

    const response = await this.codebolt.llm.chat(chatOptions);
    return response.content;
  }
}

// Usage
const assistant = new MyCodeAssistant();
```

## Type Safety Best Practices

1. **Always use types for function parameters** - This catches errors early
2. **Import specific types** - Don't use `any` when specific types are available  
3. **Use union types for options** - Like `'low' | 'medium' | 'high'` for priorities
4. **Leverage IntelliSense** - Your IDE will provide better autocompletion with proper types
5. **Check return types** - Use the provided response types to handle results properly

## Need More Types?

If you need access to additional types that aren't currently exported, please open an issue on the GitHub repository. We aim to export all types that users need for working with the public API. 