import codebolt from '@codebolt/codeboltjs';
import { CodeboltAgent } from '@codebolt/agent/unified';
import { ProcessedMessage } from '@codebolt/types/agent';
import { JobDetails, AffectedFile, StructureChange, LLMAnalysisResult } from './types';
import { parseJsonFromLLMResponse } from './helpers';
import {
    AFFECTED_FILES_ANALYZER_PROMPT,
    STRUCTURE_CHANGE_ANALYZER_PROMPT
} from './prompts';

// ================================
// LLM-BASED AFFECTED FILES ANALYSIS
// ================================

export async function analyzeAffectedFilesWithLLM(
    jobDetails: JobDetails,
    specsFilePath?: string,
    context?: ProcessedMessage | null
): Promise<LLMAnalysisResult<AffectedFile[]> & { context?: ProcessedMessage | null }> {
    try {
        codebolt.chat.sendMessage("Analyzing job and specification to identify affected files using AI...", {});

        // Try to get specs content if specsFilePath is provided
        let planContext = '';
        if (specsFilePath) {
            try {
                const specsContent = await codebolt.fs.readFile(specsFilePath);
                if (specsContent && specsContent.content) {
                    planContext = `\n\n## Implementation Specification\n${specsContent.content}`;
                }
            } catch (e) {
                console.log('Could not read specs file:', e);
            }
        }

        const userMessage = `Based on the implementation specification you just created, now analyze and identify all files that will be affected.

## Job Details
- **Title:** ${jobDetails.title}
- **Description:** ${jobDetails.description}
- **Requirements:** ${jobDetails.requirements.join('\n')}
- **Tags:** ${(jobDetails.tags || []).join(', ')}
${planContext}

Return a JSON array of affected files with the following structure:
[
  {
    "path": "relative/path/to/file",
    "reason": "why this file needs to be modified",
    "changeType": "modify" | "create" | "delete" | "rename",
    "priority": "low" | "medium" | "high",
    "confidence": 0.0-1.0
  }
]`;

        const agent = new CodeboltAgent({
            instructions: AFFECTED_FILES_ANALYZER_PROMPT,
            ...(context && { context })
            // allowedTools: ['readFile', 'listDirectory', 'searchFiles', 'getFileInfo'] // Uncomment after rebuilding @codebolt/agent
        });

        const result = await agent.processMessage(userMessage);

        if (!result.success) {
            return { success: false, error: result.error || 'Agent execution failed', context: result.context };
        }

        // Try to extract affected files from agent result
        const affectedFiles = parseJsonFromLLMResponse<AffectedFile[]>(JSON.stringify(result.result));

        if (!affectedFiles || !Array.isArray(affectedFiles)) {
            // If parsing fails, return empty array but continue with context
            codebolt.chat.sendMessage("Could not parse affected files, continuing with empty list", {});
            return { success: true, data: [], context: result.context };
        }

        codebolt.chat.sendMessage(`Identified ${affectedFiles.length} potentially affected files`, {});

        return { success: true, data: affectedFiles, context: result.context };
    } catch (error) {
        console.error('Error analyzing affected files:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

// ================================
// LLM-BASED STRUCTURE CHANGE ANALYSIS
// ================================

export async function analyzeStructureChangesWithLLM(
    jobDetails: JobDetails,
    affectedFiles: AffectedFile[],
    context?: ProcessedMessage | null
): Promise<LLMAnalysisResult<StructureChange[]> & { context?: ProcessedMessage | null }> {
    try {
        codebolt.chat.sendMessage("Analyzing if project structure changes are needed...", {});

        const affectedFilesList = affectedFiles.map(f => `- ${f.path} (${f.changeType}): ${f.reason}`).join('\n');

        const userMessage = `Based on the implementation specification and affected files analysis, now determine if any project structure changes are needed.

## Job Details
- **Title:** ${jobDetails.title}
- **Description:** ${jobDetails.description}

## Affected Files
${affectedFilesList || 'No specific files identified'}

Analyze if the project needs structural changes (new directories, new files, file moves, etc.) to implement this job.

Return a JSON object with the following structure:
{
  "needsChanges": boolean,
  "changes": [
    {
      "type": "create_directory" | "create_file" | "move_file" | "rename_file" | "delete_file",
      "path": "path/to/resource",
      "newPath": "new/path (if applicable)",
      "reason": "why this change is needed",
      "priority": "low" | "medium" | "high"
    }
  ]
}`;

        const agent = new CodeboltAgent({
            instructions: STRUCTURE_CHANGE_ANALYZER_PROMPT,
            ...(context && { context })
        });

        const result = await agent.processMessage(userMessage);

        if (!result.success) {
            return { success: false, error: result.error || 'Agent execution failed', context: result.context };
        }

        const parsed = parseJsonFromLLMResponse<{ needsChanges: boolean; changes: StructureChange[] }>(JSON.stringify(result.result));

        if (!parsed) {
            codebolt.chat.sendMessage("Could not parse structure changes, assuming none needed", {});
            return { success: true, data: [], context: result.context };
        }

        if (parsed.needsChanges && parsed.changes && parsed.changes.length > 0) {
            codebolt.chat.sendMessage(`Identified ${parsed.changes.length} structural changes needed`, {});
            return { success: true, data: parsed.changes, context: result.context };
        }

        codebolt.chat.sendMessage("No structural changes required", {});
        return { success: true, data: [], context: result.context };
    } catch (error) {
        console.error('Error analyzing structure changes:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
