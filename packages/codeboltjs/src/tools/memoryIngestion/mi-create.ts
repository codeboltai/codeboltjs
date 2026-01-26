import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import memoryIngestion from '../../modules/memoryIngestion';
import type { IngestionTrigger, IngestionProcessor, IngestionRouting } from '../../types/memoryIngestion';

export interface CreateMemoryIngestionPipelineParams {
    pipelineId?: string;
    label: string;
    description?: string;
    trigger: IngestionTrigger;
    trigger_config?: Record<string, any>;
    processors: IngestionProcessor[];
    routing: IngestionRouting;
    explanation?: string;
}

class CreateMemoryIngestionPipelineInvocation extends BaseToolInvocation<CreateMemoryIngestionPipelineParams, ToolResult> {
    constructor(params: CreateMemoryIngestionPipelineParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await memoryIngestion.create({
                id: this.params.pipelineId,
                label: this.params.label,
                description: this.params.description,
                trigger: this.params.trigger,
                trigger_config: this.params.trigger_config,
                processors: this.params.processors,
                routing: this.params.routing,
            });

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Failed to create';
                return {
                    llmContent: `Error: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: { message: errorMsg, type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            if (!response.data?.pipeline) {
                return {
                    llmContent: `Error: No pipeline returned`,
                    returnDisplay: `Error: No pipeline returned`,
                    error: { message: 'No pipeline returned', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const content = `Memory ingestion pipeline created: ${response.data.pipeline.id} - ${response.data.pipeline.label}`;
            return { llmContent: content, returnDisplay: content };
        } catch (error) {
            return {
                llmContent: `Error: ${error}`,
                returnDisplay: `Error: ${error}`,
                error: { message: String(error), type: ToolErrorType.EXECUTION_FAILED },
            };
        }
    }
}

export class CreateMemoryIngestionPipelineTool extends BaseDeclarativeTool<CreateMemoryIngestionPipelineParams, ToolResult> {
    constructor() {
        super('memoryIngestion_create', 'Create Memory Ingestion Pipeline', 'Create a memory ingestion pipeline', Kind.Other, {
            type: 'object',
            properties: {
                pipelineId: { type: 'string', description: 'Pipeline ID' },
                label: { type: 'string', description: 'Pipeline label' },
                description: { type: 'string', description: 'Pipeline description' },
                source: {
                    type: 'object',
                    properties: { type: { type: 'string', description: 'Source type' } },
                    required: ['type'],
                    description: 'Source configuration',
                },
                processors: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: { type: { type: 'string', description: 'Processor type' } },
                        required: ['type'],
                    },
                    description: 'Processors',
                },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['pipelineId', 'label', 'source', 'processors'],
        });
    }

    protected override createInvocation(params: CreateMemoryIngestionPipelineParams): ToolInvocation<CreateMemoryIngestionPipelineParams, ToolResult> {
        return new CreateMemoryIngestionPipelineInvocation(params);
    }
}
