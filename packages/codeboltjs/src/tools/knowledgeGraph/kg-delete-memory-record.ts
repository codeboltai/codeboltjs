import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

export interface KGDeleteMemoryRecordParams {
    instanceId: string;
    recordId: string;
}

class KGDeleteMemoryRecordInvocation extends BaseToolInvocation<KGDeleteMemoryRecordParams, ToolResult> {
    constructor(params: KGDeleteMemoryRecordParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.deleteMemoryRecord(this.params.instanceId, this.params.recordId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Memory record deleted: ${this.params.recordId}`,
                returnDisplay: `Deleted memory record: ${this.params.recordId}`,
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

export class KGDeleteMemoryRecordTool extends BaseDeclarativeTool<KGDeleteMemoryRecordParams, ToolResult> {
    constructor() {
        super('kg_delete_memory_record', 'Delete KG Memory Record', 'Delete a memory record', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'Instance ID' },
                recordId: { type: 'string', description: 'Record ID' },
            },
            required: ['instanceId', 'recordId'],
        });
    }

    protected override createInvocation(params: KGDeleteMemoryRecordParams): ToolInvocation<KGDeleteMemoryRecordParams, ToolResult> {
        return new KGDeleteMemoryRecordInvocation(params);
    }
}
