/**
 * Deliberation One-Out-of-N ActionBlock
 *
 * This ActionBlock creates a deliberation for a given task, spawns N agents
 * to provide responses, collects votes, and returns the winning response.
 *
 * Flow:
 * 1. Create a deliberation with the task description
 * 2. Spawn N agents using createThreadInBackground
 * 3. Each agent responds with their solution
 * 4. Agents vote on the best response
 * 5. Return the winning response
 */

import codebolt from '@codebolt/codeboltjs';
import { runDeliberation } from './deliberation';
import type { DeliberationInput, DeliberationOutput } from './types';

// ActionBlock invocation handler
codebolt.onActionBlockInvocation(async (threadContext: any, metadata: any) => {
    try {
        codebolt.chat.sendMessage('Starting Deliberation One-Out-of-N ActionBlock...', {});

        // Extract input parameters
        const input: DeliberationInput = {
            task: threadContext.task || metadata?.task || '',
            taskDescription: threadContext.taskDescription || metadata?.taskDescription || '',
            options: {
                numberOfAgents: threadContext.options?.numberOfAgents ||
                    metadata?.options?.numberOfAgents ||
                    3,
                agentId: threadContext.options?.agentId || metadata?.options?.agentId,
            },
        };

        // Validate required inputs
        if (!input.task) {
            throw new Error('Missing required input: task');
        }

        if (!input.taskDescription) {
            throw new Error('Missing required input: taskDescription');
        }

        if (input.options!.numberOfAgents < 2) {
            throw new Error('numberOfAgents must be at least 2 for deliberation');
        }

        codebolt.chat.sendMessage(
            `Deliberation config: ${input.options!.numberOfAgents} agents for task: "${input.task}"`,
            {}
        );

        // Run the deliberation process
        const result = await runDeliberation(input, metadata);

        // Build output
        const output: DeliberationOutput = {
            success: true,
            result: {
                selectedResponse: result.selectedResponse,
                agentResponses: result.agentResponses,
                votes: result.votes,
                winningAgentId: result.winningAgentId,
                winningResponseId: result.winningResponseId,
                deliberationId: result.deliberationId,
            },
        };

        codebolt.chat.sendMessage(
            `Deliberation completed successfully!\n\nWinning Response:\n${result.selectedResponse.substring(0, 500)}${result.selectedResponse.length > 500 ? '...' : ''}`,
            {}
        );

        return output;
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        codebolt.chat.sendMessage(`Deliberation failed: ${errorMessage}`, {});

        const output: DeliberationOutput = {
            success: false,
            error: errorMessage,
        };

        return output;
    }
});
