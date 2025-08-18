// Note: This module requires @codebolt/codeboltjs to be installed and configured
// For now using interfaces that match the expected format

/**
 * Interface for chat compression result
 */
export interface ChatCompressionInfo {
  originalTokenCount: number;
  newTokenCount: number;
  compressedHistory: ChatContent[];
}

/**
 * Message interface compatible with codebolt format
 */
export interface Message {
  role: 'user' | 'assistant' | 'tool' | 'system';
  content: any[] | string;
  tool_call_id?: string;
  tool_calls?: any[];
  [key: string]: any;
}

/**
 * Interface for chat message with parts structure (similar to Gemini's Content interface)
 */
export interface ChatContent {
  role: 'user' | 'model' | 'assistant';
  parts?: Array<{
    text?: string;
    functionCall?: any;
    functionResponse?: any;
  }>;
  content?: string; // fallback for simple string content
}

/**
 * Default token limits for different models
 */
const DEFAULT_TOKEN_LIMIT = 1_048_576;

/**
 * Gets token limit for a given model
 */
function getTokenLimit(model: string = 'default'): number {
  // Add other models as they become relevant
  switch (model) {
    case 'gemini-1.5-pro':
      return 2_097_152;
    case 'gemini-1.5-flash':
    case 'gemini-2.5-pro':
    case 'gemini-2.5-flash':
    case 'gemini-2.0-flash':
      return 1_048_576;
    default:
      return DEFAULT_TOKEN_LIMIT;
  }
}

/**
 * Checks if a chat content is a function response
 */
function isFunctionResponse(content: ChatContent): boolean {
  return (
    content.role === 'user' &&
    !!content.parts &&
    content.parts.every((part) => !!part.functionResponse)
  );
}

/**
 * Finds the index after a fraction of total characters in the history
 */
function findIndexAfterFraction(
  history: ChatContent[],
  fraction: number,
): number {
  if (fraction <= 0 || fraction >= 1) {
    throw new Error('Fraction must be between 0 and 1');
  }

  const contentLengths = history.map(
    (content) => JSON.stringify(content).length,
  );

  const totalCharacters = contentLengths.reduce(
    (sum, length) => sum + length,
    0,
  );
  const targetCharacters = totalCharacters * fraction;

  let charactersSoFar = 0;
  for (let i = 0; i < contentLengths.length; i++) {
    charactersSoFar += contentLengths[i];
    if (charactersSoFar >= targetCharacters) {
      return i;
    }
  }
  return contentLengths.length;
}

/**
 * Converts ChatContent to codebolt Message format
 */
function convertToCodeboltMessage(content: ChatContent): Message {
  const role = content.role === 'model' ? 'assistant' : content.role;
  let messageContent = '';
  
  if (content.content) {
    messageContent = content.content;
  } else if (content.parts) {
    messageContent = content.parts
      .filter(part => part.text)
      .map(part => part.text)
      .join('');
  }
  
  return {
    role: role as 'user' | 'assistant',
    content: messageContent
  };
}

/**
 * Gets a compression prompt for summarizing chat history
 */
function getCompressionPrompt(): string {
  return `
You are the component that summarizes internal chat history into a given structure.

When the conversation history grows too large, you will be invoked to distill the entire history into a concise, structured XML snapshot. This snapshot is CRITICAL, as it will become the agent's *only* memory of the past. The agent will resume its work based solely on this snapshot. All crucial details, plans, errors, and user directives MUST be preserved.

First, you will think through the entire history in a private <scratchpad>. Review the user's overall goal, the agent's actions, tool outputs, file modifications, and any unresolved questions. Identify every piece of information that is essential for future actions.

After your reasoning is complete, generate the final <state_snapshot> XML object. Be incredibly dense with information. Omit any irrelevant conversational filler.

The structure MUST be as follows:

<state_snapshot>
    <overall_goal>
        <!-- A single, concise sentence describing the user's high-level objective. -->
    </overall_goal>

    <key_knowledge>
        <!-- Crucial facts, conventions, and constraints the agent must remember based on the conversation history and interaction with the user. Use bullet points. -->
    </key_knowledge>

    <file_system_state>
        <!-- List files that have been created, read, modified, or deleted. Note their status and critical learnings. -->
    </file_system_state>

    <recent_actions>
        <!-- A summary of the last few significant agent actions and their outcomes. Focus on facts. -->
    </recent_actions>

    <current_context>
        <!-- What is the agent currently working on or what should be the immediate next step? -->
    </current_context>

    <unresolved_issues>
        <!-- Any open questions, errors, or blocking issues that need attention. -->
    </unresolved_issues>
</state_snapshot>

First, reason in your scratchpad. Then, generate the <state_snapshot>.
`;
}

/**
 * LLM Function type for making inference calls
 */
export type LLMFunction = (params: {
  messages: Message[];
  max_tokens?: number;
  temperature?: number;
  [key: string]: any;
}) => Promise<{
  completion?: any;
  content?: string;
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}>;

/**
 * Compresses chat history when it becomes too large
 * 
 * @param chatHistory - Array of chat messages to compress
 * @param llmFunction - Function to call LLM for generating compression summary
 * @param options - Compression options
 * @returns Promise<ChatCompressionInfo | null> - Compression result or null if no compression needed
 */
export async function compressChatHistory(
  chatHistory: ChatContent[],
  llmFunction: LLMFunction,
  options: {
    model?: string;
    force?: boolean;
    contextPercentageThreshold?: number;
    preserveThreshold?: number;
  } = {}
): Promise<ChatCompressionInfo | null> {
  const {
    model = 'default',
    force = false,
    contextPercentageThreshold = 0.7,
    preserveThreshold = 0.3
  } = options;

  // Return null if history is empty
  if (chatHistory.length === 0) {
    return null;
  }

  // Estimate token count (simplified - count characters and divide by average chars per token)
  const estimateTokenCount = (content: ChatContent[]): number => {
    const totalChars = content.reduce((sum, item) => {
      return sum + JSON.stringify(item).length;
    }, 0);
    // Rough estimation: ~4 characters per token
    return Math.ceil(totalChars / 4);
  };

  const originalTokenCount = estimateTokenCount(chatHistory);
  
  // Don't compress if not forced and we are under the limit
  if (!force) {
    const threshold = contextPercentageThreshold;
    if (originalTokenCount < threshold * getTokenLimit(model)) {
      return null;
    }
  }

  // Find the compression point
  let compressBeforeIndex = findIndexAfterFraction(
    chatHistory,
    1 - preserveThreshold,
  );
  
  // Find the first user message after the index. This is the start of the next turn.
  while (
    compressBeforeIndex < chatHistory.length &&
    (chatHistory[compressBeforeIndex]?.role === 'model' ||
      isFunctionResponse(chatHistory[compressBeforeIndex]))
  ) {
    compressBeforeIndex++;
  }

  const historyToCompress = chatHistory.slice(0, compressBeforeIndex);
  const historyToKeep = chatHistory.slice(compressBeforeIndex);

  // Convert to codebolt message format for LLM call
  const messagesToCompress = historyToCompress.map(convertToCodeboltMessage);
  
  // Create a message with the conversation history for compression
  const compressionMessages: Message[] = [
    {
      role: 'user',
      content: `Please compress this conversation history:\n\n${JSON.stringify(messagesToCompress, null, 2)}\n\nFirst, reason in your scratchpad. Then, generate the <state_snapshot>.`
    }
  ];

  try {
    // Use the provided LLM function to generate the summary
    const response = await llmFunction({
      messages: [
        {
          role: 'user',
          content: getCompressionPrompt()
        },
        ...compressionMessages
      ],
      max_tokens: 2000,
      temperature: 0.3
    });

    // Extract the summary from the response
    const summary = response.completion?.choices?.[0]?.message?.content || 
                   response.completion?.content || 
                   response.choices?.[0]?.message?.content ||
                   'Unable to generate compression summary';

    // Create compressed history with summary + kept messages
    const compressedHistory: ChatContent[] = [
      {
        role: 'user',
        content: summary
      },
      {
        role: 'model', 
        content: 'Got it. Thanks for the additional context!'
      },
      ...historyToKeep
    ];

    const newTokenCount = estimateTokenCount(compressedHistory);

    return {
      originalTokenCount,
      newTokenCount,
      compressedHistory
    };

  } catch (error) {
    console.error('Error during chat compression:', error);
    return null;
  }
}

/**
 * Simple utility to check if compression is needed based on token count
 */
export function shouldCompressChat(
  chatHistory: ChatContent[],
  model: string = 'default',
  threshold: number = 0.7
): boolean {
  if (chatHistory.length === 0) return false;
  
  const totalChars = chatHistory.reduce((sum, item) => {
    return sum + JSON.stringify(item).length;
  }, 0);
  const estimatedTokens = Math.ceil(totalChars / 4);
  
  return estimatedTokens > threshold * getTokenLimit(model);
}

export default {
  compressChatHistory,
  shouldCompressChat
};
