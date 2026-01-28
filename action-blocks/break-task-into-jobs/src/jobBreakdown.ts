import codebolt from '@codebolt/codeboltjs';
import { TaskToBreakdown, ActionPlan, ExistingJob, SubJobDefinition, LLMBreakdownResponse } from './types';
import { TASK_BREAKDOWN_SYSTEM_PROMPT, buildTaskBreakdownPrompt } from './prompts';

/**
 * Uses LLM to break down a task into sub-jobs
 */
export async function breakdownTask(
    task: TaskToBreakdown,
    plan: ActionPlan,
    existingJobs: ExistingJob[] = []
): Promise<SubJobDefinition[]> {
    try {
        // Build the prompt
        const userPrompt = buildTaskBreakdownPrompt(
            task,
            plan,
            existingJobs.map(j => ({ name: j.name, taskName: j.taskName }))
        );

        // Call LLM for breakdown
        const { completion } = await codebolt.llm.inference({
            messages: [
                { role: 'system', content: TASK_BREAKDOWN_SYSTEM_PROMPT },
                { role: 'user', content: userPrompt }
            ]
        });

        // Parse the response
        const content = completion?.choices?.[0]?.message?.content || '';
        const parsed = parseBreakdownResponse(content);

        if (parsed.subJobs && parsed.subJobs.length > 0) {
            return validateAndNormalizeSubJobs(parsed.subJobs, task);
        }

        // Fallback: create a single job from the task
        console.warn('[break-task-into-jobs] LLM returned no sub-jobs, using fallback');
        return createFallbackSubJobs(task);

    } catch (error) {
        console.error('[break-task-into-jobs] LLM breakdown failed:', error);
        return createFallbackSubJobs(task);
    }
}

/**
 * Parses LLM response to extract sub-jobs
 */
function parseBreakdownResponse(content: string): LLMBreakdownResponse {
    try {
        // Try to parse as JSON
        const parsed = JSON.parse(content);
        return parsed as LLMBreakdownResponse;
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
        const objectMatch = content.match(/\{[\s\S]*"subJobs"[\s\S]*\}/);
        if (objectMatch) {
            try {
                return JSON.parse(objectMatch[0]);
            } catch {
                // Fall through
            }
        }

        return { subJobs: [] };
    }
}

/**
 * Validates and normalizes sub-jobs from LLM
 */
function validateAndNormalizeSubJobs(
    subJobs: Partial<SubJobDefinition>[],
    task: TaskToBreakdown
): SubJobDefinition[] {
    const validTypes = ['bug', 'feature', 'task', 'epic', 'chore'];
    const validEfforts = ['small', 'medium', 'large'];
    const taskPriority = mapPriority(task.priority);

    return subJobs
        .filter(job => job.name && job.description)
        .map((job, index) => ({
            name: job.name || `${task.name} - Step ${index + 1}`,
            description: job.description || '',
            type: (validTypes.includes(job.type || '') ? job.type : 'task') as SubJobDefinition['type'],
            priority: (typeof job.priority === 'number' && job.priority >= 1 && job.priority <= 4
                ? job.priority
                : taskPriority) as 1 | 2 | 3 | 4,
            estimatedEffort: (validEfforts.includes(job.estimatedEffort || '')
                ? job.estimatedEffort
                : 'medium') as SubJobDefinition['estimatedEffort'],
            internalDependencies: Array.isArray(job.internalDependencies) ? job.internalDependencies : [],
            externalDependencies: Array.isArray(job.externalDependencies) ? job.externalDependencies : [],
            labels: Array.isArray(job.labels) ? job.labels : []
        }));
}

/**
 * Creates fallback sub-jobs when LLM fails
 */
function createFallbackSubJobs(task: TaskToBreakdown): SubJobDefinition[] {
    const priority = mapPriority(task.priority);

    return [
        {
            name: `Implement: ${task.name}`,
            description: task.description,
            type: 'task',
            priority,
            estimatedEffort: 'medium',
            internalDependencies: [],
            externalDependencies: [],
            labels: []
        }
    ];
}

/**
 * Maps task priority string to job priority number
 */
function mapPriority(priority?: string): 1 | 2 | 3 | 4 {
    switch (priority?.toLowerCase()) {
        case 'high':
            return 2;
        case 'medium':
            return 3;
        case 'low':
            return 4;
        default:
            return 3;
    }
}
