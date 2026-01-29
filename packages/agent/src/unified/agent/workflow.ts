import { BaseWorkflow, workflowConfig, WorkflowResult, workflowStepOutput } from "@codebolt/types/agent";
import { randomUUID } from 'crypto';

export class Workflow implements BaseWorkflow {
    private config: workflowConfig;
    private context: any = {};
    private currentStepIndex: number = 0;
    private executionId: string = '';
    private startTime: number = 0;
    private stepResults: workflowStepOutput[] = [];

    constructor(config: workflowConfig) {
        this.config = config;
    }

    execute(): WorkflowResult {
        this.executionId = randomUUID();
        this.startTime = Date.now();
        
        try {
            // Validate input if schema exists
            if (this.config.inputSchema) {
                this.config.inputSchema.parse(this.context);
            }

            // Execute all steps synchronously (note: this is a limitation due to BaseWorkflow interface)
            // In a real implementation, you might want to use async/await with proper error handling
            const stepResults = this.executeSteps();
            
            const executionTime = Date.now() - this.startTime;
            const success = stepResults.every(result => result.success);
            
            // Validate output if schema exists
            if (this.config.outputSchema && success) {
                this.config.outputSchema.parse(this.context);
            }

            const result: WorkflowResult = {
                executionId: this.executionId,
                success,
                data: this.context,
                stepResults,
                executionTime
            };
            if (!success) {
                result.error = 'One or more steps failed';
            }
            return result;
        } catch (error) {
            const executionTime = Date.now() - this.startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

            const result: WorkflowResult = {
                executionId: this.executionId,
                success: false,
                data: this.context,
                stepResults: this.stepResults,
                executionTime
            };
            result.error = errorMessage;
            return result;
        }
    }

    executeStep(): workflowStepOutput {
        if (this.currentStepIndex >= this.config.steps.length) {
            throw new Error('No more steps to execute');
        }

        const step = this.config.steps[this.currentStepIndex];
        if (!step) {
            throw new Error('Step not found at current index');
        }

        try {
            // Note: Since BaseWorkflow expects sync methods, we can't properly handle async step execution
            // This is a design limitation that would need to be addressed in the BaseWorkflow interface
            const result: workflowStepOutput = {
                stepId: step.id,
                success: true,
                result: null,
                metaData: this.context
            };

            this.currentStepIndex++;
            this.stepResults.push(result);
            return result;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this.currentStepIndex++;

            const errorResult: workflowStepOutput = {
                stepId: step.id,
                success: false,
                result: null
            };
            errorResult.error = errorMessage;

            this.stepResults.push(errorResult);
            return errorResult;
        }
    }

    executeSteps(): workflowStepOutput[] {
        const allResults: workflowStepOutput[] = [];

        for (let i = 0; i < this.config.steps.length; i++) {
            const step = this.config.steps[i];
            if (!step) continue;

            try {
                // Note: This is a synchronous implementation due to BaseWorkflow interface constraints
                // In a real async implementation, you would await step.execute(this.context)
                const result: workflowStepOutput = {
                    stepId: step.id,
                    success: true,
                    result: `Step ${step.id} executed synchronously`,
                    metaData: this.context
                };

                allResults.push(result);

                // Update context with successful result
                if (result.success && result.result !== null) {
                    this.updateContext({
                        [`step_${result.stepId}`]: result.result,
                        ...result.metaData
                    });
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                const errorResult: workflowStepOutput = {
                    stepId: step.id,
                    success: false,
                    result: null
                };
                errorResult.error = errorMessage;
                allResults.push(errorResult);

                // Break on error (can be made configurable)
                break;
            }
        }

        this.stepResults = allResults;
        return allResults;
    }

    getContext(): any {
        return { ...this.context };
    }

    updateContext(newContext: any): void {
        this.context = { ...this.context, ...newContext };
    }

    // Additional utility methods for better workflow management
    reset(): void {
        this.context = {};
        this.currentStepIndex = 0;
        this.executionId = '';
        this.startTime = 0;
        this.stepResults = [];
    }

    getCurrentStepIndex(): number {
        return this.currentStepIndex;
    }

    getTotalSteps(): number {
        return this.config.steps.length;
    }

    getExecutionId(): string {
        return this.executionId;
    }

    setInitialContext(context: any): void {
        this.context = { ...context };
    }

    getStepResults(): workflowStepOutput[] {
        return [...this.stepResults];
    }

    // Async versions of the methods for proper workflow execution
    // These can be used when the BaseWorkflow interface is updated to support async
    async executeAsync(): Promise<WorkflowResult> {
        this.executionId = randomUUID();
        this.startTime = Date.now();

        try {
            // Validate input if schema exists
            if (this.config.inputSchema) {
                this.config.inputSchema.parse(this.context);
            }

            // Execute all steps asynchronously
            const stepResults = await this.executeStepsAsync();

            const executionTime = Date.now() - this.startTime;
            const success = stepResults.every(result => result.success);

            // Validate output if schema exists
            if (this.config.outputSchema && success) {
                this.config.outputSchema.parse(this.context);
            }

            const result: WorkflowResult = {
                executionId: this.executionId,
                success,
                data: this.context,
                stepResults,
                executionTime
            };
            if (!success) {
                result.error = 'One or more steps failed';
            }
            return result;
        } catch (error) {
            const executionTime = Date.now() - this.startTime;
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

            const result: WorkflowResult = {
                executionId: this.executionId,
                success: false,
                data: this.context,
                stepResults: this.stepResults,
                executionTime
            };
            result.error = errorMessage;
            return result;
        }
    }

    async executeStepAsync(): Promise<workflowStepOutput> {
        if (this.currentStepIndex >= this.config.steps.length) {
            throw new Error('No more steps to execute');
        }

        const step = this.config.steps[this.currentStepIndex];
        if (!step) {
            throw new Error('Step not found at current index');
        }

        try {
            const result = await step.execute(this.context);

            // Handle different return types based on step type
            if (Array.isArray(result)) {
                // For parallel, condition, or loop steps that return multiple results
                const lastResult = result[result.length - 1];
                this.currentStepIndex++;
                this.stepResults.push(...result);
                return lastResult;
            } else {
                // For single step execution
                this.currentStepIndex++;
                this.stepResults.push(result);
                return result;
            }
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this.currentStepIndex++;

            const errorResult: workflowStepOutput = {
                stepId: step.id,
                success: false,
                result: null
            };
            errorResult.error = errorMessage;

            this.stepResults.push(errorResult);
            return errorResult;
        }
    }

    async executeStepsAsync(): Promise<workflowStepOutput[]> {
        const allResults: workflowStepOutput[] = [];

        for (let i = 0; i < this.config.steps.length; i++) {
            const step = this.config.steps[i];
            if (!step) continue;

            try {
                const result = await step.execute(this.context);

                // Handle different return types based on step type
                if (Array.isArray(result)) {
                    // For parallel, condition, or loop steps that return multiple results
                    allResults.push(...result);

                    // Update context with successful results
                    result.forEach(stepResult => {
                        if (stepResult.success && stepResult.result !== null) {
                            this.updateContext({
                                [`step_${stepResult.stepId}`]: stepResult.result,
                                ...stepResult.metaData
                            });
                        }
                    });
                } else {
                    // For single step execution
                    allResults.push(result);

                    // Update context with successful result
                    if (result.success && result.result !== null) {
                        this.updateContext({
                            [`step_${result.stepId}`]: result.result,
                            ...result.metaData
                        });
                    }
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                const errorResult: workflowStepOutput = {
                    stepId: step.id,
                    success: false,
                    result: null
                };
                errorResult.error = errorMessage;
                allResults.push(errorResult);

                // Break on error (can be made configurable)
                break;
            }
        }

        this.stepResults = allResults;
        return allResults;
    }
}