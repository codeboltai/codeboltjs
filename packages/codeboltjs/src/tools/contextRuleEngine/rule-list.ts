/**
 * Rule List Tool
 * 
 * Lists all rule engines.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcontextRuleEngine from '../../modules/contextRuleEngine';

/**
 * Parameters for listing rule engines (none required)
 */
export interface RuleListParams {
}

class RuleListInvocation extends BaseToolInvocation<RuleListParams, ToolResult> {
    constructor(params: RuleListParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcontextRuleEngine.list();

            const ruleEngines = response.payload?.ruleEngines;

            if (!ruleEngines) {
                return {
                    llmContent: 'Error: Failed to list rule engines - no rule engines returned',
                    returnDisplay: 'Error: Failed to list rule engines',
                    error: {
                        message: 'No rule engines returned from list operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Found ${ruleEngines.length} rule engine(s)`,
                returnDisplay: `Found ${ruleEngines.length} rule engine(s)`,
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
 * Tool for listing rule engines
 */
export class RuleListTool extends BaseDeclarativeTool<RuleListParams, ToolResult> {
    constructor() {
        super(
            'rule_list',
            'List Rule Engines',
            'Lists all context rule engines.',
            Kind.Other,
            {
                type: 'object',
                properties: {},
                required: [],
            }
        );
    }

    protected override createInvocation(params: RuleListParams): ToolInvocation<RuleListParams, ToolResult> {
        return new RuleListInvocation(params);
    }
}
