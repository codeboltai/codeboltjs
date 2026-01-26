/**
 * Swarm Create Vacancy Tool - Creates a new vacancy in a swarm
 * Wraps the SDK's swarmService.createVacancy() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmCreateVacancy tool
 */
export interface SwarmCreateVacancyToolParams {
    /**
     * The ID of the swarm to create the vacancy in
     */
    swarm_id: string;

    /**
     * The ID of the role associated with the vacancy
     */
    role_id: string;

    /**
     * The title of the vacancy
     */
    title: string;

    /**
     * Optional description of the vacancy
     */
    description?: string;

    /**
     * Optional requirements for the vacancy
     */
    requirements?: string[];

    /**
     * The ID of the agent creating the vacancy
     */
    created_by: string;

    /**
     * Optional metadata for the vacancy
     */
    metadata?: Record<string, any>;
}

class SwarmCreateVacancyToolInvocation extends BaseToolInvocation<
    SwarmCreateVacancyToolParams,
    ToolResult
> {
    constructor(params: SwarmCreateVacancyToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.createVacancy(this.params.swarm_id, {
                roleId: this.params.role_id,
                title: this.params.title,
                description: this.params.description,
                requirements: this.params.requirements,
                createdBy: this.params.created_by,
                metadata: this.params.metadata,
            });

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully created vacancy',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error creating vacancy: ${errorMessage}`,
                returnDisplay: `Error: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the SwarmCreateVacancy tool
 */
export class SwarmCreateVacancyTool extends BaseDeclarativeTool<
    SwarmCreateVacancyToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_create_vacancy';

    constructor() {
        super(
            SwarmCreateVacancyTool.Name,
            'SwarmCreateVacancy',
            'Creates a new vacancy for a role within a swarm that agents can apply for.',
            Kind.Edit,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm to create the vacancy in',
                        type: 'string',
                    },
                    role_id: {
                        description: 'The ID of the role associated with the vacancy',
                        type: 'string',
                    },
                    title: {
                        description: 'The title of the vacancy',
                        type: 'string',
                    },
                    description: {
                        description: 'Optional description of the vacancy',
                        type: 'string',
                    },
                    requirements: {
                        description: 'Optional requirements for the vacancy',
                        type: 'array',
                        items: { type: 'string' },
                    },
                    created_by: {
                        description: 'The ID of the agent creating the vacancy',
                        type: 'string',
                    },
                    metadata: {
                        description: 'Optional metadata for the vacancy',
                        type: 'object',
                    },
                },
                required: ['swarm_id', 'role_id', 'title', 'created_by'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmCreateVacancyToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        if (!params.role_id || params.role_id.trim() === '') {
            return "The 'role_id' parameter must be non-empty.";
        }
        if (!params.title || params.title.trim() === '') {
            return "The 'title' parameter must be non-empty.";
        }
        if (!params.created_by || params.created_by.trim() === '') {
            return "The 'created_by' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmCreateVacancyToolParams,
    ): ToolInvocation<SwarmCreateVacancyToolParams, ToolResult> {
        return new SwarmCreateVacancyToolInvocation(params);
    }
}
