/**
 * Agent Optimizer — A meta-agent that optimizes other Codebolt agents.
 *
 * This agent is invoked from the eval optimization loop. It receives the target
 * agent's code path and eval context in the user message, reads the agent's
 * source files, reasons about improvements, applies changes via file tools,
 * and returns a structured JSON summary.
 */

import codebolt from '@codebolt/codeboltjs';
import {
    InitialPromptGenerator,
    ResponseExecutor,
    AgentStep
} from '@codebolt/agent/unified';
import { FlatUserMessage } from "@codebolt/types/sdk";
import {
    CoreSystemPromptModifier,
    ToolInjectionModifier,
    ChatHistoryMessageModifier
} from '@codebolt/agent/processor-pieces';
import { AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';

// ─── System Prompt ──────────────────────────────────────────────────────────

const AGENT_OPTIMIZER_SYSTEM_PROMPT = `
You are the Agent Optimizer, a specialized meta-agent that improves other Codebolt agents by modifying their source code based on evaluation results.

# Your Role
You receive a structured optimization request containing:
1. **Agent Code Path** — absolute filesystem path to the target agent's source directory
2. **Optimization Targets** — what to optimize: instructions, prompts, tools, config, or code
3. **Current Score** — the agent's current eval score (0-100)
4. **Iteration History** — previous optimization attempts with scores and outcomes
5. **Eval Task Details** — what the agent is being evaluated on
6. **Agent Source Files** — the current contents of key agent files

# How to Optimize

## Step 1: Analyze
- Read the agent's source files at the provided code path using file read tools
- Understand the agent's current system prompt, modifiers, tool configuration, and logic
- Review the eval task requirements and scoring criteria
- Study the iteration history to avoid repeating failed approaches

## Step 2: Identify Improvements
Based on the optimization targets, identify ONE specific, targeted improvement:

**For "instructions" / "prompts":**
- Improve the system prompt clarity, specificity, or task alignment
- Add missing context or constraints
- Remove ambiguous or counterproductive instructions
- Better align the prompt with what the evaluator expects

**For "tools":**
- Add or remove tool modifiers
- Adjust tool configurations (e.g., allowed tools list)
- Improve tool injection settings

**For "config":**
- Modify codeboltagent.yaml settings (LLM model order, metadata)
- Adjust processor configurations

**For "code":**
- Modify the agent loop logic
- Add/remove/reorder message modifiers
- Improve error handling or response processing
- Adjust pre/post inference processors

## Step 3: Apply Changes
- Use file edit/write tools to make the changes to the agent's source files
- Make MINIMAL, TARGETED changes — one improvement per iteration
- Preserve the agent's overall structure and working functionality
- ALWAYS use absolute paths based on the provided agent code path

## Step 4: Report
After making changes, output a JSON summary in this exact format:

\`\`\`json
{
  "target": "<optimization_target>",
  "description": "<what was changed and why>",
  "diff": "<brief description of the diff>",
  "reasoning": "<detailed reasoning for why this change should improve the score>",
  "files_modified": ["<list of modified file paths>"]
}
\`\`\`

# Rules
- Make exactly ONE change per optimization iteration — do not batch multiple changes
- Always read files before modifying them
- Never break the agent's ability to run (keep imports, exports, and structure intact)
- Use absolute paths for all file operations
- If the iteration history shows a pattern of failed approaches, try a fundamentally different strategy
- Focus on changes most likely to improve the eval score
- Do NOT modify files outside the target agent's directory
- If you cannot identify a meaningful improvement, explain why in the reasoning field and set description to "No modification — diminishing returns"
`.trim();

// ─── Main Agent Entry Point ─────────────────────────────────────────────────

codebolt.onMessage(async (reqMessage: FlatUserMessage): Promise<void> => {
    try {
        const promptGenerator = new InitialPromptGenerator({
            processors: [
                // 1. Chat History
                new ChatHistoryMessageModifier({ enableChatHistory: true }),

                // 2. Core System Prompt — optimizer instructions
                // NOTE: No EnvironmentContextModifier or DirectoryContextModifier here.
                // Those inject the active *project* context, but this agent operates
                // on a *target agent's* code path (provided in the user message by
                // agentOptimizerExecutor). The agent source files and eval context
                // are already embedded in the prompt.
                new CoreSystemPromptModifier({
                    customSystemPrompt: AGENT_OPTIMIZER_SYSTEM_PROMPT
                }),

                // 3. Tools — needs file read/write/edit + bash for rebuilds
                new ToolInjectionModifier({
                    includeToolDescriptions: true
                }),
            ],
            baseSystemPrompt: AGENT_OPTIMIZER_SYSTEM_PROMPT
        });

        // Process the initial message (contains optimization context from executor)
        let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);

        // Agent loop — continue until the optimizer finishes its work
        let completed = false;
        do {
            const agentStep = new AgentStep({
                preInferenceProcessors: [],
                postInferenceProcessors: []
            });

            const result: AgentStepOutput = await agentStep.executeStep(reqMessage, prompt);
            prompt = result.nextMessage;

            const responseExecutor = new ResponseExecutor({
                preToolCallProcessors: [],
                postToolCallProcessors: []
            });

            const executionResult = await responseExecutor.executeResponse({
                initialUserMessage: reqMessage,
                actualMessageSentToLLM: result.actualMessageSentToLLM,
                rawLLMOutput: result.rawLLMResponse,
                nextMessage: result.nextMessage
            });

            completed = executionResult.completed;
            prompt = executionResult.nextMessage;

            if (completed) {
                break;
            }
        } while (!completed);

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        codebolt.chat.sendMessage(`Agent Optimizer Error: ${errorMessage}`);
    }
});
