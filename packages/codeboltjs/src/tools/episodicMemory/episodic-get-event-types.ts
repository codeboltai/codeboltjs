import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import episodicMemory from '../../modules/episodicMemory';
import type { IGetEventTypesParams, IGetEventTypesResponse } from '../../modules/episodicMemory';

export interface EpisodicGetEventTypesParams extends IGetEventTypesParams {}

class EpisodicGetEventTypesInvocation extends BaseToolInvocation<EpisodicGetEventTypesParams, ToolResult> {
    constructor(params: EpisodicGetEventTypesParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IGetEventTypesResponse = await episodicMemory.getEventTypes(this.params);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error?.message || 'Failed to get event types'}`,
                    returnDisplay: `Error: ${response.error?.message || 'Failed to get event types'}`,
                    error: { message: response.error?.message || 'Failed to get event types', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const eventTypes = response.data;
            return {
                llmContent: `Found ${eventTypes.length} unique event type(s)`,
                returnDisplay: JSON.stringify(eventTypes, null, 2),
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

export class EpisodicGetEventTypesTool extends BaseDeclarativeTool<EpisodicGetEventTypesParams, ToolResult> {
    constructor() {
        super('episodic_get_event_types', 'Get Event Types', 'Get unique event types from an episodic memory', Kind.Other, {
            type: 'object',
            properties: {
                memoryId: { type: 'string', description: 'ID of the episodic memory' },
                swarmId: { type: 'string', description: 'Swarm ID (alternative to memoryId)' },
            },
            required: [],
        });
    }

    protected override createInvocation(params: EpisodicGetEventTypesParams): ToolInvocation<EpisodicGetEventTypesParams, ToolResult> {
        return new EpisodicGetEventTypesInvocation(params);
    }
}
