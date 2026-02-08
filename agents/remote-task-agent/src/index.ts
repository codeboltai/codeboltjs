

import codebolt from '@codebolt/codeboltjs';
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
import type {
    CreateReviewMergeRequest,
    MergeConfig
} from '@codebolt/types/lib';

import { AgentStep } from '@codebolt/agent/unified';
import { AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';

// ============================================
// Submit Merge Request Types
// ============================================

interface SubmitMergeRequestInput {
    /** Path to the project (used for git logs) */
    projectPath: string;
    /** Agent ID creating the request */
    agentId: string;
    /** Agent name creating the request */
    agentName: string;
    /** Title for the merge request (optional - derived from commit if not provided) */
    title?: string;
    /** Description of changes (optional) */
    description?: string;
    /** The original task that led to these changes */
    initialTask?: string;
    /** Optional swarm ID */
    swarmId?: string;
    /** Commit hash to get diff for (optional - uses HEAD if not provided) */
    commitHash?: string;
    /** Merge strategy: 'patch' or 'git_worktree' */
    mergeStrategy?: 'patch' | 'git_worktree';
}

interface SubmitMergeRequestOutput {
    success: boolean;
    mergeRequestId?: string;
    mergeRequest?: {
        id: string;
        title: string;
        status: string;
        diffPatch: string;
        majorFilesChanged: string[];
    };
    error?: string;
}

// ============================================
// Git Helper Functions (using codebolt.git)
// ============================================

/**
 * Get diff using codebolt.git.diff()
 * @param commitHash - The commit hash to get diff for (defaults to 'HEAD')
 */
async function getDiff(commitHash: string = 'HEAD'): Promise<string> {
    try {
        const diffResponse = await codebolt.git.diff(commitHash);
        // Extract diff content from response
        if (diffResponse && typeof diffResponse === 'object') {
            // Handle different response formats
            if ('diff' in diffResponse) {
                return (diffResponse as { diff: string }).diff || '';
            }
            if ('data' in diffResponse) {
                return (diffResponse as { data: string }).data || '';
            }
            // If response is the diff string itself
            return JSON.stringify(diffResponse);
        }
        return '';
    } catch (error) {
        console.error('[SubmitMR] Failed to get diff:', error);
        return '';
    }
}

/**
 * Get list of changed files using codebolt.git.status()
 */
async function getChangedFiles(): Promise<string[]> {
    try {
        const statusResponse = await codebolt.git.status();
        const files: string[] = [];

        if (statusResponse && typeof statusResponse === 'object') {
            // Cast to unknown first, then to our expected shape
            const status = statusResponse as unknown as {
                modified?: string[];
                added?: string[];
                deleted?: string[];
                untracked?: string[];
                staged?: string[];
                files?: Array<{ path?: string; file?: string }>;
                data?: { files?: Array<{ path?: string; file?: string }> };
            };

            // Collect files from various status categories
            if (status.modified) files.push(...status.modified);
            if (status.added) files.push(...status.added);
            if (status.deleted) files.push(...status.deleted);
            if (status.untracked) files.push(...status.untracked);
            if (status.staged) files.push(...status.staged);
            if (status.files) {
                files.push(...status.files.map(f => f.path || f.file || '').filter(Boolean));
            }
            if (status.data?.files) {
                files.push(...status.data.files.map(f => f.path || f.file || '').filter(Boolean));
            }
        }

        // Remove duplicates
        return [...new Set(files)];
    } catch (error) {
        console.error('[SubmitMR] Failed to get status:', error);
        return [];
    }
}

/**
 * Get commit info using codebolt.git.logs()
 * @param path - The project path
 */
async function getCommitInfo(path: string): Promise<{ message: string; hash: string }> {
    try {
        const logsResponse = await codebolt.git.logs(path);

        if (logsResponse && typeof logsResponse === 'object') {
            // Cast to unknown first for safe type handling
            const logs = logsResponse as unknown as {
                logs?: Array<{ message?: string; hash?: string }>;
                data?: Array<{ message?: string; hash?: string }>;
            };

            // Get the latest commit
            const latestCommit = logs.logs?.[0] || logs.data?.[0];
            if (latestCommit) {
                return {
                    message: latestCommit.message || '',
                    hash: latestCommit.hash || ''
                };
            }
        }
        return { message: '', hash: '' };
    } catch (error) {
        console.error('[SubmitMR] Failed to get logs:', error);
        return { message: '', hash: '' };
    }
}

// ============================================
// Submit Merge Request Function
// ============================================

/**
 * Get diff from local files and submit a merge request for review
 *
 * @param input - Configuration for the merge request
 * @returns Result with merge request ID and details
 *
 * @example
 * ```typescript
 * const result = await submitMergeRequest({
 *   projectPath: '/path/to/project',
 *   agentId: 'agent-123',
 *   agentName: 'My Agent',
 *   title: 'Add new feature',
 *   description: 'This PR adds...',
 *   initialTask: 'Implement feature X'
 * });
 *
 * if (result.success) {
 *   console.log('MR created:', result.mergeRequestId);
 * }
 * ```
 */
async function submitMergeRequest(input: SubmitMergeRequestInput): Promise<SubmitMergeRequestOutput> {
    try {
        const { projectPath, agentId, agentName, commitHash } = input;

        codebolt.chat.sendMessage(`Getting changes from project...`, {});

        // Step 1: Get diff from git using codebolt.git.diff()
        const diffPatch = await getDiff(commitHash || 'HEAD');

        if (!diffPatch) {
            return {
                success: false,
                error: 'No changes found'
            };
        }

        // Step 2: Get list of changed files using codebolt.git.status()
        const majorFilesChanged = await getChangedFiles();

        // Step 3: Get info for title/description using codebolt.git.logs()
        const commitInfo = await getCommitInfo(projectPath);

        // Derive title and description
        const title = input.title || commitInfo.message.split('\n')[0] || 'Code changes';
        const description = input.description || commitInfo.message || 'Changes submitted for review';
        const initialTask = input.initialTask || title;

        codebolt.chat.sendMessage(`Creating merge request: ${title}`, {});
        codebolt.chat.sendMessage(`Files changed: ${majorFilesChanged.length}`, {});

        // Step 4: Build merge config
        const mergeConfig: MergeConfig = {
            strategy: input.mergeStrategy || 'patch'
        };

        // Step 5: Create the merge request
        const createData: CreateReviewMergeRequest = {
            type: 'review_merge',
            title,
            description,
            initialTask,
            majorFilesChanged,
            diffPatch,
            agentId,
            agentName,
            swarmId: input.swarmId,
            mergeConfig
        };

        const createResponse: any = await codebolt.reviewMergeRequest.create(createData);

        const mergeRequest = createResponse?.data?.request || createResponse?.request;
        // codebolt.chat.sendMessage(`Merge request created successfully! ID: ${JSON.stringify(createResponse)}`, {});
        if (!mergeRequest) {
            return {
                success: false,
                error: 'Failed to create merge request'
            };
        }

        // codebolt.chat.sendMessage(`Merge request created successfully! ID: ${mergeRequest.id}`, {});



        if (mergeRequest && mergeRequest.id) {
            codebolt.chat.sendMessage(`Triggering automated review for MR ${mergeRequest.id}`, {});
            try {
                await codebolt.thread.createThreadInBackground({
                    title: `Review for MR ${mergeRequest.id}`,
                    description: `Automated review for changes in MR ${mergeRequest.id}`,
                    userMessage: `Review MR ${mergeRequest.id}`,
                    selectedAgent: { id: 'c83e9754-8def-430b-820c-6d4236671427' },
                });
                codebolt.chat.sendMessage(`Reviewer agent started in background. Waiting for review completion...`, {});

                // ============================================
                // Wait for pending events from the reviewer agent
                // ============================================
                const eventQueue = codebolt.agentEventQueue;
                const agentTracker = codebolt.backgroundChildThreads;
                let reviewCompleted = false;

                // Wait for events while there are running background agents or pending events
                while (!reviewCompleted) {
                    const runningCount = agentTracker.getRunningAgentCount();
                    const pendingCount = eventQueue.getPendingExternalEventCount();

                    // codebolt.chat.sendMessage(`Checking status - Running agents: ${runningCount}, Pending events: ${pendingCount}`, {});

                    if (runningCount > 0 || pendingCount > 0) {
                        // codebolt.chat.sendMessage(`Waiting for external events...`, {});

                        // Wait for any external event (queue events, background completions)
                        const events = await eventQueue.getPendingQueueEvents();

                        // codebolt.chat.sendMessage(`Received events: ${JSON.stringify(events)}`, {});

                        // Process each event in the array
                        for (const event of events) {
                            const eventType = (event as any).type;

                            if (eventType === 'backgroundAgentCompletion') {
                                // codebolt.chat.sendMessage(`Background agent completed: ${JSON.stringify(event)}`, {});
                                reviewCompleted = true;

                                // Check the review status
                                const updatedMR = await codebolt.reviewMergeRequest.get(mergeRequest.id);
                                const mrData = (updatedMR as any)?.request || (updatedMR as any)?.data?.request;
                                const reviews = mrData?.reviews || [];
                                const latestReview = reviews[reviews.length - 1];

                                if (latestReview?.type === 'approve') {
                                    codebolt.chat.sendMessage('✅ Review APPROVED! Changes can be merged.', {});
                                } else if (latestReview?.type === 'request_changes') {
                                    codebolt.chat.sendMessage(`❌ Changes requested: ${latestReview.comment || 'See review details'}`, {});
                                } else {
                                    codebolt.chat.sendMessage(`📋 Review status: ${mrData?.status || 'pending'}`, {});
                                }
                            } else if (eventType === 'agentQueueEvent') {
                                codebolt.chat.sendMessage(`Message from reviewer agent: ${JSON.stringify(event)}`, {});
                                // Continue waiting for completion
                            } else if (eventType === 'backgroundGroupedAgentCompletion') {
                                codebolt.chat.sendMessage(`Grouped agents completed: ${JSON.stringify(event)}`, {});
                                reviewCompleted = true;
                            }
                        }
                    } else {
                        // No running agents and no pending events - check once more and exit
                        codebolt.chat.sendMessage(`No pending events or running agents. Review may have completed.`, {});
                        reviewCompleted = true;
                    }
                }

                codebolt.chat.sendMessage(`Review process completed.`, {});
            } catch (err) {
                codebolt.chat.sendMessage(`Failed to start reviewer agent or wait for review: ${err}`, {});
            }
        }

        return {
            success: true,
            mergeRequestId: mergeRequest.id,
            mergeRequest: {
                id: mergeRequest.id,
                title: mergeRequest.title,
                status: mergeRequest.status,
                diffPatch: mergeRequest.diffPatch,
                majorFilesChanged: mergeRequest.majorFilesChanged
            }
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('[SubmitMR] Error:', error);
        codebolt.chat.sendMessage(`Submit merge request failed: ${errorMessage}`, {});
        return {
            success: false,
            error: errorMessage
        };
    }
}

// Export the function and types for external use
export { submitMergeRequest, SubmitMergeRequestInput, SubmitMergeRequestOutput };

/*
 * ============================================
 * USAGE EXAMPLE
 * ============================================
 *
 * Call this function after the agent completes its work to submit changes for review.
 * Uses codebolt.git APIs (status, diff, logs) to get change information.
 *
 * const result = await submitMergeRequest({
 *     projectPath: process.cwd(),  // Project path for git logs
 *     agentId: 'remote-task-agent',
 *     agentName: 'Remote Task Agent',
 *     title: 'Implement feature X',           // optional - derived from commit
 *     description: 'Added new functionality', // optional - derived from commit
 *     initialTask: 'The original user request',
 *     commitHash: 'HEAD'  // optional - defaults to HEAD
 * });
 *
 * if (result.success) {
 *     console.log('Merge request created:', result.mergeRequestId);
 * } else {
 *     console.error('Failed:', result.error);
 * }
 */

let systemPrompt = `


You are an interactive CLI tool that helps users with software engineering tasks. Use the instructions below and the tools available to you to assist the user.

IMPORTANT: Assist with authorized security testing, defensive security, CTF challenges, and educational contexts. Refuse requests for destructive techniques, DoS attacks, mass targeting, supply chain compromise, or detection evasion for malicious purposes. Dual-use security tools (C2 frameworks, credential testing, exploit development) require clear authorization context: pentesting engagements, CTF competitions, security research, or defensive use cases.
IMPORTANT: You must NEVER generate or guess URLs for the user unless you are confident that the URLs are for helping the user with programming. You may use URLs provided by the user in their messages or local files.

If the user asks for help or wants to give feedback inform them of the following:
- /help: Get help with using Claude Code
- To give feedback, users should report the issue at https://github.com/anthropics/claude-code/issues

When the user directly asks about Claude Code (eg. \"can Claude Code do...\", \"does Claude Code have...\"), or asks in second person (eg. \"are you able...\", \"can you do...\"), or asks how to use a specific Claude Code feature (eg. implement a hook, write a slash command, or install an MCP server), use the WebFetch tool to gather information to answer the question from Claude Code docs. The list of available docs is available at https://docs.claude.com/en/docs/claude-code/claude_code_docs_map.md.

# Tone and style
- Only use emojis if the user explicitly requests it. Avoid using emojis in all communication unless asked.
- Your output will be displayed on a command line interface. Your responses should be short and concise. You can use Github-flavored markdown for formatting, and will be rendered in a monospace font using the CommonMark specification.
- Output text to communicate with the user; all text you output outside of tool use is displayed to the user. Only use tools to complete tasks. Never use tools like Bash or code comments as means to communicate with the user during the session.
- NEVER create files unless they're absolutely necessary for achieving your goal. ALWAYS prefer editing an existing file to creating a new one. This includes markdown files.

# Professional objectivity
Prioritize technical accuracy and truthfulness over validating the user's beliefs. Focus on facts and problem-solving, providing direct, objective technical info without any unnecessary superlatives, praise, or emotional validation. It is best for the user if Claude honestly applies the same rigorous standards to all ideas and disagrees when necessary, even if it may not be what the user wants to hear. Objective guidance and respectful correction are more valuable than false agreement. Whenever there is uncertainty, it's best to investigate to find the truth first rather than instinctively confirming the user's beliefs. Avoid using over-the-top validation or excessive praise when responding to users such as \"You're absolutely right\" or similar phrases.

# Task Management
You have access to the todo_write tools to help you manage and plan tasks. Use these tools VERY frequently to ensure that you are tracking your tasks and giving the user visibility into your progress.
These tools are also EXTREMELY helpful for planning tasks, and for breaking down larger complex tasks into smaller steps. If you do not use this tool when planning, you may forget to do important tasks - and that is unacceptable.

It is critical that you mark todos as completed as soon as you are done with a task. Do not batch up multiple tasks before marking them as completed.

Examples:

<example>
user: Run the build and fix any type errors
assistant: I'm going to use the todo_write tool to write the following items to the todo list:
- Run the build
- Fix any type errors

I'm now going to run the build using Bash.

Looks like I found 10 type errors. I'm going to use the todo_write tool to write 10 items to the todo list.

marking the first todo as in_progress

Let me start working on the first item...

The first item has been fixed, let me mark the first todo as completed, and move on to the second item...
..
..
</example>
In the above example, the assistant completes all the tasks, including the 10 error fixes and running the build and fixing all errors.

<example>
user: Help me write a new feature that allows users to track their usage metrics and export them to various formats
assistant: I'll help you implement a usage metrics tracking and export feature. Let me first use the todo_write tool to plan this task.
Adding the following todos to the todo list:
1. Research existing metrics tracking in the codebase
2. Design the metrics collection system
3. Implement core metrics tracking functionality
4. Create export functionality for different formats

Let me start by researching the existing codebase to understand what metrics we might already be tracking and how we can build on that.

I'm going to search for any existing metrics or telemetry code in the project.

I've found some existing telemetry code. Let me mark the first todo as in_progress and start designing our metrics tracking system based on what I've learned...

[Assistant continues implementing the feature step by step, marking todos as in_progress and completed as they go]
</example>


Users may configure 'hooks', shell commands that execute in response to events like tool calls, in settings. Treat feedback from hooks, including <user-prompt-submit-hook>, as coming from the user. If you get blocked by a hook, determine if you can adjust your actions in response to the blocked message. If not, ask the user to check their hooks configuration.

# Doing tasks
The user will primarily request you perform software engineering tasks. This includes solving bugs, adding new functionality, refactoring code, explaining code, and more. For these tasks the following steps are recommended:
- 
- Use the todo_write tool to plan the task if required
- Be careful not to introduce security vulnerabilities such as command injection, XSS, SQL injection, and other OWASP top 10 vulnerabilities. If you notice that you wrote insecure code, immediately fix it.

- Tool results and user messages may include <system-reminder> tags. <system-reminder> tags contain useful information and reminders. They are automatically added by the system, and bear no direct relation to the specific tool results or user messages in which they appear.


# Tool usage policy
- When doing file search, prefer to use the Task tool in order to reduce context usage.
- You should proactively use the Task tool with specialized agents when the task at hand matches the agent's description.

- When WebFetch returns a message about a redirect to a different host, you should immediately make a new WebFetch request with the redirect URL provided in the response.
- You can call multiple tools in a single response. If you intend to call multiple tools and there are no dependencies between them, make all independent tool calls in parallel. Maximize use of parallel tool calls where possible to increase efficiency. However, if some tool calls depend on previous calls to inform dependent values, do NOT call these tools in parallel and instead call them sequentially. For instance, if one operation must complete before another starts, run these operations sequentially instead. Never use placeholders or guess missing parameters in tool calls.
- If the user specifies that they want you to run tools \"in parallel\", you MUST send a single message with multiple tool use content blocks. For example, if you need to launch multiple agents in parallel, send a single message with multiple Task tool calls.
- Use specialized tools instead of bash commands when possible, as this provides a better user experience. For file operations, use dedicated tools: Read for reading files instead of cat/head/tail, Edit for editing instead of sed/awk, and Write for creating files instead of cat with heredoc or echo redirection. Reserve bash tools exclusively for actual system commands and terminal operations that require shell execution. NEVER use bash echo or other command-line tools to communicate thoughts, explanations, or instructions to the user. Output all communication directly in your response text instead.
- VERY IMPORTANT: When exploring the codebase to gather context or to answer a question that is not a needle query for a specific file/class/function, it is CRITICAL that you use the Task tool with subagent_type=Explore instead of running search commands directly.
<example>
user: Where are errors from the client handled?
assistant: [Uses the Task tool with subagent_type=Explore to find the files that handle client errors instead of using Glob or Grep directly]
</example>
<example>
user: What is the codebase structure?
assistant: [Uses the Task tool with subagent_type=Explore]
</example>

<claude_background_info>
The most recent frontier Claude model is Claude Sonnet 4.5 (model ID: 'claude-sonnet-4-5-20250929').
</claude_background_info>


IMPORTANT: Assist with authorized security testing, defensive security, CTF challenges, and educational contexts. Refuse requests for destructive techniques, DoS attacks, mass targeting, supply chain compromise, or detection evasion for malicious purposes. Dual-use security tools (C2 frameworks, credential testing, exploit development) require clear authorization context: pentesting engagements, CTF competitions, security research, or defensive use cases.


IMPORTANT: Always use the todo_write tool to plan and track tasks throughout the conversation.

# Code References

When referencing specific functions or pieces of code include the pattern file_path:line_number to allow the user to easily navigate to the source code location.

<example>
user: Where are errors from the client handled?
assistant: Clients are marked as failed in the connectToServer function in src/services/process.ts:712.
</example>

`.trim();

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {

    try {

        codebolt.chat.sendMessage("Remote Task Agent started - Testing submit-merge-request action block", {});


        // Original agent logic commented out below:
        codebolt.chat.sendMessage("Remote Task Agent started", {})
        // codebolt.chat.sendMessage(JSON.stringify(reqMessage),{})
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
        do {
            let agent = new AgentStep({ preInferenceProcessors: [], postInferenceProcessors: [] })
            let result: AgentStepOutput = await agent.executeStep(reqMessage, prompt); //Primarily for LLM Calling and has 
            prompt = result.nextMessage;

            let responseExecutor = new ResponseExecutor({
                preToolCallProcessors: [],
                postToolCallProcessors: []

            })
            let executionResult = await responseExecutor.executeResponse({
                initialUserMessage: reqMessage,
                actualMessageSentToLLM: result.actualMessageSentToLLM,
                rawLLMOutput: result.rawLLMResponse,
                nextMessage: result.nextMessage,
            });

            completed = executionResult.completed;
            prompt = executionResult.nextMessage;


            if (completed) {
                break;
            }

        } while (!completed);

        // ============================================
        // After agent loop completes: Submit merge request
        // ============================================
        codebolt.chat.sendMessage('Agent work completed. Submitting changes for review...', {});

        // Get project path using codebolt.project API
        const { projectPath } = await codebolt.project.getProjectPath();


        const mrResult = await submitMergeRequest({
            projectPath,
            agentId: 'remote-task-agent',
            agentName: 'Remote Task Agent',
            initialTask: reqMessage.userMessage || 'Task completed',
            mergeStrategy: 'patch'
        });

        codebolt.chat.sendMessage(JSON.stringify(mrResult), {});

        // if (mrResult.success) {
        //     codebolt.chat.sendMessage(`Merge request submitted: ${mrResult.mergeRequestId}`, {});
        //     codebolt.chat.sendMessage('Checking for pending review events...', {});

        //     // ============================================
        //     // Get pending events from agentEventQueue
        //     // ============================================
        //     try {
        //         const pendingEvents = await codebolt.agentEventQueue.getPendingQueueEvents();

        //         if (pendingEvents && pendingEvents.length > 0) {
        //             codebolt.chat.sendMessage(`Received ${pendingEvents.length} pending event(s)`, {});

        //             for (const event of pendingEvents) {
        //                 codebolt.chat.sendMessage(`Event: ${JSON.stringify(event)}`, {});
        //             }

        //             // Check if review was approved
        //             if (mrResult.mergeRequestId) {
        //                 const updatedMR = await codebolt.reviewMergeRequest.get(mrResult.mergeRequestId);
        //                 const status = updatedMR?.request?.status;
        //                 const reviews = updatedMR?.request?.reviews || [];
        //                 const latestReview = reviews[reviews.length - 1];

        //                 if (latestReview?.type === 'approve') {
        //                     codebolt.chat.sendMessage('Review APPROVED! Changes can be merged.', {});
        //                 } else if (latestReview?.type === 'request_changes') {
        //                     codebolt.chat.sendMessage(`Changes requested: ${latestReview.comment}`, {});
        //                 } else {
        //                     codebolt.chat.sendMessage(`Review status: ${status}`, {});
        //                 }
        //             }
        //         } else {
        //             codebolt.chat.sendMessage('No pending events in queue. MR submitted for review.', {});
        //         }
        //     } catch (eventError) {
        //         codebolt.chat.sendMessage(`Error getting pending events: ${eventError}`, {});
        //     }
        // } else {
        //     codebolt.chat.sendMessage(`Failed to submit merge request: ${mrResult.error}`, {});
        // }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        codebolt.chat.sendMessage(`Agent error: ${errorMessage}`, {});
    }
})




