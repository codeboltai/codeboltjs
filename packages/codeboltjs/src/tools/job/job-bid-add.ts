/**
 * Job Bid Add Tool - Adds a bid from an agent to work on a job
 * Wraps the SDK's jobService.addBid() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import jobService from '../../modules/job';
import type { AddBidData } from '../../types/job';

/**
 * Parameters for the JobBidAdd tool
 */
export interface JobBidAddToolParams {
    /**
     * The ID of the job to bid on
     */
    job_id: string;

    /**
     * The ID of the agent placing the bid
     */
    agent_id: string;

    /**
     * Optional display name of the agent
     */
    agent_name?: string;

    /**
     * The reason or justification for the bid
     */
    reason: string;

    /**
     * The priority/urgency of the bid (higher = more urgent)
     */
    priority: number;
}

class JobBidAddToolInvocation extends BaseToolInvocation<
    JobBidAddToolParams,
    ToolResult
> {
    constructor(params: JobBidAddToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const bidData: AddBidData = {
                agentId: this.params.agent_id,
                agentName: this.params.agent_name,
                reason: this.params.reason,
                priority: this.params.priority,
            };

            const response = await jobService.addBid(this.params.job_id, bidData);

            if (!response.job) {
                return {
                    llmContent: `Failed to add bid to job: ${this.params.job_id}`,
                    returnDisplay: `Failed to add bid to job: ${this.params.job_id}`,
                    error: {
                        message: 'Failed to add bid: Job not found or operation failed',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully added bid to job: ${this.params.job_id}\nAgent: ${this.params.agent_id}${this.params.agent_name ? ` (${this.params.agent_name})` : ''}\nReason: ${this.params.reason}\nPriority: ${this.params.priority}\n\nJob Details:\n${JSON.stringify(response.job, null, 2)}`,
                returnDisplay: `Added bid to job ${this.params.job_id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding bid: ${errorMessage}`,
                returnDisplay: `Error adding bid: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the JobBidAdd tool
 */
export class JobBidAddTool extends BaseDeclarativeTool<
    JobBidAddToolParams,
    ToolResult
> {
    static readonly Name: string = 'job_bid_add';

    constructor() {
        super(
            JobBidAddTool.Name,
            'JobBidAdd',
            `Adds a bid from an agent to work on a job. Bidding allows agents to express interest in working on a job, with a reason and priority. Bids can be reviewed and accepted to assign the job to the winning bidder.`,
            Kind.Edit,
            {
                properties: {
                    job_id: {
                        description: 'The ID of the job to bid on (e.g., "COD2-5")',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The ID of the agent placing the bid',
                        type: 'string',
                    },
                    agent_name: {
                        description: 'Optional display name of the agent',
                        type: 'string',
                    },
                    reason: {
                        description: 'The reason or justification for the bid (e.g., expertise, availability)',
                        type: 'string',
                    },
                    priority: {
                        description: 'The priority/urgency of the bid (higher number = more urgent)',
                        type: 'number',
                    },
                },
                required: ['job_id', 'agent_id', 'reason', 'priority'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: JobBidAddToolParams,
    ): string | null {
        if (!params.job_id || params.job_id.trim() === '') {
            return "The 'job_id' parameter must be non-empty.";
        }

        if (!params.agent_id || params.agent_id.trim() === '') {
            return "The 'agent_id' parameter must be non-empty.";
        }

        if (!params.reason || params.reason.trim() === '') {
            return "The 'reason' parameter must be non-empty.";
        }

        if (typeof params.priority !== 'number') {
            return "The 'priority' parameter must be a number.";
        }

        return null;
    }

    protected createInvocation(
        params: JobBidAddToolParams,
    ): ToolInvocation<JobBidAddToolParams, ToolResult> {
        return new JobBidAddToolInvocation(params);
    }
}
