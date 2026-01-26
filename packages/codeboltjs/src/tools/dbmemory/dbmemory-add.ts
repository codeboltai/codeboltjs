import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import dbmemory from '../../modules/dbmemory';

export interface DBMemoryAddKnowledgeParams {
    key: string;
    value: any;
    explanation?: string;
}

class DBMemoryAddKnowledgeInvocation extends BaseToolInvocation<DBMemoryAddKnowledgeParams, ToolResult> {
    constructor(params: DBMemoryAddKnowledgeParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await dbmemory.addKnowledge(this.params.key, this.params.value);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Knowledge added with key "${this.params.key}"`,
                returnDisplay: `Added knowledge: ${this.params.key}`,
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

export class DBMemoryAddKnowledgeTool extends BaseDeclarativeTool<DBMemoryAddKnowledgeParams, ToolResult> {
    constructor() {
        super('dbmemory_add_knowledge', 'Add DB Memory', 'Add key-value to database', Kind.Other, {
            type: 'object',
            properties: {
                key: { type: 'string', description: 'Key' },
                value: { description: 'Value' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['key', 'value'],
        });
    }

    protected override createInvocation(params: DBMemoryAddKnowledgeParams): ToolInvocation<DBMemoryAddKnowledgeParams, ToolResult> {
        return new DBMemoryAddKnowledgeInvocation(params);
    }
}
