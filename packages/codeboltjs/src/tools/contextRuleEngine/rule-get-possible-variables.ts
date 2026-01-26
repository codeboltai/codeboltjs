/**
 * Rule Get Possible Variables Tool
 * 
 * Gets all possible variables for UI configuration.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcontextRuleEngine from '../../modules/contextRuleEngine';

/**
 * Parameters for getting possible variables (none required)
 */
export interface RuleGetPossibleVariablesParams {
}

class RuleGetPossibleVariablesInvocation extends BaseToolInvocation<RuleGetPossibleVariablesParams, ToolResult> {
    constructor(params: RuleGetPossibleVariablesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcontextRuleEngine.getPossibleVariables();

            const variables = response.data?.variables;

            if (!variables) {
                return {
                    llmContent: 'Error: Failed to get possible variables - no variables returned',
                    returnDisplay: 'Error: Failed to get possible variables',
                    error: {
                        message: 'No variables returned',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Available variables: ${Object.keys(variables).join(', ')}`,
                returnDisplay: `${Object.keys(variables).length} available variable(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            return {
                llmContent: `Error: ${errorMessage}`,
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
 * Tool for getting possible variables
 */
export class RuleGetPossibleVariablesTool extends BaseDeclarativeTool<RuleGetPossibleVariablesParams, ToolResult> {
    constructor() {
        super(
            'rule_get_possible_variables',
            'Get Possible Variables',
            'Gets all possible variables that can be used in rule conditions for UI configuration.',
            Kind.Other,
            {
                type: 'object',
                properties: {},
                required: [],
            }
        );
    }

    protected override createInvocation(params: RuleGetPossibleVariablesParams): ToolInvocation<RuleGetPossibleVariablesParams, ToolResult> {
        return new RuleGetPossibleVariablesInvocation(params);
    }
}
