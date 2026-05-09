function handleBackgroundAgentCompletion(prompt, completionData) {
  if (!prompt || !prompt.message || !Array.isArray(prompt.message.messages)) {
    return;
  }

  prompt.message.messages.push({
    role: 'assistant',
    content: `Background agent completed:\n${JSON.stringify(completionData, null, 2)}`,
  });
}

function handleAgentQueueEvent(prompt, agentEvent) {
  if (!prompt || !prompt.message || !Array.isArray(prompt.message.messages)) {
    return;
  }

  prompt.message.messages.push({
    role: 'user',
    content: `<agent_event>
<source_agent>${agentEvent.sourceAgentId || 'unknown'}</source_agent>
<source_thread>${agentEvent.sourceThreadId || 'unknown'}</source_thread>
<event_type>${agentEvent.eventType || 'agentMessage'}</event_type>
<content>${agentEvent.payload && agentEvent.payload.content ? agentEvent.payload.content : JSON.stringify(agentEvent.payload || agentEvent)}</content>
</agent_event>`,
  });
}

function processSingleEvent(event, prompt) {
  if (!event || typeof event !== 'object') {
    return;
  }

  const eventType = event.type || event.eventType;
  const eventData = event.data || event;

  if (eventType === 'backgroundAgentCompletion' || eventType === 'backgroundGroupedAgentCompletion') {
    handleBackgroundAgentCompletion(prompt, eventData);
    return;
  }

  if (eventType === 'agentQueueEvent' || event.sourceAgentId || event.payload) {
    handleAgentQueueEvent(prompt, eventData);
  }
}

function processExternalEvent(event, prompt) {
  if (Array.isArray(event)) {
    for (const singleEvent of event) {
      processSingleEvent(singleEvent, prompt);
    }
    return;
  }

  processSingleEvent(event, prompt);
}

export { processExternalEvent };
