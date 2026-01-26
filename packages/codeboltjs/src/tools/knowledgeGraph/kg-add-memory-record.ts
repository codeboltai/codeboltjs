import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { CreateKGMemoryRecordParams } from '../../types/knowledgeGraph';

export interface KGAddMemoryRecordParams {
    instanceId: string;
    record: CreateKGMemoryRecordParams;
}

class KGAddMemoryRecordInvocation extends BaseToolInvocation<KGAddMemoryRecordParams, ToolResult> {
    constructor(params: KGAddMemoryRecordParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.addMemoryRecord(this.params.instanceId, this.params.record);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Memory record added: ${JSON.stringify(response.data)}`,
                returnDisplay: `Added memory record to instance: ${this.params.instanceId}`,
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

export class KGAddMemoryRecordTool extends BaseDeclarativeTool<KGAddMemoryRecordParams, ToolResult> {
    constructor() {
        super('kg_add_memory_record', 'Add KG Memory Record', 'Add a memory record to a knowledge graph instance', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'Instance ID' },
                record: { 
                    type: 'object',
                    description: 'Record data',
                },
            },
            required: ['instanceId', 'record'],
        });
    }

    protected override createInvocation(params: KGAddMemoryRecordParams): ToolInvocation<KGAddMemoryRecordParams, ToolResult> {
        return new KGAddMemoryRecordInvocation(params);
    }
}
