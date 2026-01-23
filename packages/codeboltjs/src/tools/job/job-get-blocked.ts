/**
 * Job Get Blocked Tool - Gets jobs that are blocked by dependencies
 * Wraps the SDK's jobService.getBlockedJobs() method
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
 * Parameters for the JobGetBlocked tool
 */
export interface JobGetBlockedToolParams {
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
     * Optional filter by labels
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
     * Optional limit on number of results
     */
    limit?: number;
}

class JobGetBlockedToolInvocation extends BaseToolInvocation<
    JobGetBlockedToolParams,
    ToolResult
> {
    constructor(params: JobGetBlockedToolParams) {
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
            if (this.params.limit !== undefined) filters.limit = this.params.limit;

            const response = await jobService.getBlockedJobs(filters);

            const jobCount = response.jobs?.length || 0;

            return {
                llmContent: `Found ${jobCount} blocked jobs (waiting on dependencies):\n\n${JSON.stringify(response.jobs, null, 2)}`,
                returnDisplay: `Found ${jobCount} blocked jobs`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error getting blocked jobs: ${errorMessage}`,
                returnDisplay: `Error getting blocked jobs: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the JobGetBlocked tool
 */
export class JobGetBlockedTool extends BaseDeclarativeTool<
    JobGetBlockedToolParams,
    ToolResult
> {
    static readonly Name: string = 'job_get_blocked';

    constructor() {
        super(
            JobGetBlockedTool.Name,
            'JobGetBlocked',
            `Gets jobs that are blocked by dependencies. Blocked jobs have one or more dependencies that have not yet been completed. Use this to understand work item bottlenecks and dependency chains.`,
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
                        description: 'Optional filter by labels',
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
                    limit: {
                        description: 'Optional limit on number of results',
                        type: 'number',
                    },
                },
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: JobGetBlockedToolParams,
    ): string | null {
        if (params.limit !== undefined && params.limit < 1) {
            return "The 'limit' parameter must be a positive number.";
        }

        return null;
    }

    protected createInvocation(
        params: JobGetBlockedToolParams,
    ): ToolInvocation<JobGetBlockedToolParams, ToolResult> {
        return new JobGetBlockedToolInvocation(params);
    }
}
