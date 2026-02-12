import codebolt from '@codebolt/codeboltjs';
import {
    CreateJobsFromPlanResult,
    RequirementPlanDocument,
    ActionPlan,
    GeneratedJob,
    JobCreationResult,
    JobDependencyMap
} from './types';
import { MESSAGES } from './prompts';
import { generateJobsFromPlan } from './jobGenerator';

/**
 * Create jobs from a requirement plan.
 *
 * Process:
 * 1. Read requirement plan
 * 2. Extract specs and action plan sections
 * 3. Read specs file
 * 4. Fetch action plan details
 * 5. Generate jobs using LLM
 * 6. Create job group and jobs
 * 7. Add job dependencies
 */
export async function createJobsFromActionPlan(
    requirementPlanId: string,
    workerAgentId?: string
): Promise<CreateJobsFromPlanResult> {
    try {
        // Validate required parameters
        if (!requirementPlanId) {
            return {
                success: false,
                error: 'requirementPlanId is required',
                jobsCreated: [],
                totalJobs: 0
            };
        }

        // Step 1: Read requirement plan
        const planResponse = await codebolt.requirementPlan.get(requirementPlanId);
        if (!planResponse.success || !planResponse.data) {
            const errorMsg = MESSAGES.ERROR_READING_PLAN(planResponse.error || 'Unknown error');
            codebolt.chat.sendMessage(errorMsg, {});
            return {
                success: false,
                error: errorMsg,
                jobsCreated: [],
                totalJobs: 0
            };
        }

        const reqPlan: RequirementPlanDocument = planResponse.data;

        // Step 2: Extract sections
        const specsSection = reqPlan.sections.find(s => s.type === 'specs-link');
        const actionPlanSection = reqPlan.sections.find(s => s.type === 'actionplan-link');

        const specsPath = specsSection?.linkedFile;
        const actionPlanId = actionPlanSection?.linkedFile;

        // Validate action plan section exists
        if (!actionPlanId) {
            const errorMsg = MESSAGES.NO_ACTION_PLAN_SECTION();
            codebolt.chat.sendMessage(errorMsg, {});
            return {
                success: false,
                error: errorMsg,
                jobsCreated: [],
                totalJobs: 0
            };
        }

        // Warn if no specs section
        if (!specsPath) {
            codebolt.chat.sendMessage(MESSAGES.NO_SPECS_SECTION(), {});
        }

        // Step 3: Read specs file (if exists)
        let specsContent = '';
        if (specsPath) {
            try {
                const specsResponse = await codebolt.fs.readFile(specsPath);
                if (specsResponse.success && specsResponse.content) {
                    specsContent = specsResponse.content;
                } else {
                    codebolt.chat.sendMessage(MESSAGES.ERROR_READING_SPECS(specsResponse.error || 'Unknown error'), {});
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                codebolt.chat.sendMessage(MESSAGES.ERROR_READING_SPECS(errorMsg), {});
            }
        }

        // Step 4: Fetch action plan details
        const actionPlanResponse = await codebolt.actionPlan.getPlanDetail(actionPlanId);
        if (!actionPlanResponse.success || !actionPlanResponse.actionPlan) {
            const errorMsg = MESSAGES.ERROR_READING_ACTION_PLAN(actionPlanResponse.message || 'Unknown error');
            codebolt.chat.sendMessage(errorMsg, {});
            return {
                success: false,
                error: errorMsg,
                jobsCreated: [],
                totalJobs: 0
            };
        }

        const actionPlan: ActionPlan = actionPlanResponse.actionPlan;

        // Check if action plan has tasks
        if (!actionPlan.items || actionPlan.items.length === 0) {
            const msg = MESSAGES.NO_TASKS(actionPlanId);
            codebolt.chat.sendMessage(msg, {});
            return {
                success: true,
                message: msg,
                jobsCreated: [],
                totalJobs: 0
            };
        }

        // Step 5: Generate jobs using LLM
        codebolt.chat.sendMessage(MESSAGES.GENERATING_JOBS(actionPlan.items.length), {});

        let generatedJobs: GeneratedJob[];
        try {
            generatedJobs = await generateJobsFromPlan(
                specsContent || 'No specifications provided',
                actionPlan.items.map(task => ({
                    name: task.name,
                    description: task.description,
                    priority: task.priority
                }))
            );
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Unknown error';
            codebolt.chat.sendMessage(MESSAGES.ERROR_LLM_GENERATION(errorMsg), {});
            return {
                success: false,
                error: `LLM generation failed: ${errorMsg}`,
                jobsCreated: [],
                totalJobs: 0
            };
        }

        // Step 6: Create job group
        const groupName = `Jobs for ${actionPlan.name}`;
        codebolt.chat.sendMessage(MESSAGES.CREATING_GROUP(groupName), {});

        const groupResponse = await codebolt.job.createJobGroup({
            name: groupName
        });

        if (!groupResponse.group) {
            const errorMsg = MESSAGES.ERROR_GROUP_CREATION('Failed to create group');
            codebolt.chat.sendMessage(errorMsg, {});
            return {
                success: false,
                error: errorMsg,
                jobsCreated: [],
                totalJobs: 0
            };
        }

        const groupId = groupResponse.group.id;
        codebolt.chat.sendMessage(MESSAGES.GROUP_CREATED(groupId), {});

        // Step 7: Create jobs
        codebolt.chat.sendMessage(MESSAGES.CREATING_JOBS(generatedJobs.length), {});

        const jobsCreated: JobCreationResult[] = [];
        const jobNameToIdMap: JobDependencyMap = {};

        for (let i = 0; i < generatedJobs.length; i++) {
            const job = generatedJobs[i];

            try {
                const jobResponse = await codebolt.job.createJob(groupId, {
                    name: job.name,
                    description: job.description,
                    type: job.type,
                    priority: job.priority === 'High' ? 2 : job.priority === 'Low' ? 4 : 3,
                    labels: job.labels,
                    assignees: workerAgentId ? [workerAgentId] : []
                });

                if (jobResponse.job) {
                    const jobId = jobResponse.job.id;
                    jobsCreated.push({
                        jobId,
                        jobName: job.name,
                        dependencies: job.dependencies
                    });
                    jobNameToIdMap[job.name] = jobId;

                    codebolt.chat.sendMessage(MESSAGES.JOB_CREATED(job.name, i + 1, generatedJobs.length), {});
                } else {
                    codebolt.chat.sendMessage(MESSAGES.ERROR_JOB_CREATION(job.name, 'No job returned'), {});
                }
            } catch (error) {
                const errorMsg = error instanceof Error ? error.message : 'Unknown error';
                codebolt.chat.sendMessage(MESSAGES.ERROR_JOB_CREATION(job.name, errorMsg), {});
            }
        }

        // Step 8: Add job dependencies
        if (jobsCreated.length > 0) {
            codebolt.chat.sendMessage(MESSAGES.ADDING_DEPENDENCIES(), {});

            for (const job of jobsCreated) {
                for (const depName of job.dependencies) {
                    const depId = jobNameToIdMap[depName];
                    if (depId) {
                        try {
                            await codebolt.job.addDependency(job.jobId, depId);
                        } catch (error) {
                            console.warn(`Failed to add dependency from ${job.jobName} to ${depName}:`, error);
                        }
                    }
                }
            }
        }

        // Success
        const finalMessage = MESSAGES.COMPLETE_SUCCESS(jobsCreated.length, groupId);
        codebolt.chat.sendMessage(finalMessage, {});

        return {
            success: true,
            groupId,
            jobGroupId: groupId,
            jobsCreated: jobsCreated.map(j => j.jobId),
            totalJobs: jobsCreated.length,
            message: finalMessage
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
        console.error('Job creation from requirement plan failed:', error);
        return {
            success: false,
            error: errorMessage,
            jobsCreated: [],
            totalJobs: 0
        };
    }
}
