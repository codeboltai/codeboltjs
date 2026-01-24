/**
 * Rule Get Tool
 * 
 * Retrieves a rule engine by ID.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcontextRuleEngine from '../../modules/contextRuleEngine';

/**
 * Parameters for getting a rule engine
 */
export interface RuleGetParams {
    /** Rule engine ID */
    id: string;
}

class RuleGetInvocation extends BaseToolInvocation<RuleGetParams, ToolResult> {
    constructor(params: RuleGetParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcontextRuleEngine.get(this.params.id);

            const ruleEngine = response.payload?.ruleEngine;

            if (!ruleEngine) {
                return {
                    llmContent: 'Error: Failed to get rule engine - no rule engine returned',
                    returnDisplay: 'Error: Failed to get rule engine',
                    error: {
                        message: 'No rule engine returned from get operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Retrieved rule engine ${this.params.id}: ${ruleEngine.name}`,
                returnDisplay: `Retrieved rule engine ${this.params.id}`,
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
 * Tool for getting a rule engine
 */
export class RuleGetTool extends BaseDeclarativeTool<RuleGetParams, ToolResult> {
    constructor() {
        super(
            'rule_get',
            'Get Rule Engine',
            'Retrieves a context rule engine by ID.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    id: {
                        type: 'string',
                        description: 'Rule engine ID',
                    },
                },
                required: ['id'],
            }
        );
    }

    protected override createInvocation(params: RuleGetParams): ToolInvocation<RuleGetParams, ToolResult> {
        return new RuleGetInvocation(params);
    }
}
