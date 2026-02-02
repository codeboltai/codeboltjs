/**
 * Test Deliberation Agent
 *
 * This agent tests the deleberation-one-out-of-n ActionBlock
 * with static task and parameters for easy testing.
 */

import codebolt from '@codebolt/codeboltjs';
import type { FlatUserMessage } from '@codebolt/types/sdk';

// ============================================
// STATIC TEST CONFIGURATION
// ============================================

const STATIC_TASK = 'Choose the best programming language for a new web API project';

const STATIC_TASK_DESCRIPTION = `
Pick ONE option from the following choices:

A) Python (with FastAPI)
B) TypeScript (with Node.js/Express)
C) Go (with Gin)
D) Rust (with Actix)

Your response must:
1. State your choice (A, B, C, or D)
2. Give ONE brief reason (1-2 sentences max)

Example response format:
"B - TypeScript. Strong typing with familiar JavaScript ecosystem makes it easy to hire developers."
`;

const STATIC_OPTIONS = {
    numberOfAgents: 4,
    agentId: '461ca95a-abd4-40f6-b57c-5369dddd6a2e'
};

// ============================================

interface AgentResponse {
    agentId: string;
    threadId: string;
    response: string;
    responseId?: string;
    timestamp: string;
}

interface DeliberationResult {
    selectedResponse: string;
    agentResponses: AgentResponse[];
    votes: Record<string, number>;
    winningAgentId: string;
    winningResponseId: string;
    deliberationId: string;
}

interface DeliberationOutput {
    success: boolean;
    result?: DeliberationResult;
    error?: string;
}

function formatResult(output: DeliberationOutput): string {
    if (!output.success || !output.result) {
        return `Deliberation failed: ${output.error || 'Unknown error'}`;
    }

    const result = output.result;
    const lines: string[] = [
        '=== Deliberation Results ===',
        '',
        `Deliberation ID: ${result.deliberationId}`,
        `Total Responses: ${result.agentResponses.length}`,
        '',
        '--- Winning Response ---',
        `Winner: ${result.winningAgentId}`,
        `Response ID: ${result.winningResponseId}`,
        '',
        result.selectedResponse,
        '',
        '--- Vote Summary ---',
    ];

    for (const [responseId, count] of Object.entries(result.votes)) {
        lines.push(`  ${responseId}: ${count} vote(s)`);
    }

    lines.push('', '--- All Responses ---');
    for (const response of result.agentResponses) {
        const preview = response.response.substring(0, 100);
        const ellipsis = response.response.length > 100 ? '...' : '';
        lines.push(`  [${response.agentId}]: ${preview}${ellipsis}`);
    }

    return lines.join('\n');
}

codebolt.onMessage(async (_msg: FlatUserMessage): Promise<void> => {
    codebolt.chat.sendMessage('Starting Deliberation Test...', {});
    codebolt.chat.sendMessage(
        `Task: ${STATIC_TASK}\nAgents: ${STATIC_OPTIONS.numberOfAgents}`,
        {}
    );

    try {
        const result = await codebolt.actionBlock.start(
            'deleberation-one-out-of-n',
            {
                task: STATIC_TASK,
                taskDescription: STATIC_TASK_DESCRIPTION,
                options: STATIC_OPTIONS,
            }
        ) as { success: boolean; result?: DeliberationOutput; error?: string };

        if (result.success && result.result) {
            const formattedResult = formatResult(result.result);
            codebolt.chat.sendMessage(formattedResult, {});
        } else {
            codebolt.chat.sendMessage(
                `Deliberation error: ${result.error || 'Unknown error'}`,
                {}
            );
        }
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        codebolt.chat.sendMessage(`Failed: ${errorMessage}`, {});
    }
});
