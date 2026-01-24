import codebolt from '@codebolt/codeboltjs';
import { Job, JobSplitAnalysis, JobBlockingAnalysis } from '../types';
import { llmWithJsonRetry } from './llm';
import { JOB_SPLIT_ANALYSIS_PROMPT, JOB_DEPENDENCY_ANALYSIS_PROMPT } from '../prompts';

/**
 * Check if all dependencies of a job are resolved (closed)
 * This checks EXISTING dependencies that are already recorded on the job
 */
export async function checkDependenciesResolved(job: Job): Promise<{ resolved: boolean; unresolvedDeps: string[] }> {
    if (!job.dependencies || job.dependencies.length === 0) {
        return { resolved: true, unresolvedDeps: [] };
    }

    const unresolvedDeps: string[] = [];
    for (const dep of job.dependencies) {
        if (dep.type === 'blocks') {
            const depJob = await codebolt.job.getJob(dep.targetJobId);
            if (depJob?.job && depJob.job.status !== 'closed') {
                unresolvedDeps.push(dep.targetJobId);
            }
        }
    }

    return { resolved: unresolvedDeps.length === 0, unresolvedDeps };
}

/**
 * Analyze job dependencies using LLM
 * This checks if a job SHOULD have dependencies on other open tasks
 * Based on semantic analysis of job names and descriptions
 */
export async function analyzeJobDependencies(
    job: Job,
    otherOpenJobs: Job[]
): Promise<{ hasBlocker: boolean; blockingJobIds: string[]; reason: string }> {
    // Skip if no other open jobs to compare against
    if (otherOpenJobs.length === 0) {
        return { hasBlocker: false, blockingJobIds: [], reason: 'No other open jobs to analyze' };
    }

    // Format other jobs for the prompt
    const otherJobsFormatted = otherOpenJobs
        .filter(j => j.id !== job.id) // Exclude current job
        .map(j => `- ID: ${j.id}, Name: ${j.name}, Description: ${j.description || 'No description'}`)
        .join('\n');

    if (!otherJobsFormatted) {
        return { hasBlocker: false, blockingJobIds: [], reason: 'No other jobs to compare' };
    }

    codebolt.chat.sendMessage(`🔍 Analyzing dependencies for job "${job.name}"...`);

    const dependencyAnalysis = await llmWithJsonRetry<JobBlockingAnalysis>(
        JOB_DEPENDENCY_ANALYSIS_PROMPT
            .replace('{{currentJobId}}', job.id)
            .replace('{{currentJobName}}', job.name)
            .replace('{{otherJobs}}', otherJobsFormatted),
        `Does this job depend on any other open tasks?`
    );

    if (dependencyAnalysis && dependencyAnalysis.hasBlocker && dependencyAnalysis.blockingJobIds?.length > 0) {
        codebolt.chat.sendMessage(`🔗 Job "${job.name}" depends on: ${dependencyAnalysis.blockingJobIds.join(', ')}`);
        codebolt.chat.sendMessage(`   Reason: ${dependencyAnalysis.reason}`);
        return {
            hasBlocker: true,
            blockingJobIds: dependencyAnalysis.blockingJobIds,
            reason: dependencyAnalysis.reason
        };
    }

    return { hasBlocker: false, blockingJobIds: [], reason: 'No dependencies detected' };
}

/**
 * Determine if a job is splittable (can be broken into sub-jobs)
 * Uses LLM inference with retry logic from swarmAgent
 */
export async function isJobSplittable(job: Job): Promise<{ splittable: boolean; proposedJobs?: { name: string; description: string }[] }> {
    // Only split root-level jobs (jobs without a parent)
    if (job.parentJobId) {
        codebolt.chat.sendMessage(`Note: Skipping split analysis for sub-task "${job.name}"`);
        return { splittable: false };
    }

    codebolt.chat.sendMessage(`🤔 Analyzing job "${job.name}" for complexity...`);

    const splitAnalysis = await llmWithJsonRetry<JobSplitAnalysis>(
        JOB_SPLIT_ANALYSIS_PROMPT
            .replace('{{jobName}}', job.name)
            .replace('{{jobDescription}}', job.description || 'No description provided'),
        `Is this job too complex?`
    );

    if (splitAnalysis && splitAnalysis.shouldSplit && splitAnalysis.proposedJobs) {
        codebolt.chat.sendMessage(`✂️ Job seems too large. Reason: ${splitAnalysis.reason}`);
        codebolt.chat.sendMessage(`Proposing split into ${splitAnalysis.proposedJobs.length} sub-tasks...`);
        return {
            splittable: true,
            proposedJobs: splitAnalysis.proposedJobs
        };
    }

    return { splittable: false };
}
