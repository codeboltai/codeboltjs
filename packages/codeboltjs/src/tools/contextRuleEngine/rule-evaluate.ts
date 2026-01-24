/**
 * Rule Evaluate Tool
 * 
 * Evaluates rules against provided variables.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcontextRuleEngine from '../../modules/contextRuleEngine';
import type { EvaluateRulesParams } from '../../types/contextRuleEngine';

/**
 * Parameters for evaluating rules
 */
export interface RuleEvaluateParams extends EvaluateRulesParams {
}

class RuleEvaluateInvocation extends BaseToolInvocation<RuleEvaluateParams, ToolResult> {
    constructor(params: RuleEvaluateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcontextRuleEngine.evaluate(this.params);

            const results = response.payload?.results;

            if (!results) {
                return {
                    llmContent: 'Error: Failed to evaluate rules - no results returned',
                    returnDisplay: 'Error: Failed to evaluate rules',
                    error: {
                        message: 'No results returned from evaluate operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully evaluated rules`,
                returnDisplay: `Rules evaluated`,
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
 * Tool for evaluating rules
 */
export class RuleEvaluateTool extends BaseDeclarativeTool<RuleEvaluateParams, ToolResult> {
    constructor() {
        super(
            'rule_evaluate',
            'Evaluate Rules',
            'Evaluates context rules against provided variables.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    ruleEngineId: {
                        type: 'string',
                        description: 'Rule engine ID',
                    },
                    variables: {
                        type: 'object',
                        description: 'Variables to evaluate against',
                    },
                },
                required: ['ruleEngineId', 'variables'],
            }
        );
    }

    protected override createInvocation(params: RuleEvaluateParams): ToolInvocation<RuleEvaluateParams, ToolResult> {
        return new RuleEvaluateInvocation(params);
    }
}
