import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { ListKGMemoryRecordsParams } from '../../types/knowledgeGraph';

export interface KGListMemoryRecordsParams {
    instanceId: string;
    filters?: ListKGMemoryRecordsParams;
}

class KGListMemoryRecordsInvocation extends BaseToolInvocation<KGListMemoryRecordsParams, ToolResult> {
    constructor(params: KGListMemoryRecordsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.listMemoryRecords(this.params.instanceId, this.params.filters);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const records = response.data || [];
            return {
                llmContent: `Found ${records.length} memory records: ${JSON.stringify(records)}`,
                returnDisplay: `Listed ${records.length} memory records`,
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

export class KGListMemoryRecordsTool extends BaseDeclarativeTool<KGListMemoryRecordsParams, ToolResult> {
    constructor() {
        super('kg_list_memory_records', 'List KG Memory Records', 'List memory records in a knowledge graph instance', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'Instance ID' },
                filters: { 
                    type: 'object',
                    description: 'Optional filters',
                },
            },
            required: ['instanceId'],
        });
    }

    protected override createInvocation(params: KGListMemoryRecordsParams): ToolInvocation<KGListMemoryRecordsParams, ToolResult> {
        return new KGListMemoryRecordsInvocation(params);
    }
}
