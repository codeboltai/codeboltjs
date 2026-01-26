/**
 * KG Record List Tool - Lists memory records in a knowledge graph instance
 * Wraps the SDK's knowledgeGraph.listMemoryRecords() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { ListKGMemoryRecordsParams } from '../../types/knowledgeGraph';

/**
 * Parameters for the KGRecordList tool
 */
export interface KGRecordListToolParams {
    /**
     * The ID of the instance to list records from
     */
    instance_id: string;

    /**
     * Optional: Filter by record kind
     */
    kind?: string;

    /**
     * Optional: Maximum number of records to return
     */
    limit?: number;

    /**
     * Optional: Number of records to skip (for pagination)
     */
    offset?: number;
}

class KGRecordListToolInvocation extends BaseToolInvocation<
    KGRecordListToolParams,
    ToolResult
> {
    constructor(params: KGRecordListToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const filters: ListKGMemoryRecordsParams = {};
            if (this.params.kind) filters.kind = this.params.kind;
            if (this.params.limit !== undefined) filters.limit = this.params.limit;
            if (this.params.offset !== undefined) filters.offset = this.params.offset;

            const response = await knowledgeGraph.listMemoryRecords(this.params.instance_id, filters);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error listing memory records: ${errorMsg}`,
                    returnDisplay: `Error listing memory records: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const records = response.data || [];
            const recordList = records.map(r => `- ${r.kind}: ${r.id} (${JSON.stringify(r.attributes)})`).join('\n');

            const filterInfo: string[] = [];
            if (this.params.kind) filterInfo.push(`kind: ${this.params.kind}`);
            if (this.params.limit !== undefined) filterInfo.push(`limit: ${this.params.limit}`);
            if (this.params.offset !== undefined) filterInfo.push(`offset: ${this.params.offset}`);
            const filterStr = filterInfo.length > 0 ? ` (${filterInfo.join(', ')})` : '';

            return {
                llmContent: records.length > 0
                    ? `Found ${records.length} memory record(s) in instance ${this.params.instance_id}${filterStr}:\n${recordList}\n\nFull data: ${JSON.stringify(records, null, 2)}`
                    : `No memory records found in instance ${this.params.instance_id}${filterStr}.`,
                returnDisplay: `Listed ${records.length} memory record(s)`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error listing memory records: ${errorMessage}`,
                returnDisplay: `Error listing memory records: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the KGRecordList tool logic
 */
export class KGRecordListTool extends BaseDeclarativeTool<
    KGRecordListToolParams,
    ToolResult
> {
    static readonly Name: string = 'kg_record_list';

    constructor() {
        super(
            KGRecordListTool.Name,
            'KGRecordList',
            `Lists memory records in a knowledge graph instance. Can filter by record kind and supports pagination with limit and offset parameters.`,
            Kind.Read,
            {
                properties: {
                    instance_id: {
                        description: 'The ID of the instance to list records from',
                        type: 'string',
                    },
                    kind: {
                        description: 'Optional: Filter by record kind',
                        type: 'string',
                    },
                    limit: {
                        description: 'Optional: Maximum number of records to return',
                        type: 'number',
                    },
                    offset: {
                        description: 'Optional: Number of records to skip (for pagination)',
                        type: 'number',
                    },
                },
                required: ['instance_id'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: KGRecordListToolParams,
    ): string | null {
        if (!params.instance_id || params.instance_id.trim() === '') {
            return "The 'instance_id' parameter must be non-empty.";
        }

        if (params.limit !== undefined && params.limit < 0) {
            return "The 'limit' parameter must be non-negative.";
        }

        if (params.offset !== undefined && params.offset < 0) {
            return "The 'offset' parameter must be non-negative.";
        }

        return null;
    }

    protected createInvocation(
        params: KGRecordListToolParams,
    ): ToolInvocation<KGRecordListToolParams, ToolResult> {
        return new KGRecordListToolInvocation(params);
    }
}
