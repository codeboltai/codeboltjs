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
    ORCHESTRATOR_SYSTEM_PROMPT,
    appendWorkerAgentId,
    appendExecutionPlanContext
} from './prompts';
import { runWhileLoop } from './agentLoop';
import { processExternalEvent } from './eventHandlers';
import { processExecutionPlanTasks } from './taskProcessor';

// Use agentEventQueue for centralized event handling
const eventQueue = codebolt.agentEventQueue;

function unwrapPlanResult(planResult: any): any {
    return planResult?.result?.planId || planResult?.result?.error
        ? planResult.result
        : planResult?.result?.result || planResult?.result?.output || planResult?.data || planResult?.result;
}

/**
 * Orchestrator Agent
 *
 * Flow:
 * 1. Requirement Analysis & Planning
 *    - Uses 'create-plan-for-given-task' action block to analyze requirements
 *    - Generates a planning note and feature plan from user requirements
 *    - Creates an execution plan with tasks
 *
 * 2. Task & Job Execution
 *    - Retrieves task items from the execution plan
 *    - Breaks each task into multiple jobs using LLM
 *    - Creates jobs with proper dependencies
 *    - Assigns jobs to sub-agents
 *    - Listens for job completion events
 *    - Executes next independent job when dependencies are met
 */
codebolt.onMessage(async (reqMessage: FlatUserMessage, additionalVariable: any) => {
    let sessionSystemPrompt = ORCHESTRATOR_SYSTEM_PROMPT;
    let defaultWorkerAgentId: string | undefined;

    // ================================
    // PHASE 0: Configure orchestrator
    // ================================
    try {
        const orchestratorId = additionalVariable?.orchestratorId || 'orchestrator';
        const orchestratorConfig = await codebolt.orchestrator.getOrchestrator(orchestratorId);
        const configData = orchestratorConfig.data as { orchestrator?: { defaultWorkerAgentId?: string } };
        defaultWorkerAgentId = configData?.orchestrator?.defaultWorkerAgentId;

        if (defaultWorkerAgentId) {
            sessionSystemPrompt = appendWorkerAgentId(sessionSystemPrompt, defaultWorkerAgentId);
        }
    } catch (error) {
        console.log('[Orchestrator] Using default configuration');
    }


    // ================================
    // PHASE 1: Requirement Analysis & Planning
    // ================================
    codebolt.chat.sendMessage("Starting requirement analysis and planning...");

    try {
        // 1.1 - 1.3: Create detailed plan using action block
        // This action block:
        // - Analyzes user requirements
        // - Generates a planning note and feature plan
        // - Creates an execution plan with tasks
        const planResult = await codebolt.actionBlock.start('create-plan-for-given-task', {
            userMessage: reqMessage
        });

        if (planResult.success && planResult.result) {
            const actionBlockResult = unwrapPlanResult(planResult);
            const { planId } = actionBlockResult || {};
            const featurePlanPath = actionBlockResult?.featurePlanPath || actionBlockResult?.requirementPlanPath;

            if (planId) {
                codebolt.chat.sendMessage(`Plan created successfully. Plan ID: ${planId}`);
                // Update system prompt with plan context
                sessionSystemPrompt = appendExecutionPlanContext(
                    sessionSystemPrompt,
                    planId,
                    featurePlanPath
                );

                // ================================
                // PHASE 2: Task & Job Execution
                // ================================

                // Validate worker agent configuration
                if (!defaultWorkerAgentId) {
                    codebolt.chat.sendMessage("Warning: No defaultWorkerAgentId configured in orchestrator. Jobs cannot be executed.");
                    codebolt.chat.sendMessage("Please configure defaultWorkerAgentId in your orchestrator settings.");
                    return;
                }

                codebolt.chat.sendMessage(`Starting task and job execution with worker agent: ${defaultWorkerAgentId}`);

                // 2.1 - 2.6: Process execution plan tasks
                // This will:
                // - Retrieve task items from the execution plan
                // - Break each task into jobs using LLM
                // - Create jobs with dependencies
                // - Execute jobs via sub-agents
                // - Listen for completion events
                // - Execute next jobs when dependencies are met
                const jobsResult = await processExecutionPlanTasks(planId, defaultWorkerAgentId);

                if (jobsResult.success) {
                    codebolt.chat.sendMessage(
                        `Execution complete! Group: ${jobsResult.groupId}, Tasks: ${jobsResult.tasksSucceeded}/${jobsResult.tasksProcessed}, Total jobs: ${jobsResult.totalJobs}`
                    );
                } else {
                    codebolt.chat.sendMessage(
                        `Execution completed with issues: ${jobsResult.tasksFailed} tasks failed. ${jobsResult.error || ''}`
                    );
                }

                return;
            }

            codebolt.chat.sendMessage(`Plan creation failed: ${actionBlockResult?.error || 'No plan ID returned'}`);
        } else {
            codebolt.chat.sendMessage("Plan creation skipped or failed, proceeding with direct orchestration...");
        }
    } catch (planError) {
        console.error('[Orchestrator] Plan creation failed:', planError);
        codebolt.chat.sendMessage("Plan creation failed, proceeding with direct orchestration...");
    }

    // ================================
    // FALLBACK: Direct orchestration mode
    // ================================
    // This mode is used when:
    // - Plan creation fails
    // - User wants direct conversation with orchestrator
    // - Simple tasks that don't need full planning

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
        const events = await eventQueue.getPendingEvents();

        if (events.length > 0) {
            continueLoop = true;

            // Process each event
            for (const event of events) {
                processExternalEvent(event, prompt);
            }
        }

    } while (continueLoop);

    return executionResult?.finalMessage || "No response generated";
});
