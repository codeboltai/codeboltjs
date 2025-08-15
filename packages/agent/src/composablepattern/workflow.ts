/**
 * @fileoverview Workflow system for Composable Agent Pattern
 * @description Provides workflow orchestration for multi-step agent processes
 */

import type { ComposableAgent, ExecutionResult, Message } from './types';
import { z } from 'zod';

// ================================
// Workflow Types
// ================================

export interface WorkflowContext {
  /** Shared data between workflow steps */
  data: Record<string, any>;
  /** Execution history */
  history: WorkflowStepResult[];
  /** Current step index */
  currentStep: number;
  /** Workflow metadata */
  metadata: Record<string, any>;
}

export interface WorkflowStepResult {
  /** Step ID */
  stepId: string;
  /** Whether step succeeded */
  success: boolean;
  /** Step output data */
  output?: any;
  /** Error message if failed */
  error?: string;
  /** Step execution time */
  executionTime: number;
  /** Step metadata */
  metadata?: Record<string, any>;
}

export interface WorkflowStep {
  /** Unique step identifier */
  id: string;
  /** Human-readable step name */
  name: string;
  /** Step description */
  description?: string;
  /** Input schema validation */
  inputSchema?: z.ZodType;
  /** Output schema validation */
  outputSchema?: z.ZodType;
  /** Step execution function */
  execute: (context: WorkflowContext) => Promise<WorkflowStepResult>;
  /** Condition to determine if step should run */
  condition?: (context: WorkflowContext) => boolean | Promise<boolean>;
  /** Steps that must complete before this step */
  dependencies?: string[];
  /** Whether step can run in parallel */
  parallel?: boolean;
  /** Retry configuration */
  retry?: {
    maxAttempts: number;
    delay: number;
    backoff?: 'linear' | 'exponential';
  };
}

export interface WorkflowConfig {
  /** Workflow name */
  name: string;
  /** Workflow description */
  description?: string;
  /** Workflow steps */
  steps: WorkflowStep[];
  /** Initial context data */
  initialData?: Record<string, any>;
  /** Workflow timeout in milliseconds */
  timeout?: number;
  /** Whether to continue on step failure */
  continueOnError?: boolean;
  /** Maximum parallel steps */
  maxParallelSteps?: number;
}

export interface WorkflowResult {
  /** Whether workflow completed successfully */
  success: boolean;
  /** Final context data */
  data: Record<string, any>;
  /** All step results */
  stepResults: WorkflowStepResult[];
  /** Total execution time */
  executionTime: number;
  /** Error message if failed */
  error?: string;
  /** Workflow metadata */
  metadata: Record<string, any>;
}

// ================================
// Built-in Step Types
// ================================

/**
 * Agent step - executes a composable agent
 */
export interface AgentStepConfig {
  /** Agent instance to execute */
  agent: ComposableAgent;
  /** Message template (can use context variables) */
  messageTemplate: string;
  /** Input mapping from context */
  inputMapping?: Record<string, string>;
  /** Output mapping to context */
  outputMapping?: Record<string, string>;
}

/**
 * Conditional step - executes different branches based on condition
 */
export interface ConditionalStepConfig {
  /** Condition function */
  condition: (context: WorkflowContext) => boolean | Promise<boolean>;
  /** Steps to execute if condition is true */
  trueBranch: WorkflowStep[];
  /** Steps to execute if condition is false */
  falseBranch?: WorkflowStep[];
}

/**
 * Parallel step - executes multiple steps in parallel
 */
export interface ParallelStepConfig {
  /** Steps to execute in parallel */
  steps: WorkflowStep[];
  /** Whether to wait for all steps to complete */
  waitForAll?: boolean;
  /** Maximum number of parallel executions */
  maxConcurrency?: number;
}

/**
 * Loop step - repeats steps while condition is true
 */
export interface LoopStepConfig {
  /** Loop condition */
  condition: (context: WorkflowContext, iteration: number) => boolean | Promise<boolean>;
  /** Steps to repeat */
  steps: WorkflowStep[];
  /** Maximum iterations */
  maxIterations?: number;
  /** Current iteration variable name in context */
  iterationVariable?: string;
}

// ================================
// Workflow Engine
// ================================

export class Workflow {
  private config: WorkflowConfig;
  private context: WorkflowContext;

  constructor(config: WorkflowConfig) {
    this.config = config;
    this.context = {
      data: { ...config.initialData || {} },
      history: [],
      currentStep: 0,
      metadata: {
        workflowName: config.name,
        startTime: new Date().toISOString(),
        steps: config.steps.map(s => ({ id: s.id, name: s.name }))
      }
    };
  }

  /**
   * Execute the workflow
   */
  async execute(): Promise<WorkflowResult> {
    const startTime = Date.now();

    try {
      await this.executeSteps(this.config.steps);

      const executionTime = Date.now() - startTime;
      
      return {
        success: true,
        data: this.context.data,
        stepResults: this.context.history,
        executionTime,
        metadata: {
          ...this.context.metadata,
          endTime: new Date().toISOString(),
          totalSteps: this.context.history.length
        }
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        data: this.context.data,
        stepResults: this.context.history,
        executionTime,
        error: error instanceof Error ? error.message : String(error),
        metadata: {
          ...this.context.metadata,
          endTime: new Date().toISOString(),
          failedAt: this.context.currentStep
        }
      };
    }
  }

  /**
   * Execute a list of steps
   */
  private async executeSteps(steps: WorkflowStep[]): Promise<void> {
    const parallelSteps: WorkflowStep[] = [];
    
    for (const step of steps) {
      // Check dependencies
      if (step.dependencies) {
        const unmetDeps = step.dependencies.filter(depId => 
          !this.context.history.some(h => h.stepId === depId && h.success)
        );
        if (unmetDeps.length > 0) {
          throw new Error(`Step ${step.id} has unmet dependencies: ${unmetDeps.join(', ')}`);
        }
      }

      // Check condition
      if (step.condition && !(await step.condition(this.context))) {
        continue;
      }

      if (step.parallel) {
        parallelSteps.push(step);
      } else {
        // Execute any pending parallel steps first
        if (parallelSteps.length > 0) {
          await this.executeParallelSteps(parallelSteps);
          parallelSteps.length = 0;
        }
        
        // Execute this step
        await this.executeStep(step);
      }
    }

    // Execute any remaining parallel steps
    if (parallelSteps.length > 0) {
      await this.executeParallelSteps(parallelSteps);
    }
  }

  /**
   * Execute parallel steps
   */
  private async executeParallelSteps(steps: WorkflowStep[]): Promise<void> {
    const maxConcurrency = this.config.maxParallelSteps || steps.length;
    const batches = this.chunkArray(steps, maxConcurrency);

    for (const batch of batches) {
      await Promise.all(batch.map(step => this.executeStep(step)));
    }
  }

  /**
   * Execute a single step with retry logic
   */
  private async executeStep(step: WorkflowStep): Promise<void> {
    const maxAttempts = step.retry?.maxAttempts || 1;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const startTime = Date.now();
        
        // Validate input if schema provided
        if (step.inputSchema) {
          step.inputSchema.parse(this.context.data);
        }

        const result = await step.execute(this.context);
        
        // Validate output if schema provided
        if (step.outputSchema && result.output !== undefined) {
          step.outputSchema.parse(result.output);
        }

        result.executionTime = Date.now() - startTime;
        this.context.history.push(result);
        
        // Merge step output into context
        if (result.output && typeof result.output === 'object') {
          this.context.data = { ...this.context.data, ...result.output };
        }

        return; // Success, exit retry loop

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < maxAttempts && step.retry) {
          const delay = this.calculateRetryDelay(step.retry, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    // All attempts failed
    const result: WorkflowStepResult = {
      stepId: step.id,
      success: false,
      error: lastError?.message || 'Unknown error',
      executionTime: 0
    };
    
    this.context.history.push(result);

    if (!this.config.continueOnError) {
      throw lastError || new Error(`Step ${step.id} failed`);
    }
  }

  /**
   * Calculate retry delay with backoff
   */
  private calculateRetryDelay(retryConfig: NonNullable<WorkflowStep['retry']>, attempt: number): number {
    const baseDelay = retryConfig.delay;
    
    switch (retryConfig.backoff) {
      case 'exponential':
        return baseDelay * Math.pow(2, attempt - 1);
      case 'linear':
      default:
        return baseDelay * attempt;
    }
  }

  /**
   * Split array into chunks
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get current workflow context
   */
  getContext(): WorkflowContext {
    return { ...this.context };
  }

  /**
   * Update workflow context data
   */
  updateContext(data: Record<string, any>): void {
    this.context.data = { ...this.context.data, ...data };
  }
}

// ================================
// Step Factory Functions
// ================================

/**
 * Create an agent execution step
 */
export function createAgentStep(config: AgentStepConfig & { id: string; name: string }): WorkflowStep {
  return {
    id: config.id,
    name: config.name,
    description: `Execute agent: ${config.agent.config.name}`,
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      try {
        // Apply input mapping
        let stepData = { ...context.data };
        if (config.inputMapping) {
          for (const [stepKey, contextKey] of Object.entries(config.inputMapping)) {
            if (context.data[contextKey] !== undefined) {
              stepData[stepKey] = context.data[contextKey];
            }
          }
        }

        // Replace template variables in message
        const message = config.messageTemplate.replace(/\{\{(\w+)\}\}/g, (match, key) => {
          return stepData[key] !== undefined ? String(stepData[key]) : match;
        });

        const result = await config.agent.execute(message);
        
        // Apply output mapping
        let output: Record<string, any> = { agentResult: result };
        if (config.outputMapping) {
          output = {};
          for (const [contextKey, resultKey] of Object.entries(config.outputMapping)) {
            const value = resultKey.split('.').reduce((obj: any, key) => obj?.[key], { agentResult: result });
            if (value !== undefined) {
              output[contextKey] = value;
            }
          }
        }

        return {
          stepId: config.id,
          success: result.success,
          output,
          error: result.error,
          executionTime: 0 // Will be set by executeStep
        };

      } catch (error) {
        return {
          stepId: config.id,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          executionTime: 0
        };
      }
    }
  };
}

/**
 * Create a data transformation step
 */
export function createTransformStep(config: {
  id: string;
  name: string;
  transform: (data: any) => any | Promise<any>;
  inputSchema?: z.ZodType;
  outputSchema?: z.ZodType;
}): WorkflowStep {
  return {
    id: config.id,
    name: config.name,
    description: 'Transform data',
    inputSchema: config.inputSchema,
    outputSchema: config.outputSchema,
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      try {
        const output = await config.transform(context.data);
        
        return {
          stepId: config.id,
          success: true,
          output,
          executionTime: 0
        };

      } catch (error) {
        return {
          stepId: config.id,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          executionTime: 0
        };
      }
    }
  };
}

/**
 * Create a conditional branch step
 */
export function createConditionalStep(config: ConditionalStepConfig & { id: string; name: string }): WorkflowStep {
  return {
    id: config.id,
    name: config.name,
    description: 'Conditional execution',
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      try {
        const conditionResult = await config.condition(context);
        const stepsToExecute = conditionResult ? config.trueBranch : (config.falseBranch || []);
        
        // Execute conditional steps
        const subWorkflow = new Workflow({
          name: `${config.id}-branch`,
          steps: stepsToExecute,
          initialData: context.data
        });
        
        const result = await subWorkflow.execute();
        
        return {
          stepId: config.id,
          success: result.success,
          output: result.data,
          error: result.error,
          executionTime: result.executionTime,
          metadata: {
            conditionResult,
            branchExecuted: conditionResult ? 'true' : 'false',
            subSteps: result.stepResults.length
          }
        };

      } catch (error) {
        return {
          stepId: config.id,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          executionTime: 0
        };
      }
    }
  };
}

/**
 * Create a delay step
 */
export function createDelayStep(config: { id: string; name: string; delay: number }): WorkflowStep {
  return {
    id: config.id,
    name: config.name,
    description: `Delay for ${config.delay}ms`,
    execute: async (): Promise<WorkflowStepResult> => {
      await new Promise(resolve => setTimeout(resolve, config.delay));
      
      return {
        stepId: config.id,
        success: true,
        executionTime: config.delay
      };
    }
  };
}

/**
 * Create a simple custom step with your own logic
 * 
 * @param config - Step configuration with custom execute function
 * @returns WorkflowStep
 * 
 * @example
 * ```typescript
 * const customStep = createStep({
 *   id: 'my-step',
 *   name: 'My Custom Step',
 *   description: 'Does something custom',
 *   execute: async (context) => {
 *     // Your custom logic here
 *     const result = await doSomething(context.data);
 *     return {
 *       stepId: 'my-step',
 *       success: true,
 *       output: { customResult: result },
 *       executionTime: 0
 *     };
 *   }
 * });
 * ```
 */
export function createStep(config: {
  /** Unique step identifier */
  id: string;
  /** Human-readable step name */
  name: string;
  /** Step description */
  description?: string;
  /** Input schema validation */
  inputSchema?: z.ZodType;
  /** Output schema validation */
  outputSchema?: z.ZodType;
  /** Step execution function */
  execute: (context: WorkflowContext) => Promise<WorkflowStepResult>;
  /** Condition to determine if step should run */
  condition?: (context: WorkflowContext) => boolean | Promise<boolean>;
  /** Steps that must complete before this step */
  dependencies?: string[];
  /** Whether step can run in parallel */
  parallel?: boolean;
  /** Retry configuration */
  retry?: {
    maxAttempts: number;
    delay: number;
    backoff?: 'linear' | 'exponential';
  };
}): WorkflowStep {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    inputSchema: config.inputSchema,
    outputSchema: config.outputSchema,
    execute: config.execute,
    condition: config.condition,
    dependencies: config.dependencies,
    parallel: config.parallel,
    retry: config.retry
  };
}

/**
 * Create a simple step that executes a function with the context data
 * 
 * @param config - Step configuration with transform function
 * @returns WorkflowStep
 * 
 * @example
 * ```typescript
 * const mathStep = createSimpleStep({
 *   id: 'calculate',
 *   name: 'Calculate Total',
 *   execute: (data) => {
 *     const total = data.items.reduce((sum, item) => sum + item.price, 0);
 *     return { total, itemCount: data.items.length };
 *   }
 * });
 * ```
 */
export function createSimpleStep(config: {
  /** Unique step identifier */
  id: string;
  /** Human-readable step name */
  name: string;
  /** Step description */
  description?: string;
  /** Input schema validation */
  inputSchema?: z.ZodType;
  /** Output schema validation */
  outputSchema?: z.ZodType;
  /** Simple execution function that takes data and returns output */
  execute: (data: any) => any | Promise<any>;
  /** Condition to determine if step should run */
  condition?: (context: WorkflowContext) => boolean | Promise<boolean>;
  /** Steps that must complete before this step */
  dependencies?: string[];
  /** Whether step can run in parallel */
  parallel?: boolean;
  /** Retry configuration */
  retry?: {
    maxAttempts: number;
    delay: number;
    backoff?: 'linear' | 'exponential';
  };
}): WorkflowStep {
  return createStep({
    ...config,
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      try {
        const output = await config.execute(context.data);
        
        return {
          stepId: config.id,
          success: true,
          output,
          executionTime: 0 // Will be set by executeStep
        };

      } catch (error) {
        return {
          stepId: config.id,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          executionTime: 0
        };
      }
    }
  });
}

/**
 * Create an async step that can perform asynchronous operations
 * 
 * @param config - Step configuration with async function
 * @returns WorkflowStep
 * 
 * @example
 * ```typescript
 * const apiStep = createAsyncStep({
 *   id: 'fetch-data',
 *   name: 'Fetch External Data',
 *   execute: async (data) => {
 *     const response = await fetch(`/api/data/${data.id}`);
 *     const result = await response.json();
 *     return { fetchedData: result };
 *   },
 *   retry: {
 *     maxAttempts: 3,
 *     delay: 1000,
 *     backoff: 'exponential'
 *   }
 * });
 * ```
 */
export function createAsyncStep(config: {
  /** Unique step identifier */
  id: string;
  /** Human-readable step name */
  name: string;
  /** Step description */
  description?: string;
  /** Input schema validation */
  inputSchema?: z.ZodType;
  /** Output schema validation */
  outputSchema?: z.ZodType;
  /** Async execution function */
  execute: (data: any, context: WorkflowContext) => Promise<any>;
  /** Condition to determine if step should run */
  condition?: (context: WorkflowContext) => boolean | Promise<boolean>;
  /** Steps that must complete before this step */
  dependencies?: string[];
  /** Whether step can run in parallel */
  parallel?: boolean;
  /** Retry configuration */
  retry?: {
    maxAttempts: number;
    delay: number;
    backoff?: 'linear' | 'exponential';
  };
}): WorkflowStep {
  return createStep({
    ...config,
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      try {
        const output = await config.execute(context.data, context);
        
        return {
          stepId: config.id,
          success: true,
          output,
          executionTime: 0 // Will be set by executeStep
        };

      } catch (error) {
        return {
          stepId: config.id,
          success: false,
          error: error instanceof Error ? error.message : String(error),
          executionTime: 0
        };
      }
    }
  });
}

/**
 * Create a validation step that validates data against a schema
 * 
 * @param config - Validation configuration
 * @returns WorkflowStep
 */
export function createValidationStep(config: {
  /** Unique step identifier */
  id: string;
  /** Human-readable step name */
  name: string;
  /** Schema to validate against */
  schema: z.ZodType;
  /** Field to validate (defaults to entire context data) */
  field?: string;
  /** Whether to stop workflow on validation failure */
  stopOnFailure?: boolean;
}): WorkflowStep {
  return createStep({
    id: config.id,
    name: config.name,
    description: `Validate ${config.field || 'data'} against schema`,
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      try {
        const dataToValidate = config.field 
          ? context.data[config.field]
          : context.data;
          
        const validatedData = config.schema.parse(dataToValidate);
        
        return {
          stepId: config.id,
          success: true,
          output: config.field 
            ? { [config.field]: validatedData }
            : validatedData,
          executionTime: 0
        };

      } catch (error) {
        const errorMessage = error instanceof z.ZodError
          ? `Validation failed: ${error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join(', ')}`
          : error instanceof Error ? error.message : String(error);

        return {
          stepId: config.id,
          success: !config.stopOnFailure,
          error: errorMessage,
          executionTime: 0,
          metadata: { validationError: true }
        };
      }
    }
  });
}

/**
 * Create a logging step for debugging workflows
 * 
 * @param config - Logging configuration
 * @returns WorkflowStep
 */
export function createLoggingStep(config: {
  /** Unique step identifier */
  id: string;
  /** Human-readable step name */
  name: string;
  /** Log level */
  level?: 'debug' | 'info' | 'warn' | 'error';
  /** Custom message template */
  message?: string;
  /** Fields to log */
  fields?: string[];
}): WorkflowStep {
  return createStep({
    id: config.id,
    name: config.name,
    description: `Log workflow state`,
    execute: async (context: WorkflowContext): Promise<WorkflowStepResult> => {
      const level = config.level || 'info';
      const message = config.message || `Step ${config.id} executed`;
      
      // Extract specific fields if specified
      const logData = config.fields 
        ? config.fields.reduce((acc, field) => {
            acc[field] = context.data[field];
            return acc;
          }, {} as Record<string, any>)
        : context.data;

      // Log to console (in production, you might use a proper logger)
      console[level](`[Workflow] ${message}`, {
        stepId: config.id,
        data: logData,
        executionStep: context.currentStep,
        timestamp: new Date().toISOString()
      });

      return {
        stepId: config.id,
        success: true,
        output: { logged: true, logLevel: level },
        executionTime: 0
      };
    }
  });
}

/**
 * Create a workflow from configuration
 */
export function createWorkflow(config: WorkflowConfig): Workflow {
  return new Workflow(config);
}
