/**
 * Rule Delete Tool
 * 
 * Deletes a rule engine.
 */

import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import cbcontextRuleEngine from '../../modules/contextRuleEngine';

/**
 * Parameters for deleting a rule engine
 */
export interface RuleDeleteParams {
    /** Rule engine ID */
    id: string;
}

class RuleDeleteInvocation extends BaseToolInvocation<RuleDeleteParams, ToolResult> {
    constructor(params: RuleDeleteParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await cbcontextRuleEngine.delete(this.params.id);

            if (!response.data?.deleted) {
                return {
                    llmContent: 'Error: Failed to delete rule engine',
                    returnDisplay: 'Error: Failed to delete rule engine',
                    error: {
                        message: 'Delete operation failed',
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            return {
                llmContent: `Successfully deleted rule engine ${this.params.id}`,
                returnDisplay: `Deleted rule engine ${this.params.id}`,
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
 * Tool for deleting a rule engine
 */
export class RuleDeleteTool extends BaseDeclarativeTool<RuleDeleteParams, ToolResult> {
    constructor() {
        super(
            'rule_delete',
            'Delete Rule Engine',
            'Deletes a context rule engine.',
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

    protected override createInvocation(params: RuleDeleteParams): ToolInvocation<RuleDeleteParams, ToolResult> {
        return new RuleDeleteInvocation(params);
    }
}
