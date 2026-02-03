import codebolt from '@codebolt/codeboltjs';
import { JobDetails, AffectedFile, StructureChange, LLMAnalysisResult } from './types';
import { parseJsonFromLLMResponse, getProjectContext } from './helpers';
import {
    AFFECTED_FILES_ANALYZER_PROMPT,
    STRUCTURE_CHANGE_ANALYZER_PROMPT
} from './prompts';

// ================================
// LLM-BASED AFFECTED FILES ANALYSIS
// ================================

export async function analyzeAffectedFilesWithLLM(
    jobDetails: JobDetails,
    specsFilePath?: string
): Promise<LLMAnalysisResult<AffectedFile[]>> {
    try {
        codebolt.chat.sendMessage("Analyzing job and specification to identify affected files using AI...", {});

        const projectContext = await getProjectContext();

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

        const prompt = AFFECTED_FILES_ANALYZER_PROMPT
            .replace('{{JOB_TITLE}}', jobDetails.title)
            .replace('{{JOB_DESCRIPTION}}', jobDetails.description)
            .replace('{{JOB_REQUIREMENTS}}', jobDetails.requirements.join('\n'))
            .replace('{{JOB_TAGS}}', (jobDetails.tags || []).join(', '))
            .replace('{{PROJECT_CONTEXT}}', projectContext)
            .replace('{{PLAN_CONTEXT}}', planContext);

        const { completion } = await codebolt.llm.inference({
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: `Analyze the job and identify all files that will be affected. Return a JSON array of affected files.` }
            ],
            full: true,
            tools: []
        });

        if (!completion || !completion.choices) {
            return { success: false, error: 'LLM inference failed' };
        }

        const llmContent = completion.choices[0].message.content;
        const affectedFiles = parseJsonFromLLMResponse<AffectedFile[]>(llmContent);

        if (!affectedFiles || !Array.isArray(affectedFiles)) {
            return { success: false, error: 'Failed to parse affected files from LLM response' };
        }

        codebolt.chat.sendMessage(`Identified ${affectedFiles.length} potentially affected files`, {});

        return { success: true, data: affectedFiles };
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
    affectedFiles: AffectedFile[]
): Promise<LLMAnalysisResult<StructureChange[]>> {
    try {
        codebolt.chat.sendMessage("Analyzing if project structure changes are needed...", {});

        const projectContext = await getProjectContext();
        const affectedFilesList = affectedFiles.map(f => `- ${f.path} (${f.changeType}): ${f.reason}`).join('\n');

        const prompt = STRUCTURE_CHANGE_ANALYZER_PROMPT
            .replace('{{JOB_TITLE}}', jobDetails.title)
            .replace('{{JOB_DESCRIPTION}}', jobDetails.description)
            .replace('{{AFFECTED_FILES}}', affectedFilesList)
            .replace('{{PROJECT_CONTEXT}}', projectContext);

        const { completion } = await codebolt.llm.inference({
            messages: [
                { role: 'system', content: prompt },
                { role: 'user', content: `Analyze if the project needs structural changes to implement this job. Return a JSON object with "needsChanges" boolean and "changes" array.` }
            ],
            full: true,
            tools: []
        });

        if (!completion || !completion.choices) {
            return { success: false, error: 'LLM inference failed' };
        }

        const llmContent = completion.choices[0].message.content;
        const result = parseJsonFromLLMResponse<{ needsChanges: boolean; changes: StructureChange[] }>(llmContent);

        if (!result) {
            return { success: false, error: 'Failed to parse structure changes from LLM response' };
        }

        if (result.needsChanges && result.changes && result.changes.length > 0) {
            codebolt.chat.sendMessage(`Identified ${result.changes.length} structural changes needed`, {});
            return { success: true, data: result.changes };
        }

        codebolt.chat.sendMessage("No structural changes required", {});
        return { success: true, data: [] };
    } catch (error) {
        console.error('Error analyzing structure changes:', error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}
