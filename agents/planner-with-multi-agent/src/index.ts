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
    PLANNER_SYSTEM_PROMPT,
    JOB_EXECUTOR_SYSTEM_PROMPT,
    buildJobExecutionContext
} from './prompts';
import { runWhileLoop } from './agentLoop';
import { processExternalEvent } from './eventHandlers';
import { fetchJobsForGroup } from './jobProcessor';
import { runSpecGenerator } from './specProcessor';

// Use agentEventQueue for centralized event handling
const eventQueue = codebolt.agentEventQueue;
// Use backgroundChildThreads for tracking running agent count
const agentTracker = codebolt.backgroundChildThreads;

const WORKER_AGENT_ID = "b29a9229-a76c-4d8c-acfc-e00a4511fb8c";

codebolt.onMessage(async (reqMessage: FlatUserMessage, additionalVariable: any) => {

    //STEP 1: Analysis and planning only — no ActionBlock calls
    let sessionSystemPrompt = PLANNER_SYSTEM_PROMPT + `
    <important>
    When starting child worker agents using the \`thread_create_background\` tool, you MUST use:
    - agentId: "${WORKER_AGENT_ID}"
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

            // If agents are running but no events yet, wait for the next event
            if (pendingEventCount === 0 && runningCount > 0) {
                const nextEvent = await eventQueue.waitForAnyExternalEvent();
                processExternalEvent(nextEvent, prompt);
            }

            // Drain any remaining pending events
            const remainingEvents = eventQueue.getPendingExternalEvents();
            for (const event of remainingEvents) {
                processExternalEvent(event, prompt);
            }
        }

    } while (continueLoop);

    // codebolt.chat.sendMessage(executionResult.finalMessage)

    try {
        let { result } = executionResult?.finalMessage ? JSON.parse(executionResult.finalMessage) : {};
        // codebolt.chat.sendMessage(`${JSON.stringify(result)}`);

        let detailPlan = result?.detailPlan;


        if (!detailPlan) {
            detailPlan = result;
            // codebolt.chat.sendMessage(`Planner did not return a detailPlan. Cannot proceed.`);
            // return true;
        }

        //STEP 2: Run spec generation directly (copied from create-detail-action-plan action-block)
        codebolt.chat.sendMessage(`Creating detailed specification from plan...`, {});

        const specResult = await runSpecGenerator(reqMessage, detailPlan);

        if (!specResult.success || !specResult.requirementPlanPath) {
            codebolt.chat.sendMessage(`Failed to create specification: ${specResult.error || 'Unknown error'}`, {});
            return true;
        }

        const requirementPlanPath = specResult.requirementPlanPath;
        codebolt.chat.sendMessage(`Specification created. Requirement plan: ${requirementPlanPath}`, {});

        //STEP 3: Create jobs from action plan (still using action block)
        codebolt.chat.sendMessage(`Creating jobs from requirement plan: ${requirementPlanPath}`, {});

        const createJobsResponse = await codebolt.actionBlock.start('create-jobs-from-action-plan', {
            requirementPlanId: requirementPlanPath,
            workerAgentId: WORKER_AGENT_ID
        });

        if (createJobsResponse.success && createJobsResponse.result) {
            const createJobsResult = createJobsResponse.result;

            if (createJobsResult.success && createJobsResult.jobGroupId) {
                const jobGroupId = createJobsResult.jobGroupId;
                codebolt.chat.sendMessage(`Jobs created successfully. Group ID: ${jobGroupId}`, {});

                //STEP 4: Process jobs via agentic loop (LLM-driven orchestration)
                await executeJobsWithAgentLoop(jobGroupId, WORKER_AGENT_ID, reqMessage);

            } else {
                codebolt.chat.sendMessage(`Failed to create jobs: ${createJobsResult.error || 'Unknown error'}`, {});
            }
        } else {
            codebolt.chat.sendMessage(`Failed to start job creation: ${createJobsResponse.error || 'Unknown error'}`, {});
        }
    } catch (error) {
        console.error('Error processing post-planning actions:', error);
        codebolt.chat.sendMessage(`Error in post-planning actions: ${error}`, {});
    }

    return true;
});

/**
 * STEP 4: Execute jobs using the same agentic loop pattern as Step 1 (planning).
 * The LLM drives job orchestration — analyzing dependencies, launching parallel jobs,
 * reacting to completion events, and handling errors intelligently.
 */
async function executeJobsWithAgentLoop(
    jobGroupId: string,
    workerAgentId: string,
    originalReqMessage: FlatUserMessage
): Promise<void> {
    // Fetch jobs from the group
    const jobs = await fetchJobsForGroup(jobGroupId);

    if (jobs.length === 0) {
        codebolt.chat.sendMessage(`No open jobs found in group ${jobGroupId}. Nothing to execute.`);
        return;
    }

    codebolt.chat.sendMessage(`Found ${jobs.length} jobs to execute. Starting agentic job orchestration...`);

    // Build the job context XML for prompt injection
    const jobContextXml = buildJobExecutionContext(
        jobGroupId,
        workerAgentId,
        jobs.map(j => ({
            jobId: j.jobId,
            name: j.name,
            description: j.description,
            status: j.status,
            dependencies: j.dependencies
        }))
    );

    // Build the job executor system prompt with context
    const jobExecutorFullPrompt = JOB_EXECUTOR_SYSTEM_PROMPT + `

<important>
When using thread_create_background, you MUST use:
- selectedAgent: { id: "${workerAgentId}" }
- isGrouped: true
- groupId: "${jobGroupId}"
</important>

${jobContextXml}`;

    // Create prompt generator for the job executor agent
    const jobPromptGenerator = new InitialPromptGenerator({
        processors: [
            new EnvironmentContextModifier({ enableFullContext: true }),
            new DirectoryContextModifier(),
            new CoreSystemPromptModifier({ customSystemPrompt: jobExecutorFullPrompt }),
            new ToolInjectionModifier({ includeToolDescriptions: true }),
        ],
        baseSystemPrompt: jobExecutorFullPrompt
    });

    // Create a synthetic user message for the job executor
    const jobReqMessage: FlatUserMessage = {
        ...originalReqMessage,
        userMessage: `Execute all jobs in group ${jobGroupId}. Analyze the job list and dependencies provided in your system context, then launch and coordinate worker agents to complete all jobs.`
    };

    let jobPrompt: ProcessedMessage = await jobPromptGenerator.processMessage(jobReqMessage);
    let jobExecutionResult: any;
    let jobContinueLoop = false;

    // Same outer do-while + runWhileLoop pattern as Step 1
    do {
        jobContinueLoop = false;

        const result = await runWhileLoop(jobReqMessage, jobPrompt);

        if (result instanceof Error) {
            codebolt.chat.sendMessage(`Error in job execution loop: ${result.message}`);
            break;
        }

        jobExecutionResult = result.executionResult;
        jobPrompt = result.prompt;

        // Check for async events from child worker agents
        const runningCount = agentTracker.getRunningAgentCount();
        const pendingEventCount = eventQueue.getPendingExternalEventCount();

        if (runningCount > 0 || pendingEventCount > 0) {
            jobContinueLoop = true;

            // If agents are running but no events yet, wait for the next event
            if (pendingEventCount === 0 && runningCount > 0) {
                const nextEvent = await eventQueue.waitForAnyExternalEvent();
                processExternalEvent(nextEvent, jobPrompt);
            }

            // Drain any remaining pending events
            const remainingEvents = eventQueue.getPendingExternalEvents();
            for (const event of remainingEvents) {
                processExternalEvent(event, jobPrompt);
            }
        }

    } while (jobContinueLoop);

    // Report final result
    if (jobExecutionResult?.finalMessage) {
        codebolt.chat.sendMessage(`Job execution complete: ${jobExecutionResult.finalMessage}`);
    } else {
        codebolt.chat.sendMessage(`Job execution completed.`);
    }
}
