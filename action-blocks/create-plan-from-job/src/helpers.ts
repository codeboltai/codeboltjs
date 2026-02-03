import codebolt from '@codebolt/codeboltjs';
import { JobDetails } from './types';

// ================================
// HELPER FUNCTIONS
// ================================

export async function getJobDetails(jobId: string): Promise<JobDetails | null> {
    try {
        codebolt.chat.sendMessage(`Retrieving job details for job ID: ${jobId}`, {});

        const response = await codebolt.job.getJob(jobId);

        if (!response || !response.job) {
            throw new Error('Failed to retrieve job details');
        }

        const jobData = response.job;

        return {
            id: jobData.id,
            title: jobData.name,
            description: jobData.description || '',
            requirements: [],
            priority: jobData.priority === 1 ? 'low' : jobData.priority === 2 ? 'medium' : jobData.priority === 3 ? 'high' : 'critical',
            status: jobData.status,
            assignedTo: jobData.assignees?.[0],
            dueDate: jobData.dueDate,
            tags: jobData.labels,
            dependencies: jobData.dependencies?.map(d => d.targetJobId) || [],
            estimatedHours: undefined,
            environmentId: undefined
        };
    } catch (error) {
        console.error('Error retrieving job details:', error);
        codebolt.chat.sendMessage(`Error retrieving job details: ${error instanceof Error ? error.message : 'Unknown error'}`, {});
        return null;
    }
}

export function parseJsonFromLLMResponse<T>(content: string): T | null {
    try {
        let jsonStr = content;

        // Extract JSON from markdown code blocks
        const jsonBlockMatch = content.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonBlockMatch) {
            jsonStr = jsonBlockMatch[1];
        } else {
            const codeBlockMatch = content.match(/```\s*([\s\S]*?)\s*```/);
            if (codeBlockMatch) {
                jsonStr = codeBlockMatch[1];
            }
        }

        // Try to find JSON object or array in the response
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
        if (jsonMatch) {
            jsonStr = jsonMatch[0];
        }

        return JSON.parse(jsonStr.trim()) as T;
    } catch (e) {
        console.error('JSON parse error:', e);
        return null;
    }
}

export async function getProjectContext(): Promise<string> {
    try {
        const projectInfo = await codebolt.project.getProjectPath();
        const projectPath = projectInfo?.projectPath || '';

        // Get directory structure
        let directoryStructure = '';
        try {
            const listResult = await codebolt.fs.listDirectory({ path: projectPath });
            if (listResult.entries) {
                directoryStructure = listResult.entries
                    .map((entry: any) => `${entry.isDirectory ? '📁' : '📄'} ${entry.name}`)
                    .join('\n');
            }
        } catch (e) {
            console.log('Could not list directory:', e);
        }

        // Try to read package.json for project info
        let packageInfo = '';
        try {
            const packageJson = await codebolt.fs.readFile(`${projectPath}/package.json`);
            if (packageJson.content) {
                const pkg = JSON.parse(packageJson.content);
                packageInfo = `Project: ${pkg.name || 'Unknown'}\nDescription: ${pkg.description || 'N/A'}\nDependencies: ${Object.keys(pkg.dependencies || {}).slice(0, 10).join(', ')}`;
            }
        } catch (e) {
            console.log('No package.json found');
        }

        return `
Project Path: ${projectPath}
${packageInfo}

Directory Structure:
${directoryStructure}
`.trim();
    } catch (error) {
        console.error('Error getting project context:', error);
        return '';
    }
}

export async function findLatestSpecsFile(): Promise<string | null> {
    const { projectPath } = await codebolt.project.getProjectPath();
    const specsDir = `${projectPath}/specs`;

    try {
        const result = await codebolt.fs.listDirectory({ path: specsDir });
        const entries = result.entries || [];

        if (entries.length === 0) {
            return null;
        }

        // Filter for .specs files
        const specsFiles = entries
            .filter((entry: any) => {
                const name = entry.name || entry;
                return name?.endsWith('.specs');
            })
            .map((entry: any) => entry.name || entry);

        if (specsFiles.length === 0) {
            return null;
        }

        // Return the latest specs file (last in list)
        const latestSpecsFile = specsFiles[specsFiles.length - 1];
        return `${specsDir}/${latestSpecsFile}`;
    } catch (error) {
        console.error('Error finding specs files:', error);
        return null;
    }
}
