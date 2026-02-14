import codebolt from '@codebolt/codeboltjs';
import { AgentContext, JobOutput } from './jobfinder/types';

// ================================
// GIT HELPERS
// ================================

async function getDiff(commitHash: string = 'HEAD'): Promise<string> {
  try {
    const diffResponse = await codebolt.git.diff(commitHash);
    if (diffResponse && typeof diffResponse === 'object') {
      if ('diff' in diffResponse) {
        return (diffResponse as { diff: string }).diff || '';
      }
      if ('data' in diffResponse) {
        return (diffResponse as { data: string }).data || '';
      }
      return JSON.stringify(diffResponse);
    }
    return '';
  } catch (error) {
    console.error('[SubmitMR] Failed to get diff:', error);
    return '';
  }
}

async function getChangedFiles(): Promise<string[]> {
  try {
    const statusResponse = await codebolt.git.status();
    const files: string[] = [];

    if (statusResponse && typeof statusResponse === 'object') {
      const status = statusResponse as unknown as {
        modified?: string[];
        added?: string[];
        deleted?: string[];
        untracked?: string[];
        staged?: string[];
        files?: Array<{ path?: string; file?: string }>;
        data?: { files?: Array<{ path?: string; file?: string }> };
      };

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

    return [...new Set(files)];
  } catch (error) {
    console.error('[SubmitMR] Failed to get status:', error);
    return [];
  }
}

// ================================
// REVIEW AGENT
// ================================

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

// ================================
// SUBMIT MERGE REQUEST
// ================================

/**
 * Submit a merge request for a completed job.
 *
 * Flow:
 *   1. Get git diff and changed files
 *   2. Create merge request via codebolt.reviewMergeRequest.create()
 *   3. Start background review agent
 */
export async function submitMergeRequest(
  job: JobOutput,
  ctx: AgentContext
): Promise<{ success: boolean; mergeRequestId?: string; error?: string }> {
  const projectPath = codebolt.project.getProjectPath();

  codebolt.chat.sendMessage(`📤 Getting changes for merge request...`);

  // Get diff
  const diffPatch = await getDiff('HEAD');
  if (!diffPatch) {
    return { success: false, error: `No changes found in project path: ${projectPath}` };
  }

  // Get changed files
  const majorFilesChanged = await getChangedFiles();

  const title = `[Swarm] ${job.name}`;
  const description = job.description || job.name;
  const initialTask = job.name;

  codebolt.chat.sendMessage(`📤 Creating merge request: ${title} (${majorFilesChanged.length} files changed)`);

  // Create the merge request
  const createResponse = await codebolt.reviewMergeRequest.create({
    type: 'review_merge',
    title,
    description,
    initialTask,
    majorFilesChanged,
    diffPatch,
    agentId: ctx.agentId,
    agentName: ctx.agentName,
    swarmId: ctx.swarmId
  });

  if (!createResponse || !createResponse.request) {
    return { success: false, error: 'Failed to create merge request' };
  }

  const mergeRequest = createResponse.request;
  codebolt.chat.sendMessage(`✅ Merge request created: ${mergeRequest.id}`);

  // Start review agent in background
  codebolt.chat.sendMessage(`🔍 Starting review agent...`);

  const reviewResult = await startReviewAgent(
    mergeRequest.id,
    {
      title: mergeRequest.title,
      description: mergeRequest.description,
      diffPatch: mergeRequest.diffPatch
    }
  );

  if (reviewResult.threadId) {
    codebolt.chat.sendMessage(`🔍 Review agent started: ${reviewResult.threadId}`);
  } else {
    codebolt.chat.sendMessage(`⚠️ Could not start review agent: ${reviewResult.error}`);
  }

  return { success: true, mergeRequestId: mergeRequest.id };
}
