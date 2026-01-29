# Workflows

Multi-step orchestration for complex agent tasks.

---

## Basic Workflow

```typescript
import { Workflow } from '@codebolt/agent/unified';

const workflow = new Workflow({
  name: 'Code Review Pipeline',
  description: 'Automated code review process',
  steps: [
    {
      id: 'lint',
      execute: async (context) => ({
        success: true,
        data: { lintPassed: true }
      })
    },
    {
      id: 'test',
      execute: async (context) => ({
        success: true,
        data: { testsPassed: true }
      })
    },
    {
      id: 'review',
      execute: async (context) => ({
        success: true,
        data: { reviewComplete: true }
      })
    }
  ]
});

const result = await workflow.executeAsync();
```

---

## Workflow Configuration

```typescript
interface WorkflowConfig {
  name: string;                    // Workflow name
  description?: string;            // Description
  version?: string;                // Version
  steps: WorkflowStep[];           // Array of steps
  inputSchema?: ZodType;           // Input validation
  outputSchema?: ZodType;          // Output validation
}
```

---

## Step Types

### Basic Step (WorkFlowStep)

```typescript
import { WorkFlowStep } from '@codebolt/agent/unified';

const step = new WorkFlowStep({
  id: 'process-data',
  description: 'Process input data',
  execute: async (context) => ({
    success: true,
    data: { processed: true }
  })
});
```

### Parallel Step

Execute multiple steps concurrently:

```typescript
import { ParallelStep, WorkFlowStep } from '@codebolt/agent/unified';

const parallelStep = new ParallelStep(
  { id: 'parallel-ops', description: 'Run in parallel' },
  [
    new WorkFlowStep({ id: 'task-a', execute: async () => ({ success: true }) }),
    new WorkFlowStep({ id: 'task-b', execute: async () => ({ success: true }) }),
    new WorkFlowStep({ id: 'task-c', execute: async () => ({ success: true }) })
  ]
);
```

### Condition Step

Execute steps sequentially until one fails:

```typescript
import { ConditionStep, WorkFlowStep } from '@codebolt/agent/unified';

const conditionStep = new ConditionStep(
  { id: 'validation', description: 'Validate inputs' },
  [
    new WorkFlowStep({ id: 'check-format', execute: validateFormat }),
    new WorkFlowStep({ id: 'check-size', execute: validateSize }),
    new WorkFlowStep({ id: 'check-content', execute: validateContent })
  ]
);
```

### Loop Step

Repeat steps up to max iterations:

```typescript
import { LoopStep, WorkFlowStep } from '@codebolt/agent/unified';

const loopStep = new LoopStep(
  { id: 'retry-loop', description: 'Retry until success' },
  [
    new WorkFlowStep({ id: 'attempt', execute: attemptOperation })
  ],
  3  // Max 3 iterations
);
```

### Agent Step

Run an agent as a workflow step:

```typescript
import { AgentStep, CodeboltAgent } from '@codebolt/agent/unified';

const agent = new CodeboltAgent({ instructions: 'Review code.' });

const agentStep = new AgentStep(
  { id: 'ai-review', description: 'AI code review' },
  agent
);
```

### Tool Step

Run a tool as a workflow step:

```typescript
import { ToolStep, createTool } from '@codebolt/agent/unified';

const analysisTool = createTool({ /* ... */ });

const toolStep = new ToolStep(
  { id: 'analyze', description: 'Run analysis tool' },
  analysisTool
);
```

---

## Step Result

```typescript
// Generic WorkflowStepResult for type-safe step outputs
interface WorkflowStepResult<T = unknown> {
  success: boolean;
  data?: T;           // Typed step data
  error?: string;
  nextStep?: string;  // Override next step
}

// Example usage with typed data:
// execute: async (context): Promise<WorkflowStepResult<{ processed: boolean }>> => {
//   return { success: true, data: { processed: true } };
// }
```

---

## Workflow Result

```typescript
interface WorkflowResult {
  executionId: string;              // UUID for this execution
  success: boolean;                 // Overall success
  data: Record<string, unknown>;    // Final context
  stepResults: WorkflowStepOutput[];  // All step results
  executionTime: number;            // Duration in ms
  error?: string;                   // Error message if failed
}
```

---

## Context Management

```typescript
const workflow = new Workflow({ name: 'Example', steps: [...] });

// Set initial context
workflow.setInitialContext({ inputData: 'value' });

// Get current context
const ctx = workflow.getContext();

// Update context
workflow.updateContext({ additionalData: 'more' });

// Execute with context
const result = await workflow.executeAsync();
```

---

## Examples

### CI/CD Pipeline

```typescript
const ciPipeline = new Workflow({
  name: 'CI Pipeline',
  steps: [
    {
      id: 'install',
      execute: async (ctx) => {
        await codebolt.terminal.executeCommand('npm install');
        return { success: true };
      }
    },
    {
      id: 'lint',
      execute: async (ctx) => {
        const result = await codebolt.terminal.executeCommand('npm run lint');
        return { success: !result.error, data: { lintOutput: result.output } };
      }
    },
    {
      id: 'test',
      execute: async (ctx) => {
        const result = await codebolt.terminal.executeCommand('npm test');
        return { success: !result.error, data: { testOutput: result.output } };
      }
    },
    {
      id: 'build',
      execute: async (ctx) => {
        const result = await codebolt.terminal.executeCommand('npm run build');
        return { success: !result.error };
      }
    }
  ]
});
```

### Conditional Workflow

```typescript
const deployWorkflow = new Workflow({
  name: 'Deploy',
  steps: [
    {
      id: 'check-branch',
      execute: async (ctx) => {
        const result = await codebolt.terminal.executeCommand('git branch --show-current');
        const branch = result.output.trim();
        return {
          success: true,
          data: { branch, isMain: branch === 'main' }
        };
      }
    },
    {
      id: 'run-tests',
      execute: async (ctx) => {
        const result = await codebolt.terminal.executeCommand('npm test');
        return { success: !result.error };
      }
    },
    {
      id: 'deploy-staging',
      execute: async (ctx) => {
        if (ctx.isMain) {
          return { success: true, data: { skipped: true } };
        }
        await deployToStaging();
        return { success: true };
      }
    },
    {
      id: 'deploy-production',
      execute: async (ctx) => {
        if (!ctx.isMain) {
          return { success: true, data: { skipped: true } };
        }
        await deployToProduction();
        return { success: true };
      }
    }
  ]
});
```

### Multi-Agent Workflow

```typescript
const researchWorkflow = new Workflow({
  name: 'Research Pipeline',
  steps: [
    new AgentStep(
      { id: 'gather', description: 'Gather information' },
      new CodeboltAgent({ instructions: 'Research and gather data.' })
    ),
    new AgentStep(
      { id: 'analyze', description: 'Analyze findings' },
      new CodeboltAgent({ instructions: 'Analyze the gathered data.' })
    ),
    new AgentStep(
      { id: 'report', description: 'Generate report' },
      new CodeboltAgent({ instructions: 'Write a summary report.' })
    )
  ]
});
```

### Parallel Processing Workflow

```typescript
const dataProcessing = new Workflow({
  name: 'Data Processing',
  steps: [
    {
      id: 'fetch',
      execute: async (ctx) => {
        const data = await fetchAllData();
        return { success: true, data: { rawData: data } };
      }
    },
    new ParallelStep(
      { id: 'process-parallel', description: 'Process in parallel' },
      [
        new WorkFlowStep({
          id: 'process-users',
          execute: async (ctx) => {
            const users = await processUsers(ctx.rawData.users);
            return { success: true, data: { users } };
          }
        }),
        new WorkFlowStep({
          id: 'process-orders',
          execute: async (ctx) => {
            const orders = await processOrders(ctx.rawData.orders);
            return { success: true, data: { orders } };
          }
        }),
        new WorkFlowStep({
          id: 'process-products',
          execute: async (ctx) => {
            const products = await processProducts(ctx.rawData.products);
            return { success: true, data: { products } };
          }
        })
      ]
    ),
    {
      id: 'aggregate',
      execute: async (ctx) => {
        const report = generateReport(ctx.users, ctx.orders, ctx.products);
        return { success: true, data: { report } };
      }
    }
  ]
});
```

---

## Error Handling

```typescript
const robustWorkflow = new Workflow({
  name: 'Robust Pipeline',
  steps: [
    {
      id: 'risky-operation',
      execute: async (ctx) => {
        try {
          const result = await riskyOperation();
          return { success: true, data: { result } };
        } catch (error) {
          // Return failure with error info
          return {
            success: false,
            error: error.message,
            data: { failedAt: 'risky-operation' }
          };
        }
      }
    },
    {
      id: 'cleanup',
      execute: async (ctx) => {
        // This runs even after failure in previous step
        // if using ConditionStep with appropriate configuration
        await cleanup();
        return { success: true };
      }
    }
  ]
});

const result = await robustWorkflow.executeAsync();

if (!result.success) {
  console.error('Workflow failed:', result.error);
  console.log('Step results:', result.stepResults);
}
```
