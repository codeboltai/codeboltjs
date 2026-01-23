/**
 * State Get App Tool - Retrieves the current application state
 * Wraps the SDK's cbstate.getApplicationState() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbstate from '../../modules/state';

/**
 * Parameters for the StateGetApp tool
 */
export interface StateGetAppToolParams {}

class StateGetAppToolInvocation extends BaseToolInvocation<
    StateGetAppToolParams,
    ToolResult
> {
    constructor(params: StateGetAppToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbstate.getApplicationState();

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved application state',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error retrieving application state: ${errorMessage}`,
                returnDisplay: `Error retrieving application state: ${errorMessage}`,
                error: {
                    message: errorMessage,
                },
            };
        }
    }
}

/**
 * Implementation of the StateGetApp tool logic
 */
export class StateGetAppTool extends BaseDeclarativeTool<
    StateGetAppToolParams,
    ToolResult
> {
    static readonly Name: string = 'state_get_app';

    constructor() {
        super(
            StateGetAppTool.Name,
            'StateGetApp',
            'Retrieves the current application state from the server. Returns the complete application state object containing configuration and runtime information.',
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        _params: StateGetAppToolParams,
    ): string | null {
        return null;
    }

    protected createInvocation(
        params: StateGetAppToolParams,
    ): ToolInvocation<StateGetAppToolParams, ToolResult> {
        return new StateGetAppToolInvocation(params);
    }
}
