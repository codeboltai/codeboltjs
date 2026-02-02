/**
 * Submit Merge Request ActionBlock - Core Logic
 *
 * For remote agents (AgentFS Provider) running in separate filesystems.
 *
 * Flow:
 * 1. Get diff from git in the projectPath (using child_process)
 * 2. Get changed files list from git status
 * 3. Create merge request via codebolt.reviewMergeRequest.create()
 * 4. Optionally start background review agent
 * 5. Optionally wait for review events via eventQueue
 */

import codebolt from '@codebolt/codeboltjs';
import { execSync } from 'child_process';
import type {
    SubmitMergeRequestInput,
    SubmitMergeRequestOutput,
    ReviewEvent,
    CreateReviewMergeRequest
} from './types';

/**
 * Execute a git command in the project directory
 */
function execGitCommand(command: string, cwd: string): string {
    try {
        return execSync(command, {
            cwd,
            encoding: 'utf-8',
            maxBuffer: 50 * 1024 * 1024 // 50MB buffer for large diffs
        }).trim();
    } catch (error) {
        console.error(`[SubmitMR] Git command failed: ${command}`, error);
        return '';
    }
}

/**
 * Get diff from the project path
 * Gets all uncommitted/staged changes
 */
function getDiff(projectPath: string, baseBranch?: string): string {
    // If base branch specified, get diff against it
    if (baseBranch) {
        const branchDiff = execGitCommand(`git diff ${baseBranch}`, projectPath);
        if (branchDiff) return branchDiff;
    }

    // Get diff of all changes (staged + unstaged)
    const allChanges = execGitCommand('git diff HEAD', projectPath);
    if (allChanges) return allChanges;

    // Fallback: get diff of staged changes only
    const stagedChanges = execGitCommand('git diff --cached', projectPath);
    if (stagedChanges) return stagedChanges;

    // Fallback: get diff of unstaged changes
    return execGitCommand('git diff', projectPath);
}

/**
 * Get list of changed files
 */
function getChangedFiles(projectPath: string): string[] {
    // Get files from git status
    const statusOutput = execGitCommand('git status --porcelain', projectPath);
    if (statusOutput) {
        return statusOutput
            .split('\n')
            .filter(line => line.length > 0)
            .map(line => line.substring(3).trim())
            .filter(f => f.length > 0);
    }
    return [];
}

/**
 * Get commit info for generating title/description
 */
function getCommitInfo(projectPath: string): { message: string; hash: string } {
    const message = execGitCommand('git log -1 --pretty=%B', projectPath);
    const hash = execGitCommand('git rev-parse --short HEAD', projectPath);
    return { message: message || '', hash: hash || '' };
}

/**
 * Get current branch name
 */
function getCurrentBranch(projectPath: string): string {
    return execGitCommand('git rev-parse --abbrev-ref HEAD', projectPath) || 'unknown';
}

/**
 * Start a background review agent
 */
async function startReviewAgent(
    mergeRequestId: string,
    mergeRequest: { title: string; description: string; diffPatch: string },
    reviewAgentId?: string
): Promise<{ threadId: string | null; error?: string }> {
    try {
        const diffPreview = mergeRequest.diffPatch.length > 50000
            ? mergeRequest.diffPatch.substring(0, 50000) + '\n... (truncated)'
            : mergeRequest.diffPatch;

        const reviewMessage = `
You are reviewing a merge request. Please:
1. Analyze the diff/changes carefully
2. Check for potential bugs, security issues, and code quality problems
3. Verify the changes match the described purpose
4. If changes are acceptable, approve the merge request
5. If changes need modifications, add review comments

Merge Request ID: ${mergeRequestId}
Title: ${mergeRequest.title}
Description: ${mergeRequest.description}

Changes to review:
\`\`\`diff
${diffPreview}
\`\`\`

After your review:
- If approved: Use reviewMergeRequest.addReview with type 'approve'
- If changes needed: Use reviewMergeRequest.addReview with type 'request_changes'
`;

        const response = await codebolt.thread.createThreadInBackground({
            title: `Review MR: ${mergeRequest.title}`,
            description: `Automated review for merge request: ${mergeRequestId}`,
            userMessage: reviewMessage,
            selectedAgent: reviewAgentId
        });

        if ('threadId' in response && response.threadId) {
            return { threadId: response.threadId };
        }

        return { threadId: null, error: 'Failed to start review agent' };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[SubmitMR] Error starting review agent:', error);
        return { threadId: null, error: errorMessage };
    }
}

/**
 * Wait for review completion event
 */
async function waitForReviewEvent(timeout: number = 300000): Promise<ReviewEvent | null> {
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
        try {
            const pendingEvent = codebolt.agentEventQueue.checkForPendingExternalEvent();
            if (pendingEvent) {
                return {
                    type: pendingEvent.type as ReviewEvent['type'],
                    data: pendingEvent.data
                };
            }

            const waitTimeout = Math.min(30000, timeout - (Date.now() - startTime));
            if (waitTimeout <= 0) break;

            const eventPromise = codebolt.agentEventQueue.waitForAnyExternalEvent();
            const timeoutPromise = new Promise<null>((resolve) =>
                setTimeout(() => resolve(null), waitTimeout)
            );

            const result = await Promise.race([eventPromise, timeoutPromise]);

            if (result) {
                return {
                    type: result.type as ReviewEvent['type'],
                    data: result.data
                };
            }
        } catch (error) {
            console.error('[SubmitMR] Error waiting for review event:', error);
        }
    }

    return null;
}

/**
 * Main function to submit a merge request
 */
export async function submitMergeRequest(
    input: SubmitMergeRequestInput
): Promise<SubmitMergeRequestOutput> {
    try {
        const { projectPath, agentId, agentName, mergeConfig } = input;
        const baseBranch = mergeConfig?.baseBranch;

        codebolt.chat.sendMessage(`Getting changes from: ${projectPath}`, {});

        // Step 1: Get diff from git
        const diffPatch = getDiff(projectPath, baseBranch);

        if (!diffPatch) {
            return {
                success: false,
                error: `No changes found in project path: ${projectPath}`
            };
        }

        // Step 2: Get list of changed files
        const majorFilesChanged = getChangedFiles(projectPath);

        // Step 3: Get info for title/description
        const commitInfo = getCommitInfo(projectPath);
        const currentBranch = getCurrentBranch(projectPath);

        // Derive title and description
        const title = input.title || commitInfo.message.split('\n')[0] || `Changes from ${currentBranch}`;
        const description = input.description || commitInfo.message || `Changes from ${input.overlayName || currentBranch}`;
        const initialTask = input.initialTask || title;

        codebolt.chat.sendMessage(`Creating merge request: ${title}`, {});
        codebolt.chat.sendMessage(`Files changed: ${majorFilesChanged.length}`, {});

        // Step 4: Create the merge request
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

        const createResponse = await codebolt.reviewMergeRequest.create(createData);

        if (!createResponse || !createResponse.request) {
            return {
                success: false,
                error: 'Failed to create merge request'
            };
        }

        const mergeRequest = createResponse.request;
        codebolt.chat.sendMessage(`Merge request created: ${mergeRequest.id}`, {});

        // Step 5: Start review agent if requested
        let reviewThreadId: string | undefined;
        const startReview = input.startReviewAgent !== false;

        if (startReview) {
            codebolt.chat.sendMessage('Starting review agent...', {});

            const reviewResult = await startReviewAgent(
                mergeRequest.id,
                {
                    title: mergeRequest.title,
                    description: mergeRequest.description,
                    diffPatch: mergeRequest.diffPatch
                },
                input.reviewAgentId
            );

            if (reviewResult.threadId) {
                reviewThreadId = reviewResult.threadId;
                codebolt.chat.sendMessage(`Review agent started: ${reviewThreadId}`, {});
            } else {
                codebolt.chat.sendMessage(`Warning: Could not start review agent: ${reviewResult.error}`, {});
            }
        }

        // Step 6: Wait for review if requested
        if (input.waitForReview && reviewThreadId) {
            codebolt.chat.sendMessage('Waiting for review completion...', {});

            const reviewTimeout = input.reviewTimeout || 300000;
            const reviewEvent = await waitForReviewEvent(reviewTimeout);

            if (reviewEvent) {
                const updatedMR = await codebolt.reviewMergeRequest.get(mergeRequest.id);
                const reviews = updatedMR?.request?.reviews || [];
                const latestReview = reviews[reviews.length - 1];

                return {
                    success: true,
                    mergeRequestId: mergeRequest.id,
                    mergeRequest: {
                        id: mergeRequest.id,
                        title: mergeRequest.title,
                        status: updatedMR?.request?.status || mergeRequest.status,
                        diffPatch: mergeRequest.diffPatch,
                        majorFilesChanged: mergeRequest.majorFilesChanged
                    },
                    reviewResult: {
                        completed: true,
                        approved: latestReview?.type === 'approve',
                        status: updatedMR?.request?.status,
                        reviewThreadId
                    }
                };
            } else {
                return {
                    success: true,
                    mergeRequestId: mergeRequest.id,
                    mergeRequest: {
                        id: mergeRequest.id,
                        title: mergeRequest.title,
                        status: mergeRequest.status,
                        diffPatch: mergeRequest.diffPatch,
                        majorFilesChanged: mergeRequest.majorFilesChanged
                    },
                    reviewResult: {
                        completed: false,
                        status: 'pending_review',
                        reviewThreadId
                    }
                };
            }
        }

        // Return without waiting for review
        return {
            success: true,
            mergeRequestId: mergeRequest.id,
            mergeRequest: {
                id: mergeRequest.id,
                title: mergeRequest.title,
                status: mergeRequest.status,
                diffPatch: mergeRequest.diffPatch,
                majorFilesChanged: mergeRequest.majorFilesChanged
            },
            reviewResult: reviewThreadId ? {
                completed: false,
                status: 'pending_review',
                reviewThreadId
            } : undefined
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('[SubmitMR] Error:', error);
        return {
            success: false,
            error: errorMessage
        };
    }
}
