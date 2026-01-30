# Workflows

Multi-step orchestration for complex agent tasks.

---

## Basic Workflow

```typescript
import { Workflow } from '@codebolt/agent/unified';
import type { WorkflowStepResult, WorkflowContext, WorkflowResult } from '@codebolt/types/agent';

interface LintStepData {
  lintPassed: boolean;
}

interface TestStepData {
  testsPassed: boolean;
}

interface ReviewStepData {
  reviewComplete: boolean;
}

const workflow: Workflow = new Workflow({
  name: 'Code Review Pipeline',
  description: 'Automated code review process',
  steps: [
    {
      id: 'lint',
      execute: async (context: WorkflowContext): Promise<WorkflowStepResult<LintStepData>> => ({
        success: true,
        data: { lintPassed: true }
      })
    },
    {
      id: 'test',
      execute: async (context: WorkflowContext): Promise<WorkflowStepResult<TestStepData>> => ({
        success: true,
        data: { testsPassed: true }
      })
    },
    {
      id: 'review',
      execute: async (context: WorkflowContext): Promise<WorkflowStepResult<ReviewStepData>> => ({
        success: true,
        data: { reviewComplete: true }
      })
    }
  ]
});

const result: WorkflowResult = await workflow.executeAsync();
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
import type { WorkflowStepResult, WorkflowContext } from '@codebolt/types/agent';

interface ProcessStepData {
  processed: boolean;
}

const step: WorkFlowStep = new WorkFlowStep({
  id: 'process-data',
  description: 'Process input data',
  execute: async (context: WorkflowContext): Promise<WorkflowStepResult<ProcessStepData>> => ({
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
import codebolt from '@codebolt/codeboltjs';
import type { WorkflowStepResult, WorkflowContext, TerminalResult } from '@codebolt/types/agent';

interface CIStepData {
  lintOutput?: string;
  testOutput?: string;
}

const ciPipeline: Workflow = new Workflow({
  name: 'CI Pipeline',
  steps: [
    {
      id: 'install',
      execute: async (ctx: WorkflowContext): Promise<WorkflowStepResult<void>> => {
        const result: TerminalResult = await codebolt.terminal.executeCommand('npm install');
        return { success: !result.error };
      }
    },
    {
      id: 'lint',
      execute: async (ctx: WorkflowContext): Promise<WorkflowStepResult<CIStepData>> => {
        const result: TerminalResult = await codebolt.terminal.executeCommand('npm run lint');
        return { success: !result.error, data: { lintOutput: result.output } };
      }
    },
    {
      id: 'test',
      execute: async (ctx: WorkflowContext): Promise<WorkflowStepResult<CIStepData>> => {
        const result: TerminalResult = await codebolt.terminal.executeCommand('npm test');
        return { success: !result.error, data: { testOutput: result.output } };
      }
    },
    {
      id: 'build',
      execute: async (ctx: WorkflowContext): Promise<WorkflowStepResult<void>> => {
        const result: TerminalResult = await codebolt.terminal.executeCommand('npm run build');
        return { success: !result.error };
      }
    }
  ]
});
```

### Conditional Workflow

```typescript
interface DeployContext extends WorkflowContext {
  branch?: string;
  isMain?: boolean;
}

interface BranchStepData {
  branch: string;
  isMain: boolean;
}

interface DeployStepData {
  skipped?: boolean;
}

const deployWorkflow: Workflow = new Workflow({
  name: 'Deploy',
  steps: [
    {
      id: 'check-branch',
      execute: async (ctx: DeployContext): Promise<WorkflowStepResult<BranchStepData>> => {
        const result: TerminalResult = await codebolt.terminal.executeCommand('git branch --show-current');
        const branch: string = result.output.trim();
        return {
          success: true,
          data: { branch, isMain: branch === 'main' }
        };
      }
    },
    {
      id: 'run-tests',
      execute: async (ctx: DeployContext): Promise<WorkflowStepResult<void>> => {
        const result: TerminalResult = await codebolt.terminal.executeCommand('npm test');
        return { success: !result.error };
      }
    },
    {
      id: 'deploy-staging',
      execute: async (ctx: DeployContext): Promise<WorkflowStepResult<DeployStepData>> => {
        if (ctx.isMain) {
          return { success: true, data: { skipped: true } };
        }
        await deployToStaging();
        return { success: true };
      }
    },
    {
      id: 'deploy-production',
      execute: async (ctx: DeployContext): Promise<WorkflowStepResult<DeployStepData>> => {
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
interface DataProcessingContext extends WorkflowContext {
  rawData?: {
    users: unknown[];
    orders: unknown[];
    products: unknown[];
  };
  users?: unknown[];
  orders?: unknown[];
  products?: unknown[];
}

interface FetchStepData {
  rawData: {
    users: unknown[];
    orders: unknown[];
    products: unknown[];
  };
}

interface ReportStepData {
  report: unknown;
}

const dataProcessing: Workflow = new Workflow({
  name: 'Data Processing',
  steps: [
    {
      id: 'fetch',
      execute: async (ctx: DataProcessingContext): Promise<WorkflowStepResult<FetchStepData>> => {
        const data = await fetchAllData();
        return { success: true, data: { rawData: data } };
      }
    },
    new ParallelStep(
      { id: 'process-parallel', description: 'Process in parallel' },
      [
        new WorkFlowStep({
          id: 'process-users',
          execute: async (ctx: DataProcessingContext): Promise<WorkflowStepResult<{ users: unknown[] }>> => {
            const users: unknown[] = await processUsers(ctx.rawData!.users);
            return { success: true, data: { users } };
          }
        }),
        new WorkFlowStep({
          id: 'process-orders',
          execute: async (ctx: DataProcessingContext): Promise<WorkflowStepResult<{ orders: unknown[] }>> => {
            const orders: unknown[] = await processOrders(ctx.rawData!.orders);
            return { success: true, data: { orders } };
          }
        }),
        new WorkFlowStep({
          id: 'process-products',
          execute: async (ctx: DataProcessingContext): Promise<WorkflowStepResult<{ products: unknown[] }>> => {
            const products: unknown[] = await processProducts(ctx.rawData!.products);
            return { success: true, data: { products } };
          }
        })
      ]
    ),
    {
      id: 'aggregate',
      execute: async (ctx: DataProcessingContext): Promise<WorkflowStepResult<ReportStepData>> => {
        const report: unknown = generateReport(ctx.users, ctx.orders, ctx.products);
        return { success: true, data: { report } };
      }
    }
  ]
});
```

---

## Error Handling

```typescript
interface RiskyStepData {
  result?: unknown;
  failedAt?: string;
}

const robustWorkflow: Workflow = new Workflow({
  name: 'Robust Pipeline',
  steps: [
    {
      id: 'risky-operation',
      execute: async (ctx: WorkflowContext): Promise<WorkflowStepResult<RiskyStepData>> => {
        try {
          const result: unknown = await riskyOperation();
          return { success: true, data: { result } };
        } catch (error: unknown) {
          // Return failure with error info
          const errorMessage: string = error instanceof Error ? error.message : 'Unknown error';
          return {
            success: false,
            error: errorMessage,
            data: { failedAt: 'risky-operation' }
          };
        }
      }
    },
    {
      id: 'cleanup',
      execute: async (ctx: WorkflowContext): Promise<WorkflowStepResult<void>> => {
        // This runs even after failure in previous step
        // if using ConditionStep with appropriate configuration
        await cleanup();
        return { success: true };
      }
    }
  ]
});

const result: WorkflowResult = await robustWorkflow.executeAsync();

if (!result.success) {
  console.error('Workflow failed:', result.error);
  console.log('Step results:', result.stepResults);
}
```
