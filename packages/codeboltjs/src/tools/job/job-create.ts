/**
 * Job Create Tool - Creates a new job in a job group
 * Wraps the SDK's jobService.createJob() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import jobService from '../../modules/job';
import type { CreateJobData, JobType, JobPriority } from '../../types/job';

/**
 * Parameters for the JobCreate tool
 */
export interface JobCreateToolParams {
    /**
     * The ID of the job group to create the job in
     */
    group_id: string;

    /**
     * The name/title of the job
     */
    name: string;

    /**
     * The type of job
     */
    type: JobType;

    /**
     * The priority of the job (1-4, with 4 being urgent)
     */
    priority: JobPriority;

    /**
     * Optional description of the job
     */
    description?: string;

    /**
     * Optional status of the job
     */
    status?: 'open' | 'working' | 'hold' | 'closed';

    /**
     * Optional list of assignees
     */
    assignees?: string[];

    /**
     * Optional list of labels
     */
    labels?: string[];

    /**
     * Optional parent job ID for sub-jobs
     */
    parent_job_id?: string;

    /**
     * Optional notes
     */
    notes?: string;

    /**
     * Optional due date
     */
    due_date?: string;
}

class JobCreateToolInvocation extends BaseToolInvocation<
    JobCreateToolParams,
    ToolResult
> {
    constructor(params: JobCreateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const createData: CreateJobData = {
                name: this.params.name,
                type: this.params.type,
                priority: this.params.priority,
                description: this.params.description,
                status: this.params.status,
                assignees: this.params.assignees,
                labels: this.params.labels,
                parentJobId: this.params.parent_job_id,
                notes: this.params.notes,
                dueDate: this.params.due_date,
            };

            const response = await jobService.createJob(this.params.group_id, createData);

            if (!response.job) {
                return {
                    llmContent: 'Error creating job: No job returned in response',
                    returnDisplay: 'Error creating job: No job returned in response',
                    error: {
                        message: 'No job returned in response',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully created job: ${response.job.id}\n\nJob Details:\n${JSON.stringify(response.job, null, 2)}`,
                returnDisplay: `Successfully created job: ${response.job.id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating job: ${errorMessage}`,
                returnDisplay: `Error creating job: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the JobCreate tool
 */
export class JobCreateTool extends BaseDeclarativeTool<
    JobCreateToolParams,
    ToolResult
> {
    static readonly Name: string = 'job_create';

    constructor() {
        super(
            JobCreateTool.Name,
            'JobCreate',
            `Creates a new job in a specified job group. Jobs are work items that can be tracked, assigned, and organized with dependencies, labels, and priorities.`,
            Kind.Edit,
            {
                properties: {
                    group_id: {
                        description: 'The ID of the job group to create the job in',
                        type: 'string',
                    },
                    name: {
                        description: 'The name/title of the job',
                        type: 'string',
                    },
                    type: {
                        description: 'The type of job',
                        type: 'string',
                        enum: ['bug', 'feature', 'task', 'epic', 'chore'],
                    },
                    priority: {
                        description: 'The priority of the job (1-4, with 4 being urgent)',
                        type: 'number',
                        enum: [1, 2, 3, 4],
                    },
                    description: {
                        description: 'Optional description of the job',
                        type: 'string',
                    },
                    status: {
                        description: 'Optional status of the job',
                        type: 'string',
                        enum: ['open', 'working', 'hold', 'closed'],
                    },
                    assignees: {
                        description: 'Optional list of assignees',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    labels: {
                        description: 'Optional list of labels',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    parent_job_id: {
                        description: 'Optional parent job ID for sub-jobs',
                        type: 'string',
                    },
                    notes: {
                        description: 'Optional notes',
                        type: 'string',
                    },
                    due_date: {
                        description: 'Optional due date',
                        type: 'string',
                    },
                },
                required: ['group_id', 'name', 'type', 'priority'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: JobCreateToolParams,
    ): string | null {
        if (!params.group_id || params.group_id.trim() === '') {
            return "The 'group_id' parameter must be non-empty.";
        }

        if (!params.name || params.name.trim() === '') {
            return "The 'name' parameter must be non-empty.";
        }

        const validTypes = ['bug', 'feature', 'task', 'epic', 'chore'];
        if (!validTypes.includes(params.type)) {
            return `The 'type' parameter must be one of: ${validTypes.join(', ')}`;
        }

        if (params.priority < 1 || params.priority > 4) {
            return "The 'priority' parameter must be between 1 and 4.";
        }

        return null;
    }

    protected createInvocation(
        params: JobCreateToolParams,
    ): ToolInvocation<JobCreateToolParams, ToolResult> {
        return new JobCreateToolInvocation(params);
    }
}
