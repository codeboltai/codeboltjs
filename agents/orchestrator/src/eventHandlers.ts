import { ProcessedMessage } from '@codebolt/types/agent';

/**
 * External event types that can be received from the event queue
 */
export type ExternalEventType =
    | 'backgroundAgentCompletion'
    | 'backgroundGroupedAgentCompletion'
    | 'agentQueueEvent';

export interface ExternalEvent {
    type: ExternalEventType;
    data: any;
}

export interface AgentQueueEventData {
    sourceAgentId?: string;
    sourceThreadId?: string;
    eventType?: string;
    payload?: {
        content?: string;
        [key: string]: any;
    };
}

/**
 * Handles background agent completion events
 * Adds completion data to the prompt messages
 */
export function handleBackgroundAgentCompletion(
    prompt: ProcessedMessage,
    completionData: any
): void {
    const agentMessage = {
        role: "assistant" as const,
        content: `Background agent completed:\n${JSON.stringify(completionData, null, 2)}`
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
${agentEvent.payload?.content || JSON.stringify(agentEvent.payload)}
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
 */
export function processExternalEvent(
    event: ExternalEvent,
    prompt: ProcessedMessage
): void {
    switch (event.type) {
        case 'backgroundAgentCompletion':
        case 'backgroundGroupedAgentCompletion':
            handleBackgroundAgentCompletion(prompt, event.data);
            break;

        case 'agentQueueEvent':
            handleAgentQueueEvent(prompt, event.data);
            break;

        default:
            console.warn(`Unknown event type: ${event.type}`);
    }
}
