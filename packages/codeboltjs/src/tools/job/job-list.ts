/**
 * Job List Tool - Lists jobs with optional filters
 * Wraps the SDK's jobService.listJobs() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import jobService from '../../modules/job';
import type { JobListFilters, JobStatus, JobPriority, JobType } from '../../types/job';

/**
 * Parameters for the JobList tool
 */
export interface JobListToolParams {
    /**
     * Optional filter by status
     */
    status?: JobStatus[];

    /**
     * Optional filter by priority
     */
    priority?: JobPriority[];

    /**
     * Optional filter by assignee
     */
    assignee?: string[];

    /**
     * Optional filter by labels (AND - all labels must match)
     */
    labels?: string[];

    /**
     * Optional filter by job type
     */
    type?: JobType[];

    /**
     * Optional filter by job group ID
     */
    group_id?: string;

    /**
     * Optional filter by title containing text
     */
    title_contains?: string;

    /**
     * Optional limit on number of results
     */
    limit?: number;

    /**
     * Optional offset for pagination
     */
    offset?: number;

    /**
     * Optional sort by field
     */
    sort_by?: 'priority' | 'createdAt' | 'updatedAt' | 'status' | 'importance';

    /**
     * Optional sort order
     */
    sort_order?: 'asc' | 'desc';
}

class JobListToolInvocation extends BaseToolInvocation<
    JobListToolParams,
    ToolResult
> {
    constructor(params: JobListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const filters: JobListFilters = {};

            if (this.params.status !== undefined) filters.status = this.params.status;
            if (this.params.priority !== undefined) filters.priority = this.params.priority;
            if (this.params.assignee !== undefined) filters.assignee = this.params.assignee;
            if (this.params.labels !== undefined) filters.labels = this.params.labels;
            if (this.params.type !== undefined) filters.type = this.params.type;
            if (this.params.group_id !== undefined) filters.groupId = this.params.group_id;
            if (this.params.title_contains !== undefined) filters.titleContains = this.params.title_contains;
            if (this.params.limit !== undefined) filters.limit = this.params.limit;
            if (this.params.offset !== undefined) filters.offset = this.params.offset;
            if (this.params.sort_by !== undefined) filters.sortBy = this.params.sort_by;
            if (this.params.sort_order !== undefined) filters.sortOrder = this.params.sort_order;

            const response = await jobService.listJobs(filters);

            const jobCount = response.jobs?.length || 0;
            const totalCount = response.totalCount || jobCount;

            return {
                llmContent: `Found ${jobCount} jobs${totalCount > jobCount ? ` (${totalCount} total)` : ''}:\n\n${JSON.stringify(response.jobs, null, 2)}`,
                returnDisplay: `Found ${jobCount} jobs${totalCount > jobCount ? ` of ${totalCount} total` : ''}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing jobs: ${errorMessage}`,
                returnDisplay: `Error listing jobs: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the JobList tool
 */
export class JobListTool extends BaseDeclarativeTool<
    JobListToolParams,
    ToolResult
> {
    static readonly Name: string = 'job_list';

    constructor() {
        super(
            JobListTool.Name,
            'JobList',
            `Lists jobs with optional filters. Can filter by status, priority, assignee, labels, type, and more. Supports pagination and sorting.`,
            Kind.Read,
            {
                properties: {
                    status: {
                        description: 'Optional filter by status',
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: ['open', 'working', 'hold', 'closed'],
                        },
                    },
                    priority: {
                        description: 'Optional filter by priority',
                        type: 'array',
                        items: {
                            type: 'number',
                            enum: [1, 2, 3, 4],
                        },
                    },
                    assignee: {
                        description: 'Optional filter by assignee',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    labels: {
                        description: 'Optional filter by labels (AND - all labels must match)',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    type: {
                        description: 'Optional filter by job type',
                        type: 'array',
                        items: {
                            type: 'string',
                            enum: ['bug', 'feature', 'task', 'epic', 'chore'],
                        },
                    },
                    group_id: {
                        description: 'Optional filter by job group ID',
                        type: 'string',
                    },
                    title_contains: {
                        description: 'Optional filter by title containing text',
                        type: 'string',
                    },
                    limit: {
                        description: 'Optional limit on number of results',
                        type: 'number',
                    },
                    offset: {
                        description: 'Optional offset for pagination',
                        type: 'number',
                    },
                    sort_by: {
                        description: 'Optional sort by field',
                        type: 'string',
                        enum: ['priority', 'createdAt', 'updatedAt', 'status', 'importance'],
                    },
                    sort_order: {
                        description: 'Optional sort order',
                        type: 'string',
                        enum: ['asc', 'desc'],
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: JobListToolParams,
    ): string | null {
        if (params.limit !== undefined && params.limit < 1) {
            return "The 'limit' parameter must be a positive number.";
        }

        if (params.offset !== undefined && params.offset < 0) {
            return "The 'offset' parameter must be a non-negative number.";
        }

        return null;
    }

    protected createInvocation(
        params: JobListToolParams,
    ): ToolInvocation<JobListToolParams, ToolResult> {
        return new JobListToolInvocation(params);
    }
}
