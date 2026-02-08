/**
 * Model Router — Selects the appropriate model based on task complexity.
 * Equivalent to Gemini CLI's ModelRouterService with composite strategy:
 *
 * 1. FallbackStrategy  — If current model unavailable, try next
 * 2. OverrideStrategy  — User-specified model takes priority
 * 3. ClassifierStrategy — LLM-based FLASH vs PRO classification
 * 4. DefaultStrategy   — Fall back to configured default
 *
 * In Codebolt, the LLM model is managed by the platform, so this service
 * provides advisory model selection that can be passed to the agent config.
 * The actual model used depends on what's configured in codeboltagent.yaml.
 */
import codebolt from '@codebolt/codeboltjs';

export type ModelTier = 'pro' | 'flash' | 'default';

export interface RoutingDecision {
  tier: ModelTier;
  reason: string;
}

/**
 * Classify a user message to determine if it needs a PRO (complex) or FLASH (simple) model.
 *
 * PRO criteria (from Gemini CLI):
 *   - 4+ steps required
 *   - Strategic planning needed
 *   - High ambiguity
 *   - Deep debugging
 *   - Architectural decisions
 *
 * FLASH criteria:
 *   - Specific, bounded task
 *   - 1-3 steps
 *   - Clear requirements
 *   - Simple lookup or small edit
 */
export async function classifyTaskComplexity(
  userMessage: string
): Promise<RoutingDecision> {
  try {
    const analysis = await codebolt.llm.inference({
      messages: [
        {
          role: 'system',
          content: [
            'Classify the following user request as either FLASH or PRO.',
            '',
            'PRO = Complex task requiring 4+ steps, strategic planning, high ambiguity,',
            'deep debugging, or architectural decisions.',
            '',
            'FLASH = Simple, specific, bounded task requiring 1-3 steps with clear requirements.',
            '',
            'Return ONLY the word "FLASH" or "PRO".',
          ].join('\n'),
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const classification = analysis.completion?.choices?.[0]?.message?.content?.trim()?.toUpperCase();

    if (classification === 'FLASH') {
      return { tier: 'flash', reason: 'Simple/bounded task (1-3 steps)' };
    }

    return { tier: 'pro', reason: 'Complex task requiring strategic planning' };
  } catch {
    return { tier: 'default', reason: 'Classification failed, using default model' };
  }
}

/**
 * Score-based complexity classification (Gemini's NumericalClassifierStrategy).
 * Returns a score 1-100:
 *   1-20:  Trivial (single operations)
 *   21-50: Standard (single-file edits)
 *   51-80: High complexity (multi-file, debugging)
 *   81-100: Extreme (architectural)
 */
export async function scoreTaskComplexity(
  userMessage: string
): Promise<number> {
  try {
    const analysis = await codebolt.llm.inference({
      messages: [
        {
          role: 'system',
          content: [
            'Score the complexity of this task on a scale of 1-100:',
            '  1-20: Trivial (single lookup, one-line change)',
            '  21-50: Standard (single-file edit, simple function)',
            '  51-80: High (multi-file changes, debugging, testing)',
            '  81-100: Extreme (architectural redesign, complex refactoring)',
            'Return ONLY the number.',
          ].join('\n'),
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const scoreStr = analysis.completion?.choices?.[0]?.message?.content?.trim() || '50';
    const score = parseInt(scoreStr, 10);
    return isNaN(score) ? 50 : Math.max(1, Math.min(100, score));
  } catch {
    return 50;
  }
}
