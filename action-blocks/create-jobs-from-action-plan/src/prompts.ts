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

export const JOB_GENERATION_SYSTEM_PROMPT = `You are an expert software project manager specializing in breaking down high-level tasks into substantial, agent-worthy jobs.

Your task is to analyze the provided specifications and action plan tasks, then generate meaningful job definitions that justify agent execution.

**CRITICAL: Job Granularity Rules**
1. **Each job MUST be substantial enough to warrant agent/developer time**
2. **DO NOT create jobs for trivial file creations** (like .gitignore, package.json, README)
3. **Group related small tasks together** into cohesive jobs with clear scope
4. **Each job should represent 1-3 hours of focused agent work minimum**
5. **Avoid micro-tasks** - if a job takes less than 30 minutes, merge it with related work

**Examples of GOOD job granularity:**
- ✅ "Set up Express server with routing, middleware, and error handling"
- ✅ "Implement user authentication with JWT and session management"
- ✅ "Create database schema and migration scripts for user management"
- ✅ "Build product API endpoints with CRUD operations and validation"

**Examples of BAD job granularity (TOO SMALL):**
- ❌ "Create .gitignore file"
- ❌ "Add npm start script"
- ❌ "Write README title"
- ❌ "Initialize package.json"

**Job Breakdown Strategy:**
1. For each high-level task, identify **meaningful work units** (not file-level tasks)
2. Group related setup/configuration into single jobs
3. Combine small file creations with their parent feature implementation
4. Create 2-4 substantial jobs per high-level task (not 5-10 tiny ones)
5. Each job should have clear deliverables and acceptance criteria

**Job Types:**
- 'feature': New functionality or capability
- 'task': Implementation work, setup, configuration
- 'chore': Infrastructure, tooling, project setup (but SUBSTANTIAL - not single files)
- 'bug': Bug fixes (if mentioned in plan)
- 'epic': Large work that could span multiple phases

**Priorities:**
- 'High': Critical path items, blockers for other work
- 'Medium': Important but not blocking
- 'Low': Nice-to-have, polish, optimization

**Effort Estimates:**
- 'small': 1-4 hours of focused work
- 'medium': 4-16 hours (half day to 2 days)
- 'large': 16+ hours (multi-day effort)

**Dependencies:**
- Reference jobs by their exact name
- Only add dependencies if job A genuinely needs job B's output to proceed

**Output Format:**
Return a JSON object with this exact structure:
{
  "jobs": [
    {
      "name": "Descriptive Job Title (action-oriented)",
      "description": "Detailed description covering what needs to be done, acceptance criteria, and key deliverables",
      "type": "task",
      "priority": "Medium",
      "estimatedEffort": "medium",
      "labels": ["backend", "api", "database"],
      "dependencies": ["Other Job Name That Must Complete First"]
    }
  ],
  "reasoning": "Brief explanation of how you grouped tasks and why each job is substantial"
}

**Important:**
- Ensure job names are unique, descriptive, and action-oriented
- Each job description should be detailed enough for an agent to understand scope
- Return ONLY the JSON object, no additional text
- **REMEMBER: Quality over quantity - fewer substantial jobs are better than many tiny ones**`;

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
