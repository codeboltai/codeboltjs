// ================================
// MESSAGES AND PROMPTS
// ================================

export const MESSAGES = {
    READING_PLAN: (planPath: string) =>
        `📄 Reading requirement plan from "${planPath}"...`,

    EXTRACTING_SECTIONS: () =>
        `🔍 Extracting specs and action plan sections...`,

    FOUND_SECTIONS: (specsPath?: string, actionPlanId?: string) =>
        `✅ Found sections:\n  - Specs: ${specsPath || 'Not found'}\n  - Action Plan: ${actionPlanId || 'Not found'}`,

    READING_SPECS: (specsPath: string) =>
        `📋 Reading specs from "${specsPath}"...`,

    READING_ACTION_PLAN: (planId: string) =>
        `📊 Fetching action plan "${planId}"...`,

    GENERATING_JOBS: (taskCount: number) =>
        `🤖 Using LLM to generate jobs from ${taskCount} high-level task(s)...`,

    CREATING_GROUP: (groupName: string) =>
        `📦 Creating job group "${groupName}"...`,

    GROUP_CREATED: (groupId: string) =>
        `✅ Job group created: ${groupId}`,

    CREATING_JOBS: (count: number) =>
        `⚙️ Creating ${count} job(s)...`,

    JOB_CREATED: (jobName: string, index: number, total: number) =>
        `✅ Created job ${index}/${total}: "${jobName}"`,

    ADDING_DEPENDENCIES: () =>
        `🔗 Setting up job dependencies...`,

    COMPLETE_SUCCESS: (jobCount: number, groupId: string) =>
        `🎉 Successfully created ${jobCount} job(s) in group ${groupId}!`,

    NO_SPECS_SECTION: () =>
        `⚠️ Warning: No specs-link section found in requirement plan`,

    NO_ACTION_PLAN_SECTION: () =>
        `❌ Error: No actionplan-link section found in requirement plan`,

    NO_TASKS: (planId: string) =>
        `ℹ️ Action plan "${planId}" has no tasks`,

    ERROR_READING_PLAN: (error: string) =>
        `❌ Failed to read requirement plan: ${error}`,

    ERROR_READING_SPECS: (error: string) =>
        `❌ Failed to read specs file: ${error}`,

    ERROR_READING_ACTION_PLAN: (error: string) =>
        `❌ Failed to fetch action plan: ${error}`,

    ERROR_LLM_GENERATION: (error: string) =>
        `❌ LLM job generation failed: ${error}`,

    ERROR_GROUP_CREATION: (error: string) =>
        `❌ Failed to create job group: ${error}`,

    ERROR_JOB_CREATION: (jobName: string, error: string) =>
        `❌ Failed to create job "${jobName}": ${error}`,
};

// ================================
// LLM SYSTEM PROMPTS
// ================================

export const JOB_GENERATION_SYSTEM_PROMPT = `You are an expert software project manager specializing in breaking down high-level tasks into granular, actionable jobs.

Your task is to analyze the provided specifications and action plan tasks, then generate detailed job definitions with proper dependencies.

**Guidelines:**
1. Break down each high-level task into 2-5 granular jobs
2. Each job should be specific and actionable
3. Assign appropriate job types: 'bug', 'feature', 'task', 'epic', or 'chore'
4. Set realistic priorities: 'High', 'Medium', or 'Low'
5. Estimate effort: 'small' (< 4 hours), 'medium' (4-16 hours), or 'large' (> 16 hours)
6. Identify dependencies between jobs (use job names for references)
7. Add relevant labels for categorization

**Output Format:**
Return a JSON object with this exact structure:
{
  "jobs": [
    {
      "name": "Job Title",
      "description": "Detailed description of what needs to be done",
      "type": "task",
      "priority": "Medium",
      "estimatedEffort": "medium",
      "labels": ["backend", "api"],
      "dependencies": ["Other Job Name"]
    }
  ],
  "reasoning": "Brief explanation of the breakdown strategy"
}

**Important:**
- Ensure job names are unique and descriptive
- Dependencies must reference exact job names from the same list
- Return ONLY the JSON object, no additional text`;

export function buildJobGenerationPrompt(
    specsContent: string,
    actionPlanTasks: { name: string; description?: string; priority?: string }[]
): string {
    return `## Specifications

${specsContent}

## High-Level Tasks from Action Plan

${actionPlanTasks.map((task, i) => `
### Task ${i + 1}: ${task.name}
Description: ${task.description || 'No description'}
Priority: ${task.priority || 'Not specified'}
`).join('\n')}

## Instructions

Based on the specifications and high-level tasks above, generate a comprehensive list of granular jobs with proper dependencies. Break down each task into specific, actionable jobs that a developer can execute.`;
}
