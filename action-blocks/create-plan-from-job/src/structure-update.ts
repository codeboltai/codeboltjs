import codebolt from '@codebolt/codeboltjs';
import { ActorType } from "@codebolt/types/sdk";
import { JobDetails, StructureChange } from './types';

// ================================
// PROJECT STRUCTURE UPDATE REQUEST
// ================================

export async function submitProjectStructureUpdate(
    jobDetails: JobDetails,
    structureChanges: StructureChange[],
    agentId: string
): Promise<string | null> {
    try {
        if (structureChanges.length === 0) {
            return null;
        }

        codebolt.chat.sendMessage("Submitting project structure update request...", {});

        const projectInfo = await codebolt.project.getProjectPath();
        const projectPath = projectInfo?.projectPath;

        if (!projectPath) {
            codebolt.chat.sendMessage("Project path not available, skipping structure update", {});
            return null;
        }

        const authorType: ActorType = 'agent';

        const changesSummary = structureChanges
            .map(c => `- ${c.type}: ${c.path}${c.newPath ? ` → ${c.newPath}` : ''} (${c.reason})`)
            .join('\n');

        const updateData = {
            title: `Project Structure Update for: ${jobDetails.title}`,
            description: `Automated project structure update request based on job requirements.\n\nJob: ${jobDetails.title}\n\nProposed Changes:\n${changesSummary}`,
            author: agentId,
            authorType,
            changes: [] as any[] // Structure changes are documented in description
        };

        const response = await codebolt.projectStructureUpdateRequest.create(updateData, projectPath);

        if (response && response.success) {
            const updateId = response.data?.id ?? null;
            codebolt.chat.sendMessage(`Project structure update request created with ID: ${updateId}`, {});
            return updateId;
        } else {
            throw new Error(`Failed to create project structure update: ${response?.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error submitting project structure update:', error);
        codebolt.chat.sendMessage(`Error submitting project structure update: ${error instanceof Error ? error.message : 'Unknown error'}`, {});
        return null;
    }
}
