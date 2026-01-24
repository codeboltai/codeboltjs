import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import episodicMemory from '../../modules/episodicMemory';
import type { IAppendEventParams, IAppendEventResponse } from '../../modules/episodicMemory';

export interface EpisodicAppendEventParams extends IAppendEventParams {}

class EpisodicAppendEventInvocation extends BaseToolInvocation<EpisodicAppendEventParams, ToolResult> {
    constructor(params: EpisodicAppendEventParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IAppendEventResponse = await episodicMemory.appendEvent(this.params);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error?.message || 'Failed to append event'}`,
                    returnDisplay: `Error: ${response.error?.message || 'Failed to append event'}`,
                    error: { message: response.error?.message || 'Failed to append event', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const event = response.data;
            return {
                llmContent: `Event appended successfully with ID: ${event.id}`,
                returnDisplay: `Appended event: ${event.event_type} (ID: ${event.id})`,
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

export class EpisodicAppendEventTool extends BaseDeclarativeTool<EpisodicAppendEventParams, ToolResult> {
    constructor() {
        super('episodic_append_event', 'Append Event', 'Append an event to an episodic memory', Kind.Other, {
            type: 'object',
            properties: {
                memoryId: { type: 'string', description: 'ID of the episodic memory' },
                swarmId: { type: 'string', description: 'Swarm ID (alternative to memoryId)' },
                event_type: { type: 'string', description: 'Type of the event' },
                emitting_agent_id: { type: 'string', description: 'ID of the agent emitting the event' },
                team_id: { type: 'string', description: 'Team ID' },
                tags: { type: 'array', items: { type: 'string' }, description: 'Tags for the event' },
                payload: { description: 'Event payload (string or object)' },
            },
            required: ['event_type', 'emitting_agent_id', 'payload'],
        });
    }

    protected override createInvocation(params: EpisodicAppendEventParams): ToolInvocation<EpisodicAppendEventParams, ToolResult> {
        return new EpisodicAppendEventInvocation(params);
    }
}
