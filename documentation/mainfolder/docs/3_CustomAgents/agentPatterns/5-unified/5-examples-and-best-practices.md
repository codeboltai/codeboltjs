# Examples and Best Practices

This section provides comprehensive examples and best practices for using the Unified Agent Framework effectively.

## Complete Application Examples

### 1. Customer Support System

```typescript
import { CodeboltAgent, createTool } from '@codebolt/agent/unified';
import {
  ConversationCompactorModifier,
  ToolValidationModifier,
  ChatRecordingModifier
} from '@codebolt/agent/processor-pieces';
import { z } from 'zod';

// Create specialized tools
const ticketSearchTool = createTool({
  id: 'ticket-search',
  description: 'Search customer support tickets',
  inputSchema: z.object({
    query: z.string(),
    status: z.enum(['open', 'closed', 'pending']).optional(),
    customerId: z.string().optional()
  }),
  execute: async ({ input }) => {
    // Simulate ticket search
    return {
      tickets: [
        { id: '12345', status: 'open', subject: 'Login issue', priority: 'high' },
        { id: '12346', status: 'pending', subject: 'Billing question', priority: 'medium' }
      ],
      totalFound: 2
    };
  }
});

const knowledgeBaseTool = createTool({
  id: 'knowledge-base',
  description: 'Search knowledge base articles',
  inputSchema: z.object({
    query: z.string(),
    category: z.string().optional()
  }),
  execute: async ({ input }) => {
    return {
      articles: [
        { id: 'kb001', title: 'How to reset password', relevance: 0.95 },
        { id: 'kb002', title: 'Billing FAQ', relevance: 0.87 }
      ]
    };
  }
});

const escalationTool = createTool({
  id: 'escalate-ticket',
  description: 'Escalate ticket to human agent',
  inputSchema: z.object({
    ticketId: z.string(),
    reason: z.string(),
    priority: z.enum(['low', 'medium', 'high', 'urgent'])
  }),
  execute: async ({ input }) => {
    return {
      escalated: true,
      assignedTo: 'senior-agent-001',
      estimatedResponse: '15 minutes'
    };
  }
});

// Create specialized agent
const supportAgent = new CodeboltAgent({
  instructions: `You are a helpful customer support agent. Your role is to:
  1. Understand customer issues clearly
  2. Search for relevant tickets and knowledge base articles
  3. Provide accurate and helpful solutions
  4. Escalate complex issues when necessary
  5. Maintain a friendly and professional tone`,

  tools: [ticketSearchTool, knowledgeBaseTool, escalationTool],

  postToolCallProcessors: [
    new ConversationCompactorModifier({
      maxConversationLength: 30
    })
  ],
  preToolCallProcessors: [
    new ToolValidationModifier({
      strictMode: true
    })
  ]
});

// Usage example
async function handleCustomerSupport() {
  const customerMessage = "I can't log into my account and I have an important meeting in 30 minutes";

  const result = await supportAgent.execute({
    role: 'user',
    content: customerMessage
  });

  console.log('Support Result:', {
    success: result.success,
    result: result.result,
    error: result.error
  });
}
```

### 2. Content Creation Pipeline

```typescript
import { CodeboltAgent, createTool, Workflow, AgentStep } from '@codebolt/agent/unified';
import { z } from 'zod';

// Research agent
const researchAgent = new CodeboltAgent({
  instructions: 'You are an expert researcher who gathers comprehensive information on any topic.',
  tools: [
    createTool({
      id: 'web-search',
      description: 'Search the web for information',
      inputSchema: z.object({
        query: z.string(),
        maxResults: z.number().optional().default(10)
      }),
      execute: async ({ input }) => ({
        results: [
          { title: 'Article 1', url: 'https://example1.com', snippet: 'Relevant info...' },
          { title: 'Article 2', url: 'https://example2.com', snippet: 'More info...' }
        ]
      })
    }),
    createTool({
      id: 'academic-search',
      description: 'Search academic papers and journals',
      inputSchema: z.object({
        query: z.string(),
        field: z.string().optional()
      }),
      execute: async ({ input }) => ({
        papers: [
          { title: 'Research Paper 1', authors: ['Dr. Smith'], year: 2023, citations: 45 }
        ]
      })
    })
  ]
});

const writerAgent = new CodeboltAgent({
  instructions: 'You are a skilled content writer who creates engaging, well-structured content.',
  tools: [
    createTool({
      id: 'style-checker',
      description: 'Check content style and readability',
      inputSchema: z.object({
        content: z.string(),
        style: z.enum(['formal', 'casual', 'academic']).optional().default('formal')
      }),
      execute: async ({ input }) => ({
        score: 85,
        suggestions: ['Use more active voice', 'Vary sentence length'],
        readabilityGrade: 'College level'
      })
    })
  ]
});

const editorAgent = new CodeboltAgent({
  instructions: 'You are a meticulous editor who refines and polishes content.',
  tools: [
    createTool({
      id: 'grammar-check',
      description: 'Check grammar and spelling',
      inputSchema: z.object({ content: z.string() }),
      execute: async ({ input }) => ({
        errors: [],
        suggestions: ['Consider rephrasing paragraph 2'],
        score: 95
      })
    })
  ]
});

// Usage
async function createContent() {
  // Execute research
  const researchResult = await researchAgent.execute({
    role: 'user',
    content: 'Research comprehensive information about AI in Healthcare'
  });

  // Execute writing
  const writingResult = await writerAgent.execute({
    role: 'user',
    content: `Write a blog post about AI in Healthcare using this research: ${researchResult.result}`
  });

  // Execute editing
  const editingResult = await editorAgent.execute({
    role: 'user',
    content: `Edit and polish this content: ${writingResult.result}`
  });

  if (editingResult.success) {
    console.log('Content created successfully!');
    console.log('Final content:', editingResult.result);
  }
}
```

### 3. Data Analysis System

```typescript
import { CodeboltAgent, createTool } from '@codebolt/agent/unified';
import { z } from 'zod';

// Multi-agent data analysis system
const dataCollectorAgent = new CodeboltAgent({
  instructions: 'You collect and validate data from various sources.',
  tools: [
    createTool({
      id: 'api-connector',
      description: 'Connect to various APIs and collect data',
      inputSchema: z.object({
        endpoint: z.string(),
        parameters: z.record(z.unknown()).optional()
      }),
      execute: async ({ input }) => ({
        data: [{ id: 1, value: 100 }, { id: 2, value: 200 }],
        metadata: { source: input.endpoint, timestamp: new Date().toISOString() }
      })
    }),
    createTool({
      id: 'data-validator',
      description: 'Validate data quality and completeness',
      inputSchema: z.object({
        data: z.array(z.unknown()),
        schema: z.record(z.unknown()).optional()
      }),
      execute: async ({ input }) => ({
        isValid: true,
        errors: [],
        quality_score: 0.95,
        completeness: 0.98
      })
    })
  ]
});

const dataAnalystAgent = new CodeboltAgent({
  instructions: 'You perform statistical analysis and generate insights from data.',
  tools: [
    createTool({
      id: 'statistical-analysis',
      description: 'Perform statistical analysis on datasets',
      inputSchema: z.object({
        data: z.array(z.unknown()),
        analysis_type: z.enum(['descriptive', 'correlation', 'regression'])
      }),
      execute: async ({ input }) => ({
        results: {
          mean: 150,
          median: 145,
          std_dev: 25,
          correlation: 0.75
        },
        insights: ['Strong positive correlation observed', 'Data shows upward trend']
      })
    }),
    createTool({
      id: 'visualization',
      description: 'Create charts and visualizations',
      inputSchema: z.object({
        data: z.array(z.unknown()),
        chart_type: z.enum(['bar', 'line', 'scatter', 'histogram'])
      }),
      execute: async ({ input }) => ({
        chart_url: 'https://charts.example.com/chart123',
        chart_config: { type: input.chart_type, data: input.data }
      })
    })
  ]
});

const reportGeneratorAgent = new CodeboltAgent({
  instructions: 'You create comprehensive reports from analysis results.',
  tools: [
    createTool({
      id: 'report-builder',
      description: 'Build structured reports',
      inputSchema: z.object({
        data: z.record(z.unknown()),
        template: z.string().optional().default('standard')
      }),
      execute: async ({ input }) => ({
        report: `# Data Analysis Report\n\n## Summary\n${JSON.stringify(input.data, null, 2)}`,
        format: 'markdown',
        generated_at: new Date().toISOString()
      })
    })
  ]
});

// Usage
async function analyzeData() {
  // Collect data
  const collectionResult = await dataCollectorAgent.execute({
    role: 'user',
    content: 'Collect sales data from our API'
  });

  // Analyze data
  const analysisResult = await dataAnalystAgent.execute({
    role: 'user',
    content: `Analyze trends in this data: ${collectionResult.result}`
  });

  // Generate report
  const reportResult = await reportGeneratorAgent.execute({
    role: 'user',
    content: `Generate a comprehensive report from: ${analysisResult.result}`
  });

  console.log('Analysis completed:', reportResult.success);
  console.log('Report:', reportResult.result);
}
```

## Best Practices

### 1. Agent Design Principles

#### Good: Focused, Specialized Agents
```typescript
// Specialized agents with clear responsibilities
const emailAgent = new CodeboltAgent({
  instructions: 'You handle email-related tasks with expertise in email protocols and best practices.',
  tools: [emailSendTool, emailValidationTool, templateTool]
});

const calculationAgent = new CodeboltAgent({
  instructions: 'You perform mathematical calculations and solve numerical problems.',
  tools: [calculatorTool, statisticsTool, graphingTool]
});
```

#### Avoid: Generic, Unfocused Agents
```typescript
// Avoid overly generic agents
const genericAgent = new CodeboltAgent({
  instructions: 'You do everything and anything.',
  tools: [/* 20+ unrelated tools */] // Too many tools
});
```

### 2. Tool Organization

#### Good: Logical Tool Grouping
```typescript
// Clear, descriptive tool definitions
const calculatorTool = createTool({
  id: 'advanced-calculator',
  description: 'Perform complex mathematical calculations including trigonometry, logarithms, and statistical functions',
  inputSchema: z.object({
    expression: z.string().describe('Mathematical expression to evaluate'),
    precision: z.number().optional().default(10).describe('Decimal precision for results')
  }),
  execute: async ({ input }) => {
    // Implementation
  }
});
```

#### Avoid: Poor Tool Organization
```typescript
// Avoid unclear tool definitions
const badTool = createTool({
  id: 'tool1', // Non-descriptive ID
  description: 'Does stuff', // Vague description
  inputSchema: z.any(), // No input validation
  execute: async ({ input }) => input // No actual functionality
});
```

### 3. Processor Configuration

#### Good: Environment-Specific Configuration
```typescript
import {
  ConversationCompactorModifier,
  ChatRecordingModifier,
  ToolValidationModifier,
  LoopDetectionModifier
} from '@codebolt/agent/processor-pieces';

const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const agent = new CodeboltAgent({
  instructions: 'You are a well-configured agent.',
  tools: [myTool],

  messageModifiers: [
    // Development-specific processors
    ...(isDevelopment ? [
      new ChatRecordingModifier({
        outputPath: './dev-logs'
      })
    ] : [])
  ],

  postToolCallProcessors: [
    // Always include essential processors
    new ConversationCompactorModifier({
      maxConversationLength: isDevelopment ? 10 : 30
    })
  ],

  preToolCallProcessors: [
    new ToolValidationModifier({
      strictMode: isProduction // Strict validation in production
    })
  ],

  postInferenceProcessors: [
    ...(isDevelopment ? [
      new LoopDetectionModifier({
        maxIterations: 5 // Lower limit for development
      })
    ] : [])
  ]
});
```

### 4. Error Handling

#### Good: Comprehensive Error Handling
```typescript
async function executeWithErrorHandling(agent: CodeboltAgent, message: string) {
  try {
    const result = await agent.execute({
      role: 'user',
      content: message
    });

    if (!result.success) {
      // Log structured error information
      console.error('Agent execution failed:', {
        error: result.error
      });

      // Return user-friendly error message
      return {
        success: false,
        message: 'I encountered an issue processing your request. Please try again.',
        errorCode: 'AGENT_EXECUTION_FAILED'
      };
    }

    return {
      success: true,
      response: result.result
    };

  } catch (error) {
    // Log unexpected errors
    console.error('Unexpected error during agent execution:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      message,
      timestamp: new Date().toISOString()
    });

    return {
      success: false,
      message: 'I\'m experiencing technical difficulties. Please try again later.',
      errorCode: 'UNEXPECTED_ERROR'
    };
  }
}
```

### 5. Performance Optimization

#### Good: Resource Management
```typescript
import { ConversationCompactorModifier } from '@codebolt/agent/processor-pieces';

// Optimized agent configuration
const optimizedAgent = new CodeboltAgent({
  instructions: 'You are an optimized agent.',
  tools: [myTool],

  // Use conversation compaction to manage memory
  postToolCallProcessors: [
    new ConversationCompactorModifier({
      maxConversationLength: 20 // Keep conversation manageable
    })
  ]
});
```

### 6. Testing Strategies

#### Good: Comprehensive Testing
```typescript
import { createTool, CodeboltAgent } from '@codebolt/agent/unified';
import { z } from 'zod';

// Unit testing for tools
describe('Calculator Tool', () => {
  const calculatorTool = createTool({
    id: 'calculator',
    description: 'Calculator',
    inputSchema: z.object({ expression: z.string() }),
    execute: async ({ input }) => ({ result: eval(input.expression) })
  });

  it('should perform basic arithmetic', async () => {
    const result = await calculatorTool.execute({ expression: '2 + 2' }, {});
    expect(result.success).toBe(true);
    expect(result.result.result).toBe(4);
  });

  it('should handle complex expressions', async () => {
    const result = await calculatorTool.execute({ expression: 'Math.sqrt(16)' }, {});
    expect(result.success).toBe(true);
    expect(result.result.result).toBe(4);
  });
});

// Integration testing for agents
describe('Math Agent Integration', () => {
  const calculatorTool = createTool({
    id: 'calculator',
    description: 'Calculator',
    inputSchema: z.object({ expression: z.string() }),
    execute: async ({ input }) => ({ result: eval(input.expression) })
  });

  const mathAgent = new CodeboltAgent({
    instructions: 'You solve mathematical problems.',
    tools: [calculatorTool]
  });

  it('should solve math problems', async () => {
    const result = await mathAgent.execute({
      role: 'user',
      content: 'What is 15 * 7?'
    });
    expect(result.success).toBe(true);
  });
});
```

### 7. Debugging

#### Good: Using ChatRecordingModifier for debugging
```typescript
import { ChatRecordingModifier } from '@codebolt/agent/processor-pieces';

const debugAgent = new CodeboltAgent({
  instructions: 'You are a debug agent.',
  tools: [myTools],

  messageModifiers: [
    new ChatRecordingModifier({
      enabled: true,
      outputPath: './debug-logs'
    })
  ]
});
```

## Conclusion

The Unified Agent Framework provides a comprehensive, production-ready system for building sophisticated AI applications. By following these best practices and examples, you can create robust, scalable, and maintainable AI systems.

Key takeaways:
- **Start Simple**: Begin with basic agents and tools, then add complexity as needed
- **Design for Scale**: Use proper error handling and resource management
- **Test Thoroughly**: Implement comprehensive testing at all levels
- **Use Processors**: Add processors for validation and conversation management
- **Follow Patterns**: Use established patterns for common use cases
