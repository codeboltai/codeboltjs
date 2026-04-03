import codebolt from '@codebolt/codeboltjs';
import {
  InitialPromptGenerator,
  ResponseExecutor,
  LoopDetectionService
} from '@codebolt/agent/unified'
import { CompressionCoordinator } from './CompressionCoordinator';
import { FlatUserMessage } from "@codebolt/types/sdk";
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

const eventQueue = codebolt.agentEventQueue;

let systemPrompt =`
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

/**
 * Process an external event (steering, agent queue, background completion)
 * and inject it into the prompt so the LLM sees it on the next iteration.
 */
function processExternalEvent(event: any, prompt: ProcessedMessage): void {
  console.log(`[act-updated][Event] Received external event:`, JSON.stringify(event, null, 2));

  if (!event) {
    console.warn(`[act-updated][Event] Skipping null/undefined event`);
    return;
  }
  if (!prompt?.message?.messages) {
    console.warn(`[act-updated][Event] Skipping event - prompt.message.messages is not available`);
    return;
  }

  const eventType = event.type || event.eventType;
  const eventData = event.data || event;
  console.log(`[act-updated][Event] eventType=${eventType}, eventData keys=${Object.keys(eventData || {}).join(',')}`);

  if (eventType === 'agentQueueEvent') {
    const payload = eventData?.payload || {};
    console.log(`[act-updated][Event] agentQueueEvent payload:`, JSON.stringify(payload, null, 2));

    // Handle steering events from the user
    if (payload.type === 'steering' || eventData?.eventType === 'steering') {
      const instruction = payload.instruction || payload.content || JSON.stringify(payload);
      console.log(`[act-updated][Steering] Injecting steering instruction into prompt: "${instruction.substring(0, 200)}"`);
      const steeringMessage = {
        role: "user" as const,
        content: `<steering_message>
<instruction>${instruction}</instruction>
<context>The user has sent a steering message while you are working. Review the instruction and adjust your current approach accordingly. Prioritize this instruction for your next actions.</context>
</steering_message>`
      };
      prompt.message.messages.push(steeringMessage);
      console.log(`[act-updated][Steering] Prompt now has ${prompt.message.messages.length} messages after injection`);
      return;
    }

    // Handle other agent queue events (inter-agent messages)
    const content = payload.content || JSON.stringify(payload);
    console.log(`[act-updated][Event] Injecting agent queue event from ${eventData.sourceAgentId || 'system'}`);
    prompt.message.messages.push({
      role: "user" as const,
      content: `<agent_event>
<source>${eventData.sourceAgentId || 'system'}</source>
<content>${content}</content>
</agent_event>`
    });
  } else if (eventType === 'backgroundAgentCompletion' || eventType === 'backgroundGroupedAgentCompletion') {
    console.log(`[act-updated][Event] Injecting background agent completion event`);
    prompt.message.messages.push({
      role: "assistant" as const,
      content: `Background agent completed:\n${JSON.stringify(eventData, null, 2)}`
    });
  } else {
    console.warn(`[act-updated][Event] Unknown event type: ${eventType}, skipping`);
  }
}

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
  console.log(`[act-updated] Agent started, received message: "${(reqMessage.userMessage || '').substring(0, 100)}"`);

  try {
    // Instantiate modifiers that need state persistence
    const ideContextModifier = new IdeContextModifier({
      includeActiveFile: true,
      includeOpenFiles: true,
      includeCursorPosition: true,
      includeSelectedText: true
    });

    const coreSystemPromptModifier = new CoreSystemPromptModifier({ customSystemPrompt: systemPrompt });

    const loopDetectionService = new LoopDetectionService({ debug: true });
    const compressionCoordinator = new CompressionCoordinator({
      proactiveThreshold: 0.7,
      postToolThreshold: 0.5,
      preserveThreshold: 0.3,
      reactiveRetryLimit: 1,
      compactStrategy: 'summarize',
      enableLogging: true,
    });

    let promptGenerator = new InitialPromptGenerator({

      processors: [
        // 1. Chat History
        new ChatHistoryMessageModifier({ enableChatHistory: true }),
        // 2. Environment Context (date, OS)
        new EnvironmentContextModifier({ enableFullContext: false }),
        // 3. Directory Context (folder structure)  
        new DirectoryContextModifier(),

        // 4. IDE Context (active file, opened files) - Shared instance
        ideContextModifier,
        // 5. Core System Prompt (instructions)
        new CoreSystemPromptModifier(
          { customSystemPrompt: systemPrompt }
        ),
        // 6. Tools (function declarations)
        new ToolInjectionModifier({
          includeToolDescriptions: true
        }),

        // 7. At-file processing (@file mentions)
        new AtFileProcessorModifier({
          enableRecursiveSearch: true
        })
      ],
      baseSystemPrompt: systemPrompt
    });

    let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
    // codebolt.chat.sendMessage(JSON.stringify(prompt.message), {})

    // return;
    let completed = false;
    let executionResult: any;
    const responseExecutor = new ResponseExecutor({
      preToolCallProcessors: [],
      postToolCallProcessors: [compressionCoordinator.getPostToolCallProcessor()],
      loopDetectionService: loopDetectionService
    });
    let loopIteration = 0;
    do {
      loopIteration++;
      console.log(`[act-updated][Loop] === Iteration ${loopIteration} ===`);

      // Check for pending steering/external events before each LLM call
      const pendingEvents = eventQueue.getPendingExternalEvents();
      console.log(`[act-updated][Loop] Pending external events: ${pendingEvents.length}`);
      for (const externalEvent of pendingEvents) {
        processExternalEvent(externalEvent, prompt);
      }

      console.log(`[act-updated][Loop] Starting AgentStep (LLM call)...`);
      let agent = new AgentStep({
        preInferenceProcessors: [
          compressionCoordinator.getPreInferenceProcessor(),
          coreSystemPromptModifier,
          ideContextModifier
        ],
        postInferenceProcessors: []
      })

      let result: AgentStepOutput;
      try {
        result = await agent.executeStep(reqMessage, prompt);
        compressionCoordinator.resetReactiveRetries();
      } catch (error) {
        const recovery = await compressionCoordinator.recoverFromContextError(
          reqMessage,
          prompt,
          error
        );

        if (!recovery.shouldRetry) {
          throw error;
        }

        console.warn(
          `[act-updated][Compression] ${recovery.reason}. Retrying with a compacted prompt.`,
        );
        prompt = recovery.recoveredMessage;
        result = await agent.executeStep(reqMessage, prompt);
      }
      console.log(`[act-updated][Loop] AgentStep completed`);
      prompt = result.nextMessage;

      console.log(`[act-updated][Loop] Executing response...`);
      executionResult = await responseExecutor.executeResponse({
        initialUserMessage: reqMessage,
        actualMessageSentToLLM: result.actualMessageSentToLLM,
        rawLLMOutput: result.rawLLMResponse,
        nextMessage: result.nextMessage,
      });

      completed = executionResult.completed;
      prompt = executionResult.nextMessage;
      console.log(`[act-updated][Loop] Iteration ${loopIteration} done, completed=${completed}`);

      if (completed) {
        break;
      }

    } while (!completed);

    console.log(`[act-updated] Agent finished after ${loopIteration} iterations`);
    return executionResult.finalMessage;

  } catch (error) {
    console.error(`[act-updated] Agent error:`, error);
  }


})
