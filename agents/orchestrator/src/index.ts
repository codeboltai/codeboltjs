import codebolt from '@codebolt/codeboltjs';
import fs from 'fs'
import {
    InitialPromptGenerator,

    ResponseExecutor
} from '@codebolt/agent/unified'
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



// Cast codeboltEvent to any to access new methods not yet in the published types
const eventManager = codebolt.codeboltEvent as any;

let systemPrompt = `

You are an AI Orchestrator Agent operating in CodeboltAi. Your **ONLY** role is to manage and coordinate work by delegating tasks to specialized worker agents using thread management tools.

## CRITICAL RESTRICTIONS

**YOU MUST NEVER:**
- Write, create, edit, or modify any files directly
- Execute code editing tools (write_file, edit_file, replace_file_content, etc.)
- Run terminal commands that modify the filesystem
- Generate code for implementation purposes
- Use any file manipulation tools

**YOU MUST ALWAYS:**
- Delegate ALL implementation work to worker agents via the \`thread_management\` tool with action \`createAndStartThread\`
- Only use read-only tools for understanding context (codebase_search, read_file, grep_search)
- Coordinate, plan, and synthesize - never implement

## Core Responsibility

You are a **coordinator and delegator** - you analyze requests, break them into tasks, and assign them to worker agents. You do NOT perform any coding or file operations yourself.

Your workflow:
1. **Analyze** - Understand the user's request fully
2. **Plan** - Break down complex requests into discrete, actionable tasks
3. **Delegate** - Use the \`thread_management\` tool with action \`createAndStartThread\` to assign each task to a worker agent
4. **Monitor** - Track progress of delegated threads
5. **Synthesize** - Compile results and report back to the user



**Task Description Guidelines:**
- Be specific and actionable (e.g., "Create a login form component with email/password fields and validation")
- Include relevant context the worker needs
- Define clear success criteria
- One focused task per thread

**Examples of good task delegation:**
- "Implement the UserProfile component that displays name, email, and avatar"
- "Add input validation to the registration form - email format, password strength"
- "Create unit tests for the authentication service"
- "Fix the bug in payment processing where amounts are incorrectly rounded"

## When to Create Multiple Threads

- **Parallel tasks**: Independent features that don't depend on each other
- **Sequential tasks**: When one task's output is needed for the next, wait for completion before delegating the next
- **Large features**: Break into logical components (e.g., UI, API, tests)

## Grouping Related Threads

When creating multiple threads that are logically related (e.g., multiple parts of the same feature, parallel subtasks of a single request), you SHOULD group them together:

**Use \`isGrouped: true\` and a shared \`groupId\` when:**
- Creating multiple threads for the same user request
- Tasks are parallel subtasks of a larger feature
- You want to track completion of a batch of related work

**How to group threads:**
1. Generate a unique \`groupId\` (e.g., "feature-auth-implementation", "bugfix-payment-batch")
2. Pass \`isGrouped: true\` and the same \`groupId\` to all related thread creations




## Communication Style

- Use backticks for file, function, and class names (e.g., \`UserService.ts\`)
- Keep updates brief and focused on orchestration decisions
- Explain your task breakdown reasoning when delegating
- Report on thread status and summarize results
- Use markdown for clarity (headers, lists, bold for emphasis)

## What You CAN Do

- **Read files** to understand context and requirements
- **Search codebase** to find relevant code locations
- **Analyze** code structure and dependencies
- **Plan** implementation strategy
- **Delegate** tasks via \`thread_management\` tool with action \`createAndStartThread\`
- **Synthesize** results from completed threads
- **Answer questions** about the codebase or approach

## What You CANNOT Do

- Create, write, edit, or delete any files
- Run build commands, install packages, or execute scripts
- Directly implement any code changes
- Use any file modification tools


## Important Reminders

- If you find yourself about to write code or edit a file - STOP and delegate instead
- You are the coordinator, not the implementer
- Every implementation task must go through the \`thread_management\` tool with action \`createAndStartThread\`
- Your value is in planning, breaking down work, and coordinating - not in writing code
- **CRITICAL**: When using \`thread_management\` tool with action \`createAndStartThread\`, you MUST pass the \`selectedAgent\` parameter with the agent ID that is provided to you. Check the \`<important>\` section at the end of this prompt for the specific agent ID to use.

`.trim();

/**
 * Process a single message through the agent pipeline
 */
async function messageProcessingLoop(
    reqMessage: FlatUserMessage,
    prompt: ProcessedMessage
): Promise<{ completed: boolean; prompt: ProcessedMessage; hasActiveWork: boolean }> {
    let agent = new AgentStep({ preInferenceProcessors: [], postInferenceProcessors: [] });
    let result: AgentStepOutput = await agent.executeStep(reqMessage, prompt);
    prompt = result.nextMessage;

    let responseExecutor = new ResponseExecutor({
        preToolCallProcessors: [],
        postToolCallProcessors: []
    });

    let executionResult = await responseExecutor.executeResponse({
        initialUserMessage: reqMessage,
        actualMessageSentToLLM: result.actualMessageSentToLLM,
        rawLLMOutput: result.rawLLMResponse,
        nextMessage: result.nextMessage,
    });

    // Check if there are active background agents, groups, or pending tool calls
    const hasActiveWork = eventManager.hasActiveWork();

    return {
        completed: executionResult.completed,
        prompt: executionResult.nextMessage,
        hasActiveWork
    };
}

codebolt.onMessage(async (reqMessage: FlatUserMessage, additionalVariable: any) => {

 

    try {
        let sessionSystemPrompt;
        try {
            let orchestratorId = additionalVariable?.orchestratorId || 'orchestrator';
            let orhestratorConfig = await codebolt.orchestrator.getOrchestrator(orchestratorId);
            let defaultWorkerAgentId = orhestratorConfig.data.orchestrator.defaultWorkerAgentId;
            codebolt.chat.sendMessage(defaultWorkerAgentId);
            
            sessionSystemPrompt = systemPrompt;
            // if (defaultWorkerAgentId) {
                sessionSystemPrompt += `\n\n<important>
MANDATORY: When using the \`thread_management\` tool with action \`createAndStartThread\`, you MUST always pass this agent ID in the \`selectedAgent\` parameter:

selectedAgent: "${defaultWorkerAgentId}"

Do NOT omit this parameter. Every thread creation MUST include this agent ID.
</important>`;
            // }
        } catch (error) {
            sessionSystemPrompt = systemPrompt;
        }

    

        let promptGenerator = new InitialPromptGenerator({
            processors: [
                // 1. Chat History
                new ChatHistoryMessageModifier({ enableChatHistory: true }),
                // 2. Environment Context (date, OS)
                new EnvironmentContextModifier({ enableFullContext: true }),
                // 3. Directory Context (folder structure)
                new DirectoryContextModifier(),
                // 4. IDE Context (active file, opened files)
                new IdeContextModifier({
                    includeActiveFile: true,
                    includeOpenFiles: true,
                    includeCursorPosition: true,
                    includeSelectedText: true
                }),
                // 5. Core System Prompt (instructions)
                new CoreSystemPromptModifier(
                    { customSystemPrompt: sessionSystemPrompt }
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
            baseSystemPrompt: sessionSystemPrompt
        });

        let prompt: ProcessedMessage = await promptGenerator.processMessage(reqMessage);

        // Initial message processing
        let { completed, prompt: updatedPrompt } = await messageProcessingLoop(reqMessage, prompt);
        prompt = updatedPrompt;

        // Continue processing while there are background agents, groups, or work pending
        const runningAgents = eventManager.getRunningAgentCount();
        const activeGroups = eventManager.getActiveGroupCount();
        codebolt.chat.sendMessage(`Background agents: ${runningAgents}, Active groups: ${activeGroups}`)

        while (!completed || eventManager.hasActiveWork()) {
            if (eventManager.hasActiveWork()) {
                // Wait for any external event (background agent completion, agent event, etc.)
                const currentAgents = eventManager.getRunningAgentCount();
                const currentGroups = eventManager.getActiveGroupCount();
                codebolt.chat.sendMessage(`Checking for external event (agents: ${currentAgents}, groups: ${currentGroups})`)

                const externalEvent = await eventManager.waitForAnyExternalEvent();

                // Log updated status after event
                codebolt.chat.sendMessage(`Event received. Remaining - agents: ${eventManager.getRunningAgentCount()}, groups: ${eventManager.getActiveGroupCount()}`)

                // Handle the event based on its type
                switch (externalEvent.type) {
                    case 'backgroundAgentCompletion':
                        // Cleanup is now handled internally by codeboltEvent
                        // Add completion info to prompt for next iteration
                        prompt.message.messages.push({
                            role: 'user',
                            content: `Background agent completed: ${JSON.stringify(externalEvent.data)}`
                        });
                        break;

                    case 'backgroundGroupedAgentCompletion':
                        // Handle grouped agent completion - all agents in the group have finished
                        // externalEvent.data contains: { groupId, completedAgents: [...], totalAgents }
                        prompt.message.messages.push({
                            role: 'user',
                            content: `Background agent group "${externalEvent.data.groupId}" completed. All ${externalEvent.data.totalAgents} agents finished. Results: ${JSON.stringify(externalEvent.data.completedAgents)}`
                        });
                        break;

                    case 'agentEventReceived':
                        // Handle agent event
                        prompt.message.messages.push({
                            role: 'user',
                            content: `Agent event received: ${JSON.stringify(externalEvent.data)}`
                        });
                        break;
                }

                // Process the event through the agent loop
                // const eventResult = await messageProcessingLoop(reqMessage, prompt);
                // completed = eventResult.completed;
                // prompt = eventResult.prompt;
            }
            else {
                // Continue normal processing
                const result = await messageProcessingLoop(reqMessage, prompt);
                completed = result.completed;
                prompt = result.prompt;
            }
        }

    } catch (error) {
        return error;
    }
})
