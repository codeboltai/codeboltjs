import codebolt from '@codebolt/codeboltjs';
import { CodeboltAgent } from '@codebolt/agent/unified';
import { FlatUserMessage } from "@codebolt/types/sdk";

codebolt.onMessage(async (reqMessage: FlatUserMessage): Promise<void> => {
    try {
        codebolt.chat.sendMessage("Reviewer Agent started...", {});

        const userMessage = reqMessage.userMessage || '';
        // Match "Review MR {id}"
        const mrIdMatch = userMessage.match(/Review MR ([\w-]+)/i);
        const mrId =  mrIdMatch ? mrIdMatch[1] : null;

        if (!mrId) {
            codebolt.chat.sendMessage("Could not find MR ID in the task message. Please provide 'Review MR <id>'.", {});
            return;
        }

        codebolt.chat.sendMessage(`DEBUG: User message received: "${userMessage}"`, {});
        codebolt.chat.sendMessage(`Fetching details for MR ID: "${mrId}"`, {});

        // Fetch MR details
        let mrData;
        try {
            const response:any = await codebolt.reviewMergeRequest.get(mrId);
            mrData = response.data.request;
            codebolt.chat.sendMessage(`MR details: ${JSON.stringify(mrData)}`, {});

        } catch (e) {
            codebolt.chat.sendMessage(`Failed to fetch MR: ${e}`, {});
            return;
        }

        if (!mrData) {
            codebolt.chat.sendMessage(`MR ${mrId} not found.`, {});
            return;
        }

        const diffPatch = mrData.diffPatch || '';
        const title = mrData.title;
        const description = mrData.description;

        const reviewTask = `
Please review the following Merge Request:
ID: ${mrId}
Title: ${title}
Description: ${description}

Changes (Diff):
\`\`\`diff
${diffPatch.substring(0, 50000)}
\`\`\`
(Diff truncated to 50k chars if longer)

Provide a code review. 
Start with a summary.
Then list specific findings.
End with a CONCLUSION: [APPROVE | REQUEST_CHANGES].
`;

        // Use High-Level CodeboltAgent
        const agent = new CodeboltAgent({
            instructions: `
You are an automated Code Reviewer Agent.
Your task is to review Merge Requests (MRs) based on the provided diff and context.
Analyze the code changes, identify bugs/issues, and provide constructive feedback.
If the code looks good, strictly APPROVE it.
If there are issues, REQUEST_CHANGES and list them.
Be concise and professional.
            `,
            enableLogging: true
        });

        const result = await agent.processMessage({
            ...reqMessage,
            userMessage: reviewTask
        });

        if (result.success && result.result) {
            // The result of the agent loop (last message content usually)
            // We might need to inspect result structure. 
            // AgentResult usually contains 'message' or 'finalMessage'. 
            // Based on skill: "return execResult!.finalMessage;" which is FlatUserMessage-like or string?
            // Actually skill says: "if (result.success) { console.log('Result:', result.result); }"
            // Let's assume result.result is the string response or object containing it.

            // Inspecting types shows AgentResult might handle this. 
            // Use a safe check.
            const reviewContent = typeof result.result === 'string' ? result.result : JSON.stringify(result.result);

            // Parse decision
            let status: 'approve' | 'request_changes' | 'comment' = 'comment';
            if (reviewContent.includes("CONCLUSION: APPROVE")) {
                status = 'approve';
            } else if (reviewContent.includes("CONCLUSION: REQUEST_CHANGES")) {
                status = 'request_changes';
            }

            codebolt.chat.sendMessage(`Posting review for ${mrId} as ${status}...`, {});

            await codebolt.reviewMergeRequest.addReview(mrId, {
                comment: reviewContent,
                type: status,
                agentId: 'reviewer-agent',
                agentName: 'Reviewer Agent'
            });

            codebolt.chat.sendMessage("Review posted successfully.", {});
        } else {
            codebolt.chat.sendMessage(`Review generation failed: ${result.error}`, {});
        }

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        codebolt.chat.sendMessage(`Reviewer Agent error: ${errorMessage}`, {});
        console.error(error);
    }
});
