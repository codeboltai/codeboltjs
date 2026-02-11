import codebolt from '@codebolt/codeboltjs';
import { InitialPromptGenerator } from '@codebolt/agent/unified';
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
import { ProcessedMessage } from '@codebolt/types/agent';

import {
    PLANNER_SYSTEM_PROMPT
} from './prompts';
import { runWhileLoop } from './agentLoop';
import { processExternalEvent } from './eventHandlers';
import { processJobsByGroup } from './jobProcessor';

// Use agentEventQueue for centralized event handling
const eventQueue = codebolt.agentEventQueue;
// Use backgroundChildThreads for tracking running agent count
const agentTracker = codebolt.backgroundChildThreads;

codebolt.onMessage(async (reqMessage: FlatUserMessage, additionalVariable: any) => {

    //STEP 1: Create planning 
    let sessionSystemPrompt = PLANNER_SYSTEM_PROMPT + `
    <important>
    When starting child worker agents using the \`thread_create_background\` tool, you MUST use:
    - agentId: "b29a9229-a76c-4d8c-acfc-e00a4511fb8c"
    </important>`;
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
            new CoreSystemPromptModifier({ customSystemPrompt: sessionSystemPrompt }),
            new ToolInjectionModifier({ includeToolDescriptions: true }),
            new AtFileProcessorModifier({ enableRecursiveSearch: true })
        ],
        baseSystemPrompt: sessionSystemPrompt
    });

    let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);
    let executionResult: any;
    let continueLoop = false;

    do {
        continueLoop = false;

        // Run the agent loop until completion or need to wait for events
        const result = await runWhileLoop(reqMessage, prompt);

        if (result instanceof Error) {
            codebolt.chat.sendMessage(`Error in agent loop: ${result.message}`);
            break;
        }

        executionResult = result.executionResult;
        prompt = result.prompt;

        // Check for async events from child agents
        const runningCount = agentTracker.getRunningAgentCount();
        const pendingEventCount = eventQueue.getPendingExternalEventCount();

        if (runningCount > 0 || pendingEventCount > 0) {
            continueLoop = true;

            // Get all pending events
            const events = await eventQueue.getPendingQueueEvents();

            // Process each event
            for (const event of events) {
                processExternalEvent(event, prompt);
            }
        }

    } while (continueLoop);

    codebolt.chat.sendMessage(executionResult.finalMessage)
    // Planner agent returns after requirement is approved by user.
    // It does NOT process the requirement - that is handled separately.

    try {
        const { result } = executionResult?.finalMessage ? JSON.parse(executionResult.finalMessage) : {};
        const requirementPlanPath = result.requirementPlanPath;

        if (requirementPlanPath) {
            codebolt.chat.sendMessage(`Creating jobs from requirement plan: ${requirementPlanPath}`, {});

            //STEP 2: Create jobs from action plan (still using action block)
            const createJobsResponse = await codebolt.actionBlock.start('create-jobs-from-action-plan', {
                requirementPlanId: requirementPlanPath,
                workerAgentId: "b29a9229-a76c-4d8c-acfc-e00a4511fb8c"
            });

            if (createJobsResponse.success && createJobsResponse.result) {
                const createJobsResult = createJobsResponse.result;

                if (createJobsResult.success && createJobsResult.jobGroupId) {
                    const jobGroupId = createJobsResult.jobGroupId;
                    codebolt.chat.sendMessage(`Jobs created successfully. Group ID: ${jobGroupId}`, {});

                    //STEP 3: Process jobs by group (inlined, no longer an action block)
                    const jobResult = await processJobsByGroup(
                        jobGroupId,
                        "b29a9229-a76c-4d8c-acfc-e00a4511fb8c"
                    );

                    if (jobResult.success) {
                        codebolt.chat.sendMessage(`All jobs processed successfully!`, {});
                    } else {
                        codebolt.chat.sendMessage(`Job processing finished with errors: ${jobResult.error}`, {});
                    }

                } else {
                    codebolt.chat.sendMessage(`Failed to create jobs: ${createJobsResult.error || 'Unknown error'}`, {});
                }
            } else {
                codebolt.chat.sendMessage(`Failed to start job creation: ${createJobsResponse.error || 'Unknown error'}`, {});
            }
        }
    } catch (error) {
        console.error('Error processing post-planning actions:', error);
        codebolt.chat.sendMessage(`Error in post-planning actions: ${error}`, {});
    }

    return true;
});

