/**
 * Unified Workflow Management System
 * 
 * Provides comprehensive workflow orchestration for the Unified Agent Framework
 * with support for complex multi-step processes, parallel execution, conditional logic,
 * and integration with the unified agent system.
 */

import { z } from 'zod';
import type {
    OpenAIMessage,
    OpenAITool,
    ToolResult,
    CodeboltAPI
} from '../types/libTypes';
import type {
    Processor,
    ProcessorInput,
    ProcessorOutput
} from '../types/processorTypes';
import type {
    UnifiedAgentConfig,
    UnifiedAgentResult
} from '../types/types';
import { Agent } from './agent';
import { createTool } from './tool';

// ================================
// Core Workflow Types
// ================================

/**
 * Workflow execution context containing shared data and state
 */
export interface WorkflowContext {
    /** Unique workflow execution ID */
    executionId: string;
    /** Shared data between workflow steps */
    data: Record<string, unknown>;
    /** Execution history */
    history: WorkflowStepResult[];
    /** Current step index */
    currentStep: number;
    /** Workflow metadata */
    metadata: WorkflowMetadata;
    /** Available agents for step execution */
    agents: Map<string, Agent>;
    /** Available tools for step execution */
    tools: Map<string, OpenAITool>;
    /** Processors for step enhancement */
    processors: Map<string, Processor>;
    /** CodeBolt API instance */
    codebolt?: CodeboltAPI;
}

/**
 * Workflow metadata for tracking and debugging
 */
export interface WorkflowMetadata {
    /** Workflow name */
    workflowName: string;
    /** Workflow version */
    version?: string;
    /** Execution start time */
    startTime: string;
    /** Execution end time */
    endTime?: string;
    /** User or system that initiated the workflow */
    initiator?: string;
    /** Environment (dev, staging, prod) */
    environment?: string;
    /** Custom metadata */
    custom: Record<string, unknown>;
}

/**
 * Result of a workflow step execution
 */
export interface WorkflowStepResult {
    /** Step ID */
    stepId: string;
    /** Step name */
    stepName: string;
    /** Whether step succeeded */
    success: boolean;
    /** Step output data */
    output?: unknown;
    /** Error message if failed */
    error?: string;
    /** Step execution time in milliseconds */
    executionTime: number;
    /** Number of retry attempts */
    attempts: number;
    /** Step metadata */
    metadata: Record<string, unknown>;
    /** Timestamp when step started */
    startTime: string;
    /** Timestamp when step completed */
    endTime: string;
}

/**
 * Workflow step configuration
 */
export interface WorkflowStep {
    /** Unique step identifier */
    id: string;
    /** Human-readable step name */
    name: string;
    /** Step description */
    description?: string;
    /** Step type for categorization */
    type: WorkflowStepType;
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
    retry?: RetryConfig;
    /** Timeout for step execution */
    timeout?: number;
    /** Step-specific metadata */
    metadata?: Record<string, unknown>;
}

/**
 * Step types for categorization and specialized handling
 */
export type WorkflowStepType = 
    | 'agent'           // Execute an agent
    | 'tool'            // Execute a tool
    | 'condition'       // Conditional branching
    | 'loop'            // Loop execution
    | 'parallel'        // Parallel execution
    | 'transform'       // Data transformation
    | 'validation'      // Data validation
    | 'delay'           // Time delay
    | 'notification'    // Send notification
    | 'approval'        // Human approval
    | 'custom';         // Custom logic

/**
 * Retry configuration for failed steps
 */
export interface RetryConfig {
    /** Maximum number of retry attempts */
    maxAttempts: number;
    /** Base delay between retries in milliseconds */
    delay: number;
    /** Backoff strategy */
    backoff?: 'linear' | 'exponential' | 'fixed';
    /** Maximum delay cap for exponential backoff */
    maxDelay?: number;
    /** Jitter to add randomness to delays */
    jitter?: boolean;
    /** Condition to determine if error should be retried */
    retryCondition?: (error: Error, attempt: number) => boolean;
}

/**
 * Workflow configuration
 */
export interface WorkflowConfig {
    /** Workflow name */
    name: string;
    /** Workflow description */
    description?: string;
    /** Workflow version */
    version?: string;
    /** Workflow steps */
    steps: WorkflowStep[];
    /** Initial context data */
    initialData?: Record<string, unknown>;
    /** Workflow timeout in milliseconds */
    timeout?: number;
    /** Whether to continue on step failure */
    continueOnError?: boolean;
    /** Maximum parallel steps */
    maxParallelSteps?: number;
    /** Global retry configuration */
    globalRetry?: RetryConfig;
    /** Workflow-level processors */
    processors?: Processor[];
    /** Workflow metadata */
    metadata?: Record<string, unknown>;
}

/**
 * Final workflow execution result
 */
export interface WorkflowResult {
    /** Unique execution ID */
    executionId: string;
    /** Whether workflow completed successfully */
    success: boolean;
    /** Final context data */
    data: Record<string, unknown>;
    /** All step results */
    stepResults: WorkflowStepResult[];
    /** Total execution time */
    executionTime: number;
    /** Error message if failed */
    error?: string;
    /** Workflow metadata */
    metadata: WorkflowMetadata;
    /** Performance metrics */
    metrics: WorkflowMetrics;
}

/**
 * Workflow performance metrics
 */
export interface WorkflowMetrics {
    /** Total steps executed */
    totalSteps: number;
    /** Successful steps */
    successfulSteps: number;
    /** Failed steps */
    failedSteps: number;
    /** Skipped steps */
    skippedSteps: number;
    /** Parallel steps executed */
    parallelSteps: number;
    /** Total retry attempts */
    totalRetries: number;
    /** Average step execution time */
    averageStepTime: number;
    /** Longest step execution time */
    longestStepTime: number;
    /** Memory usage (if available) */
    memoryUsage?: number;
}

// ================================
// Workflow Engine
// ================================

/**
 * Main workflow execution engine
 */
export class UnifiedWorkflow {
    private config: WorkflowConfig;
    private context: WorkflowContext;
    private isExecuting: boolean = false;
    private abortController: AbortController = new AbortController();

    constructor(config: WorkflowConfig, codebolt?: CodeboltAPI) {
        this.config = config;
        this.context = this.createInitialContext(config, codebolt);
    }

    /**
     * Create initial workflow context
     */
    private createInitialContext(config: WorkflowConfig, codebolt?: CodeboltAPI): WorkflowContext {
        return {
            executionId: this.generateExecutionId(),
            data: { ...config.initialData || {} },
            history: [],
            currentStep: 0,
            metadata: {
                workflowName: config.name,
                version: config.version,
                startTime: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development',
                custom: { ...config.metadata || {} }
            },
            agents: new Map(),
            tools: new Map(),
            processors: new Map(),
            codebolt
        };
    }

    /**
     * Generate unique execution ID
     */
    private generateExecutionId(): string {
        return `wf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Execute the workflow
     */
    async execute(): Promise<WorkflowResult> {
        if (this.isExecuting) {
            throw new Error('Workflow is already executing');
        }

        this.isExecuting = true;
        const startTime = Date.now();

        try {
            // Apply workflow-level processors
            if (this.config.processors) {
                await this.applyProcessors(this.config.processors);
            }

            // Execute workflow steps
            await this.executeSteps(this.config.steps);

            const executionTime = Date.now() - startTime;
            this.context.metadata.endTime = new Date().toISOString();

            return this.createSuccessResult(executionTime);

        } catch (error) {
            const executionTime = Date.now() - startTime;
            this.context.metadata.endTime = new Date().toISOString();

            return this.createErrorResult(error, executionTime);
        } finally {
            this.isExecuting = false;
        }
    }

    /**
     * Execute workflow steps with dependency resolution and parallel execution
     */
    private async executeSteps(steps: WorkflowStep[]): Promise<void> {
        const pendingSteps = [...steps];
        const completedSteps = new Set<string>();
        const parallelSteps: WorkflowStep[] = [];

        while (pendingSteps.length > 0 || parallelSteps.length > 0) {
            // Check for timeout
            if (this.config.timeout) {
                const elapsed = Date.now() - new Date(this.context.metadata.startTime).getTime();
                if (elapsed > this.config.timeout) {
                    throw new Error(`Workflow timeout after ${elapsed}ms`);
                }
            }

            // Find steps ready to execute
            const readySteps = pendingSteps.filter(step => 
                this.areStepDependenciesMet(step, completedSteps) &&
                (!step.condition || await step.condition(this.context))
            );

            // Separate parallel and sequential steps
            const sequentialSteps = readySteps.filter(step => !step.parallel);
            const newParallelSteps = readySteps.filter(step => step.parallel);

            // Add new parallel steps
            parallelSteps.push(...newParallelSteps);

            // Remove ready steps from pending
            readySteps.forEach(step => {
                const index = pendingSteps.indexOf(step);
                if (index > -1) pendingSteps.splice(index, 1);
            });

            // Execute sequential steps
            for (const step of sequentialSteps) {
                await this.executeStep(step);
                completedSteps.add(step.id);
            }

            // Execute parallel steps if we've reached the limit or no more sequential steps
            if (parallelSteps.length >= (this.config.maxParallelSteps || 5) || 
                (parallelSteps.length > 0 && sequentialSteps.length === 0)) {
                
                const batchSize = Math.min(parallelSteps.length, this.config.maxParallelSteps || 5);
                const batch = parallelSteps.splice(0, batchSize);
                
                await Promise.all(batch.map(async step => {
                    await this.executeStep(step);
                    completedSteps.add(step.id);
                }));
            }

            // Check if we're stuck (no progress made)
            if (readySteps.length === 0 && pendingSteps.length > 0) {
                const unmetDeps = pendingSteps.map(step => ({
                    stepId: step.id,
                    dependencies: step.dependencies?.filter(dep => !completedSteps.has(dep)) || []
                }));
                throw new Error(`Circular dependency or unmet dependencies detected: ${JSON.stringify(unmetDeps)}`);
            }
        }
    }

    /**
     * Check if step dependencies are met
     */
    private areStepDependenciesMet(step: WorkflowStep, completedSteps: Set<string>): boolean {
        if (!step.dependencies || step.dependencies.length === 0) {
            return true;
        }
        return step.dependencies.every(dep => completedSteps.has(dep));
    }

    /**
     * Execute a single step with retry logic and timeout
     */
    private async executeStep(step: WorkflowStep): Promise<void> {
        const retryConfig = step.retry || this.config.globalRetry;
        const maxAttempts = retryConfig?.maxAttempts || 1;
        let lastError: Error | null = null;

        for (let attempt = 1; attempt <= maxAttempts; attempt++) {
            try {
                const stepResult = await this.executeStepWithTimeout(step, attempt);
                this.context.history.push(stepResult);
                
                // Merge step output into context
                if (stepResult.success && stepResult.output && typeof stepResult.output === 'object') {
                    this.context.data = { ...this.context.data, ...stepResult.output as Record<string, unknown> };
                }

                return; // Success, exit retry loop

            } catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                
                // Check if we should retry
                if (attempt < maxAttempts && retryConfig) {
                    if (retryConfig.retryCondition && !retryConfig.retryCondition(lastError, attempt)) {
                        break; // Don't retry based on condition
                    }
                    
                    const delay = this.calculateRetryDelay(retryConfig, attempt);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }

        // All attempts failed
        const failedResult: WorkflowStepResult = {
            stepId: step.id,
            stepName: step.name,
            success: false,
            error: lastError?.message || 'Unknown error',
            executionTime: 0,
            attempts: maxAttempts,
            metadata: { failedAfterRetries: true },
            startTime: new Date().toISOString(),
            endTime: new Date().toISOString()
        };
        
        this.context.history.push(failedResult);

        if (!this.config.continueOnError) {
            throw lastError || new Error(`Step ${step.id} failed after ${maxAttempts} attempts`);
        }
    }

    /**
     * Execute step with timeout protection
     */
    private async executeStepWithTimeout(step: WorkflowStep, attempt: number): Promise<WorkflowStepResult> {
        const timeout = step.timeout || 300000; // 5 minutes default
        const startTime = Date.now();

        return new Promise<WorkflowStepResult>((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Step ${step.id} timed out after ${timeout}ms`));
            }, timeout);

            // Validate input if schema provided
            if (step.inputSchema) {
                try {
                    step.inputSchema.parse(this.context.data);
                } catch (error) {
                    clearTimeout(timeoutId);
                    reject(new Error(`Input validation failed for step ${step.id}: ${error}`));
                    return;
                }
            }

            step.execute(this.context)
                .then(result => {
                    clearTimeout(timeoutId);
                    
                    // Validate output if schema provided
                    if (step.outputSchema && result.output !== undefined) {
                        try {
                            step.outputSchema.parse(result.output);
                        } catch (error) {
                            reject(new Error(`Output validation failed for step ${step.id}: ${error}`));
                            return;
                        }
                    }

                    // Enhance result with timing and metadata
                    const enhancedResult: WorkflowStepResult = {
                        ...result,
                        stepId: step.id,
                        stepName: step.name,
                        executionTime: Date.now() - startTime,
                        attempts: attempt,
                        startTime: new Date(startTime).toISOString(),
                        endTime: new Date().toISOString(),
                        metadata: {
                            ...result.metadata || {},
                            stepType: step.type,
                            hasRetry: attempt > 1
                        }
                    };

                    resolve(enhancedResult);
                })
                .catch(error => {
                    clearTimeout(timeoutId);
                    reject(error);
                });
        });
    }

    /**
     * Calculate retry delay with backoff and jitter
     */
    private calculateRetryDelay(retryConfig: RetryConfig, attempt: number): number {
        let delay = retryConfig.delay;

        switch (retryConfig.backoff) {
            case 'exponential':
                delay = retryConfig.delay * Math.pow(2, attempt - 1);
                break;
            case 'linear':
                delay = retryConfig.delay * attempt;
                break;
            case 'fixed':
            default:
                delay = retryConfig.delay;
                break;
        }

        // Apply maximum delay cap
        if (retryConfig.maxDelay) {
            delay = Math.min(delay, retryConfig.maxDelay);
        }

        // Apply jitter
        if (retryConfig.jitter) {
            const jitterAmount = delay * 0.1; // 10% jitter
            delay += (Math.random() - 0.5) * 2 * jitterAmount;
        }

        return Math.max(0, Math.floor(delay));
    }

    /**
     * Apply workflow-level processors
     */
    private async applyProcessors(processors: Processor[]): Promise<void> {
        for (const processor of processors) {
            try {
                const input: ProcessorInput = {
                    message: {
                        messages: [{
                            role: 'system',
                            content: `Workflow ${this.config.name} starting execution`
                        }],
                        metadata: this.context.metadata
                    },
                    context: this.context.data
                };

                await processor.processInput(input);
            } catch (error) {
                console.warn(`Workflow processor failed:`, error);
            }
        }
    }

    /**
     * Create successful workflow result
     */
    private createSuccessResult(executionTime: number): WorkflowResult {
        const metrics = this.calculateMetrics();
        
        return {
            executionId: this.context.executionId,
            success: true,
            data: this.context.data,
            stepResults: this.context.history,
            executionTime,
            metadata: this.context.metadata,
            metrics
        };
    }

    /**
     * Create error workflow result
     */
    private createErrorResult(error: unknown, executionTime: number): WorkflowResult {
        const metrics = this.calculateMetrics();
        
        return {
            executionId: this.context.executionId,
            success: false,
            data: this.context.data,
            stepResults: this.context.history,
            executionTime,
            error: error instanceof Error ? error.message : String(error),
            metadata: {
                ...this.context.metadata,
                failedAt: this.context.currentStep,
                errorType: error instanceof Error ? error.constructor.name : 'Unknown'
            },
            metrics
        };
    }

    /**
     * Calculate workflow performance metrics
     */
    private calculateMetrics(): WorkflowMetrics {
        const results = this.context.history;
        const successfulSteps = results.filter(r => r.success).length;
        const failedSteps = results.filter(r => !r.success).length;
        const totalRetries = results.reduce((sum, r) => sum + (r.attempts - 1), 0);
        
        const executionTimes = results.map(r => r.executionTime);
        const averageStepTime = executionTimes.length > 0 
            ? executionTimes.reduce((sum, time) => sum + time, 0) / executionTimes.length 
            : 0;
        const longestStepTime = executionTimes.length > 0 ? Math.max(...executionTimes) : 0;

        return {
            totalSteps: results.length,
            successfulSteps,
            failedSteps,
            skippedSteps: this.config.steps.length - results.length,
            parallelSteps: results.filter(r => r.metadata.stepType === 'parallel').length,
            totalRetries,
            averageStepTime,
            longestStepTime
        };
    }

    /**
     * Abort workflow execution
     */
    abort(reason?: string): void {
        this.abortController.abort();
        this.isExecuting = false;
        console.log(`Workflow ${this.config.name} aborted: ${reason || 'No reason provided'}`);
    }

    /**
     * Get current workflow status
     */
    getStatus(): {
        isExecuting: boolean;
        currentStep: number;
        totalSteps: number;
        completedSteps: number;
        elapsedTime: number;
    } {
        const elapsedTime = this.context.metadata.startTime 
            ? Date.now() - new Date(this.context.metadata.startTime).getTime()
            : 0;

        return {
            isExecuting: this.isExecuting,
            currentStep: this.context.currentStep,
            totalSteps: this.config.steps.length,
            completedSteps: this.context.history.length,
            elapsedTime
        };
    }

    /**
     * Add agent to workflow context
     */
    addAgent(name: string, agent: Agent): void {
        this.context.agents.set(name, agent);
    }

    /**
     * Add tool to workflow context
     */
    addTool(name: string, tool: OpenAITool): void {
        this.context.tools.set(name, tool);
    }

    /**
     * Add processor to workflow context
     */
    addProcessor(name: string, processor: Processor): void {
        this.context.processors.set(name, processor);
    }

    /**
     * Update workflow context data
     */
    updateContext(data: Record<string, unknown>): void {
        this.context.data = { ...this.context.data, ...data };
    }

    /**
     * Get workflow context (read-only)
     */
    getContext(): Readonly<WorkflowContext> {
        return { ...this.context };
    }
}

// Export workflow creation function
export function createWorkflow(config: WorkflowConfig, codebolt?: CodeboltAPI): UnifiedWorkflow {
    return new UnifiedWorkflow(config, codebolt);
}
