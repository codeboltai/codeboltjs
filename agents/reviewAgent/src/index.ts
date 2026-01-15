import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";

interface ReviewDecision {
  decision: 'approve' | 'request_changes' | 'comment';
  comment: string;
  newStatus?: 'approved' | 'changes_requested' | 'review_completed' | 'in_review';
}

// ================================
// HELPER FUNCTIONS (from swarmAgent pattern)
// ================================

function parseJson<T>(response: string): T | null {
  try {
    // Try to extract JSON from response
    let jsonStr = response.replace(/```json\n?|\n?```/g, '').trim();

    // Try to find JSON object in the response
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      jsonStr = jsonMatch[0];
    }

    return JSON.parse(jsonStr) as T;
  } catch (e) {
    codebolt.chat.sendMessage(`Parse error: ${e}`);
    return null;
  }
}

async function llm(systemPrompt: string, userPrompt: string): Promise<string> {
  const res = await codebolt.llm.inference({
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
    llmrole: 'default',
  });
  return res.completion?.choices?.[0]?.message?.content || '';
}

/**
 * Call LLM with retry for JSON parsing
 * If parsing fails, sends the error back to LLM to fix the JSON
 */
async function llmWithJsonRetry<T>(
  systemPrompt: string,
  userPrompt: string,
  maxRetries: number = 3
): Promise<T | null> {
  let lastResponse = '';
  let lastError = '';

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    let currentPrompt = userPrompt;

    // If this is a retry, include the error feedback
    if (attempt > 1 && lastError) {
      currentPrompt = `${userPrompt}

IMPORTANT: Your previous response was not valid JSON. 
Error: ${lastError}
Your response was: ${lastResponse.substring(0, 500)}...

Please respond with ONLY a valid JSON object. No markdown, no explanation, just the JSON.`;
    }

    const response = await llm(systemPrompt, currentPrompt);
    lastResponse = response;

    const parsed = parseJson<T>(response);
    if (parsed) {
      return parsed;
    }

    // Store error for next retry
    try {
      JSON.parse(response);
    } catch (e) {
      lastError = e instanceof Error ? e.message : 'Invalid JSON format';
    }

    codebolt.chat.sendMessage(`⚠️ JSON parse failed (attempt ${attempt}/${maxRetries}), retrying...`);
  }

  codebolt.chat.sendMessage(`❌ Failed to get valid JSON after ${maxRetries} attempts`);
  return null;
}

// ================================
// REVIEW LOGIC
// ================================

const REVIEW_SYSTEM_PROMPT = `You are a senior code reviewer. Analyze the provided diff patch and make a review decision.

Your response MUST be a valid JSON object with the following structure:
{
  "decision": "approve" | "request_changes" | "comment",
  "comment": "Your detailed review comment explaining your decision"
}

Guidelines:
- "approve": Use when the code is well-written, follows best practices, and is ready to merge
- "request_changes": Use when there are issues that must be fixed before merging (security issues, bugs, bad practices)
- "comment": Use when you want to provide feedback but the decision is not clear-cut

Consider:
1. Code quality and readability
2. Security vulnerabilities
3. Error handling
4. Best practices
5. Potential bugs
6. Performance concerns

Respond ONLY with the JSON object, no additional text.`;

/**
 * Create a task in the action plan for requested changes
 * @param request - The review merge request
 * @param reviewComment - The review comment explaining what needs to be changed
 */
async function createTaskForRequestedChanges(request: any, reviewComment: string): Promise<void> {
  try {
    codebolt.chat.sendMessage(`📝 Creating task for requested changes...`);

    // Get existing action plans to find the right one or create a new one
    const plansResponse: any = await codebolt.actionPlan.getAllPlans();
    let plans = plansResponse?.response?.data?.actionPlans || plansResponse?.data?.actionPlans || [];

    let targetPlanId: string;

    if (plans.length === 0) {
      // No action plans exist, create a new one
      codebolt.chat.sendMessage(`📋 Creating new action plan for review tasks...`);
      const createResponse: any = await codebolt.actionPlan.createActionPlan({
        name: 'Code Review Tasks',
        description: 'Tasks created from code review feedback',
        agentId: 'review-agent',
        agentName: 'Review Agent',
        status: 'active'
      });

      targetPlanId = createResponse?.response?.data?.actionPlan?.planId
        || createResponse?.data?.actionPlan?.planId
        || createResponse?.actionPlan?.planId;

      if (!targetPlanId) {
        codebolt.chat.sendMessage(`⚠️ Could not create action plan`);
        return;
      }
    } else {
      // Use the first available action plan
      targetPlanId = plans[0].planId;
    }

    // Create a task for the requested changes
    const task = {
      name: `Review Changes: ${request.title}`,
      description: `**Review Request ID:** ${request.id}\n\n**Requested Changes:**\n${reviewComment}\n\n**Files Affected:**\n${request.majorFilesChanged?.join('\n') || 'No files listed'}`,
      priority: 'high',
      status: 'pending',
      tags: ['code-review', 'changes-requested'],
      // Link back to the review request
      mentionedFiles: request.majorFilesChanged || []
    };

    const addTaskResponse: any = await codebolt.actionPlan.addTaskToActionPlan(targetPlanId, task);

    if (addTaskResponse?.response?.success || addTaskResponse?.success) {
      const taskName = addTaskResponse?.response?.data?.task?.name
        || addTaskResponse?.data?.task?.name
        || task.name;
      codebolt.chat.sendMessage(`✅ Created task: "${taskName}" in action plan`);

      // Link the job/task ID to the review request if available
      const taskId = addTaskResponse?.response?.data?.task?.taskId
        || addTaskResponse?.data?.task?.taskId;
      if (taskId) {
        await codebolt.reviewMergeRequest.addLinkedJob(request.id, taskId);
        codebolt.chat.sendMessage(`🔗 Linked task ${taskId} to review request`);
      }
    } else {
      codebolt.chat.sendMessage(`⚠️ Failed to create task in action plan`);
    }

  } catch (error: any) {
    codebolt.chat.sendMessage(`⚠️ Error creating task for changes: ${error.message || error}`);
  }
}

async function reviewSingleRequest(request: any): Promise<void> {
  const agentId = 'review-agent';
  const agentName = 'Review Agent';

  codebolt.chat.sendMessage(`📋 Reviewing request: ${request.title} (${request.id})`);

  // Skip if already merged, closed, or rejected
  if (['merged', 'closed', 'rejected'].includes(request.status)) {
    codebolt.chat.sendMessage(`⏭️ Skipping ${request.id} - status is ${request.status}`);
    return;
  }

  // Prepare the prompt for LLM
  const reviewPrompt = `
## Review Request: ${request.title}

### Initial Task
${request.initialTask}

### Description
${request.description}

### Files Changed
${request.majorFilesChanged.join(', ')}

### Diff Patch
\`\`\`diff
${request.diffPatch}
\`\`\`

### Issues Faced
${request.issuesFaced?.length ? request.issuesFaced.join('\n') : 'None reported'}

### Remaining Tasks
${request.remainingTasks?.length ? request.remainingTasks.join('\n') : 'None reported'}

Please review this code change and provide your decision.
`;

  try {
    // Call LLM for review with JSON retry
    const reviewDecision = await llmWithJsonRetry<ReviewDecision>(
      REVIEW_SYSTEM_PROMPT,
      reviewPrompt,
      3
    );

    if (!reviewDecision) {
      codebolt.chat.sendMessage(`❌ Failed to get valid review decision from LLM`);
      return;
    }

    // Add review feedback
    await codebolt.reviewMergeRequest.addReview(request.id, {
      agentId,
      agentName,
      type: reviewDecision.decision,
      comment: reviewDecision.comment
    });

    codebolt.chat.sendMessage(`✅ Added review feedback: ${reviewDecision.decision}`);

    // Update status based on decision
    let newStatus: string;
    switch (reviewDecision.decision) {
      case 'approve':
        newStatus = 'approved';
        break;
      case 'request_changes':
        newStatus = 'changes_requested';
        // Create a task in Action Plan for the requested changes
        await createTaskForRequestedChanges(request, reviewDecision.comment);
        break;
      default:
        newStatus = 'review_completed';
    }

    await codebolt.reviewMergeRequest.updateStatus(request.id, newStatus as any);
    codebolt.chat.sendMessage(`📊 Updated status to: ${newStatus}`);

  } catch (error: any) {
    codebolt.chat.sendMessage(`❌ Error reviewing ${request.id}: ${error.message || error}`);
  }

}

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
  codebolt.chat.sendMessage("🚀 Starting Review Agent");

  try {
    // Get all pending review requests
    const pendingResponse: any = await codebolt.reviewMergeRequest.pending();
    codebolt.chat.sendMessage(`Pending requests: ${JSON.stringify(pendingResponse)}`);
    const pendingRequests = pendingResponse?.data?.requests || [];

    if (pendingRequests.length === 0) {
      codebolt.chat.sendMessage("📭 No pending review requests found");
      return;
    }

    codebolt.chat.sendMessage(`📬 Found ${pendingRequests.length} pending review request(s)`);

    // Process the first pending request
    const requestToReview = pendingRequests[0];
    await reviewSingleRequest(requestToReview);

    codebolt.chat.sendMessage("✅ Review Agent completed");

  } catch (error: any) {
    codebolt.chat.sendMessage(`❌ Error in Review Agent: ${error.message || error}`);
  }
});
