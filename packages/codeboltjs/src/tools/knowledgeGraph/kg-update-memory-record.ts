import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { CreateKGMemoryRecordParams } from '../../types/knowledgeGraph';

export interface KGUpdateMemoryRecordParams {
    instanceId: string;
    recordId: string;
    updates: Partial<CreateKGMemoryRecordParams>;
}

class KGUpdateMemoryRecordInvocation extends BaseToolInvocation<KGUpdateMemoryRecordParams, ToolResult> {
    constructor(params: KGUpdateMemoryRecordParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.updateMemoryRecord(this.params.instanceId, this.params.recordId, this.params.updates);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Memory record updated: ${JSON.stringify(response.data)}`,
                returnDisplay: `Updated memory record: ${this.params.recordId}`,
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

export class KGUpdateMemoryRecordTool extends BaseDeclarativeTool<KGUpdateMemoryRecordParams, ToolResult> {
    constructor() {
        super('kg_update_memory_record', 'Update KG Memory Record', 'Update a memory record', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'Instance ID' },
                recordId: { type: 'string', description: 'Record ID' },
                updates: { 
                    type: 'object',
                    description: 'Update parameters',
                },
            },
            required: ['instanceId', 'recordId', 'updates'],
        });
    }

    protected override createInvocation(params: KGUpdateMemoryRecordParams): ToolInvocation<KGUpdateMemoryRecordParams, ToolResult> {
        return new KGUpdateMemoryRecordInvocation(params);
    }
}
