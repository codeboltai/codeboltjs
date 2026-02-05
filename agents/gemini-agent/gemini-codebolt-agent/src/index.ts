/**
 * Gemini CLI Agent — Main Entry Point
 *
 * Replicates the full Gemini CLI agentic loop using Codebolt Agent SDK v2
 * Level 2 (Base Components) with Level 1 augmentation.
 *
 * Pipeline per user message:
 *   1. InitialPromptGenerator  — modifiers build the enriched prompt
 *   2. AgentStep               — pre-inference processors → LLM call → post-inference
 *   3. ResponseExecutor        — pre-tool → execute tools → post-tool
 *   4. NextSpeakerChecker      — should the model keep going or yield?
 *   5. Loop back to (2) until completed
 *
 * Custom Gemini-specific pieces:
 *   - GeminiSystemPromptModifier  (multi-section prompt)
 *   - MemoryModifier              (user + project memory)
 *   - PlanModeModifier            (read-only plan mode)
 *   - LoopDetectionProcessor      (3-method loop detection)
 *   - ErrorCheckProcessor         (critical / blocking error handling)
 *   - nextSpeakerChecker          (continuation logic)
 *   - modelRouter                 (complexity classification)
 */
import codebolt from '@codebolt/codeboltjs';
import {
  InitialPromptGenerator,
  AgentStep,
  ResponseExecutor,
} from '@codebolt/agent/unified';
import {
  ChatHistoryMessageModifier,
  EnvironmentContextModifier,
  DirectoryContextModifier,
  IdeContextModifier,
  ToolInjectionModifier,
  AtFileProcessorModifier,
  ChatCompressionModifier,
  ConversationCompactorModifier,
} from '@codebolt/agent/processor-pieces';
import type { FlatUserMessage } from '@codebolt/types/sdk';
import type { ProcessedMessage, AgentStepOutput } from '@codebolt/types/agent';

// Custom Gemini pieces
import { GeminiSystemPromptModifier } from './modifiers/GeminiSystemPromptModifier';
import { MemoryModifier } from './modifiers/MemoryModifier';
import { PlanModeModifier } from './modifiers/PlanModeModifier';
import { LoopDetectionProcessor } from './processors/LoopDetectionProcessor';
import { ErrorCheckProcessor } from './processors/ErrorCheckProcessor';
import { checkNextSpeaker } from './services/nextSpeakerChecker';
import { classifyTaskComplexity } from './services/modelRouter';

// Config
import {
  MAX_AGENT_TURNS,
  MAX_CONTINUATION_TURNS,
  DEFAULT_PROMPT_OPTIONS,
  LOOP_DETECTION_CONFIG,
  COMPRESSION_TOKEN_THRESHOLD,
  ALLOWED_TOOLS,
} from './config';
import type { GeminiPromptOptions } from './prompt/systemPrompt';

// ─── Stateful Instances (survive across messages within a session) ────
const loopDetector = new LoopDetectionProcessor(LOOP_DETECTION_CONFIG);
const planModeModifier = new PlanModeModifier(false);
let promptOptions: GeminiPromptOptions = { ...DEFAULT_PROMPT_OPTIONS };
const systemPromptModifier = new GeminiSystemPromptModifier(promptOptions);


/**
 * Extract the last assistant text content from a ProcessedMessage.
 */
function extractLastAssistantText(msg: ProcessedMessage): string {
  const messages = msg.message.messages;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === 'assistant' && typeof m.content === 'string') {
      return m.content;
    }
  }
  return '';
}

/**
 * Check if the last LLM response included tool calls.
 */
function lastResponseHadToolCalls(msg: ProcessedMessage): boolean {
  const messages = msg.message.messages;
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m.role === 'assistant') {
      return Array.isArray(m.tool_calls) && m.tool_calls.length > 0;
    }
  }
  return false;
}

// ─── Message Handler ──────────────────────────────────────────────────
codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
  try {
    // Reset loop detector on each new user message
    loopDetector.reset();

              
    // Detect environment on first message
    // const isGitRepo =true;
    // if (isGitRepo !== promptOptions.isGitRepo) {
    //   promptOptions = { ...promptOptions, isGitRepo };
    //   systemPromptModifier.updateOptions({ isGitRepo });
    // }

    // Advisory model routing (logged but the platform controls the actual model)
    // const routing = await classifyTaskComplexity(reqMessage.userMessage || '');
    // console.log(`[model-router] tier=${routing.tier} reason="${routing.reason}"`);

    // ── Stage 1: Build initial prompt ────────────────────────────────
    const promptGenerator = new InitialPromptGenerator({
      processors: [
        new ChatHistoryMessageModifier({ enableChatHistory: true }),
        new EnvironmentContextModifier({ enableFullContext: true }),
        new DirectoryContextModifier(),
        new IdeContextModifier({
          includeActiveFile: true,
          includeOpenFiles: true,
          includeCursorPosition: true,
          includeSelectedText: true,
        }),
        systemPromptModifier,
        new MemoryModifier(),
        planModeModifier,
        new ToolInjectionModifier({
          includeToolDescriptions: true,
        }),
        new AtFileProcessorModifier({ enableRecursiveSearch: true }),
      ],
      baseSystemPrompt: '', // Handled by GeminiSystemPromptModifier
    });

    let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
    let completed = false;

    // const response:any = await codebolt.chat.getChatHistory(reqMessage.threadId);
    // codebolt.chat.sendMessage(JSON.stringify(prompt.message.messages));

    let totalTurns = 0;
    let continuationTurns = 0;

    // ── Stage 2: Agentic loop ────────────────────────────────────────
    do {
      totalTurns++;

      // Safety valve: absolute max turns
      if (totalTurns > MAX_AGENT_TURNS) {
        codebolt.chat.sendMessage(
          `Reached maximum turn limit (${MAX_AGENT_TURNS}). Stopping to prevent infinite loop.`,
          {}
        );
        break;
      }

      // AgentStep: PreInference (loop detection, compression) → LLM → PostInference
      const agentStep = new AgentStep({
        preInferenceProcessors: [
          new ChatCompressionModifier({ enableCompression: true }),
          loopDetector,
        ],
        postInferenceProcessors: [],
      });

      const stepResult: AgentStepOutput = await agentStep.executeStep(reqMessage, prompt);
      prompt = stepResult.nextMessage;

      // ResponseExecutor: PreTool → Execute tools → PostTool
      const responseExecutor = new ResponseExecutor({
        preToolCallProcessors: [],
        postToolCallProcessors: [
          new ErrorCheckProcessor(),
          new ConversationCompactorModifier({
            compactStrategy: 'smart',
          }),
        ],
      });

      const execResult = await responseExecutor.executeResponse({
        initialUserMessage: reqMessage,
        actualMessageSentToLLM: stepResult.actualMessageSentToLLM,
        rawLLMOutput: stepResult.rawLLMResponse,
        nextMessage: stepResult.nextMessage,
      });

      completed = execResult.completed;
      prompt = execResult.nextMessage;

      // ── Next-Speaker Checker (Gemini CLI continuation logic) ──────
      if (completed) {
        const lastText = extractLastAssistantText(prompt);
        const hadTools = lastResponseHadToolCalls(prompt);
        const speaker = await checkNextSpeaker(lastText, hadTools);

        if (speaker === 'model') {
          continuationTurns++;
          if (continuationTurns <= MAX_CONTINUATION_TURNS) {
            completed = false; // Keep going
          }
        } else {
          continuationTurns = 0; // Reset on user turn
        }
      } else {
        continuationTurns = 0;
      }

    } while (!completed);

    console.log(`[gemini-agent] Completed in ${totalTurns} turn(s)`);

  } catch (error) {
    console.error('[gemini-agent] Fatal error:', error);
    codebolt.chat.sendMessage(
      `An unexpected error occurred: ${error instanceof Error ? error.message : String(error)}`,
      {}
    );
  }
});
