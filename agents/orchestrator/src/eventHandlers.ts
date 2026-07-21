import { ProcessedMessage } from '@codebolt/types/agent';

/**
 * External event types that can be received from the event queue
 */
export type ExternalEventType =
    | 'threadCompletion'
    | 'backgroundCommandCompletion'
    | 'agentMessage'
    | 'steering'
    | 'agentQueueEvent';

export interface ExternalEvent {
    type: ExternalEventType;
    data: any;
}

export interface AgentQueueEventData {
    sourceAgentId?: string;
    sourceThreadId?: string;
    eventType?: string;
    content?: string;
    payload?: {
        content?: string;
        [key: string]: any;
    };
}

export function handleSteeringEvent(
    prompt: ProcessedMessage,
    steeringData: any
): void {
    const instruction = steeringData?.instruction || JSON.stringify(steeringData);
    const steeringMessage = {
        role: "user" as const,
        content: `<steering_message>
<instruction>${instruction}</instruction>
<context>The user sent this steering message while work was running. Adjust the current approach before continuing.</context>
</steering_message>`
    };

    if (prompt?.message?.messages) {
        prompt.message.messages.push(steeringMessage);
    }
}

/**
 * Job completion event data
 */
export interface JobCompletionEventData {
    jobId: string;
    threadId?: string;
    success: boolean;
    result?: any;
    error?: string;
    metadata?: {
        jobId?: string;
        taskName?: string;
        [key: string]: any;
    };
}

/**
 * Handles thread completion events
 * Adds completion data to the prompt messages
 */
export function handleThreadCompletion(
    prompt: ProcessedMessage,
    completionData: any
): void {
    const agentMessage = {
        role: "assistant" as const,
        content: `Background thread completed:\n${JSON.stringify(completionData, null, 2)}`
    };

    if (prompt?.message?.messages) {
        prompt.message.messages.push(agentMessage);
    }
}

/**
 * Handles agent queue events from child agents
 * Formats the message and adds it to the prompt
 */
export function handleAgentQueueEvent(
    prompt: ProcessedMessage,
    agentEvent: AgentQueueEventData
): void {
    const messageContent = `<child_agent_message>
<source_agent>${agentEvent.sourceAgentId || 'unknown'}</source_agent>
<source_thread>${agentEvent.sourceThreadId || 'unknown'}</source_thread>
<event_type>${agentEvent.eventType || 'agentMessage'}</event_type>
<content>
${agentEvent.content || agentEvent.payload?.content || JSON.stringify(agentEvent.payload)}
</content>
<context>This message is from a child worker agent. Review the content and take appropriate action - you may need to delegate further tasks, provide feedback, or synthesize results.</context>
<reply_instructions>To reply to this agent, use the eventqueue_send_message tool with targetAgentId set to "${agentEvent.sourceAgentId}" and your response in the content parameter.</reply_instructions>
</child_agent_message>`;

    const agentMessage = {
        role: "user" as const,
        content: messageContent
    };

    if (prompt?.message?.messages) {
        prompt.message.messages.push(agentMessage);
    }
}

/**
 * Process an external event and update the prompt accordingly
 * Accepts any event object and handles it based on its structure
 */
export function processExternalEvent(
    event: any,
    prompt: ProcessedMessage
): void {
    // Handle events with explicit type field
    if (event && typeof event === 'object') {
        const eventType = event.type || event.eventType;
        const eventData = event.data || event;
        const eventMetadata = event.metadata || {};

        switch (eventType) {
            case 'threadCompletion':
            case 'backgroundCommandCompletion':
                handleThreadCompletion(prompt, eventData);
                break;

            case 'steering':
                handleSteeringEvent(prompt, eventData);
                break;

            case 'agentMessage':
            case 'agentQueueEvent': {
                const agentEventData = eventData && typeof eventData === 'object'
                    ? eventData
                    : { content: String(eventData) };
                handleAgentQueueEvent(prompt, {
                    ...agentEventData,
                    sourceAgentId: agentEventData.sourceAgentId || eventMetadata.sourceAgentId,
                    sourceThreadId: agentEventData.sourceThreadId || eventMetadata.sourceThreadId,
                    eventType
                });
                break;
            }

            default:
                // Try to handle as a generic agent event
                if (event.sourceAgentId || event.payload) {
                    handleAgentQueueEvent(prompt, event as AgentQueueEventData);
                } else {
                    console.warn(`Unknown event type: ${eventType}`, event);
                }
        }
    }
}

/**
 * Extracts job completion info from an event
 */
export function extractJobCompletionInfo(event: any): JobCompletionEventData | null {
    if (!event) return null;

    const eventType = event.type || event.eventType;
    const eventData = event.data || event;

    if (eventType === 'threadCompletion') {

        const metadata = eventData?.metadata || {};
        const jobId = metadata.jobId || eventData.jobId;

        if (jobId) {
            return {
                jobId,
                threadId: eventData.threadId || eventData.targetThreadId,
                success: eventData.success !== false && eventData.status !== 'failed' && !eventData.error,
                result: eventData.result,
                error: eventData.error,
                metadata
            };
        }
    }

    return null;
}
