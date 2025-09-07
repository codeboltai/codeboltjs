# Examples and Best Practices

This section provides comprehensive examples and best practices for using the Unified Agent Framework effectively.

## Complete Application Examples

### 1. Customer Support System

```typescript
import {
  createAgent,
  createTool,
  createWorkflow,
  createOrchestrator,
  createAgentStep,
  createToolStep,
  ConversationCompactorProcessor,
  ToolValidationProcessor,
  TelemetryProcessor,
  ChatRecordingProcessor
} from '@codebolt/agent/unified';
import { z } from 'zod';

// Create specialized tools
const ticketSearchTool = createTool({
  id: 'ticket-search',
  name: 'Ticket Search',
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
  name: 'Knowledge Base Search',
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
  name: 'Escalate Ticket',
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

// Create specialized agents
const supportAgent = createAgent({
  name: 'Customer Support Agent',
  instructions: `You are a helpful customer support agent. Your role is to:
  1. Understand customer issues clearly
  2. Search for relevant tickets and knowledge base articles
  3. Provide accurate and helpful solutions
  4. Escalate complex issues when necessary
  5. Maintain a friendly and professional tone`,
  
  tools: [ticketSearchTool, knowledgeBaseTool, escalationTool],
  
  processors: {
    followUpConversation: [
      new ConversationCompactorProcessor({
        maxConversationLength: 30,
        preserveRecentMessages: 5
      }),
      new TelemetryProcessor({
        enableMetrics: true,
        customMetrics: {
          'support.ticket.searches': (context) => 
            context.toolResults?.filter(r => r.toolName === 'ticket-search').length || 0,
          'support.escalations': (context) =>
            context.toolResults?.filter(r => r.toolName === 'escalate-ticket').length || 0
        }
      })
    ],
    preToolCall: [
      new ToolValidationProcessor({
        strictMode: true,
        enableInputValidation: true
      })
    ]
  }
});

// Create support workflow
const supportWorkflow = createWorkflow({
  name: 'Customer Support Workflow',
  description: 'Comprehensive customer support process',
  steps: [
    createAgentStep({
      id: 'initial-assessment',
      name: 'Initial Assessment',
      agent: supportAgent,
      message: 'Assess this customer issue: {{customerMessage}}',
      outputMapping: {
        assessment: 'agentResult.response',
        suggestedActions: 'agentResult.toolResults'
      }
    }),
    createToolStep({
      id: 'knowledge-search',
      name: 'Knowledge Base Search',
      tool: knowledgeBaseTool,
      input: (context) => ({
        query: context.data.customerMessage,
        category: context.data.category
      }),
      outputMapping: {
        knowledgeArticles: 'toolResult.articles'
      }
    }),
    createAgentStep({
      id: 'solution-generation',
      name: 'Generate Solution',
      agent: supportAgent,
      message: 'Based on the assessment {{assessment}} and knowledge articles {{knowledgeArticles}}, provide a solution for: {{customerMessage}}',
      dependencies: ['initial-assessment', 'knowledge-search'],
      outputMapping: {
        solution: 'agentResult.response'
      }
    })
  ]
});

// Create support orchestrator
const supportOrchestrator = createOrchestrator({
  name: 'Customer Support Orchestrator',
  instructions: `You coordinate customer support operations intelligently:
  
  - For simple questions: Use knowledge base search
  - For account issues: Search tickets and provide direct help
  - For complex problems: Use the full support workflow
  - For urgent issues: Escalate immediately`,
  
  agents: {
    'support-agent': supportAgent
  },
  
  workflows: {
    'support-workflow': supportWorkflow
  },
  
  tools: {
    'ticket-search': ticketSearchTool,
    'knowledge-base': knowledgeBaseTool,
    'escalate-ticket': escalationTool
  },
  
  limits: {
    maxSteps: 8,
    maxExecutionTime: 120000 // 2 minutes
  }
});

// Usage example
async function handleCustomerSupport() {
  const customerMessage = "I can't log into my account and I have an important meeting in 30 minutes";
  
  const result = await supportOrchestrator.loop(customerMessage);
  
  console.log('Support Result:', {
    success: result.success,
    response: result.response,
    stepsExecuted: result.executionSteps.length,
    resourcesUsed: {
      agents: result.metrics.agentsExecuted,
      workflows: result.metrics.workflowsExecuted,
      tools: result.metrics.toolsExecuted
    }
  });
}
```

### 2. Content Creation Pipeline

```typescript
// Research and content creation system
const researchAgent = createAgent({
  name: 'Research Specialist',
  instructions: 'You are an expert researcher who gathers comprehensive information on any topic.',
  tools: [
    createTool({
      id: 'web-search',
      name: 'Web Search',
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
      name: 'Academic Search',
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

const writerAgent = createAgent({
  name: 'Content Writer',
  instructions: 'You are a skilled content writer who creates engaging, well-structured content.',
  tools: [
    createTool({
      id: 'style-checker',
      name: 'Style Checker',
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

const editorAgent = createAgent({
  name: 'Content Editor',
  instructions: 'You are a meticulous editor who refines and polishes content.',
  tools: [
    createTool({
      id: 'grammar-check',
      name: 'Grammar Checker',
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

// Content creation workflow
const contentWorkflow = createWorkflow({
  name: 'Content Creation Pipeline',
  steps: [
    createAgentStep({
      id: 'research-phase',
      name: 'Research Phase',
      agent: researchAgent,
      message: 'Research comprehensive information about: {{topic}}. Focus on {{focus_areas}}.',
      outputMapping: {
        researchData: 'agentResult.response',
        sources: 'agentResult.toolResults'
      }
    }),
    createAgentStep({
      id: 'writing-phase',
      name: 'Writing Phase',
      agent: writerAgent,
      message: 'Write a {{content_type}} about {{topic}} using this research: {{researchData}}. Target audience: {{audience}}. Length: {{length}}.',
      dependencies: ['research-phase'],
      outputMapping: {
        draft: 'agentResult.response',
        styleAnalysis: 'agentResult.toolResults'
      }
    }),
    createAgentStep({
      id: 'editing-phase',
      name: 'Editing Phase',
      agent: editorAgent,
      message: 'Edit and polish this content: {{draft}}. Ensure it meets {{quality_standards}}.',
      dependencies: ['writing-phase'],
      outputMapping: {
        finalContent: 'agentResult.response',
        qualityReport: 'agentResult.toolResults'
      }
    })
  ],
  initialData: {
    topic: 'Artificial Intelligence in Healthcare',
    content_type: 'blog post',
    audience: 'healthcare professionals',
    length: '1500 words',
    focus_areas: ['current applications', 'future trends', 'challenges'],
    quality_standards: 'professional, accurate, engaging'
  }
});

// Usage
async function createContent() {
  const result = await contentWorkflow.execute();
  
  if (result.success) {
    console.log('Content created successfully!');
    console.log('Final content:', result.data.finalContent);
    console.log('Quality report:', result.data.qualityReport);
  }
}
```

### 3. Data Analysis System

```typescript
// Multi-agent data analysis system
const dataCollectorAgent = createAgent({
  name: 'Data Collector',
  instructions: 'You collect and validate data from various sources.',
  tools: [
    createTool({
      id: 'api-connector',
      name: 'API Connector',
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
      name: 'Data Validator',
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

const dataAnalystAgent = createAgent({
  name: 'Data Analyst',
  instructions: 'You perform statistical analysis and generate insights from data.',
  tools: [
    createTool({
      id: 'statistical-analysis',
      name: 'Statistical Analysis',
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
      name: 'Data Visualization',
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

const reportGeneratorAgent = createAgent({
  name: 'Report Generator',
  instructions: 'You create comprehensive reports from analysis results.',
  tools: [
    createTool({
      id: 'report-builder',
      name: 'Report Builder',
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

// Data analysis orchestrator
const dataOrchestrator = createOrchestrator({
  name: 'Data Analysis Orchestrator',
  instructions: `You coordinate data analysis workflows:
  
  1. For data collection tasks → use data collector
  2. For analysis tasks → use data analyst  
  3. For reporting → use report generator
  4. For end-to-end analysis → coordinate all agents`,
  
  agents: {
    'collector': dataCollectorAgent,
    'analyst': dataAnalystAgent,
    'reporter': reportGeneratorAgent
  }
});

// Usage
async function analyzeData() {
  const result = await dataOrchestrator.loop(
    'Collect sales data from our API, analyze trends, and generate a comprehensive report'
  );
  
  console.log('Analysis completed:', result.success);
  console.log('Report:', result.response);
}
```

## Best Practices

### 1. Agent Design Principles

#### ✅ Good: Focused, Specialized Agents
```typescript
// Specialized agents with clear responsibilities
const emailAgent = createAgent({
  name: 'Email Specialist',
  instructions: 'You handle email-related tasks with expertise in email protocols and best practices.',
  tools: [emailSendTool, emailValidationTool, templateTool],
  llmConfig: {
    temperature: 0.3, // Lower temperature for accuracy
    maxTokens: 1500
  }
});

const calculationAgent = createAgent({
  name: 'Math Specialist',
  instructions: 'You perform mathematical calculations and solve numerical problems.',
  tools: [calculatorTool, statisticsTool, graphingTool],
  llmConfig: {
    temperature: 0.1, // Very low for mathematical accuracy
    maxTokens: 1000
  }
});
```

#### ❌ Avoid: Generic, Unfocused Agents
```typescript
// Avoid overly generic agents
const genericAgent = createAgent({
  name: 'Generic Agent',
  instructions: 'You do everything and anything.',
  tools: [/* 20+ unrelated tools */], // Too many tools
  llmConfig: {
    temperature: 0.7, // Not optimized for any specific task
    maxTokens: 4000
  }
});
```

### 2. Tool Organization

#### ✅ Good: Logical Tool Grouping
```typescript
// Group related tools
const fileOperationTools = [
  createFileTool({ operation: 'read', id: 'file-read' }),
  createFileTool({ operation: 'write', id: 'file-write' }),
  createFileTool({ operation: 'delete', id: 'file-delete' })
];

const apiTools = [
  createHttpTool({ method: 'GET', id: 'api-get' }),
  createHttpTool({ method: 'POST', id: 'api-post' }),
  createValidationTool({ schema: apiResponseSchema, id: 'api-validate' })
];

// Clear, descriptive tool definitions
const calculatorTool = createTool({
  id: 'advanced-calculator',
  name: 'Advanced Calculator',
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

#### ❌ Avoid: Poor Tool Organization
```typescript
// Avoid unclear tool definitions
const badTool = createTool({
  id: 'tool1', // Non-descriptive ID
  name: 'Tool', // Generic name
  description: 'Does stuff', // Vague description
  inputSchema: z.any(), // No input validation
  execute: async ({ input }) => input // No actual functionality
});
```

### 3. Workflow Design

#### ✅ Good: Clear Dependencies and Error Handling
```typescript
const robustWorkflow = createWorkflow({
  name: 'Data Processing Pipeline',
  description: 'Robust data processing with error handling',
  steps: [
    createValidationStep({
      id: 'validate-input',
      name: 'Input Validation',
      schema: inputSchema,
      stopOnFailure: true, // Stop if validation fails
      errorMessage: 'Input validation failed'
    }),
    createToolStep({
      id: 'process-data',
      name: 'Data Processing',
      tool: processingTool,
      dependencies: ['validate-input'],
      retry: {
        maxAttempts: 3,
        delay: 1000,
        backoff: 'exponential'
      },
      onError: 'continue' // Continue with next step on error
    }),
    createConditionalStep({
      id: 'quality-check',
      name: 'Quality Check',
      condition: (context) => context.data.processedData?.quality > 0.8,
      trueSteps: [
        createToolStep({
          id: 'finalize',
          name: 'Finalize Processing',
          tool: finalizeTool
        })
      ],
      falseSteps: [
        createToolStep({
          id: 'reprocess',
          name: 'Reprocess Data',
          tool: reprocessTool
        })
      ]
    })
  ],
  continueOnError: false, // Stop workflow on critical errors
  timeout: 300000 // 5 minute timeout
});
```

#### ❌ Avoid: Fragile Workflow Design
```typescript
const fragileWorkflow = createWorkflow({
  name: 'Fragile Workflow',
  steps: [
    createToolStep({
      id: 'step1',
      tool: unreliableTool
      // No error handling, no retries, no validation
    }),
    createToolStep({
      id: 'step2',
      tool: anotherTool,
      dependencies: ['step1']
      // Will fail if step1 fails
    })
  ]
  // No timeout, no error handling configuration
});
```

### 4. Processor Configuration

#### ✅ Good: Environment-Specific Configuration
```typescript
const isDevelopment = process.env.NODE_ENV === 'development';
const isProduction = process.env.NODE_ENV === 'production';

const agent = createAgent({
  name: 'Configurable Agent',
  instructions: 'You are a well-configured agent.',
  
  processors: {
    followUpConversation: [
      // Always include essential processors
      new ConversationCompactorProcessor({
        maxConversationLength: isDevelopment ? 10 : 30,
        enableSummarization: !isDevelopment // Disable expensive operations in dev
      }),
      
      // Development-specific processors
      ...(isDevelopment ? [
        new ChatRecordingProcessor({
          storageLocation: './dev-logs',
          includeMetadata: true
        })
      ] : []),
      
      // Production-specific processors
      ...(isProduction ? [
        new TelemetryProcessor({
          metricsEndpoint: process.env.METRICS_ENDPOINT,
          enableMetrics: true,
          enableLogging: false // Reduce noise in production
        }),
        new ResponseValidationProcessor({
          enableSafetyCheck: true,
          strictMode: true
        })
      ] : [])
    ],
    
    preToolCall: [
      new ToolValidationProcessor({
        strictMode: isProduction, // Strict validation in production
        enableInputValidation: true,
        enableOutputValidation: isProduction
      }),
      
      ...(isDevelopment ? [
        new LoopDetectionProcessor({
          maxIterations: 5 // Lower limit for development
        })
      ] : [])
    ]
  }
});
```

### 5. Error Handling

#### ✅ Good: Comprehensive Error Handling
```typescript
async function executeWithErrorHandling(agent: Agent, message: string) {
  try {
    const result = await agent.execute(message, {
      maxIterations: 5,
      timeout: 30000
    });
    
    if (!result.success) {
      // Log structured error information
      console.error('Agent execution failed:', {
        error: result.error,
        iterations: result.iterations,
        lastToolResult: result.toolResults?.[result.toolResults.length - 1],
        conversationLength: result.conversationHistory?.length
      });
      
      // Return user-friendly error message
      return {
        success: false,
        message: 'I encountered an issue processing your request. Please try rephrasing or contact support if the problem persists.',
        errorCode: 'AGENT_EXECUTION_FAILED'
      };
    }
    
    return {
      success: true,
      response: result.response,
      metadata: {
        iterations: result.iterations,
        toolsUsed: result.toolResults?.length || 0,
        executionTime: result.executionTime
      }
    };
    
  } catch (error) {
    // Log unexpected errors
    console.error('Unexpected error during agent execution:', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      message,
      timestamp: new Date().toISOString()
    });
    
    // Send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      await sendToErrorTracking(error, { message, agentName: agent.config.name });
    }
    
    return {
      success: false,
      message: 'I\'m experiencing technical difficulties. Please try again later.',
      errorCode: 'UNEXPECTED_ERROR'
    };
  }
}

async function sendToErrorTracking(error: unknown, context: Record<string, unknown>) {
  // Implementation for error tracking service
}
```

### 6. Performance Optimization

#### ✅ Good: Resource Management
```typescript
// Optimized orchestrator configuration
const optimizedOrchestrator = createOrchestrator({
  name: 'Optimized Orchestrator',
  instructions: 'You coordinate resources efficiently.',
  
  // Resource limits
  limits: {
    maxSteps: 8, // Reasonable step limit
    maxExecutionTime: 60000, // 1 minute timeout
    maxMemoryUsage: 100 * 1024 * 1024 // 100MB memory limit
  },
  
  // Decision optimization
  decisionConfig: {
    confidenceThreshold: 0.8, // Higher threshold for faster decisions
    explainDecisions: false, // Disable in production for speed
    askConfirmation: false
  },
  
  // Memory optimization
  memory: {
    persistent: false, // Disable persistence if not needed
    maxSize: 100, // Limit memory entries
    ttl: 300000 // 5 minute TTL
  },
  
  agents: { /* optimized agents */ },
  workflows: { /* optimized workflows */ }
});

// Parallel workflow execution
const parallelWorkflow = createWorkflow({
  name: 'Parallel Processing Workflow',
  steps: [
    // These steps can run in parallel
    createAgentStep({
      id: 'task1',
      name: 'Task 1',
      agent: agent1,
      parallel: true
    }),
    createAgentStep({
      id: 'task2',
      name: 'Task 2',
      agent: agent2,
      parallel: true
    }),
    createAgentStep({
      id: 'task3',
      name: 'Task 3',
      agent: agent3,
      parallel: true
    }),
    
    // This step waits for all parallel tasks
    createAgentStep({
      id: 'summary',
      name: 'Summarize Results',
      agent: summaryAgent,
      dependencies: ['task1', 'task2', 'task3']
    })
  ],
  maxParallelSteps: 3 // Allow up to 3 parallel steps
});
```

### 7. Testing Strategies

#### ✅ Good: Comprehensive Testing
```typescript
// Unit testing for tools
describe('Calculator Tool', () => {
  const calculatorTool = createTool({
    id: 'calculator',
    name: 'Calculator',
    inputSchema: z.object({ expression: z.string() }),
    execute: async ({ input }) => ({ result: eval(input.expression) })
  });
  
  it('should perform basic arithmetic', async () => {
    const result = await executeTool(calculatorTool, { expression: '2 + 2' });
    expect(result.result).toBe(4);
  });
  
  it('should handle complex expressions', async () => {
    const result = await executeTool(calculatorTool, { expression: 'Math.sqrt(16)' });
    expect(result.result).toBe(4);
  });
  
  it('should handle invalid expressions gracefully', async () => {
    await expect(executeTool(calculatorTool, { expression: 'invalid' }))
      .rejects.toThrow();
  });
});

// Integration testing for agents
describe('Math Agent Integration', () => {
  const mathAgent = createAgent({
    name: 'Math Agent',
    instructions: 'You solve mathematical problems.',
    tools: [calculatorTool]
  });
  
  it('should solve math problems', async () => {
    const result = await mathAgent.execute('What is 15 * 7?');
    expect(result.success).toBe(true);
    expect(result.response).toContain('105');
  });
  
  it('should handle multiple calculations', async () => {
    const result = await mathAgent.execute('Calculate both 10 + 5 and 20 - 8');
    expect(result.success).toBe(true);
    expect(result.toolResults).toHaveLength(2);
  });
});

// End-to-end testing for workflows
describe('Data Processing Workflow E2E', () => {
  it('should process data end-to-end', async () => {
    const workflow = createWorkflow({
      name: 'Test Workflow',
      steps: [
        createToolStep({
          id: 'collect',
          tool: dataCollectionTool
        }),
        createToolStep({
          id: 'process',
          tool: dataProcessingTool,
          dependencies: ['collect']
        })
      ]
    });
    
    const result = await workflow.execute();
    
    expect(result.success).toBe(true);
    expect(result.stepResults).toHaveLength(2);
    expect(result.data.processedData).toBeDefined();
  });
});
```

### 8. Monitoring and Observability

#### ✅ Good: Comprehensive Monitoring
```typescript
// Production monitoring setup
const productionAgent = createAgent({
  name: 'Production Agent',
  instructions: 'You are a production-ready agent.',
  
  processors: {
    followUpConversation: [
      new TelemetryProcessor({
        enableMetrics: true,
        enableTracing: true,
        metricsEndpoint: process.env.METRICS_ENDPOINT,
        
        // Custom metrics for business insights
        customMetrics: {
          'agent.success_rate': (context) => context.success ? 1 : 0,
          'agent.response_time': (context) => context.executionTime,
          'agent.tool_usage': (context) => context.toolResults?.length || 0,
          'agent.conversation_length': (context) => context.conversationHistory?.length || 0,
          'agent.user_satisfaction': (context) => context.userFeedback?.rating || 0
        },
        
        // Performance monitoring
        performanceThresholds: {
          maxResponseTime: 30000, // 30 seconds
          maxMemoryUsage: 100 * 1024 * 1024, // 100MB
          maxTokenUsage: 4000
        }
      }),
      
      new ResponseValidationProcessor({
        enableContentValidation: true,
        enableSafetyCheck: true,
        
        // Quality metrics
        qualityMetrics: [
          'response_length',
          'readability_score',
          'sentiment_appropriateness',
          'factual_accuracy'
        ]
      })
    ]
  }
});

// Health check endpoint
async function healthCheck() {
  try {
    const testResult = await productionAgent.execute('Hello, are you working?', {
      maxIterations: 1,
      timeout: 5000
    });
    
    return {
      status: testResult.success ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      responseTime: testResult.executionTime,
      version: process.env.APP_VERSION
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    };
  }
}
```

## Migration Guide

### From Other Agent Patterns

#### From ComposableAgent
```typescript
// Old ComposableAgent pattern
const oldAgent = new ComposableAgent({
  name: 'Research Agent',
  instructions: 'You conduct research',
  tools: [researchTool],
  processors: [compressionProcessor]
});

// New Unified Agent
const newAgent = createAgent({
  name: 'Research Agent',
  instructions: 'You conduct research',
  tools: [researchTool],
  processors: {
    followUpConversation: [compressionProcessor]
  },
  defaultProcessors: true // Adds sensible defaults
});
```

#### Migration Steps

1. **Update Imports**
```typescript
// Old imports
import { ComposableAgent } from '@codebolt/agent/composable';
import { SomeProcessor } from '@codebolt/agent/processor-pieces';

// New imports
import { createAgent, SomeProcessor } from '@codebolt/agent/unified';
```

2. **Convert Agent Creation**
```typescript
// Replace constructor calls with factory functions
const agent = createAgent({ /* config */ });
const workflow = createWorkflow({ /* config */ });
const orchestrator = createOrchestrator({ /* config */ });
```

3. **Update Processor Usage**
```typescript
// Old: Manual processor management
agent.addProcessor(processor);

// New: Structured processor configuration
const agent = createAgent({
  processors: {
    followUpConversation: [processor1, processor2],
    preToolCall: [processor3]
  }
});
```

## Conclusion

The Unified Agent Framework provides a comprehensive, production-ready system for building sophisticated AI applications. By following these best practices and examples, you can create robust, scalable, and maintainable AI systems that grow with your needs.

Key takeaways:
- **Start Simple**: Begin with basic agents and tools, then add complexity as needed
- **Design for Scale**: Use proper error handling, monitoring, and resource management
- **Test Thoroughly**: Implement comprehensive testing at all levels
- **Monitor Everything**: Use telemetry and observability for production systems
- **Follow Patterns**: Use established patterns for common use cases
- **Optimize Performance**: Consider resource usage and execution time
- **Plan for Growth**: Design systems that can evolve and expand
