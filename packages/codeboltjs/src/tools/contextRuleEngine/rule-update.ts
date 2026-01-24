/**
 * Rule Update Tool
 * 
 * Updates a rule engine.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcontextRuleEngine from '../../modules/contextRuleEngine';
import type { UpdateContextRuleEngineParams } from '../../types/contextRuleEngine';

/**
 * Parameters for updating a rule engine
 */
export interface RuleUpdateParams {
    /** Rule engine ID */
    id: string;
    /** Update parameters */
    updates: UpdateContextRuleEngineParams;
}

class RuleUpdateInvocation extends BaseToolInvocation<RuleUpdateParams, ToolResult> {
    constructor(params: RuleUpdateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcontextRuleEngine.update(this.params.id, this.params.updates);

            const ruleEngine = response.payload?.ruleEngine;

            if (!ruleEngine) {
                return {
                    llmContent: 'Error: Failed to update rule engine - no rule engine returned',
                    returnDisplay: 'Error: Failed to update rule engine',
                    error: {
                        message: 'No rule engine returned from update operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully updated rule engine ${this.params.id}`,
                returnDisplay: `Updated rule engine ${this.params.id}`,
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
 * Tool for updating a rule engine
 */
export class RuleUpdateTool extends BaseDeclarativeTool<RuleUpdateParams, ToolResult> {
    constructor() {
        super(
            'rule_update',
            'Update Rule Engine',
            'Updates a context rule engine.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'Rule engine ID',
                    },
                    updates: {
                        type: 'object',
                        description: 'Update parameters',
                    },
                },
                required: ['id', 'updates'],
            }
        );
    }

    protected override createInvocation(params: RuleUpdateParams): ToolInvocation<RuleUpdateParams, ToolResult> {
        return new RuleUpdateInvocation(params);
    }
}
