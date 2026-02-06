/**
 * Submit Merge Request ActionBlock - Core Logic
 *
 * For remote agents (AgentFS Provider) running in separate filesystems.
 *
 * Flow:
 * 1. Get diff from git using codebolt.git API
 * 2. Get changed files list from codebolt.git.status()
 * 3. Create merge request via codebolt.reviewMergeRequest.create()
 * 4. Optionally start background review agent
 * 5. Optionally wait for review events via eventQueue
 */

import codebolt from '@codebolt/codeboltjs';
import type {
    SubmitMergeRequestInput,
    SubmitMergeRequestOutput,
    ReviewEvent,
    CreateReviewMergeRequest
} from './types';

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

/**
 * Get current branch name from git status response
 */
async function getCurrentBranch(): Promise<string> {
    try {
        const statusResponse = await codebolt.git.status();
        if (statusResponse && typeof statusResponse === 'object') {
            const status = statusResponse as unknown as {
                current?: string;
                branch?: string;
                data?: { current?: string; branch?: string };
            };
            return status.current || status.branch || status.data?.current || status.data?.branch || 'unknown';
        }
        return 'unknown';
    } catch (error) {
        console.error('[SubmitMR] Failed to get current branch:', error);
        return 'unknown';
    }
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

        // Step 1: Get diff from git using codebolt API
        const diffPatch = await getDiff(baseBranch || 'HEAD');

        if (!diffPatch) {
            return {
                success: false,
                error: `No changes found in project path: ${projectPath}`
            };
        }

        // Step 2: Get list of changed files using codebolt API
        const majorFilesChanged = await getChangedFiles();

        // Step 3: Get info for title/description using codebolt API
        const commitInfo = await getCommitInfo(projectPath);
        const currentBranch = await getCurrentBranch();

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
