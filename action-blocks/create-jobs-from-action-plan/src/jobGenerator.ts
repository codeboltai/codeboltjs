import codebolt from '@codebolt/codeboltjs';
import { GeneratedJob, LLMJobBreakdownResponse } from './types';
import { JOB_GENERATION_SYSTEM_PROMPT, buildJobGenerationPrompt } from './prompts';

// ================================
// LLM JOB GENERATION
// ================================

/**
 * Uses LLM to generate granular jobs from specs and high-level tasks
 */
export async function generateJobsFromPlan(
    specsContent: string,
    actionPlanTasks: { name: string; description?: string; priority?: string }[]
): Promise<GeneratedJob[]> {
    try {
        const userPrompt = buildJobGenerationPrompt(specsContent, actionPlanTasks);

        const { completion } = await codebolt.llm.inference({
            messages: [
                { role: 'system', content: JOB_GENERATION_SYSTEM_PROMPT },
                { role: 'user', content: userPrompt }
            ],
            full: true,
            tools: []
        });

        if (completion?.choices?.[0]?.message?.content) {
            const parsed = parseJobBreakdownResponse(completion.choices[0].message.content);
            if (parsed && parsed.jobs && parsed.jobs.length > 0) {
                return validateAndNormalizeJobs(parsed.jobs);
            }
        }
    } catch (error) {
        console.error('[create-jobs-from-action-plan] LLM generation failed:', error);
    }

    // Fallback: create simple jobs from tasks
    return createFallbackJobs(actionPlanTasks);
}

// ================================
// PARSING AND VALIDATION
// ================================

/**
 * Parses LLM response to extract job breakdown
 */
function parseJobBreakdownResponse(content: string): LLMJobBreakdownResponse | null {
    try {
        // Try direct JSON parse
        const parsed = JSON.parse(content);
        return parsed as LLMJobBreakdownResponse;
    } catch {
        // Try to extract JSON from markdown code blocks
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
            try {
                return JSON.parse(jsonMatch[1].trim());
            } catch {
                // Fall through
            }
        }

        // Try to find JSON object in the content
        const objectMatch = content.match(/\{[\s\S]*"jobs"[\s\S]*\}/);
        if (objectMatch) {
            try {
                return JSON.parse(objectMatch[0]);
            } catch {
                // Fall through
            }
        }

        return null;
    }
}

/**
 * Validates and normalizes generated jobs
 */
function validateAndNormalizeJobs(jobs: Partial<GeneratedJob>[]): GeneratedJob[] {
    const validTypes: GeneratedJob['type'][] = ['bug', 'feature', 'task', 'epic', 'chore'];
    const validPriorities: GeneratedJob['priority'][] = ['High', 'Medium', 'Low'];
    const validEfforts: GeneratedJob['estimatedEffort'][] = ['small', 'medium', 'large'];

    return jobs
        .filter(job => job.name && job.description)
        .map((job, index) => ({
            name: job.name || `Job ${index + 1}`,
            description: job.description || '',
            type: (validTypes.includes(job.type as any) ? job.type : 'task') as GeneratedJob['type'],
            priority: (validPriorities.includes(job.priority as any) ? job.priority : 'Medium') as GeneratedJob['priority'],
            estimatedEffort: (validEfforts.includes(job.estimatedEffort as any) ? job.estimatedEffort : 'medium') as GeneratedJob['estimatedEffort'],
            labels: Array.isArray(job.labels) ? job.labels : [],
            dependencies: Array.isArray(job.dependencies) ? job.dependencies : []
        }));
}

/**
 * Creates fallback jobs when LLM fails
 */
function createFallbackJobs(
    tasks: { name: string; description?: string; priority?: string }[]
): GeneratedJob[] {
    return tasks.map(task => ({
        name: `Implement: ${task.name}`,
        description: task.description || task.name,
        type: 'task' as const,
        priority: mapPriority(task.priority),
        estimatedEffort: 'medium' as const,
        labels: [],
        dependencies: []
    }));
}

/**
 * Maps task priority to job priority
 */
function mapPriority(priority?: string): 'High' | 'Medium' | 'Low' {
    switch (priority?.toLowerCase()) {
        case 'high':
        case 'urgent':
        case '4':
            return 'High';
        case 'low':
        case '1':
            return 'Low';
        default:
            return 'Medium';
    }
}
