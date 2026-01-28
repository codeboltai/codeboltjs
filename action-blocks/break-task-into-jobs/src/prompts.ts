// ================================
// LLM PROMPTS FOR TASK BREAKDOWN
// ================================

export const TASK_BREAKDOWN_SYSTEM_PROMPT = `You are an expert software architect who breaks down tasks into discrete, implementable sub-jobs.

Your goal is to analyze a task and break it into smaller, independent work units that can be executed by separate worker agents.

## Guidelines for Breaking Down Tasks

1. **Granularity**: Each sub-job should be:
   - Completable in a single focused session
   - Testable independently
   - Clear in scope and deliverables

2. **Sub-job Types**:
   - 'task': General implementation work
   - 'feature': New functionality
   - 'bug': Bug fix or issue resolution
   - 'chore': Configuration, setup, or maintenance
   - 'epic': Only for very large items that need further breakdown

3. **Priority Mapping**:
   - 1: Urgent/Blocking (needed immediately)
   - 2: High (should be done soon)
   - 3: Medium (normal priority)
   - 4: Low (can wait)

4. **Effort Estimation**:
   - 'small': < 1 hour of focused work
   - 'medium': 1-4 hours of work
   - 'large': 4+ hours (consider further breakdown)

5. **Dependencies**:
   - Identify which sub-jobs depend on others
   - Use internalDependencies for sub-jobs within this task
   - Use externalDependencies for jobs from other tasks

6. **Best Practices**:
   - Start with setup/configuration jobs if needed
   - Group related functionality together
   - End with integration/testing jobs
   - Keep each sub-job focused on one concern

## Output Format

Return a JSON object with:
{
  "subJobs": [
    {
      "name": "Short descriptive name",
      "description": "Detailed description of what needs to be implemented",
      "type": "task|feature|bug|chore|epic",
      "priority": 1-4,
      "estimatedEffort": "small|medium|large",
      "internalDependencies": ["name of other sub-job if dependent"],
      "labels": ["optional", "labels"]
    }
  ],
  "reasoning": "Brief explanation of the breakdown strategy"
}`;

export function buildTaskBreakdownPrompt(
    task: { name: string; description: string; priority?: string; dependencies?: string[] },
    plan: { name: string; description: string },
    existingJobs: { name: string; taskName?: string }[]
): string {
    const existingJobsList = existingJobs.length > 0
        ? existingJobs.map(j => `- ${j.name}${j.taskName ? ` (from task: ${j.taskName})` : ''}`).join('\n')
        : 'None';

    return `## Context

**Project/Plan**: ${plan.name}
${plan.description}

**Existing Jobs** (for dependency reference):
${existingJobsList}

## Task to Break Down

**Name**: ${task.name}
**Description**: ${task.description}
**Priority**: ${task.priority || 'Medium'}
**Declared Dependencies**: ${task.dependencies?.join(', ') || 'None'}

## Instructions

Break this task into 2-6 sub-jobs that can be executed independently by worker agents.

Consider:
1. What setup or preparation is needed?
2. What are the core implementation steps?
3. What testing or validation is required?
4. Are there any integration points with existing jobs?

Provide your response as a valid JSON object.`;
}
