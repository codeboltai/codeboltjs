/**
 * Swarm Close Vacancy Tool - Closes a vacancy
 * Wraps the SDK's swarmService.closeVacancy() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import swarmService from '../../modules/swarm';

/**
 * Parameters for the SwarmCloseVacancy tool
 */
export interface SwarmCloseVacancyToolParams {
    /**
     * The ID of the swarm
     */
    swarm_id: string;

    /**
     * The ID of the vacancy to close
     */
    vacancy_id: string;

    /**
     * The reason for closing the vacancy
     */
    reason: string;
}

class SwarmCloseVacancyToolInvocation extends BaseToolInvocation<
    SwarmCloseVacancyToolParams,
    ToolResult
> {
    constructor(params: SwarmCloseVacancyToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await swarmService.closeVacancy(
                this.params.swarm_id,
                this.params.vacancy_id,
                this.params.reason
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully closed vacancy',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error closing vacancy: ${errorMessage}`,
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
 * Implementation of the SwarmCloseVacancy tool
 */
export class SwarmCloseVacancyTool extends BaseDeclarativeTool<
    SwarmCloseVacancyToolParams,
    ToolResult
> {
    static readonly Name: string = 'swarm_close_vacancy';

    constructor() {
        super(
            SwarmCloseVacancyTool.Name,
            'SwarmCloseVacancy',
            'Closes a vacancy in a swarm with a specified reason.',
            Kind.Edit,
            {
                properties: {
                    swarm_id: {
                        description: 'The ID of the swarm',
                        type: 'string',
                    },
                    vacancy_id: {
                        description: 'The ID of the vacancy to close',
                        type: 'string',
                    },
                    reason: {
                        description: 'The reason for closing the vacancy',
                        type: 'string',
                    },
                },
                required: ['swarm_id', 'vacancy_id', 'reason'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: SwarmCloseVacancyToolParams,
    ): string | null {
        if (!params.swarm_id || params.swarm_id.trim() === '') {
            return "The 'swarm_id' parameter must be non-empty.";
        }
        if (!params.vacancy_id || params.vacancy_id.trim() === '') {
            return "The 'vacancy_id' parameter must be non-empty.";
        }
        if (!params.reason || params.reason.trim() === '') {
            return "The 'reason' parameter must be non-empty.";
        }
        return null;
    }

    protected createInvocation(
        params: SwarmCloseVacancyToolParams,
    ): ToolInvocation<SwarmCloseVacancyToolParams, ToolResult> {
        return new SwarmCloseVacancyToolInvocation(params);
    }
}
