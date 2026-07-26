// ================================
// LLM PROMPTS FOR TASK BREAKDOWN
// ================================

export const TASK_BREAKDOWN_SYSTEM_PROMPT = `You are an expert software architect who breaks down tasks into substantial, implementable jobs.

Your goal is to analyze a task and divide it into jobs. Each job will be assigned to a dedicated worker agent.

## KEY CONCEPT: Two Types of Jobs

**1. PARALLEL Jobs** - Jobs with NO dependencies run simultaneously by different agents
**2. SEQUENTIAL Jobs** - Jobs with dependencies wait for their dependencies to complete first

### How it works:
- Jobs with empty internalDependencies: [] → Start immediately, run in PARALLEL
- Jobs with internalDependencies: ["Job A"] → Wait for "Job A" to finish first (SEQUENTIAL)

### When to use each:
**PARALLEL** (no dependencies):
- Independent modules that don't share code/data
- Frontend + Backend work
- Multiple unrelated API endpoints
- Separate features with no shared state

**SEQUENTIAL** (with dependencies):
- API layer needs database schema first
- Integration tests need features implemented first
- Deployment needs build to complete first

## CRITICAL: Do NOT Create Micro-Tasks

**BAD examples (too granular - DO NOT create separate jobs):**
- "Create package.json"
- "Set up folder structure"
- "Install dependencies"
- "Create configuration files"
- "Write imports"

**GOOD examples (substantial, parallelizable jobs):**
- "Implement user authentication API" + "Implement user authentication UI" (can run in parallel)
- "Build product CRUD endpoints" + "Build order CRUD endpoints" (can run in parallel)
- "Create database schema and migrations" → "Build API layer" (sequential dependency)

## Guidelines for Creating Jobs

1. **Create Separate Jobs When**:
   - Work can run IN PARALLEL (independent modules, frontend/backend split, multiple features)
   - Work MUST happen sequentially due to real dependencies (use internalDependencies)
   - Different expertise domains are required

2. **Keep Together in ONE Job**:
   - Project setup + implementation (don't separate "create package.json")
   - Configuration + the feature using that configuration
   - Implementation + testing of that implementation

3. **Job Size**: Each job should be:
   - A complete, meaningful unit of work
   - Something worth assigning a dedicated agent to
   - Self-contained with clear deliverables
   - NOT a single file creation or tiny step
   - Strictly limited to the parent task; do not include adjacent or follow-up plan tasks

4. **Job Types**:
   - 'task': General implementation work
   - 'feature': New functionality
   - 'bug': Bug fix or issue resolution
   - 'chore': Configuration, setup, or maintenance
   - 'epic': Only for very large items that need further breakdown

5. **Priority Mapping**:
   - 1: Urgent/Blocking (needed immediately)
   - 2: High (should be done soon)
   - 3: Medium (normal priority)
   - 4: Low (can wait)

6. **Effort Estimation**:
   - 'small': 1-2 hours of focused work
   - 'medium': 2-6 hours of work
   - 'large': 6+ hours

7. **Dependencies**:
   - Only specify dependencies when absolutely required
   - Jobs without dependencies execute IN PARALLEL
   - Use internalDependencies for jobs within this task
   - Use externalDependencies for jobs from other tasks

8. **Best Practices**:
   - Ask yourself: "Is this really worth a separate agent?" before creating a job
   - One comprehensive job is better than multiple tiny ones
   - Each job description should be detailed enough for an agent to work independently
   - Each job description must explicitly say what is in scope and that the worker must not continue into other tasks from the larger plan
   - If completing a job requires out-of-scope work, the worker should report the needed follow-up instead of doing it

## Output Format

Return a JSON object with:
{
  "subJobs": [
    {
      "name": "Short descriptive name",
      "description": "Detailed description of what needs to be implemented, including explicit scope boundaries and out-of-scope instructions",
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

Break this task into jobs. Create both PARALLEL and SEQUENTIAL jobs as needed.

Every job MUST remain within this task only. Do not include work from other plan tasks, dependent future tasks, adjacent features, cleanup/polish tasks, or broader project work unless it is explicitly part of this task description.

**Two types of jobs:**
1. **PARALLEL** - Jobs with no dependencies (internalDependencies: []) run simultaneously
2. **SEQUENTIAL** - Jobs with dependencies (internalDependencies: ["other job"]) wait for dependencies

**Create PARALLEL jobs for:**
- Independent modules/features
- Frontend and backend work (if both exist)
- Multiple unrelated components

**Create SEQUENTIAL jobs when:**
- One job genuinely needs another to complete first
- Example: "Build API" depends on "Create database schema"

**Do NOT create micro-tasks like:**
- "Create package.json" - include in the main implementation job
- "Set up project" - include in the job that needs it

**Scope boundary requirement for every job description:**
- State that the worker must complete only this assigned job.
- State that the worker must not implement adjacent, dependent, follow-up, polish, or larger-plan work.
- State that if additional work is required outside this job, the worker should report it as follow-up instead of doing it.

**Dependency syntax:**
- No dependency (PARALLEL): "internalDependencies": []
- Has dependency (SEQUENTIAL): "internalDependencies": ["Name of job to wait for"]

Provide your response as a valid JSON object.`;
}
