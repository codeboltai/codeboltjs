/**
 * Swarm Apply Vacancy Tool - Apply for a vacancy
 * Wraps the SDK's swarmService.applyForVacancy() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmApplyVacancy tool
 */
export interface SwarmApplyVacancyToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;

    /**
     * The ID of the vacancy to apply for
     */
    vacancy_id: string;

    /**
     * The ID of the agent applying
     */
    agent_id: string;

    /**
     * Optional application message
     */
    message?: string;
}

class SwarmApplyVacancyToolInvocation extends BaseToolInvocation<
    SwarmApplyVacancyToolParams,
    ToolResult
> {
    constructor(params: SwarmApplyVacancyToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.applyForVacancy(
                this.params.swarm_id,
                this.params.vacancy_id,
                this.params.agent_id,
                this.params.message
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully applied for vacancy',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error applying for vacancy: ${errorMessage}`,
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
 * Implementation of the SwarmApplyVacancy tool
 */
export class SwarmApplyVacancyTool extends BaseDeclarativeTool<
    SwarmApplyVacancyToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_apply_vacancy';

    constructor() {
        super(
            SwarmApplyVacancyTool.Name,
            'SwarmApplyVacancy',
            'Allows an agent to apply for a vacancy in a swarm.',
            Kind.Edit,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm',
                        type: 'string',
                    },
                    vacancy_id: {
                        description: 'The ID of the vacancy to apply for',
                        type: 'string',
                    },
                    agent_id: {
                        description: 'The ID of the agent applying',
                        type: 'string',
                    },
                    message: {
                        description: 'Optional application message',
                        type: 'string',
                    },
                },
                required: ['swarm_id', 'vacancy_id', 'agent_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmApplyVacancyToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        if (!params.vacancy_id || params.vacancy_id.trim() === '') {
            return "The 'vacancy_id' parameter must be non-empty.";
        }
        if (!params.agent_id || params.agent_id.trim() === '') {
            return "The 'agent_id' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmApplyVacancyToolParams,
    ): ToolInvocation<SwarmApplyVacancyToolParams, ToolResult> {
        return new SwarmApplyVacancyToolInvocation(params);
    }
}
