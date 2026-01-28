import codebolt from '@codebolt/codeboltjs';
import {
    TaskToExecute,
    ActionPlan,
    GeneratedJobDetails,
    JobType
} from './types';
import { JOB_GENERATION_SYSTEM_PROMPT } from './prompts';
import { mapPriority, parseJsonResponse } from './utils';

// ================================
// JOB GENERATION WITH LLM
// ================================

/**
 * Builds the user prompt for job generation
 */
function buildUserPrompt(task: TaskToExecute, plan: ActionPlan): string {
    return `
## Full Action Plan Context
Plan Name: ${plan.name}
Plan Description: ${plan.description}
Plan ID: ${plan.planId}

All Tasks in Plan:
${JSON.stringify(plan.tasks, null, 2)}

## Task to Create Job For
Task ID: ${task.taskId}
Task Name: ${task.name}
Task Description: ${task.description}
Task Priority: ${task.priority || 'Medium'}
Dependencies: ${task.dependencies?.join(', ') || 'None'}
Estimated Time: ${task.estimated_time || 'Not specified'}

Generate a detailed job specification for this task.`;
}

/**
 * Creates fallback job details when LLM fails
 */
function createFallbackJobDetails(task: TaskToExecute, plan: ActionPlan): GeneratedJobDetails {
    return {
        name: task.name,
        description: task.description,
        type: 'task' as JobType,
        priority: mapPriority(task.priority),
        labels: [],
        notes: `Part of plan: ${plan.name}`
    };
}

/**
 * Generates detailed job specification using LLM
 */
export async function generateJobDetails(
    task: TaskToExecute,
    plan: ActionPlan
): Promise<GeneratedJobDetails> {
    const userPrompt = buildUserPrompt(task, plan);

    try {
        const { completion } = await codebolt.llm.inference({
            messages: [
                { role: 'system', content: JOB_GENERATION_SYSTEM_PROMPT },
                { role: 'user', content: userPrompt }
            ],
            full: true,
            tools: []
        });

        if (completion?.choices?.[0]?.message?.content) {
            const parsed = parseJsonResponse(completion.choices[0].message.content);
            if (parsed) {
                return parsed;
            }
        }
    } catch (error) {
        // Fall through to default
    }

    return createFallbackJobDetails(task, plan);
}
