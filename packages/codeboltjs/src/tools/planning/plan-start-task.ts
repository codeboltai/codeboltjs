/**
 * Plan Start Task Tool - Starts/executes a task step in an action plan
 * Wraps the SDK's codeboltActionPlan.startTaskStep() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltActionPlan from '../../modules/actionPlan';

/**
 * Parameters for the PlanStartTask tool
 */
export interface PlanStartTaskToolParams {
    /**
     * The ID of the action plan containing the task
     */
    planId: string;

    /**
     * The ID of the task to start
     */
    taskId: string;
}

class PlanStartTaskToolInvocation extends BaseToolInvocation<
    PlanStartTaskToolParams,
    ToolResult
> {
    constructor(params: PlanStartTaskToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltActionPlan.startTaskStep(
                this.params.planId,
                this.params.taskId
            );

            if (!response) {
                return {
                    llmContent: `Error: No response received when starting task: ${this.params.taskId} in plan: ${this.params.planId}`,
                    returnDisplay: 'Error: Failed to start task',
                    error: {
                        message: `No response received when starting task: ${this.params.taskId}`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully started task: ${this.params.taskId} in plan: ${this.params.planId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error starting task: ${errorMessage}`,
                returnDisplay: `Error starting task: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PlanStartTask tool logic
 */
export class PlanStartTaskTool extends BaseDeclarativeTool<
    PlanStartTaskToolParams,
    ToolResult
> {
    static readonly Name: string = 'plan_start_task';

    constructor() {
        super(
            PlanStartTaskTool.Name,
            'PlanStartTask',
            `Starts or executes a specific task step within an action plan. This triggers the execution of the task and returns the execution status.`,
            Kind.Execute,
            {
                properties: {
                    planId: {
                        description:
                            'The unique identifier of the action plan containing the task (required)',
                        type: 'string',
                    },
                    taskId: {
                        description:
                            'The unique identifier of the task to start/execute (required)',
                        type: 'string',
                    },
                },
                required: ['planId', 'taskId'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: PlanStartTaskToolParams,
    ): string | null {
        if (!params.planId || params.planId.trim() === '') {
            return "The 'planId' parameter must be a non-empty string.";
        }
        if (!params.taskId || params.taskId.trim() === '') {
            return "The 'taskId' parameter must be a non-empty string.";
        }
        return null;
    }

    protected createInvocation(
        params: PlanStartTaskToolParams,
    ): ToolInvocation<PlanStartTaskToolParams, ToolResult> {
        return new PlanStartTaskToolInvocation(params);
    }
}
