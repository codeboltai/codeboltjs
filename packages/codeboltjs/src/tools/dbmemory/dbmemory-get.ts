import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import dbmemory from '../../modules/dbmemory';

export interface DBMemoryGetKnowledgeParams {
    key: string;
    explanation?: string;
}

class DBMemoryGetKnowledgeInvocation extends BaseToolInvocation<DBMemoryGetKnowledgeParams, ToolResult> {
    constructor(params: DBMemoryGetKnowledgeParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await dbmemory.getKnowledge(this.params.key);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const value = response.value !== undefined ? JSON.stringify(response.value, null, 2) : 'undefined';
            return {
                llmContent: `Value for "${this.params.key}":\n${value}`,
                returnDisplay: `Retrieved: ${this.params.key}`,
            };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class DBMemoryGetKnowledgeTool extends BaseDeclarativeTool<DBMemoryGetKnowledgeParams, ToolResult> {
    constructor() {
        super('dbmemory_get_knowledge', 'Get DB Memory', 'Get value from database', Kind.Other, {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Key' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['key'],
        });
    }

    protected override createInvocation(params: DBMemoryGetKnowledgeParams): ToolInvocation<DBMemoryGetKnowledgeParams, ToolResult> {
        return new DBMemoryGetKnowledgeInvocation(params);
    }
}
