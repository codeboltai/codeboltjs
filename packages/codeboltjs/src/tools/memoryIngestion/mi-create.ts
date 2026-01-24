import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import memoryIngestion from '../../modules/memoryIngestion';

export interface CreateMemoryIngestionPipelineParams {
    pipelineId: string;
    label: string;
    description?: string;
    source: { type: string; [key: string]: any };
    processors: Array<{ type: string; [key: string]: any }>;
    explanation?: string;
}

class CreateMemoryIngestionPipelineInvocation extends BaseToolInvocation<CreateMemoryIngestionPipelineParams, ToolResult> {
    constructor(params: CreateMemoryIngestionPipelineParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await memoryIngestion.create({
                pipelineId: this.params.pipelineId,
                label: this.params.label,
                description: this.params.description,
                source: this.params.source,
                processors: this.params.processors,
            });

            if (!response.success || !response.pipeline) {
                return {
                    llmContent: `Error: ${response.error || 'Failed to create'}`,
                    returnDisplay: `Error: ${response.error || 'Failed'}`,
                    error: { message: response.error || 'Failed', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const content = `Memory ingestion pipeline created: ${response.pipeline.id} - ${response.pipeline.label}`;
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
