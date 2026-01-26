/**
 * State Get Project Tool - Retrieves the current project state
 * Wraps the SDK's cbstate.getProjectState() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbstate from '../../modules/state';

/**
 * Parameters for the StateGetProject tool
 */
export interface StateGetProjectToolParams {}

class StateGetProjectToolInvocation extends BaseToolInvocation<
    StateGetProjectToolParams,
    ToolResult
> {
    constructor(params: StateGetProjectToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbstate.getProjectState();

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: 'Successfully retrieved project state',
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error retrieving project state: ${errorMessage}`,
                returnDisplay: `Error retrieving project state: ${errorMessage}`,
                error: {
                    message: errorMessage,
                },
            };
        }
    }
}

/**
 * Implementation of the StateGetProject tool logic
 */
export class StateGetProjectTool extends BaseDeclarativeTool<
    StateGetProjectToolParams,
    ToolResult
> {
    static readonly Name: string = 'state_get_project';

    constructor() {
        super(
            StateGetProjectTool.Name,
            'StateGetProject',
            'Retrieves the current project state from the server. Returns project-specific configuration and data.',
            Kind.Read,
            {
                properties: {},
                required: [],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        _params: StateGetProjectToolParams,
    ): string | null {
        return null;
    }

    protected createInvocation(
        params: StateGetProjectToolParams,
    ): ToolInvocation<StateGetProjectToolParams, ToolResult> {
        return new StateGetProjectToolInvocation(params);
    }
}
