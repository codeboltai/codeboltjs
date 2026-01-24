import type { ToolInvocation, ToolResult } from '../types';
import { ToolErrorType, Kind } from '../types';
import { BaseDeclarativeTool, BaseToolInvocation } from '../base-tool';
import episodicMemory from '../../modules/episodicMemory';
import type { IQueryEventsParams, IQueryEventsResponse } from '../../modules/episodicMemory';

export interface EpisodicQueryEventsParams extends IQueryEventsParams {}

class EpisodicQueryEventsInvocation extends BaseToolInvocation<EpisodicQueryEventsParams, ToolResult> {
    constructor(params: EpisodicQueryEventsParams) {
        super(params);
    }

    async execute(_signal: AbortSignal): Promise<ToolResult> {
        try {
            const response: IQueryEventsResponse = await episodicMemory.queryEvents(this.params);
            if (!response.success || !response.data) {
                return {
                    llmContent: `Error: ${response.error?.message || 'Failed to query events'}`,
                    returnDisplay: `Error: ${response.error?.message || 'Failed to query events'}`,
                    error: { message: response.error?.message || 'Failed to query events', type: ToolErrorType.EXECUTION_FAILED },
                };
            }
            const { events, total, filtered } = response.data;
            return {
                llmContent: `Found ${events.length} event(s) out of ${total} total${filtered ? ' (filtered)' : ''}`,
                returnDisplay: JSON.stringify(events, null, 2),
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

export class EpisodicQueryEventsTool extends BaseDeclarativeTool<EpisodicQueryEventsParams, ToolResult> {
    constructor() {
        super('episodic_query_events', 'Query Events', 'Query events from an episodic memory', Kind.Other, {
            type: 'object',
            properties: {
                memoryId: { type: 'string', description: 'ID of the episodic memory' },
                swarmId: { type: 'string', description: 'Swarm ID (alternative to memoryId)' },
                lastMinutes: { type: 'number', description: 'Filter events from last N minutes' },
                lastCount: { type: 'number', description: 'Get last N events' },
                tags: { type: 'array', items: { type: 'string' }, description: 'Filter by tags' },
                event_type: { type: 'string', description: 'Filter by event type' },
                emitting_agent_id: { type: 'string', description: 'Filter by emitting agent ID' },
                team_id: { type: 'string', description: 'Filter by team ID' },
                since: { type: 'string', description: 'Filter events since timestamp' },
            },
            required: [],
        });
    }

    protected override createInvocation(params: EpisodicQueryEventsParams): ToolInvocation<EpisodicQueryEventsParams, ToolResult> {
        return new EpisodicQueryEventsInvocation(params);
    }
}
