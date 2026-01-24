/**
 * Job Update Tool - Updates an existing job
 * Wraps the SDK's jobService.updateJob() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import jobService from '../../modules/job';
import type { UpdateJobData, JobType, JobPriority, JobStatus } from '../../types/job';

/**
 * Parameters for the JobUpdate tool
 */
export interface JobUpdateToolParams {
    /**
     * The ID of the job to update
     */
    job_id: string;

    /**
     * Optional new name/title for the job
     */
    name?: string;

    /**
     * Optional new type for the job
     */
    type?: JobType;

    /**
     * Optional new priority for the job (1-4, with 4 being urgent)
     */
    priority?: JobPriority;

    /**
     * Optional new description for the job
     */
    description?: string;

    /**
     * Optional new status for the job
     */
    status?: JobStatus;

    /**
     * Optional new list of assignees
     */
    assignees?: string[];

    /**
     * Optional new list of labels
     */
    labels?: string[];

    /**
     * Optional new parent job ID
     */
    parent_job_id?: string;

    /**
     * Optional new notes
     */
    notes?: string;

    /**
     * Optional new due date
     */
    due_date?: string;
}

class JobUpdateToolInvocation extends BaseToolInvocation<
    JobUpdateToolParams,
    ToolResult
> {
    constructor(params: JobUpdateToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const updateData: UpdateJobData = {};

            if (this.params.name !== undefined) updateData.name = this.params.name;
            if (this.params.type !== undefined) updateData.type = this.params.type;
            if (this.params.priority !== undefined) updateData.priority = this.params.priority;
            if (this.params.description !== undefined) updateData.description = this.params.description;
            if (this.params.status !== undefined) updateData.status = this.params.status;
            if (this.params.assignees !== undefined) updateData.assignees = this.params.assignees;
            if (this.params.labels !== undefined) updateData.labels = this.params.labels;
            if (this.params.parent_job_id !== undefined) updateData.parentJobId = this.params.parent_job_id;
            if (this.params.notes !== undefined) updateData.notes = this.params.notes;
            if (this.params.due_date !== undefined) updateData.dueDate = this.params.due_date;

            const response = await jobService.updateJob(this.params.job_id, updateData);

            if (!response.job) {
                return {
                    llmContent: `Job not found or update failed: ${this.params.job_id}`,
                    returnDisplay: `Job not found or update failed: ${this.params.job_id}`,
                    error: {
                        message: `Job not found or update failed: ${this.params.job_id}`,
                        type: ToolErrorType.TASK_NOT_FOUND,
                    },
                };
            }

            return {
                llmContent: `Successfully updated job: ${this.params.job_id}\n\nUpdated Job Details:\n${JSON.stringify(response.job, null, 2)}`,
                returnDisplay: `Successfully updated job: ${this.params.job_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating job: ${errorMessage}`,
                returnDisplay: `Error updating job: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the JobUpdate tool
 */
export class JobUpdateTool extends BaseDeclarativeTool<
    JobUpdateToolParams,
    ToolResult
> {
    static readonly Name: string = 'job_update';

    constructor() {
        super(
            JobUpdateTool.Name,
            'JobUpdate',
            `Updates an existing job with new values. Only the fields provided will be updated; other fields remain unchanged.`,
            Kind.Edit,
            {
                properties: {
                    job_id: {
                        description: 'The ID of the job to update (e.g., "COD2-5")',
                        type: 'string',
                    },
                    name: {
                        description: 'Optional new name/title for the job',
                        type: 'string',
                    },
                    type: {
                        description: 'Optional new type for the job',
                        type: 'string',
                        enum: ['bug', 'feature', 'task', 'epic', 'chore'],
                    },
                    priority: {
                        description: 'Optional new priority for the job (1-4, with 4 being urgent)',
                        type: 'number',
                        enum: [1, 2, 3, 4],
                    },
                    description: {
                        description: 'Optional new description for the job',
                        type: 'string',
                    },
                    status: {
                        description: 'Optional new status for the job',
                        type: 'string',
                        enum: ['open', 'working', 'hold', 'closed'],
                    },
                    assignees: {
                        description: 'Optional new list of assignees',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    labels: {
                        description: 'Optional new list of labels',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    parent_job_id: {
                        description: 'Optional new parent job ID',
                        type: 'string',
                    },
                    notes: {
                        description: 'Optional new notes',
                        type: 'string',
                    },
                    due_date: {
                        description: 'Optional new due date',
                        type: 'string',
                    },
                },
                required: ['job_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: JobUpdateToolParams,
    ): string | null {
        if (!params.job_id || params.job_id.trim() === '') {
            return "The 'job_id' parameter must be non-empty.";
        }

        if (params.type !== undefined) {
            const validTypes = ['bug', 'feature', 'task', 'epic', 'chore'];
            if (!validTypes.includes(params.type)) {
                return `The 'type' parameter must be one of: ${validTypes.join(', ')}`;
            }
        }

        if (params.priority !== undefined) {
            if (params.priority < 1 || params.priority > 4) {
                return "The 'priority' parameter must be between 1 and 4.";
            }
        }

        if (params.status !== undefined) {
            const validStatuses = ['open', 'working', 'hold', 'closed'];
            if (!validStatuses.includes(params.status)) {
                return `The 'status' parameter must be one of: ${validStatuses.join(', ')}`;
            }
        }

        return null;
    }

    protected createInvocation(
        params: JobUpdateToolParams,
    ): ToolInvocation<JobUpdateToolParams, ToolResult> {
        return new JobUpdateToolInvocation(params);
    }
}
