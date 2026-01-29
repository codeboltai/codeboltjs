import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import actionPlan from '../../modules/actionPlan';
import type { ActionPlanTask, TaskPriority, TaskStatus } from '@codebolt/types/sdk';

export interface AddTaskToActionPlanParams {
    planId: string;
    task: {
        name: string;
        description?: string;
        priority?: TaskPriority;
        taskType?: string;
        status?: TaskStatus;
        assignedTo?: string;
        estimatedTime?: number;
        dependencies?: string[];
    };
    explanation?: string;
}

class AddTaskToActionPlanInvocation extends BaseToolInvocation<AddTaskToActionPlanParams, ToolResult> {
    constructor(params: AddTaskToActionPlanParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await actionPlan.addTaskToActionPlan(this.params.planId, this.params.task);

            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const content = `Task "${this.params.task.name}" added to plan ${this.params.planId}`;
            return { llmContent: content, returnDisplay: content };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class AddTaskToActionPlanTool extends BaseDeclarativeTool<AddTaskToActionPlanParams, ToolResult> {
    constructor() {
        super('actionPlan_addTask', 'Add Task to Action Plan', 'Add a task to an action plan', Kind.Other, {
            type: 'object',
            properties: {
                planId: { type: 'string', description: 'Action plan ID' },
                task: {
                    type: 'object',
                    properties: {
                        name: { type: 'string', description: 'Task name' },
                        description: { type: 'string', description: 'Task description' },
                        priority: { type: 'string', description: 'Task priority' },
                        taskType: { type: 'string', description: 'Task type' },
                        status: { type: 'string', description: 'Task status' },
                        assignedTo: { type: 'string', description: 'Assigned to' },
                        estimatedTime: { type: 'number', description: 'Estimated time' },
                        dependencies: { type: 'array', items: { type: 'string' }, description: 'Dependencies' },
                    },
                    required: ['name'],
                },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['planId', 'task'],
        });
    }

    protected override createInvocation(params: AddTaskToActionPlanParams): ToolInvocation<AddTaskToActionPlanParams, ToolResult> {
        return new AddTaskToActionPlanInvocation(params);
    }
}
