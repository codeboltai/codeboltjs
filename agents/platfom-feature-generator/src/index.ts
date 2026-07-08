import codebolt from '@codebolt/codeboltjs';
import { createAgent } from '@codebolt/agent/unified';
import { FlatUserMessage } from '@codebolt/types/sdk';

const agent = createAgent({
  systemPrompt: 'You are a helpful CodeBolt assistant. Handle chat messages and external runtime events directly.',
});

const commandEventTypes = new Set([
  'commandRunning',
  'commandOutput',
  'commandError',
  'commandFinish',
  'terminalCommandOutputResponse',
  'terminalCommandStatusResponse',
  'terminalCommandWaitResponse',
  'terminalCommandStopResponse',
  'terminalCommandsListResponse',
]);

async function runAgent(message: string | FlatUserMessage): Promise<string> {
  const result = await agent.run(message);
  const response = result.success ? result.finalMessage || '' : result.error || 'Agent execution failed.';
  await codebolt.chat.sendMessage(response, {});

  return response;
}

function createEventMessage(eventType: string, eventData: unknown): string {
  return [
    `Handle this external runtime event: ${eventType}`,
    JSON.stringify(eventData, null, 2),
  ].join('\n\n');
}

function isCommandEvent(message: unknown): boolean {
  if (!message || typeof message !== 'object') {
    return false;
  }

  const eventType = (message as { type?: unknown }).type;
  return typeof eventType === 'string' && commandEventTypes.has(eventType);
}

async function listenForExternalEvents(): Promise<void> {
  while (true) {
    const event = await codebolt.agentEventQueue.waitForAnyExternalEvent();
    await runAgent(createEventMessage(event.type, event.data));
  }
}

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
  return runAgent(reqMessage);
});

codebolt.onRawMessage(async (message: unknown) => {
  if (!isCommandEvent(message)) {
    return;
  }

  await runAgent(createEventMessage('commandEvent', message));
});

codebolt.onReady(() => {
  void listenForExternalEvents();
});
