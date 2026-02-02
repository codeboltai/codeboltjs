/**
 * Submit Merge Request ActionBlock
 *
 * Called by remote agents (AgentFS Provider) running in separate filesystems.
 *
 * Flow:
 * 1. Remote agent completes work in projectPath (mounted agentfs or project dir)
 * 2. Calls this action block with projectPath and agent info
 * 3. This action block:
 *    - Gets diff from git in the projectPath
 *    - Creates merge request via codebolt.reviewMergeRequest.create()
 *    - Starts background review agent
 * 4. Remote agent waits for review event via eventQueue
 */

import codebolt from '@codebolt/codeboltjs';
import { submitMergeRequest } from './submitMergeRequest';
import type { SubmitMergeRequestInput, SubmitMergeRequestOutput } from './types';

// ActionBlock invocation handler
codebolt.onActionBlockInvocation(async (threadContext: Record<string, unknown>, metadata: Record<string, unknown>) => {
    try {
        codebolt.chat.sendMessage('Starting Submit Merge Request ActionBlock...', {});

        const params = (threadContext?.params || {}) as Record<string, unknown>;

        // Get projectPath - required
        const projectPath = (params.projectPath as string) || (metadata?.projectPath as string);

        if (!projectPath) {
            throw new Error('Missing required input: projectPath');
        }

        // Get agentId - required
        const agentId = (params.agentId as string) || (metadata?.agentId as string);

        if (!agentId) {
            throw new Error('Missing required input: agentId');
        }

        // Build input
        const input: SubmitMergeRequestInput = {
            projectPath,
            overlayName: (params.overlayName as string) || (metadata?.overlayName as string),
            mergeConfig: (params.mergeConfig as SubmitMergeRequestInput['mergeConfig']) ||
                (metadata?.mergeConfig as SubmitMergeRequestInput['mergeConfig']),
            agentId,
            agentName: (params.agentName as string) || (metadata?.agentName as string) || 'Remote Agent',
            title: (params.title as string) || (metadata?.title as string),
            description: (params.description as string) || (metadata?.description as string),
            initialTask: (params.initialTask as string) || (metadata?.initialTask as string),
            swarmId: (params.swarmId as string) || (metadata?.swarmId as string),
            startReviewAgent: (params.startReviewAgent as boolean) ?? (metadata?.startReviewAgent as boolean) ?? true,
            reviewAgentId: (params.reviewAgentId as string) || (metadata?.reviewAgentId as string),
            waitForReview: (params.waitForReview as boolean) ?? (metadata?.waitForReview as boolean) ?? false,
            reviewTimeout: (params.reviewTimeout as number) || (metadata?.reviewTimeout as number) || 300000
        };

        codebolt.chat.sendMessage(`Submitting merge request from: ${projectPath}`, {});

        if (input.overlayName) {
            codebolt.chat.sendMessage(`Overlay: ${input.overlayName}`, {});
        }

        // Run the merge request submission
        const result = await submitMergeRequest(input);

        // Build output
        const output: SubmitMergeRequestOutput = {
            success: result.success,
            mergeRequestId: result.mergeRequestId,
            mergeRequest: result.mergeRequest,
            reviewResult: result.reviewResult,
            error: result.error
        };

        if (result.success) {
            let successMessage = `Merge request submitted successfully!\nMR ID: ${result.mergeRequestId}`;

            if (result.reviewResult?.reviewThreadId) {
                successMessage += `\nReview Agent Thread: ${result.reviewResult.reviewThreadId}`;
            }

            if (result.reviewResult?.completed) {
                successMessage += `\nReview Status: ${result.reviewResult.approved ? 'APPROVED' : 'CHANGES REQUESTED'}`;
            } else if (result.reviewResult) {
                successMessage += `\nReview Status: Pending (use eventQueue to wait for completion)`;
            }

            codebolt.chat.sendMessage(successMessage, {});
        } else {
            codebolt.chat.sendMessage(`Merge request submission failed: ${result.error}`, {});
        }

        return output;

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        codebolt.chat.sendMessage(`Submit Merge Request failed: ${errorMessage}`, {});

        const output: SubmitMergeRequestOutput = {
            success: false,
            error: errorMessage
        };

        return output;
    }
});
