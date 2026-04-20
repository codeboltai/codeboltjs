import type { ProcessedMessage } from '@codebolt/types/agent';
import type { LLMInferenceParams, MessageObject } from '@codebolt/types/sdk';

const RUNTIME_CONTEXT_METADATA_KEY = '__codeboltRuntimePromptContext';

interface RuntimePromptContext {
  systemPrompt: string | undefined;
  systemContextMessages: MessageObject[];
  userContextMessages: MessageObject[];
  transcriptMessages: MessageObject[];
}

function cloneContent(
  content: MessageObject['content'],
): MessageObject['content'] {
  if (Array.isArray(content)) {
    return [...content];
  }

  return content;
}

function cloneMessage(message: MessageObject): MessageObject {
  const clonedMessage: MessageObject = {
    ...message,
    content: cloneContent(message.content),
  };

  if (message.tool_calls) {
    clonedMessage.tool_calls = [...message.tool_calls];
  }

  return clonedMessage;
}

function cloneMessages(messages: MessageObject[]): MessageObject[] {
  return messages.map((message) => cloneMessage(message));
}

function buildSystemMessages(
  runtimeContext: RuntimePromptContext,
): MessageObject[] {
  const stringSections: string[] = [];
  const nonStringSystemMessages: MessageObject[] = [];

  if (runtimeContext.systemPrompt && runtimeContext.systemPrompt.trim().length > 0) {
    stringSections.push(runtimeContext.systemPrompt);
  }

  for (const systemMessage of runtimeContext.systemContextMessages) {
    if (typeof systemMessage.content === 'string') {
      stringSections.push(systemMessage.content);
      continue;
    }

    nonStringSystemMessages.push(cloneMessage(systemMessage));
  }

  const flattenedSystemMessages: MessageObject[] = [];
  if (stringSections.length > 0) {
    flattenedSystemMessages.push({
      role: 'system',
      content: stringSections.join('\n\n'),
    });
  }

  flattenedSystemMessages.push(...nonStringSystemMessages);

  return flattenedSystemMessages;
}

function flattenRuntimeMessages(
  runtimeContext: RuntimePromptContext,
): MessageObject[] {
  return [
    ...buildSystemMessages(runtimeContext),
    ...cloneMessages(runtimeContext.userContextMessages),
    ...cloneMessages(runtimeContext.transcriptMessages),
  ];
}

function inferRuntimeContext(prompt: ProcessedMessage): RuntimePromptContext {
  const messages = prompt.message.messages ?? [];
  const systemMessages = messages.filter((message) => message.role === 'system');
  const transcriptMessages = messages.filter((message) => message.role !== 'system');

  let systemPrompt: string | undefined;
  const systemContextMessages: MessageObject[] = [];

  if (systemMessages.length > 0) {
    const [firstSystemMessage, ...remainingSystemMessages] = systemMessages;

    if (firstSystemMessage && typeof firstSystemMessage.content === 'string') {
      systemPrompt = firstSystemMessage.content;
    } else if (firstSystemMessage) {
      systemContextMessages.push(cloneMessage(firstSystemMessage));
    }

    systemContextMessages.push(...cloneMessages(remainingSystemMessages));
  }

  return {
    systemPrompt,
    systemContextMessages,
    userContextMessages: [],
    transcriptMessages: cloneMessages(transcriptMessages),
  };
}

function getRuntimePromptContext(
  prompt: ProcessedMessage,
): RuntimePromptContext | undefined {
  const metadata = prompt.metadata ?? {};
  const runtimeContext = metadata[
    RUNTIME_CONTEXT_METADATA_KEY
  ] as RuntimePromptContext | undefined;

  if (!runtimeContext) {
    return undefined;
  }

  return {
    systemPrompt: runtimeContext.systemPrompt,
    systemContextMessages: cloneMessages(runtimeContext.systemContextMessages),
    userContextMessages: cloneMessages(runtimeContext.userContextMessages),
    transcriptMessages: cloneMessages(runtimeContext.transcriptMessages),
  };
}

function ensureRuntimePromptContext(
  prompt: ProcessedMessage,
): RuntimePromptContext {
  return getRuntimePromptContext(prompt) ?? inferRuntimeContext(prompt);
}

function withRuntimePromptContext(
  prompt: ProcessedMessage,
  runtimeContext: RuntimePromptContext,
): ProcessedMessage {
  return {
    ...prompt,
    message: {
      ...prompt.message,
      messages: flattenRuntimeMessages(runtimeContext),
    },
    metadata: {
      ...prompt.metadata,
      [RUNTIME_CONTEXT_METADATA_KEY]: {
        systemPrompt: runtimeContext.systemPrompt,
        systemContextMessages: cloneMessages(runtimeContext.systemContextMessages),
        userContextMessages: cloneMessages(runtimeContext.userContextMessages),
        transcriptMessages: cloneMessages(runtimeContext.transcriptMessages),
      } satisfies RuntimePromptContext,
    },
  };
}

export function syncProcessedMessageWithRuntimeContext(
  prompt: ProcessedMessage,
): ProcessedMessage {
  return withRuntimePromptContext(prompt, ensureRuntimePromptContext(prompt));
}

export function reconcileRuntimePromptContext(
  prompt: ProcessedMessage,
): ProcessedMessage {
  const runtimeContext = getRuntimePromptContext(prompt);
  if (!runtimeContext) {
    return syncProcessedMessageWithRuntimeContext(prompt);
  }

  const flattenedMessages = prompt.message.messages ?? [];
  const transcriptStartIndex =
    (runtimeContext.systemPrompt ? 1 : 0) +
    runtimeContext.systemContextMessages.length +
    runtimeContext.userContextMessages.length;
  const normalizedTranscriptStartIndex = Math.min(
    transcriptStartIndex,
    flattenedMessages.length,
  );

  return withRuntimePromptContext(prompt, {
    ...runtimeContext,
    transcriptMessages: cloneMessages(
      flattenedMessages.slice(normalizedTranscriptStartIndex),
    ),
  });
}

export function setSystemPrompt(
  prompt: ProcessedMessage,
  systemPrompt: string,
): ProcessedMessage {
  const runtimeContext = ensureRuntimePromptContext(prompt);

  return withRuntimePromptContext(prompt, {
    ...runtimeContext,
    systemPrompt,
  });
}

export function appendSystemContextMessage(
  prompt: ProcessedMessage,
  message: MessageObject,
): ProcessedMessage {
  const runtimeContext = ensureRuntimePromptContext(prompt);

  return withRuntimePromptContext(prompt, {
    ...runtimeContext,
    systemContextMessages: [
      ...runtimeContext.systemContextMessages,
      cloneMessage(message),
    ],
  });
}

export function appendUserContextMessage(
  prompt: ProcessedMessage,
  message: MessageObject,
): ProcessedMessage {
  const runtimeContext = ensureRuntimePromptContext(prompt);

  return withRuntimePromptContext(prompt, {
    ...runtimeContext,
    userContextMessages: [
      ...runtimeContext.userContextMessages,
      cloneMessage(message),
    ],
  });
}

export function appendTranscriptMessage(
  prompt: ProcessedMessage,
  message: MessageObject,
): ProcessedMessage {
  const runtimeContext = ensureRuntimePromptContext(prompt);

  return withRuntimePromptContext(prompt, {
    ...runtimeContext,
    transcriptMessages: [...runtimeContext.transcriptMessages, cloneMessage(message)],
  });
}

export function appendTranscriptMessages(
  prompt: ProcessedMessage,
  messages: MessageObject[],
): ProcessedMessage {
  const runtimeContext = ensureRuntimePromptContext(prompt);

  return withRuntimePromptContext(prompt, {
    ...runtimeContext,
    transcriptMessages: [
      ...runtimeContext.transcriptMessages,
      ...cloneMessages(messages),
    ],
  });
}

export function prependTranscriptMessages(
  prompt: ProcessedMessage,
  messages: MessageObject[],
): ProcessedMessage {
  const runtimeContext = ensureRuntimePromptContext(prompt);

  return withRuntimePromptContext(prompt, {
    ...runtimeContext,
    transcriptMessages: [
      ...cloneMessages(messages),
      ...runtimeContext.transcriptMessages,
    ],
  });
}

export function replaceTranscriptMessages(
  prompt: ProcessedMessage,
  messages: MessageObject[],
): ProcessedMessage {
  const runtimeContext = ensureRuntimePromptContext(prompt);

  return withRuntimePromptContext(prompt, {
    ...runtimeContext,
    transcriptMessages: cloneMessages(messages),
  });
}

export function getTranscriptMessages(prompt: ProcessedMessage): MessageObject[] {
  return cloneMessages(ensureRuntimePromptContext(prompt).transcriptMessages);
}

export function buildInferenceParams(
  prompt: ProcessedMessage,
): LLMInferenceParams {
  const runtimeContext = ensureRuntimePromptContext(prompt);

  return {
    ...prompt.message,
    messages: flattenRuntimeMessages(runtimeContext),
  };
}
