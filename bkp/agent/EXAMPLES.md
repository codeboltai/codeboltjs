# CodeBolt Agent Examples

This directory contains practical examples demonstrating different usage patterns of the CodeBolt Agent package.

## Quick Start Examples

### 1. Simple Chat Agent (Composable Pattern)

```typescript
// examples/simple-chat-agent.ts
import { ComposableAgent, createCodeBoltAgentMemory } from '@codebolt/agent/composable';

const chatAgent = new ComposableAgent({
  name: 'Chat Assistant',
  instructions: 'You are a helpful AI assistant. Be concise and friendly.',
  model: 'gpt-4o-mini',
  memory: createCodeBoltAgentMemory('chat_agent')
});

// Usage
async function runChatExample() {
  const result = await chatAgent.execute('Hello! How can you help me today?');
  console.log(result.message);
  
  // Follow-up conversation
  const followUp = await chatAgent.execute('Tell me a fun fact about space');
  console.log(followUp.message);
}

runChatExample();
```

### 2. File Analysis Agent with Tools

```typescript
// examples/file-analysis-agent.ts
import { ComposableAgent, createTool, createCodeBoltAgentMemory } from '@codebolt/agent/composable';
import { z } from 'zod';
import { promises as fs } from 'fs';
import path from 'path';

// Create file reading tool
const readFileTool = createTool({
  id: 'read-file',
  description: 'Read contents of a file',
  inputSchema: z.object({
    filePath: z.string().describe('Path to the file to read'),
    maxLines: z.number().optional().default(100)
  }),
  outputSchema: z.object({
    content: z.string(),
    lineCount: z.number(),
    size: z.number()
  }),
  execute: async ({ context }) => {
    const content = await fs.readFile(context.filePath, 'utf8');
    const lines = content.split('\n');
    const truncatedContent = lines.slice(0, context.maxLines).join('\n');
    const stats = await fs.stat(context.filePath);
    
    return {
      content: truncatedContent,
      lineCount: lines.length,
      size: stats.size
    };
  }
});

// Create file listing tool
const listFilesTool = createTool({
  id: 'list-files',
  description: 'List files in a directory',
  inputSchema: z.object({
    directory: z.string().describe('Directory path'),
    extension: z.string().optional().describe('Filter by file extension')
  }),
  outputSchema: z.object({
    files: z.array(z.string()),
    count: z.number()
  }),
  execute: async ({ context }) => {
    const files = await fs.readdir(context.directory);
    const filteredFiles = context.extension 
      ? files.filter(f => path.extname(f) === context.extension)
      : files;
    
    return {
      files: filteredFiles,
      count: filteredFiles.length
    };
  }
});

// Create the agent
const fileAgent = new ComposableAgent({
  name: 'File Analysis Agent',
  instructions: `
    You are a file analysis assistant. You can read files and list directory contents.
    When analyzing code files, provide insights about:
    - Code structure and organization
    - Potential issues or improvements
    - Documentation quality
    - Best practices adherence
    
    Use the available tools to access file information.
  `,
  model: 'gpt-4o-mini',
  tools: { readFileTool, listFilesTool },
  memory: createCodeBoltAgentMemory('file_agent')
});

// Usage examples
async function analyzeProject() {
  // List files first
  const result1 = await fileAgent.execute('List all TypeScript files in the ./src directory');
  console.log('Files found:', result1.message);
  
  // Analyze a specific file
  const result2 = await fileAgent.execute('Read and analyze ./src/main.ts for code quality');
  console.log('Analysis:', result2.message);
}

analyzeProject();
```

### 3. Multi-Step Workflow Example

```typescript
// examples/content-creation-workflow.ts
import { 
  ComposableAgent, 
  createWorkflow, 
  createAgentStep,
  createTransformStep,
  createConditionalStep,
  createCodeBoltAgentMemory 
} from '@codebolt/agent/composable';

// Create specialized agents
const researchAgent = new ComposableAgent({
  name: 'Research Agent',
  instructions: 'You are a research assistant. Provide comprehensive, factual information on requested topics.',
  model: 'gpt-4o-mini',
  memory: createCodeBoltAgentMemory('research_agent')
});

const writerAgent = new ComposableAgent({
  name: 'Content Writer',
  instructions: 'You are a skilled content writer. Create engaging, well-structured articles based on research.',
  model: 'gpt-4o-mini', 
  memory: createCodeBoltAgentMemory('writer_agent')
});

const editorAgent = new ComposableAgent({
  name: 'Editor',
  instructions: 'You are an editor. Review content for clarity, flow, and grammar. Provide improvement suggestions.',
  model: 'gpt-4o-mini',
  memory: createCodeBoltAgentMemory('editor_agent')
});

// Create the workflow
const contentWorkflow = createWorkflow({
  name: 'Content Creation Pipeline',
  description: 'Research, write, and edit content on a given topic',
  steps: [
    // Step 1: Research the topic
    createAgentStep({
      id: 'research',
      name: 'Research Topic',
      agent: researchAgent,
      messageTemplate: 'Research comprehensive information about: {{topic}}. Include key facts, trends, and insights.',
      outputMapping: { 'researchData': 'agentResult.message' }
    }),
    
    // Step 2: Write initial draft
    createAgentStep({
      id: 'write',
      name: 'Write Article Draft',
      agent: writerAgent,
      messageTemplate: `Write a {{wordCount}}-word article about {{topic}} using this research:
      
      {{researchData}}
      
      Target audience: {{targetAudience}}
      Tone: {{tone}}`,
      outputMapping: { 'draft': 'agentResult.message' }
    }),
    
    // Step 3: Editorial review
    createAgentStep({
      id: 'review',
      name: 'Editorial Review',
      agent: editorAgent,
      messageTemplate: `Review this article and rate its quality (1-10) and readiness for publication:
      
      {{draft}}
      
      Provide specific feedback and suggestions for improvement.`,
      outputMapping: { 
        'reviewFeedback': 'agentResult.message',
        'needsImprovement': 'agentResult.metadata.needsImprovement'
      }
    }),
    
    // Step 4: Conditional improvement
    createConditionalStep({
      id: 'improve-check',
      name: 'Quality Check',
      condition: (context) => {
        // Extract quality score from review
        const review = context.data.reviewFeedback;
        const scoreMatch = review.match(/(?:score|rating|quality):\s*(\d+)/i);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 5;
        return score < 8; // Improve if score is less than 8
      },
      trueBranch: [
        createAgentStep({
          id: 'improve',
          name: 'Improve Content',
          agent: writerAgent,
          messageTemplate: `Improve this article based on the editorial feedback:
          
          ORIGINAL ARTICLE:
          {{draft}}
          
          EDITORIAL FEEDBACK:
          {{reviewFeedback}}
          
          Please revise and improve the article.`,
          outputMapping: { 'finalArticle': 'agentResult.message' }
        })
      ],
      falseBranch: [
        createTransformStep({
          id: 'finalize',
          name: 'Finalize Content',
          transform: (data) => ({
            finalArticle: data.draft, // Use original draft if no improvement needed
            status: 'approved'
          })
        })
      ]
    })
  ]
});

// Usage
async function createContent() {
  const result = await contentWorkflow.execute({
    topic: 'The Future of Artificial Intelligence in Healthcare',
    wordCount: 1000,
    targetAudience: 'healthcare professionals',
    tone: 'professional yet accessible'
  });
  
  console.log('Content Creation Results:');
  console.log('=========================');
  console.log('Final Article:', result.data.finalArticle);
  console.log('Status:', result.data.status);
  console.log('Steps completed:', result.stepResults.length);
  console.log('Total time:', result.executionTime, 'ms');
}

createContent();
```

### 4. Streaming Response Example

```typescript
// examples/streaming-agent.ts
import { ComposableAgent, createCodeBoltAgentMemory } from '@codebolt/agent/composable';

const streamingAgent = new ComposableAgent({
  name: 'Streaming Assistant',
  instructions: 'You are a helpful assistant that provides detailed explanations.',
  model: 'gpt-4o-mini',
  memory: createCodeBoltAgentMemory('streaming_agent')
});

async function streamingExample() {
  console.log('Starting streaming response...\n');
  
  const result = await streamingAgent.execute(
    'Explain how neural networks work in simple terms',
    {
      stream: true,
      callback: async (chunk) => {
        switch (chunk.type) {
          case 'text':
            process.stdout.write(chunk.content);
            break;
          case 'tool_call':
            console.log(`\n[Tool Call: ${chunk.tool_call?.function.name}]`);
            break;
          case 'tool_result':
            console.log(`\n[Tool Result: ${chunk.content}]`);
            break;
          case 'error':
            console.error(`\nError: ${chunk.content}`);
            break;
        }
      }
    }
  );
  
  console.log('\n\nStreaming complete!');
  console.log('Final result success:', result.success);
}

streamingExample();
```

### 5. Builder Pattern Example (Advanced)

```typescript
// examples/builder-pattern-advanced.ts
import { 
  Agent, 
  InitialPromptBuilder, 
  LLMOutputHandler,
  FollowUpPromptBuilder,
  SystemPrompt,
  TaskInstruction 
} from '@codebolt/agent/builder';

async function advancedBuilderExample() {
  // Setup system prompt
  const systemPrompt = new SystemPrompt();
  // In real usage, you'd load from a YAML file
  systemPrompt.content = 'You are a senior software engineer helping with code review.';
  
  // Setup task instruction
  const taskInstruction = new TaskInstruction();
  taskInstruction.content = 'Review the provided code for best practices and potential issues.';
  
  // Create agent with tools
  const agent = new Agent([], systemPrompt);
  
  // Build complex initial prompt
  const promptBuilder = new InitialPromptBuilder('Please review my TypeScript code');
  const initialPrompt = await promptBuilder
    .addSystemInstructions('Focus on TypeScript best practices and performance')
    .addFile('./src/example.ts')
    .addTaskDetails('Look for type safety issues and optimization opportunities')
    .addEnvironmentDetails()
    .build();
  
  // Execute initial prompt
  let llmOutput = await agent.runAgent(initialPrompt);
  let outputHandler = new LLMOutputHandler(llmOutput, codebolt);
  
  // Main conversation loop
  while (!outputHandler.isCompleted()) {
    // Send message to user
    await outputHandler.sendMessageToUser();
    
    // Execute any tool calls
    const toolResults = await outputHandler.runTools();
    
    // Build follow-up prompt if not completed
    if (!outputHandler.isCompleted()) {
      const followUpBuilder = new FollowUpPromptBuilder(codebolt);
      const nextPrompt = await followUpBuilder
        .addPreviousConversation(initialPrompt)
        .addToolResult(toolResults)
        .checkAndSummarizeConversationIfLong()
        .build();
      
      // Get next response
      llmOutput = await agent.runAgent(nextPrompt);
      outputHandler = new LLMOutputHandler(llmOutput, codebolt);
    }
  }
  
  console.log('Code review completed!');
}

// Note: This example requires proper CodeBolt environment setup
// advancedBuilderExample();
```

### 6. Custom Storage Provider Example

```typescript
// examples/custom-storage.ts
import { ComposableAgent, Memory, StorageProvider } from '@codebolt/agent/composable';

// Custom Redis storage provider
class RedisStorageProvider implements StorageProvider {
  private client: any; // Redis client
  
  constructor(redisClient: any) {
    this.client = redisClient;
  }
  
  async get(key: string): Promise<any> {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set(key: string, value: any): Promise<void> {
    await this.client.set(key, JSON.stringify(value));
  }
  
  async delete(key: string): Promise<void> {
    await this.client.del(key);
  }
  
  async keys(): Promise<string[]> {
    return await this.client.keys('*');
  }
  
  async clear(): Promise<void> {
    const keys = await this.keys();
    if (keys.length > 0) {
      await this.client.del(keys);
    }
  }
}

// Usage with custom storage
async function customStorageExample() {
  // const redisClient = new Redis({ host: 'localhost', port: 6379 });
  // const customStorage = new RedisStorageProvider(redisClient);
  
  // const memory = new Memory({
  //   storage: customStorage,
  //   maxMessages: 100,
  //   autoSave: true
  // });
  
  // const agent = new ComposableAgent({
  //   name: 'Redis Agent',
  //   instructions: 'You are an assistant with Redis-backed memory.',
  //   model: 'gpt-4o-mini',
  //   memory
  // });
  
  // const result = await agent.execute('Remember this conversation in Redis');
  // console.log(result.message);
}
```

## Running the Examples

1. **Install dependencies:**
```bash
npm install @codebolt/agent zod
```

2. **Set up your environment:**
Create a `codeboltagents.yaml` file with your model configurations:

```yaml
models:
  gpt-4o-mini:
    provider: openai
    config:
      temperature: 0.7
      max_tokens: 2000
```

3. **Run individual examples:**
```bash
npx tsx examples/simple-chat-agent.ts
npx tsx examples/file-analysis-agent.ts
npx tsx examples/content-creation-workflow.ts
npx tsx examples/streaming-agent.ts
```

## Tips for Building Your Own Agents

1. **Start Simple**: Begin with the composable pattern for basic functionality
2. **Add Tools Gradually**: Start with built-in tools, then add custom ones as needed
3. **Use Appropriate Memory**: Choose the right storage type for your use case
4. **Handle Errors**: Always implement proper error handling in your tools
5. **Test Incrementally**: Test each component before building complex workflows
6. **Monitor Performance**: Use streaming for long-running operations
7. **Validate Inputs**: Use Zod schemas to ensure data integrity

## Next Steps

- Check out the [API Reference](../API_REFERENCE.md) for detailed method documentation
- Read the [Complete Documentation](../DOCUMENTATION.md) for architectural guidance
- Explore the source code in `/src/composablepattern/examples/` for more advanced patterns