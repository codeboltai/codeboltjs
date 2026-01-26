import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import memoryIngestion from '../../modules/memoryIngestion';

export interface ExecuteMemoryIngestionPipelineParams {
    pipelineId: string;
    eventType?: string;
    trigger?: string;
    threadId?: string;
    agentId?: string;
    swarmId?: string;
    projectId?: string;
    payload?: Record<string, any>;
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
                eventType: this.params.eventType,
                trigger: this.params.trigger,
                threadId: this.params.threadId,
                agentId: this.params.agentId,
                swarmId: this.params.swarmId,
                projectId: this.params.projectId,
                payload: this.params.payload,
            });

            if (!response.success) {
                const errorMsg = response.error || response.message || 'Failed to execute';
                return {
                    llmContent: `Error: ${errorMsg}`,
                    returnDisplay: `Error: ${errorMsg}`,
                    error: { message: errorMsg, type: ToolErrorType.EXECUTION_FAILED },
                };
            }

            const result = response.data?.result;
            const content = `Pipeline executed. Records processed: ${result?.processedCount || 0}`;
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
