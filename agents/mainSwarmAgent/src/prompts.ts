// ================================
// JOB ANALYSIS PROMPTS
// ================================

export const JOB_SPLIT_ANALYSIS_PROMPT = `You are a project manager agent analyzing a job to decide if it needs to be split into smaller sub-tasks.

## Job Details
- Name: {{jobName}}
- Description: {{jobDescription}}

## Instructions
Analyze the job description. ONLY propose splitting if the job is  LARGE, COMPLEX, or explicitly asks for multiple distinct deliverables that cannot be handled by a single agent session.
Do NOT split if the job can be reasonably completed in one go.

You MUST respond with ONLY a valid JSON object. No markdown code blocks, no explanation, just pure JSON.

## Response Format:
{
  "shouldSplit": boolean,
  "reason": "Brief explanation of why splitting is or isn't needed",
  "proposedJobs": [ // Optional, only if shouldSplit is true
    { "name": "Sub-task 1 Name", "description": "Implementation details for sub-task 1" },
    { "name": "Sub-task 2 Name", "description": "Implementation details for sub-task 2" }
  ]
}`;

export const JOB_BLOCKER_ANALYSIS_PROMPT = `You are a technical lead agent analyzing a job to identify potential blockers or external dependencies.

## Job Details
- Name: {{jobName}}
- Description: {{jobDescription}}

## Instructions
Analyze the job description for keywords indicating external dependencies (e.g., "waiting for", "blocked by", "depends on", "database", "API key", "provisioning").

You MUST respond with ONLY a valid JSON object. No markdown code blocks, no explanation, just pure JSON.

## Response Format:
{
  "hasBlocker": boolean,
  "blockerReason": "Description of the blocker (if any)",
  "blockerType": "external" // Default to 'external' if found
}
`;

export const SPLIT_APPROVAL_PROMPT = `You are a supervisor agent reviewing a proposal to split a job into smaller sub-tasks.

## Job Details
- Name: {{jobName}}
- Description: {{jobDescription}}

## Split Proposal
- Reason: {{proposalDescription}}
- Proposed Sub-tasks:
{{proposedJobs}}

## Instructions
Review the proposal. Approve if the split makes the job more manageable and the sub-tasks are clear. Reject if the split is unnecessary or the sub-tasks are poorly defined.

You MUST respond with ONLY a valid JSON object. No markdown code blocks, no explanation, just pure JSON.

## Response Format:
  "action": "approve", // or "reject"
  "reason": "Brief explanation of your decision"
}`;

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
  "blockingJobIds": ["<job_id_1>", "<job_id_2>"], // Array of strings. Empty if no blockers.
  "reason": "Brief explanation of the dependencies if any"
}`;
