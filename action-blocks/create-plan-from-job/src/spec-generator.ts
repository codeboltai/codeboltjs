import codebolt from '@codebolt/codeboltjs';
import { CodeboltAgent } from '@codebolt/agent/unified';
import { JobDetails, PlanResult } from './types';
import { findLatestSpecsFile } from './helpers';
import { PLAN_GENERATOR_SYSTEM_PROMPT } from './prompts';

// ================================
// SPECIFICATION GENERATION WITH AGENT LOOP
// ================================

export async function generateSpecWithAgentLoop(jobDetails: JobDetails): Promise<PlanResult> {
    try {
        codebolt.chat.sendMessage(`Creating specification for job: ${jobDetails.title}`, {});

        const userMessage = `Create a detailed implementation specification for the following job:

## Job Details
- **Title:** ${jobDetails.title}
- **Description:** ${jobDetails.description}
- **Priority:** ${jobDetails.priority}
- **Requirements:** ${jobDetails.requirements.length > 0 ? jobDetails.requirements.map(req => `\n  - ${req}`).join('') : 'None specified'}
- **Tags:** ${(jobDetails.tags || []).join(', ') || 'None'}
- **Dependencies:** ${(jobDetails.dependencies || []).join(', ') || 'None'}

Please analyze the codebase, understand the current project structure, and create a comprehensive implementation specification. The specification should be detailed, follow best practices, and consider the project's existing architecture.`;

        // Use CodeboltAgent to handle the agent loop (uses default processors)
        const agent = new CodeboltAgent({
            instructions: PLAN_GENERATOR_SYSTEM_PROMPT
        });

        const result = await agent.processMessage(userMessage);

        if (!result.success) {
            return { success: false, error: result.error || 'Agent execution failed', context: null };
        }

        // Find the specs file that was created
        const specsFilePath = await findLatestSpecsFile();

        if (!specsFilePath) {
            return { success: false, error: 'Failed to create specification file', context: result.context };
        }

        codebolt.chat.sendMessage(`Specification created: ${specsFilePath}`, {});
        return { success: true, specsFilePath, context: result.context };
    } catch (error) {
        console.error('Error creating specification:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
