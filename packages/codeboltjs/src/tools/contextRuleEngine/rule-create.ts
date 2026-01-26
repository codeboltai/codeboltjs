/**
 * Rule Create Tool
 * 
 * Creates a new context rule engine.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcontextRuleEngine from '../../modules/contextRuleEngine';
import type { CreateContextRuleEngineParams } from '../../types/contextRuleEngine';

/**
 * Parameters for creating a rule engine
 */
export interface RuleCreateParams extends CreateContextRuleEngineParams {
}

class RuleCreateInvocation extends BaseToolInvocation<RuleCreateParams, ToolResult> {
    constructor(params: RuleCreateParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcontextRuleEngine.create(this.params);

            const ruleEngine = response.data?.ruleEngine;

            if (!ruleEngine) {
                return {
                    llmContent: 'Error: Failed to create rule engine - no rule engine returned',
                    returnDisplay: 'Error: Failed to create rule engine',
                    error: {
                        message: 'No rule engine returned from create operation',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully created rule engine (ID: ${ruleEngine.id})`,
                returnDisplay: `Created rule engine ${ruleEngine.id}`,
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
 * Tool for creating a rule engine
 */
export class RuleCreateTool extends BaseDeclarativeTool<RuleCreateParams, ToolResult> {
    constructor() {
        super(
            'rule_create',
            'Create Rule Engine',
            'Creates a new context rule engine for conditional memory inclusion.',
            Kind.Other,
            {
                type: 'object',
                properties: {
                    name: {
                        type: 'string',
                        description: 'The name of the rule engine',
                    },
                    rules: {
                        type: 'array',
                        description: 'Array of rules',
                    },
                },
                required: ['name', 'rules'],
            }
        );
    }

    protected override createInvocation(params: RuleCreateParams): ToolInvocation<RuleCreateParams, ToolResult> {
        return new RuleCreateInvocation(params);
    }
}
