/**
 * Job Lock Tool - Acquires a lock on a job for an agent
 * Wraps the SDK's jobService.lockJob() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import jobService from '../../modules/job';

/**
 * Parameters for the JobLock tool
 */
export interface JobLockToolParams {
    /**
     * The ID of the job to lock
     */
    job_id: string;

    /**
     * The ID of the agent acquiring the lock
     */
    agent_id: string;

    /**
     * Optional display name of the agent
     */
    agent_name?: string;
}

class JobLockToolInvocation extends BaseToolInvocation<
    JobLockToolParams,
    ToolResult
> {
    constructor(params: JobLockToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await jobService.lockJob(
                this.params.job_id,
                this.params.agent_id,
                this.params.agent_name
            );

            if (!response.job) {
                return {
                    llmContent: `Failed to lock job: ${this.params.job_id}. The job may not exist or may already be locked by another agent.`,
                    returnDisplay: `Failed to lock job: ${this.params.job_id}`,
                    error: {
                        message: 'Failed to lock job: Job not found or already locked',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully locked job: ${this.params.job_id} for agent: ${this.params.agent_id}${this.params.agent_name ? ` (${this.params.agent_name})` : ''}\n\nJob Details:\n${JSON.stringify(response.job, null, 2)}`,
                returnDisplay: `Locked job ${this.params.job_id} for agent ${this.params.agent_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error locking job: ${errorMessage}`,
                returnDisplay: `Error locking job: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the JobLock tool
 */
export class JobLockTool extends BaseDeclarativeTool<
    JobLockToolParams,
    ToolResult
> {
    static readonly Name: string = 'job_lock';

    constructor() {
        super(
            JobLockTool.Name,
            'JobLock',
            `Acquires a lock on a job for an agent. Locking a job indicates that an agent is actively working on it and prevents other agents from making conflicting changes. The lock should be released when work is complete.`,
            Kind.Edit,
            {
                properties: {
                    job_id: {
                        description: 'The ID of the job to lock (e.g., "COD2-5")',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The ID of the agent acquiring the lock',
                        type: 'string',
                    },
                    agent_name: {
                        description: 'Optional display name of the agent',
                        type: 'string',
                    },
                },
                required: ['job_id', 'agent_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: JobLockToolParams,
    ): string | null {
        if (!params.job_id || params.job_id.trim() === '') {
            return "The 'job_id' parameter must be non-empty.";
        }

        if (!params.agent_id || params.agent_id.trim() === '') {
            return "The 'agent_id' parameter must be non-empty.";
        }

        return null;
    }

    protected createInvocation(
        params: JobLockToolParams,
    ): ToolInvocation<JobLockToolParams, ToolResult> {
        return new JobLockToolInvocation(params);
    }
}
