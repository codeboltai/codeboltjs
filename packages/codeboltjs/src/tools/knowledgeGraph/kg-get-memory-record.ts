import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';

export interface KGGetMemoryRecordParams {
    instanceId: string;
    recordId: string;
}

class KGGetMemoryRecordInvocation extends BaseToolInvocation<KGGetMemoryRecordParams, ToolResult> {
    constructor(params: KGGetMemoryRecordParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await knowledgeGraph.getMemoryRecord(this.params.instanceId, this.params.recordId);
            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error}`,
                    returnDisplay: `Error: ${response.error}`,
                    error: { message: response.error || 'Unknown error', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            return {
                llmContent: `Memory record retrieved: ${JSON.stringify(response.data)}`,
                returnDisplay: `Retrieved memory record: ${this.params.recordId}`,
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

export class KGGetMemoryRecordTool extends BaseDeclarativeTool<KGGetMemoryRecordParams, ToolResult> {
    constructor() {
        super('kg_get_memory_record', 'Get KG Memory Record', 'Get a memory record by ID', Kind.Other, {
            type: 'object',
            properties: {
                instanceId: { type: 'string', description: 'Instance ID' },
                recordId: { type: 'string', description: 'Record ID' },
            },
            required: ['instanceId', 'recordId'],
        });
    }

    protected override createInvocation(params: KGGetMemoryRecordParams): ToolInvocation<KGGetMemoryRecordParams, ToolResult> {
        return new KGGetMemoryRecordInvocation(params);
    }
}
