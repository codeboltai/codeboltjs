/**
 * State Get Agent Tool - Retrieves the current agent state
 * Wraps the SDK's cbstate.getAgentState() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbstate from '../../modules/state';

/**
 * Parameters for the StateGetAgent tool
 */
export interface StateGetAgentToolParams {}

class StateGetAgentToolInvocation extends BaseToolInvocation<
    StateGetAgentToolParams,
    ToolResult
> {
    constructor(params: StateGetAgentToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbstate.getAgentState();

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved agent state',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error retrieving agent state: ${errorMessage}`,
                returnDisplay: `Error retrieving agent state: ${errorMessage}`,
                error: {
                    message: errorMessage,
                },
            };
        }
    }
}

/**
 * Implementation of the StateGetAgent tool logic
 */
export class StateGetAgentTool extends BaseDeclarativeTool<
    StateGetAgentToolParams,
    ToolResult
> {
    static readonly Name: string = 'state_get_agent';

    constructor() {
        super(
            StateGetAgentTool.Name,
            'StateGetAgent',
            'Retrieves the current state of the agent from the server. Returns all key-value pairs stored in the agent\'s state.',
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        _params: StateGetAgentToolParams,
    ): string | null {
        return null;
    }

    protected createInvocation(
        params: StateGetAgentToolParams,
    ): ToolInvocation<StateGetAgentToolParams, ToolResult> {
        return new StateGetAgentToolInvocation(params);
    }
}
