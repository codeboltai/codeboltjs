/**
 * Next Speaker Checker — Determines if the model should continue speaking
 * or yield control back to the user.
 *
 * Equivalent to Gemini CLI's nextSpeakerChecker.ts:
 *   - Fast-path returns for obvious cases (empty response, questions)
 *   - LLM-based analysis for ambiguous cases
 *
 * Called after each turn where the model returns without tool calls
 * (i.e., the ResponseExecutor marks completed=true).
 */
import codebolt from '@codebolt/codeboltjs';

export type NextSpeaker = 'user' | 'model';

/**
 * Determine whether the model should continue speaking or the user should take over.
 * @param lastModelResponse - The text content from the model's last response
 * @param hasToolCalls - Whether the last response included tool calls
 * @returns 'model' if the model should continue, 'user' if it should yield
 */
export async function checkNextSpeaker(
  lastModelResponse: string,
  hasToolCalls: boolean
): Promise<NextSpeaker> {
  // Fast-path: if there were tool calls, the loop handles continuation automatically
  if (hasToolCalls) return 'model';

  // Fast-path: empty or whitespace-only response → model should try again
  if (!lastModelResponse || lastModelResponse.trim() === '') {
    return 'model';
  }

  const trimmed = lastModelResponse.trim();

  // Fast-path: response ends with a direct question → user's turn
  if (trimmed.endsWith('?')) {
    return 'user';
  }

  // Fast-path: very short response (< 20 chars) that looks like acknowledgment → user
  if (trimmed.length < 20) {
    return 'user';
  }

  // Fast-path: response contains explicit completion markers
  const completionMarkers = [
    'let me know if',
    'feel free to',
    'anything else',
    'is there anything',
    'what would you like',
    'ready for your next',
  ];
  const lower = trimmed.toLowerCase();
  for (const marker of completionMarkers) {
    if (lower.includes(marker)) {
      return 'user';
    }
  }

  // Fast-path: response contains continuation markers
  const continuationMarkers = [
    'i will now',
    'next, i',
    'let me also',
    'additionally,',
    'i also need to',
    'now i need to',
    'continuing with',
  ];
  for (const marker of continuationMarkers) {
    if (lower.includes(marker)) {
      return 'model';
    }
  }

  // For ambiguous cases, use a lightweight LLM check
  try {
    const analysis = await codebolt.llm.inference({
      messages: [
        {
          role: 'system',
          content: [
            'Determine if the AI assistant should continue working or wait for the user.',
            'Rules:',
            '1. Return "model" if the assistant has stated an immediate next action or its message appears incomplete.',
            '2. Return "user" if the assistant ended with a direct question.',
            '3. Return "user" if the assistant has completed its current task without stating a next step.',
            'Return ONLY the word "user" or "model".',
          ].join('\n'),
        },
        {
          role: 'user',
          content: `Last assistant message (truncated):\n${trimmed.slice(-1500)}`,
        },
      ],
    });

    const decision = analysis.completion?.choices?.[0]?.message?.content?.trim()?.toLowerCase();
    return decision === 'model' ? 'model' : 'user';
  } catch {
    // On error, default to yielding to user
    return 'user';
  }
}
