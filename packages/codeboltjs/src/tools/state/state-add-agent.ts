/**
 * State Add Agent Tool - Adds a key-value pair to the agent's state
 * Wraps the SDK's cbstate.addToAgentState(key, value) method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbstate from '../../modules/state';

/**
 * Parameters for the StateAddAgent tool
 */
export interface StateAddAgentToolParams {
    /**
     * The key to add to the agent's state
     */
    key: string;

    /**
     * The value associated with the key
     */
    value: string;
}

class StateAddAgentToolInvocation extends BaseToolInvocation<
    StateAddAgentToolParams,
    ToolResult
> {
    constructor(params: StateAddAgentToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const response = await cbstate.addToAgentState(
                this.params.key,
                this.params.value,
            );

            return {
                llmContent: JSON.stringify(response, null, 2),
                returnDisplay: `Successfully added key "${this.params.key}" to agent state`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding to agent state: ${errorMessage}`,
                returnDisplay: `Error adding to agent state: ${errorMessage}`,
                error: {
                    message: errorMessage,
                },
            };
        }
    }
}

/**
 * Implementation of the StateAddAgent tool logic
 */
export class StateAddAgentTool extends BaseDeclarativeTool<
    StateAddAgentToolParams,
    ToolResult
> {
    static readonly Name: string = 'state_add_agent';

    constructor() {
        super(
            StateAddAgentTool.Name,
            'StateAddAgent',
            'Adds a key-value pair to the agent\'s state. Use this to store agent-specific data that persists across interactions.',
            Kind.Edit,
            {
                properties: {
                    key: {
                        description: 'The key to add to the agent\'s state',
                        type: 'string',
                    },
                    value: {
                        description: 'The value associated with the key',
                        type: 'string',
                    },
                },
                required: ['key', 'value'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: StateAddAgentToolParams,
    ): string | null {
        if (!params.key || params.key.trim() === '') {
            return "The 'key' parameter must be non-empty.";
        }

        if (params.value === undefined || params.value === null) {
            return "The 'value' parameter is required.";
        }

        return null;
    }

    protected createInvocation(
        params: StateAddAgentToolParams,
    ): ToolInvocation<StateAddAgentToolParams, ToolResult> {
        return new StateAddAgentToolInvocation(params);
    }
}
