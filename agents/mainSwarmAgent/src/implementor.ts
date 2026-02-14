import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from '@codebolt/types/sdk';
import { AgentContext, JobOutput } from './jobfinder/types';
import { submitMergeRequest } from './mergeRequest';

import {
  InitialPromptGenerator,
  ResponseExecutor
} from '@codebolt/agent/unified';

import {
  EnvironmentContextModifier,
  CoreSystemPromptModifier,
  DirectoryContextModifier,
  IdeContextModifier,
  AtFileProcessorModifier,
  ToolInjectionModifier,
  ChatHistoryMessageModifier
} from '@codebolt/agent/processor-pieces';

import { AgentStep } from '@codebolt/agent/unified';
import { AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';

// ================================
// SWARM IMPLEMENTOR SYSTEM PROMPT
// ================================

function buildSystemPrompt(job: JobOutput, ctx: AgentContext): string {
  return `You are a swarm worker agent (${ctx.agentName}) operating as part of a coordinated swarm team.

## Your Identity
- **Agent ID**: ${ctx.agentId}
- **Agent Name**: ${ctx.agentName}
- **Swarm ID**: ${ctx.swarmId}
- **Role**: Implementation agent in a multi-agent swarm

## Your Assigned Job
- **Job ID**: ${job.id}
- **Job Name**: ${job.name}
- **Job Description**: ${job.description || 'No description provided'}

## Critical Rules

1. **Focus ONLY on your assigned job**. Do not work on anything outside the scope of "${job.name}". Your job is one piece of a larger project being handled by multiple agents in parallel.

2. **You are part of a swarm**. Other agents are working on other jobs simultaneously. Do NOT modify files or code that is clearly outside your job's scope, as another agent may be working on those.

3. **Be surgical and precise**. Make only the changes necessary to complete your specific job. Avoid refactoring unrelated code, adding unrelated features, or making sweeping changes.

4. **Read before you write**. Always read existing files and understand the codebase structure before making changes. Check for existing patterns, conventions, and styles.

5. **Complete the job fully**. Implement everything described in the job description. When done, use the attempt_completion tool to signal that your work is finished.

## Workflow

1. **Understand**: Read the job description carefully. Identify what needs to be built or changed.
2. **Explore**: Search the codebase to understand existing structure, patterns, and relevant files.
3. **Plan**: Determine the minimal set of changes needed.
4. **Implement**: Make the changes, following existing code conventions.
5. **Verify**: Read back modified files to confirm correctness.
6. **Complete**: Use attempt_completion to signal you are done, with a brief summary of what was implemented.

## Communication Style
- Use concise status updates
- Reference file paths with backticks
- Don't over-explain; focus on actions and results`;
}

// ================================
// JOB EXECUTION (AGENT LOOP)
// ================================

/**
 * Execute a job using the full agent loop (LLM inference + tool calling).
 * After the agent loop completes, submits a merge request for review.
 *
 * Flow:
 *   1. Build initial prompt with context (environment, directory, tools, etc.)
 *   2. Loop: LLM inference -> tool execution -> repeat until completion
 *   3. Submit merge request for review (via mergeRequest.ts)
 */
export async function executeJob(
  reqMessage: FlatUserMessage,
  job: JobOutput,
  ctx: AgentContext
): Promise<void> {
  const systemPrompt = buildSystemPrompt(job, ctx);

  codebolt.chat.sendMessage(`📝 Starting implementation loop for: ${job.name}`);

  // Build the initial prompt with all context processors
  const promptGenerator = new InitialPromptGenerator({
    processors: [
      new ChatHistoryMessageModifier({ enableChatHistory: true }),
      new EnvironmentContextModifier({ enableFullContext: true }),
      new DirectoryContextModifier(),
      new IdeContextModifier({
        includeActiveFile: true,
        includeOpenFiles: true,
        includeCursorPosition: true,
        includeSelectedText: true
      }),
      new CoreSystemPromptModifier({ customSystemPrompt: systemPrompt }),
      new ToolInjectionModifier({ includeToolDescriptions: true }),
      new AtFileProcessorModifier({ enableRecursiveSearch: true })
    ],
    baseSystemPrompt: systemPrompt
  });

  let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);

  // Agent loop: inference -> tool execution -> repeat
  let completed = false;

  do {
    // Step 1: LLM Inference
    const agent = new AgentStep({
      preInferenceProcessors: [],
      postInferenceProcessors: []
    });

    const result: AgentStepOutput = await agent.executeStep(reqMessage, prompt);
    prompt = result.nextMessage;

    // Step 2: Tool Execution
    const responseExecutor = new ResponseExecutor({
      preToolCallProcessors: [],
      postToolCallProcessors: []
    });

    const executionResult = await responseExecutor.executeResponse({
      initialUserMessage: reqMessage,
      actualMessageSentToLLM: result.actualMessageSentToLLM,
      rawLLMOutput: result.rawLLMResponse,
      nextMessage: result.nextMessage,
    });

    completed = executionResult.completed;
    prompt = executionResult.nextMessage;

  } while (!completed);

  codebolt.chat.sendMessage(`🏁 Implementation loop finished for: ${job.name}`);

  // Submit merge request for review
  const mrResult = await submitMergeRequest(job, ctx);

  if (!mrResult.success) {
    codebolt.chat.sendMessage(`⚠️ Merge request submission failed: ${mrResult.error}`);
  }
}
