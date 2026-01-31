/**
 * Deliberation One-Out-of-N Core Logic
 *
 * This module handles:
 * 1. Creating a deliberation for a given task
 * 2. Spawning N agents in background threads
 * 3. Collecting agent responses via event queue
 * 4. Managing voting process
 * 5. Determining the winner
 */

import codebolt from '@codebolt/codeboltjs';
import { v4 as uuidv4 } from 'uuid';
import {
    DeliberationContext,
    DeliberationInput,
    DeliberationResult,
    AgentResponse,
} from './types';

/**
 * Creates a new deliberation for the given task
 */
export async function createDeliberation(
    input: DeliberationInput,
    creatorId: string,
    creatorName: string
): Promise<DeliberationContext> {
    const groupId = uuidv4();
    const title = `Deliberation: ${input.task.substring(0, 50)}${input.task.length > 50 ? '...' : ''}`;

    codebolt.chat.sendMessage(`Creating deliberation: ${title}`, {});

    const result = await codebolt.agentDeliberation.create({
        deliberationType: 'voting',
        title,
        requestMessage: `Task: ${input.task}\n\nDescription: ${input.taskDescription}\n\nPlease provide your solution/response to this task.`,
        creatorId,
        creatorName,
        status: 'collecting-responses',
    });

    if (!result.payload?.deliberation) {
        throw new Error('Failed to create deliberation');
    }

    const deliberationId = result.payload.deliberation.id;
    codebolt.chat.sendMessage(`Deliberation created with ID: ${deliberationId}`, {});

    return {
        deliberationId,
        task: input.task,
        taskDescription: input.taskDescription,
        numberOfAgents: input.options?.numberOfAgents || 3,
        creatorId,
        creatorName,
        groupId,
    };
}

/**
 * Spawns N agents in background threads to participate in the deliberation
 * Returns a map of threadId to agent info
 */
export async function spawnDeliberationAgents(
    ctx: DeliberationContext,
    agentId?: string
): Promise<Map<string, { agentNumber: number }>> {
    const threadMap = new Map<string, { agentNumber: number }>();

    codebolt.chat.sendMessage(`Spawning ${ctx.numberOfAgents} agents for deliberation...`, {});

    for (let i = 0; i < ctx.numberOfAgents; i++) {
        const agentNumber = i + 1;
        const agentTask = buildAgentTask(ctx, agentNumber, agentId);

        codebolt.chat.sendMessage(`Spawning agent ${agentNumber}/${ctx.numberOfAgents}...`, {});

        const result = await codebolt.thread.createThreadInBackground({
            title: `Deliberation Agent ${agentNumber}`,
            description: `Agent participating in deliberation: ${ctx.deliberationId}`,
            userMessage: agentTask,
            selectedAgent: agentId ? { id: agentId } : undefined
        });

        if (result.threadId) {
            threadMap.set(result.threadId, { agentNumber });
            codebolt.chat.sendMessage(`Agent ${agentNumber} thread started: ${result.threadId}`, {});
        }
    }

    codebolt.chat.sendMessage(`${threadMap.size} agents spawned successfully`, {});
    return threadMap;
}

/**
 * Builds the task prompt for each agent
 */
function buildAgentTask(ctx: DeliberationContext, agentNumber: number,agentId?:string): string {
    return `
You are Agent #${agentNumber} participating in a deliberation process.

**Deliberation ID:** ${ctx.deliberationId}

**Your agent id :** ${agentId}

**Task:** ${ctx.task}

**Task Description:** ${ctx.taskDescription}

**Instructions:**

1. Analyze the task carefully and develop your best solution/response.

2. Submit your response using the **deliberation_respond** tool:
   - deliberationId: "${ctx.deliberationId}"
   - responderId: your agent ID
   - responderName: "Agent ${agentId}"
   - body: your complete solution/response

3. After submitting your response, use the **deliberation_get** tool to review other agents' responses:
   - id: "${ctx.deliberationId}"
   - view: "responses"

4. Vote for the best response (not your own) using the **deliberation_vote** tool:
   - deliberationId: "${ctx.deliberationId}"
   - responseId: the ID of the response you're voting for
   - voterId: your agent ID
   - voterName: "Agent ${agentId}"

Your unique perspective as Agent #${agentId} should contribute to finding the best solution.
`;
}

/**
 * Waits for all agents to complete using the event queue
 * Returns responses from the deliberation
 */
export async function waitForAgentCompletions(
    ctx: DeliberationContext,
    threadMap: Map<string, { agentNumber: number }>
): Promise<AgentResponse[]> {
    const eventQueue = codebolt.agentEventQueue;
    const agentTracker = codebolt.backgroundChildThreads;
    const completedThreads = new Set<string>();
    const expectedCount = threadMap.size;

    codebolt.chat.sendMessage(`Waiting for ${expectedCount} agents to complete...`, {});

    // Event loop - wait for agent completions
    while (completedThreads.size < expectedCount) {
        const runningCount = agentTracker.getRunningAgentCount();
        const pendingEvents = eventQueue.getPendingExternalEventCount();

        console.log(`[Deliberation] Running agents: ${runningCount}, Completed: ${completedThreads.size}/${expectedCount}, Pending events: ${pendingEvents}`);

        // Check if all agents have completed
        if (runningCount === 0 && pendingEvents === 0 && completedThreads.size < expectedCount) {
            codebolt.chat.sendMessage(`Warning: Some agents may have failed. Received ${completedThreads.size}/${expectedCount} completions`, {});
            break;
        }

        try {
            // Wait for next event
            const event = await eventQueue.waitForAnyExternalEvent();

            console.log(`[Deliberation] Received event:`, JSON.stringify(event, null, 2));

            if (event.type === 'backgroundAgentCompletion' ||
                event.type === 'backgroundGroupedAgentCompletion') {

                const completionData = event.data || event;
                const threadId = completionData?.threadId || completionData?.metadata?.threadId;

                if (threadId && threadMap.has(threadId)) {
                    const agentInfo = threadMap.get(threadId)!;
                    completedThreads.add(threadId);

                    const success = completionData?.success !== false;
                    codebolt.chat.sendMessage(
                        `Agent ${agentInfo.agentNumber} ${success ? 'completed' : 'failed'} (${completedThreads.size}/${expectedCount})`,
                        {}
                    );
                }
            }
        } catch (error) {
            console.error('[Deliberation] Error waiting for event:', error);
        }
    }

    codebolt.chat.sendMessage(`All agent completions received. Fetching responses...`, {});

    // Fetch responses from the deliberation
    const delibResult = await codebolt.agentDeliberation.get({
        id: ctx.deliberationId,
        view: 'full',
    });

    const responses = delibResult.payload?.responses || [];
    codebolt.chat.sendMessage(`Got ${responses.length} responses from deliberation`, {});

    return responses.map((r: any) => ({
        agentId: r.responderId,
        threadId: '',
        response: r.body,
        responseId: r.id,
        timestamp: r.createdAt,
    }));
}

/**
 * Transitions deliberation to voting phase
 */
export async function startVotingPhase(ctx: DeliberationContext): Promise<void> {
    codebolt.chat.sendMessage('Transitioning to voting phase...', {});

    await codebolt.agentDeliberation.update({
        deliberationId: ctx.deliberationId,
        status: 'voting',
    });
}

/**
 * Waits for voting to complete by checking deliberation state
 */
export async function waitForVotes(
    ctx: DeliberationContext,
    responses: AgentResponse[]
): Promise<Record<string, number>> {
    // For now, we'll fetch the current vote state
    // In a more advanced implementation, we could spawn voting agents

    codebolt.chat.sendMessage(`Collecting votes...`, {});

    const delibResult = await codebolt.agentDeliberation.get({
        id: ctx.deliberationId,
        view: 'full',
    });

    const votes = delibResult.payload?.votes || [];
    return countVotes(votes, responses);
}

/**
 * Counts votes per response
 */
function countVotes(votes: any[], responses: AgentResponse[]): Record<string, number> {
    const voteCounts: Record<string, number> = {};

    // Initialize all responses with 0 votes
    for (const response of responses) {
        if (response.responseId) {
            voteCounts[response.responseId] = 0;
        }
    }

    // Count votes
    for (const vote of votes) {
        if (vote.responseId && voteCounts[vote.responseId] !== undefined) {
            voteCounts[vote.responseId]++;
        }
    }

    return voteCounts;
}

/**
 * Gets the winner of the deliberation
 */
export async function getWinner(
    ctx: DeliberationContext,
    responses: AgentResponse[],
    votes: Record<string, number>
): Promise<DeliberationResult> {
    // Get winner from API
    const winnerResult = await codebolt.agentDeliberation.getWinner({
        deliberationId: ctx.deliberationId,
    });

    let winningResponse: AgentResponse | undefined;
    let winningResponseId = '';

    if (winnerResult.payload?.winner) {
        winningResponseId = winnerResult.payload.winner.id;
        winningResponse = responses.find(r => r.responseId === winningResponseId);
    }

    // If no winner from API, determine by vote count
    if (!winningResponse && Object.keys(votes).length > 0) {
        const sortedVotes = Object.entries(votes).sort(([, a], [, b]) => b - a);
        if (sortedVotes.length > 0) {
            winningResponseId = sortedVotes[0][0];
            winningResponse = responses.find(r => r.responseId === winningResponseId);
        }
    }

    // If still no winner, pick first response
    if (!winningResponse && responses.length > 0) {
        winningResponse = responses[0];
        winningResponseId = winningResponse.responseId || '';
    }

    // Update deliberation status to completed
    await codebolt.agentDeliberation.update({
        deliberationId: ctx.deliberationId,
        status: 'completed',
    });

    codebolt.chat.sendMessage(`Deliberation completed! Winner: ${winningResponse?.agentId || 'unknown'}`, {});

    return {
        selectedResponse: winningResponse?.response || '',
        agentResponses: responses,
        votes,
        winningAgentId: winningResponse?.agentId || '',
        winningResponseId,
        deliberationId: ctx.deliberationId,
    };
}

/**
 * Orchestrates the entire deliberation process
 */
export async function runDeliberation(
    input: DeliberationInput,
    metadata: any
): Promise<DeliberationResult> {
    const creatorId = metadata?.parentAgentInstanceId || 'orchestrator';
    const creatorName = metadata?.agentName || `Agent:${creatorId}`;
    const agentId = input.options?.agentId;

    // Step 1: Create deliberation
    const ctx = await createDeliberation(input, creatorId, creatorName);

    // Step 2: Spawn agents and get thread map
    const threadMap = await spawnDeliberationAgents(ctx, agentId);

    // Step 3: Wait for agent completions using event queue
    const responses = await waitForAgentCompletions(ctx, threadMap);

    if (responses.length === 0) {
        throw new Error('No responses received from agents');
    }

    // Step 4: Start voting phase
    await startVotingPhase(ctx);

    // Step 5: Collect votes
    const votes = await waitForVotes(ctx, responses);

    // Step 6: Determine winner
    const result = await getWinner(ctx, responses, votes);

    return result;
}
