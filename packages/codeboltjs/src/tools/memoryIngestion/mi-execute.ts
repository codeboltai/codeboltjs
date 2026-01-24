import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import memoryIngestion from '../../modules/memoryIngestion';

export interface ExecuteMemoryIngestionPipelineParams {
    pipelineId: string;
    inputData?: any;
    explanation?: string;
}

class ExecuteMemoryIngestionPipelineInvocation extends BaseToolInvocation<ExecuteMemoryIngestionPipelineParams, ToolResult> {
    constructor(params: ExecuteMemoryIngestionPipelineParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response = await memoryIngestion.execute({
                pipelineId: this.params.pipelineId,
                inputData: this.params.inputData,
            });

            if (!response.success) {
                return {
                    llmContent: `Error: ${response.error || 'Failed to execute'}`,
                    returnDisplay: `Error: ${response.error || 'Failed'}`,
                    error: { message: response.error || 'Failed', type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const content = `Pipeline executed. Records processed: ${response.recordsProcessed || 0}`;
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

export class ExecuteMemoryIngestionPipelineTool extends BaseDeclarativeTool<ExecuteMemoryIngestionPipelineParams, ToolResult> {
    constructor() {
        super('memoryIngestion_execute', 'Execute Memory Ingestion Pipeline', 'Execute a memory ingestion pipeline', Kind.Other, {
            type: 'object',
            properties: {
                pipelineId: { type: 'string', description: 'Pipeline ID' },
                inputData: { description: 'Input data' },
                explanation: { type: 'string', description: 'Explanation' },
            },
            required: ['pipelineId'],
        });
    }

    protected override createInvocation(params: ExecuteMemoryIngestionPipelineParams): ToolInvocation<ExecuteMemoryIngestionPipelineParams, ToolResult> {
        return new ExecuteMemoryIngestionPipelineInvocation(params);
    }
}
