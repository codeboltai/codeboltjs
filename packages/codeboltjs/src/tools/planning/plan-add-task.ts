/**
 * Plan Add Task Tool - Adds a task to an existing action plan
 * Wraps the SDK's codeboltActionPlan.addTaskToActionPlan() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import codeboltActionPlan from '../../modules/actionPlan';
import type { ActionPlanTask } from '@codebolt/types/sdk';

/**
 * Parameters for the PlanAddTask tool
 */
export interface PlanAddTaskToolParams {
    /**
     * The ID of the action plan to add the task to
     */
    planId: string;

    /**
     * The task to add to the action plan
     */
    task: ActionPlanTask;
}

class PlanAddTaskToolInvocation extends BaseToolInvocation<
    PlanAddTaskToolParams,
    ToolResult
> {
    constructor(params: PlanAddTaskToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await codeboltActionPlan.addTaskToActionPlan(
                this.params.planId,
                this.params.task
            );

            if (!response) {
                return {
                    llmContent: `Error: No response received when adding task to plan: ${this.params.planId}`,
                    returnDisplay: 'Error: Failed to add task to action plan',
                    error: {
                        message: `No response received when adding task to plan: ${this.params.planId}`,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully added task "${this.params.task.name}" to plan: ${this.params.planId}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding task to action plan: ${errorMessage}`,
                returnDisplay: `Error adding task to action plan: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the PlanAddTask tool logic
 */
export class PlanAddTaskTool extends BaseDeclarativeTool<
    PlanAddTaskToolParams,
    ToolResult
> {
    static readonly Name: string = 'plan_add_task';

    constructor() {
        super(
            PlanAddTaskTool.Name,
            'PlanAddTask',
            `Adds a new task to an existing action plan. The task must have a name and can optionally include description, priority, and task type.`,
            Kind.Edit,
            {
                properties: {
                    planId: {
                        description:
                            'The unique identifier of the action plan to add the task to (required)',
                        type: 'string',
                    },
                    task: {
                        description:
                            'The task object to add to the plan (required)',
                        type: 'object',
                        properties: {
                            name: {
                                description: 'The name/title of the task (required)',
                                type: 'string',
                            },
                            description: {
                                description: 'A description of the task',
                                type: 'string',
                            },
                            priority: {
                                description: "Priority level of the task (e.g., 'high', 'medium', 'low')",
                                type: 'string',
                            },
                            taskType: {
                                description: 'The type/category of the task',
                                type: 'string',
                            },
                        },
                        required: ['name'],
                    },
                },
                required: ['planId', 'task'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: PlanAddTaskToolParams,
    ): string | null {
        if (!params.planId || params.planId.trim() === '') {
            return "The 'planId' parameter must be a non-empty string.";
        }
        if (!params.task || typeof params.task !== 'object') {
            return "The 'task' parameter must be an object.";
        }
        if (!params.task.name || params.task.name.trim() === '') {
            return "The 'task.name' parameter must be a non-empty string.";
        }
        return null;
    }

    protected createInvocation(
        params: PlanAddTaskToolParams,
    ): ToolInvocation<PlanAddTaskToolParams, ToolResult> {
        return new PlanAddTaskToolInvocation(params);
    }
}
