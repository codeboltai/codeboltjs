/**
 * State Update Project Tool - Updates a key-value pair in the project state
 * Wraps the SDK's cbstate.updateProjectState(key, value) method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbstate from '../../modules/state';

/**
 * Parameters for the StateUpdateProject tool
 */
export interface StateUpdateProjectToolParams {
    /**
     * The key to update in the project state
     */
    key: string;

    /**
     * The value to set for the key (can be any type)
     */
    value: any;
}

class StateUpdateProjectToolInvocation extends BaseToolInvocation<
    StateUpdateProjectToolParams,
    ToolResult
> {
    constructor(params: StateUpdateProjectToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbstate.updateProjectState(
                this.params.key,
                this.params.value,
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully updated project state key "${this.params.key}"`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error updating project state: ${errorMessage}`,
                returnDisplay: `Error updating project state: ${errorMessage}`,
                error: {
                    message: errorMessage,
                },
            };
        }
    }
}

/**
 * Implementation of the StateUpdateProject tool logic
 */
export class StateUpdateProjectTool extends BaseDeclarativeTool<
    StateUpdateProjectToolParams,
    ToolResult
> {
    static readonly Name: string = 'state_update_project';

    constructor() {
        super(
            StateUpdateProjectTool.Name,
            'StateUpdateProject',
            'Updates a key-value pair in the project state. Use this to store or modify project-specific data that persists across sessions.',
            Kind.Edit,
            {
                properties: {
                    key: {
                        description: 'The key to update in the project state',
                        type: 'string',
                    },
                    value: {
                        description: 'The value to set for the key (can be any JSON-serializable type)',
                    },
                },
                required: ['key', 'value'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: StateUpdateProjectToolParams,
    ): string | null {
        if (!params.key || params.key.trim() === '') {
            return "The 'key' parameter must be non-empty.";
        }

        if (params.value === undefined) {
            return "The 'value' parameter is required.";
        }

        return null;
    }

    protected createInvocation(
        params: StateUpdateProjectToolParams,
    ): ToolInvocation<StateUpdateProjectToolParams, ToolResult> {
        return new StateUpdateProjectToolInvocation(params);
    }
}
