/**
 * KG Record Add Tool - Adds a memory record to a knowledge graph instance
 * Wraps the SDK's knowledgeGraph.addMemoryRecord() method
 */

import type {
    ToolInvocation,
    ToolResult,
} from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import knowledgeGraph from '../../modules/knowledgeGraph';
import type { CreateKGMemoryRecordParams } from '../../types/knowledgeGraph';

/**
 * Parameters for the KGRecordAdd tool
 */
export interface KGRecordAddToolParams {
    /**
     * The ID of the instance to add the record to
     */
    instance_id: string;

    /**
     * The kind/type of the record (must match a record_kind in the template)
     */
    kind: string;

    /**
     * The attributes/data of the record
     */
    attributes: Record<string, any>;

    /**
     * Optional: Start of validity period (ISO date string)
     */
    valid_from?: string;

    /**
     * Optional: End of validity period (ISO date string)
     */
    valid_to?: string;
}

class KGRecordAddToolInvocation extends BaseToolInvocation<
    KGRecordAddToolParams,
    ToolResult
> {
    constructor(params: KGRecordAddToolParams) {
        super(params);
    }

    async execute(): Promise<ToolResult> {
        try {
            const record: CreateKGMemoryRecordParams = {
                kind: this.params.kind,
                attributes: this.params.attributes,
                valid_from: this.params.valid_from,
                valid_to: this.params.valid_to,
            };

            const response = await knowledgeGraph.addMemoryRecord(this.params.instance_id, record);

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Unknown error';
                return {
                    llmContent: `Error adding memory record: ${errorMsg}`,
                    returnDisplay: `Error adding memory record: ${errorMsg}`,
                    error: {
                        message: errorMsg,
                        type: ToolErrorType.EXECUTION_FAILED,
                    },
                };
            }

            const addedRecord = response.data;
            return {
                llmContent: `Successfully added memory record of kind "${this.params.kind}" with ID: ${addedRecord?.id}\n\nRecord data: ${JSON.stringify(addedRecord, null, 2)}`,
                returnDisplay: `Added memory record: ${addedRecord?.id}`,
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                llmContent: `Error adding memory record: ${errorMessage}`,
                returnDisplay: `Error adding memory record: ${errorMessage}`,
                error: {
                    message: errorMessage,
                    type: ToolErrorType.EXECUTION_FAILED,
                },
            };
        }
    }
}

/**
 * Implementation of the KGRecordAdd tool logic
 */
export class KGRecordAddTool extends BaseDeclarativeTool<
    KGRecordAddToolParams,
    ToolResult
> {
    static readonly Name: string = 'kg_record_add';

    constructor() {
        super(
            KGRecordAddTool.Name,
            'KGRecordAdd',
            `Adds a memory record (node) to a knowledge graph instance. Records represent entities in the knowledge graph with a specific kind and attributes.`,
            Kind.Edit,
            {
                properties: {
                    instance_id: {
                        description: 'The ID of the instance to add the record to',
                        type: 'string',
                    },
                    kind: {
                        description: 'The kind/type of the record (must match a record_kind in the template)',
                        type: 'string',
                    },
                    attributes: {
                        description: 'The attributes/data of the record as a JSON object',
                        type: 'object',
                    },
                    valid_from: {
                        description: 'Optional: Start of validity period (ISO date string)',
                        type: 'string',
                    },
                    valid_to: {
                        description: 'Optional: End of validity period (ISO date string)',
                        type: 'string',
                    },
                },
                required: ['instance_id', 'kind', 'attributes'],
                type: 'object',
            },
        );
    }

    protected override validateToolParamValues(
        params: KGRecordAddToolParams,
    ): string | null {
        if (!params.instance_id || params.instance_id.trim() === '') {
            return "The 'instance_id' parameter must be non-empty.";
        }

        if (!params.kind || params.kind.trim() === '') {
            return "The 'kind' parameter must be non-empty.";
        }

        if (!params.attributes || typeof params.attributes !== 'object') {
            return "The 'attributes' parameter must be an object.";
        }

        return null;
    }

    protected createInvocation(
        params: KGRecordAddToolParams,
    ): ToolInvocation<KGRecordAddToolParams, ToolResult> {
        return new KGRecordAddToolInvocation(params);
    }
}
