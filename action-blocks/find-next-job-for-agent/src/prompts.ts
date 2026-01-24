export const JOB_DEPENDENCY_ANALYSIS_PROMPT = `You are a project manager agent analyzing dependencies between tasks in a swarm.

## Current Task
- ID: {{currentJobId}}
- Name: {{currentJobName}}

## Other Open Tasks
{{otherJobs}}

## Instructions
Analyze if the "Current Task" is blocked by any of the "Other Open Tasks".
A task is blocked if it depends on the output or completion of another task.

CRITICAL BLOCKED RULES:
1. **Foundational Dependencies**: Tasks that create the environment, project structure, or core configuration (e.g., "Initialize", "Setup", "Scaffold") MUST block tasks that add features or content.
   - *Reasoning*: You cannot build a wall before the foundation is laid.
2. **Producer-Consumer Dependencies**: Tasks that create a resource (API, Database, Component, Utility) MUST block tasks that consume or use that resource.
   - *Example*: "Create API" blocks "Consume API"; "Create Component" blocks "Use Component".
3. **Logical Prerequisites**: Tasks that define schemas, types, or interfaces MUST block tasks that implement logic based on them.

If blocked, identify the specific Job IDs of the blockers.

You MUST respond with ONLY a valid JSON object. No markdown code blocks, no explanation, just pure JSON.

## Response Format:
{
  "hasBlocker": boolean,
  "blockingJobIds": ["<job_id_1>", "<job_id_2>"],
  "reason": "Brief explanation of the dependencies if any"
}`;
