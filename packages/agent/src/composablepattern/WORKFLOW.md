# Workflow System

The Workflow system provides orchestration for multi-step agent processes, allowing you to chain multiple agents and create complex automation pipelines.

## Overview

Workflows enable you to:
- **Chain Multiple Agents**: Connect different specialized agents in sequence
- **Conditional Logic**: Execute different paths based on data or results
- **Parallel Processing**: Run multiple steps simultaneously
- **Data Transformation**: Process and transform data between steps
- **Error Handling**: Handle failures gracefully with retry logic
- **Context Sharing**: Share data between workflow steps

## Basic Workflow Example

```typescript
import { 
  ComposableAgent, 
  Workflow, 
  createWorkflow, 
  createAgentStep,
  createTransformStep,
  openai 
} from '@codebolt/agent/composable';

// Create agents
const researchAgent = new ComposableAgent({
  name: 'Research Agent',
  instructions: 'Research topics and provide detailed information',
  model: openai('gpt-4o-mini')
});

const writingAgent = new ComposableAgent({
  name: 'Writing Agent', 
  instructions: 'Write engaging content based on research',
  model: openai('gpt-4o-mini')
});

// Create workflow
const contentWorkflow = createWorkflow({
  name: 'Content Creation',
  initialData: { topic: 'AI in Healthcare' },
  steps: [
    // Step 1: Research
    createAgentStep({
      id: 'research',
      name: 'Research Topic',
      agent: researchAgent,
      messageTemplate: 'Research: {{topic}}',
      outputMapping: { 'researchData': 'agentResult.message' }
    }),
    
    // Step 2: Write
    createAgentStep({
      id: 'write',
      name: 'Write Article',
      agent: writingAgent,
      messageTemplate: 'Write article about {{topic}} using: {{researchData}}',
      outputMapping: { 'article': 'agentResult.message' }
    })
  ]
});

// Execute workflow
const result = await contentWorkflow.execute();
console.log(result.data.article);
```

## Step Types

### Custom Steps

Create your own custom step logic with the flexible `createStep` function:

```typescript
const customStep = createStep({
  id: 'my-custom-step',
  name: 'My Custom Logic',
  description: 'Performs custom business logic',
  execute: async (context) => {
    // Your custom logic here
    const result = await performCustomOperation(context.data);
    
    return {
      stepId: 'my-custom-step',
      success: true,
      output: { customResult: result },
      executionTime: 0
    };
  },
  condition: (context) => context.data.shouldRun === true,
  retry: {
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential'
  }
});
```

### Simple Steps

For straightforward data transformations, use `createSimpleStep`:

```typescript
const mathStep = createSimpleStep({
  id: 'calculate-total',
  name: 'Calculate Order Total',
  execute: (data) => {
    const subtotal = data.items.reduce((sum, item) => sum + item.price, 0);
    const tax = subtotal * 0.08;
    return { subtotal, tax, total: subtotal + tax };
  }
});
```

### Async Steps

For operations that need async/await, use `createAsyncStep`:

```typescript
const apiStep = createAsyncStep({
  id: 'fetch-data',
  name: 'Fetch External Data',
  execute: async (data, context) => {
    const response = await fetch(`/api/data/${data.id}`);
    const result = await response.json();
    return { fetchedData: result };
  },
  retry: {
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential'
  }
});
```

### Validation Steps

Validate data against schemas:

```typescript
const validationStep = createValidationStep({
  id: 'validate-input',
  name: 'Validate User Input',
  schema: z.object({
    email: z.string().email(),
    age: z.number().min(18)
  }),
  field: 'userInput', // Validate specific field
  stopOnFailure: true // Stop workflow if validation fails
});
```

### Logging Steps

Add debugging and monitoring:

```typescript
const logStep = createLoggingStep({
  id: 'log-progress',
  name: 'Log Current State',
  level: 'info',
  message: 'Processing user data',
  fields: ['userId', 'processingStage'] // Log specific fields
});
```

### Agent Steps

Execute a ComposableAgent with templated input:

```typescript
createAgentStep({
  id: 'analyze',
  name: 'Analyze Data',
  agent: analysisAgent,
  messageTemplate: 'Analyze this data: {{inputData}}',
  inputMapping: {
    'dataToAnalyze': 'rawData'  // Map context.rawData to step.dataToAnalyze
  },
  outputMapping: {
    'analysis': 'agentResult.message',  // Map result to context.analysis
    'score': 'agentResult.metadata.score'
  }
})
```

### Transform Steps

Process and transform data:

```typescript
createTransformStep({
  id: 'process',
  name: 'Process Results',
  inputSchema: z.object({
    score: z.number(),
    feedback: z.string()
  }),
  outputSchema: z.object({
    passed: z.boolean(),
    summary: z.string()
  }),
  transform: (data) => ({
    passed: data.score >= 7,
    summary: `Score: ${data.score}/10 - ${data.feedback}`
  })
})
```

### Conditional Steps

Execute different branches based on conditions:

```typescript
createConditionalStep({
  id: 'quality-check',
  name: 'Quality Gate',
  condition: (context) => context.data.score >= 8,
  trueBranch: [
    createTransformStep({
      id: 'approve',
      name: 'Approve Content',
      transform: (data) => ({ status: 'approved' })
    })
  ],
  falseBranch: [
    createAgentStep({
      id: 'improve',
      name: 'Improve Content',
      agent: improvementAgent,
      messageTemplate: 'Improve: {{content}} based on: {{feedback}}'
    })
  ]
})
```

### Delay Steps

Add delays between steps:

```typescript
createDelayStep({
  id: 'wait',
  name: 'Wait for Processing',
  delay: 2000  // 2 seconds
})
```

## Advanced Features

### Parallel Processing

Steps marked with `parallel: true` run concurrently:

```typescript
const workflow = createWorkflow({
  name: 'Parallel Analysis',
  steps: [
    createAgentStep({
      id: 'sentiment',
      name: 'Sentiment Analysis',
      agent: sentimentAgent,
      parallel: true,
      messageTemplate: 'Analyze sentiment: {{text}}'
    }),
    createAgentStep({
      id: 'keywords',
      name: 'Keyword Extraction', 
      agent: keywordAgent,
      parallel: true,
      messageTemplate: 'Extract keywords: {{text}}'
    }),
    // This step waits for both parallel steps to complete
    createTransformStep({
      id: 'combine',
      name: 'Combine Results',
      transform: (data) => ({
        analysis: {
          sentiment: data.sentimentResult,
          keywords: data.keywordResult
        }
      })
    })
  ]
});
```

### Dependencies

Specify step dependencies:

```typescript
createAgentStep({
  id: 'final-report',
  name: 'Generate Report',
  dependencies: ['sentiment', 'keywords', 'summary'],  // Wait for these steps
  agent: reportAgent,
  messageTemplate: 'Create report with sentiment: {{sentimentResult}}, keywords: {{keywordResult}}, summary: {{summaryResult}}'
})
```

### Retry Logic

Add retry behavior to steps:

```typescript
createAgentStep({
  id: 'api-call',
  name: 'Call External API',
  agent: apiAgent,
  retry: {
    maxAttempts: 3,
    delay: 1000,      // 1 second base delay
    backoff: 'exponential'  // 1s, 2s, 4s delays
  },
  messageTemplate: 'Make API call with: {{data}}'
})
```

### Error Handling

Configure workflow error behavior:

```typescript
const workflow = createWorkflow({
  name: 'Resilient Workflow',
  continueOnError: true,  // Continue even if steps fail
  timeout: 60000,         // 1 minute timeout
  maxParallelSteps: 3,    // Limit parallel execution
  steps: [
    // ... steps
  ]
});
```

## Real-World Examples

### Customer Support Pipeline

```typescript
const supportWorkflow = createWorkflow({
  name: 'Customer Support',
  initialData: {
    customerMessage: "I can't log into my account",
    customerId: "CUST-12345"
  },
  steps: [
    // Classify the inquiry
    createAgentStep({
      id: 'classify',
      name: 'Classify Issue',
      agent: classificationAgent,
      messageTemplate: 'Classify: {{customerMessage}}',
      outputMapping: { 'category': 'agentResult.message' }
    }),
    
    // Route to appropriate agent
    createConditionalStep({
      id: 'route',
      name: 'Route to Specialist',
      condition: (ctx) => ctx.data.category.includes('technical'),
      trueBranch: [
        createAgentStep({
          id: 'technical-support',
          name: 'Technical Support',
          agent: techAgent,
          messageTemplate: 'Help with technical issue: {{customerMessage}}'
        })
      ],
      falseBranch: [
        createAgentStep({
          id: 'general-support',
          name: 'General Support',
          agent: generalAgent,
          messageTemplate: 'Help with inquiry: {{customerMessage}}'
        })
      ]
    }),
    
    // Generate response
    createTransformStep({
      id: 'format-response',
      name: 'Format Response',
      transform: (data) => ({
        response: {
          customerId: data.customerId,
          category: data.category,
          solution: data.supportResponse,
          timestamp: new Date().toISOString()
        }
      })
    })
  ]
});
```

### Content Creation Pipeline

```typescript
const contentPipeline = createWorkflow({
  name: 'Blog Post Creation',
  initialData: { topic: 'Future of Remote Work' },
  steps: [
    // Research phase
    createAgentStep({
      id: 'research',
      name: 'Research Topic',
      agent: researchAgent,
      messageTemplate: 'Research trends and statistics for: {{topic}}'
    }),
    
    // Outline creation
    createAgentStep({
      id: 'outline',
      name: 'Create Outline',
      agent: outlineAgent,
      messageTemplate: 'Create outline for {{topic}} using research: {{researchData}}'
    }),
    
    // Parallel content creation
    createAgentStep({
      id: 'intro',
      name: 'Write Introduction',
      agent: writingAgent,
      parallel: true,
      messageTemplate: 'Write engaging intro for: {{outline}}'
    }),
    
    createAgentStep({
      id: 'body',
      name: 'Write Body',
      agent: writingAgent,
      parallel: true,
      messageTemplate: 'Write main content for: {{outline}}'
    }),
    
    createAgentStep({
      id: 'conclusion',
      name: 'Write Conclusion',
      agent: writingAgent,
      parallel: true,
      messageTemplate: 'Write conclusion for: {{outline}}'
    }),
    
    // Combine and review
    createTransformStep({
      id: 'combine',
      name: 'Combine Sections',
      dependencies: ['intro', 'body', 'conclusion'],
      transform: (data) => ({
        fullArticle: `${data.introContent}\n\n${data.bodyContent}\n\n${data.conclusionContent}`
      })
    }),
    
    createAgentStep({
      id: 'review',
      name: 'Review Article',
      agent: reviewAgent,
      messageTemplate: 'Review and provide feedback: {{fullArticle}}'
    }),
    
    // Conditional improvement
    createConditionalStep({
      id: 'improve-check',
      name: 'Check if Improvement Needed',
      condition: (ctx) => ctx.data.reviewScore < 8,
      trueBranch: [
        createAgentStep({
          id: 'improve',
          name: 'Improve Article',
          agent: writingAgent,
          messageTemplate: 'Improve article based on feedback: {{reviewFeedback}}\n\nArticle: {{fullArticle}}'
        })
      ]
    })
  ]
});
```

### Data Processing Pipeline

```typescript
const dataProcessingWorkflow = createWorkflow({
  name: 'Data Analysis Pipeline',
  initialData: { 
    dataSource: 'sales_data.csv',
    analysisType: 'quarterly_report'
  },
  steps: [
    // Data extraction
    createTransformStep({
      id: 'extract',
      name: 'Extract Data',
      transform: async (data) => {
        // Simulate data loading
        const rawData = await loadDataFromSource(data.dataSource);
        return { rawData };
      }
    }),
    
    // Data validation
    createTransformStep({
      id: 'validate',
      name: 'Validate Data',
      inputSchema: z.object({
        rawData: z.array(z.record(z.any()))
      }),
      transform: (data) => {
        const validRecords = data.rawData.filter(isValidRecord);
        return {
          validData: validRecords,
          invalidCount: data.rawData.length - validRecords.length
        };
      }
    }),
    
    // Parallel analysis
    createAgentStep({
      id: 'statistical-analysis',
      name: 'Statistical Analysis',
      agent: statsAgent,
      parallel: true,
      messageTemplate: 'Perform statistical analysis on: {{validData}}'
    }),
    
    createAgentStep({
      id: 'trend-analysis',
      name: 'Trend Analysis',
      agent: trendAgent,
      parallel: true,
      messageTemplate: 'Analyze trends in: {{validData}}'
    }),
    
    createAgentStep({
      id: 'anomaly-detection',
      name: 'Detect Anomalies',
      agent: anomalyAgent,
      parallel: true,
      messageTemplate: 'Detect anomalies in: {{validData}}'
    }),
    
    // Generate report
    createAgentStep({
      id: 'generate-report',
      name: 'Generate Report',
      dependencies: ['statistical-analysis', 'trend-analysis', 'anomaly-detection'],
      agent: reportAgent,
      messageTemplate: `Generate ${data.analysisType} report with:
        - Statistics: {{statisticalResults}}
        - Trends: {{trendResults}}  
        - Anomalies: {{anomalyResults}}`
    })
  ]
});
```

## Workflow Context

The workflow context is shared between all steps and contains:

```typescript
interface WorkflowContext {
  data: Record<string, any>;     // Shared data
  history: WorkflowStepResult[]; // Execution history
  currentStep: number;           // Current step index
  metadata: Record<string, any>; // Workflow metadata
}
```

### Accessing Context Data

```typescript
// In agent message templates
messageTemplate: 'Process {{inputData}} with settings {{configuration}}'

// In transform functions
transform: (data) => {
  console.log('Current data:', data);
  return { 
    processed: processData(data.inputData),
    timestamp: new Date().toISOString()
  };
}

// In conditions
condition: (context) => {
  return context.data.score > 7 && context.data.approved === true;
}
```

## Monitoring and Debugging

### Execution Results

```typescript
const result = await workflow.execute();

console.log('Success:', result.success);
console.log('Execution time:', result.executionTime);
console.log('Final data:', result.data);

// Step-by-step results
result.stepResults.forEach(step => {
  console.log(`${step.stepId}: ${step.success ? 'SUCCESS' : 'FAILED'}`);
  if (step.error) console.log(`  Error: ${step.error}`);
  console.log(`  Time: ${step.executionTime}ms`);
});
```

### Workflow Context Inspection

```typescript
// Get current context during execution
const currentContext = workflow.getContext();
console.log('Current data:', currentContext.data);
console.log('Execution history:', currentContext.history);

// Update context
workflow.updateContext({ 
  customFlag: true,
  timestamp: Date.now()
});
```

## Best Practices

### 1. Design for Modularity

```typescript
// Good: Small, focused steps
createAgentStep({
  id: 'extract-keywords',
  name: 'Extract Keywords',
  agent: keywordAgent,
  messageTemplate: 'Extract keywords from: {{text}}'
});

// Better than: One large step that does everything
```

### 2. Handle Errors Gracefully

```typescript
// Add retry logic for flaky operations
createAgentStep({
  id: 'api-call',
  name: 'External API Call',
  agent: apiAgent,
  retry: {
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential'
  }
});

// Use conditional steps for error handling
createConditionalStep({
  id: 'error-recovery',
  name: 'Handle Errors',
  condition: (ctx) => ctx.history.some(step => !step.success),
  trueBranch: [
    createAgentStep({
      id: 'fallback',
      name: 'Fallback Process',
      agent: fallbackAgent
    })
  ]
});
```

### 3. Validate Data Between Steps

```typescript
createTransformStep({
  id: 'validate-input',
  name: 'Validate Input',
  inputSchema: z.object({
    email: z.string().email(),
    age: z.number().min(0).max(120)
  }),
  transform: (data) => data  // Pass through if valid
});
```

### 4. Use Meaningful Step Names

```typescript
// Good
createAgentStep({
  id: 'sentiment-analysis',
  name: 'Analyze Customer Sentiment',
  description: 'Analyze the emotional tone of customer feedback'
});

// Bad
createAgentStep({
  id: 'step1',
  name: 'Process',
  description: 'Do stuff'
});
```

### 5. Optimize Parallel Execution

```typescript
// Group related parallel operations
const workflow = createWorkflow({
  name: 'Parallel Processing',
  maxParallelSteps: 3,  // Limit resource usage
  steps: [
    // These run in parallel
    createAgentStep({ id: 'analysis1', parallel: true, ... }),
    createAgentStep({ id: 'analysis2', parallel: true, ... }),
    createAgentStep({ id: 'analysis3', parallel: true, ... }),
    
    // This waits for all parallel steps
    createTransformStep({
      id: 'combine-results',
      dependencies: ['analysis1', 'analysis2', 'analysis3'],
      transform: combineAnalysisResults
    })
  ]
});
```

The Workflow system provides powerful orchestration capabilities while maintaining the simplicity and composability of the agent pattern. Use it to build complex, multi-step automation that leverages the strengths of different specialized agents.
