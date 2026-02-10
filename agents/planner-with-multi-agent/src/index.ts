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


const eventQueue = codebolt.agentEventQueue;
const agentTracker = codebolt.backgroundChildThreads;

codebolt.onMessage(async (reqMessage: FlatUserMessage, additionalVariable: any) => {

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

    // Run the initial agent loop
    const result = await runWhileLoop(reqMessage, prompt);

    if (result instanceof Error) {
        codebolt.chat.sendMessage(`Error in agent loop: ${result.message}`);
        return "Error occurred";
    }

    executionResult = result.executionResult;
    prompt = result.prompt;

    // If background agents were started, wait for all of them to finish
    // Using waitForAnyExternalEvent() to block instead of polling in a while loop
    while (agentTracker.getRunningAgentCount() > 0 || eventQueue.getPendingExternalEventCount() > 0) {
        // Block and wait for an external event (no busy polling)
        const event = await eventQueue.waitForAnyExternalEvent();
        codebolt.chat.sendMessage(`Event received: ${event.type}`);
        if (event.type === 'agentQueueEvent' || event.type === 'backgroundGroupedAgentCompletion') {
            // Process the received event
            processExternalEvent(event, prompt);

            // Run the agent loop again to process the event result
            const loopResult = await runWhileLoop(reqMessage, prompt);

            if (loopResult instanceof Error) {
                codebolt.chat.sendMessage(`Error processing event: ${loopResult.message}`);
                continue;
            }

            executionResult = loopResult.executionResult;
            prompt = loopResult.prompt;
        }
    }

    // After all loops complete, invoke the create-jobs-from-action-plan action block
    codebolt.chat.sendMessage('🚀 Planning complete! Creating jobs from requirement plan...');

    // try {
    //     // Find the requirement plan ID from the last messages or context
    //     // For testing, we'll need to extract this from the conversation history
    //     // This is a placeholder - in production, this would extract the actual requirement plan ID
    //     const requirementPlanId = '/Users/ravirawat/Documents/cbtest/orchestrator-team-test/plans/nodejs-express-app-implementation.plan'; // TODO: Extract from context
    //     const workerAgentId = 'b29a9229-a76c-4d8c-acfc-e00a4511fb8c'; // Worker agent ID

    //     const jobCreationResult = await codebolt.actionBlock.start('create-jobs-from-action-plan', {
    //         requirementPlanId: requirementPlanId,
    //         workerAgentId: workerAgentId
    //     });

    //     if (jobCreationResult.success && jobCreationResult.result) {
    //         const { groupId, jobsCreated, totalJobs } = jobCreationResult.result;
    //         codebolt.chat.sendMessage(`✅ Successfully created ${totalJobs} jobs in group ${groupId}!`);
    //         codebolt.chat.sendMessage(`Job IDs: ${jobsCreated?.join(', ')}`);

    //         // Now process the created jobs using the process-jobs-by-group ActionBlock
    //         if (groupId && totalJobs > 0) {
    //             codebolt.chat.sendMessage('🚀 Starting job processing with worker agents...');

    //             const jobProcessingResult = await codebolt.actionBlock.start('process-jobs-by-group', {
    //                 jobGroupId: groupId,
    //                 workerAgentId: workerAgentId
    //             });

    //             if (jobProcessingResult.success && jobProcessingResult.result) {
    //                 const { processedJobs, failedJobs, totalProcessed } = jobProcessingResult.result;
    //                 codebolt.chat.sendMessage(`🎉 Job processing complete! Processed: ${totalProcessed}, Failed: ${failedJobs?.length || 0}`);
    //                 if (failedJobs && failedJobs.length > 0) {
    //                     codebolt.chat.sendMessage(`⚠️ Failed jobs: ${failedJobs.join(', ')}`);
    //                 }
    //             } else {
    //                 codebolt.chat.sendMessage(`⚠️ Job processing completed with issues: ${jobProcessingResult.error || 'Unknown error'}`);
    //             }
    //         }
    //     } else {
    //         codebolt.chat.sendMessage(`⚠️ Job creation completed with issues: ${jobCreationResult.error || 'Unknown error'}`);
    //     }
    // } catch (error) {
    //     const errorMsg = error instanceof Error ? error.message : 'Unknown error';
    //     codebolt.chat.sendMessage(`❌ Failed to create/process jobs: ${errorMsg}`);
    // }

    return executionResult?.finalMessage || "No response generated";
});
