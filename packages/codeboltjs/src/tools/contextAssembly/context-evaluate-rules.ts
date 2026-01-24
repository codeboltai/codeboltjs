/**
 * Context Evaluate Rules Tool
 * 
 * Evaluates rules only without fetching memory content.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcontextAssembly from '../../modules/contextAssembly';
import type { ContextAssemblyRequest } from '../../types/contextAssembly';

/**
 * Parameters for evaluating rules
 */
export interface ContextEvaluateRulesParams {
    /** Context assembly request */
    request: ContextAssemblyRequest;
    /** Optional specific rule engine IDs to evaluate */
    ruleEngineIds?: string[];
}

class ContextEvaluateRulesInvocation extends BaseToolInvocation<ContextEvaluateRulesParams, ToolResult> {
    constructor(params: ContextEvaluateRulesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcontextAssembly.evaluateRules(
                this.params.request,
                this.params.ruleEngineIds
            );

            const evaluations = response.payload?.evaluations;

            if (!evaluations) {
                return {
                    llmContent: 'Error: Failed to evaluate rules - no evaluations returned',
                    returnDisplay: 'Error: Failed to evaluate rules',
                    error: {
                        message: 'No evaluations returned',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully evaluated ${Object.keys(evaluations).length} rule(s)`,
                returnDisplay: `Evaluated ${Object.keys(evaluations).length} rule(s)`,
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
export class ContextEvaluateRulesTool extends BaseDeclarativeTool<ContextEvaluateRulesParams, ToolResult> {
    constructor() {
        super(
            'context_evaluate_rules',
            'Evaluate Context Rules',
            'Evaluates rules only without fetching memory content. Optionally specify rule engine IDs.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    request: {
                        type: 'object',
                        description: 'Context assembly request',
                    },
                    ruleEngineIds: {
                        type: 'array',
                        items: { type: 'string' },
                        description: 'Optional specific rule engine IDs to evaluate',
                    },
                },
                required: ['request'],
            }
        );
    }

    protected override createInvocation(params: ContextEvaluateRulesParams): ToolInvocation<ContextEvaluateRulesParams, ToolResult> {
        return new ContextEvaluateRulesInvocation(params);
    }
}
