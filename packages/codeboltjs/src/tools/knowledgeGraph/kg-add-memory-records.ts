import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { CreateKGMemoryRecordParams } from '../../types/knowledgeGraph';

export interface KGAddMemoryRecordsParams {
    instanceId: string;
    records: CreateKGMemoryRecordParams[];
}

class KGAddMemoryRecordsInvocation extends BaseToolInvocation<KGAddMemoryRecordsParams, ToolResult> {
    constructor(params: KGAddMemoryRecordsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.addMemoryRecords(this.params.instanceId, this.params.records);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const records = response.data || [];
            return {
                llmContent: `Added ${records.length} memory records: ${JSON.stringify(records)}`,
                returnDisplay: `Added ${records.length} memory records to instance: ${this.params.instanceId}`,
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

export class KGAddMemoryRecordsTool extends BaseDeclarativeTool<KGAddMemoryRecordsParams, ToolResult> {
    constructor() {
        super('kg_add_memory_records', 'Add KG Memory Records', 'Add multiple memory records to a knowledge graph instance', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'Instance ID' },
                records: { 
                    type: 'array',
                    description: 'Array of record data',
                    items: { type: 'object' },
                },
            },
            required: ['instanceId', 'records'],
        });
    }

    protected override createInvocation(params: KGAddMemoryRecordsParams): ToolInvocation<KGAddMemoryRecordsParams, ToolResult> {
        return new KGAddMemoryRecordsInvocation(params);
    }
}
