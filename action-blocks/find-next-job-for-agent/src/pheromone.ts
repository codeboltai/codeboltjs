import codebolt from '@codebolt/codeboltjs';
import { PHEROMONE_TYPES, BLOCKED_TIMEOUT_MS, Job, PheromoneDeposit } from './types';

/**
 * Check if a job has a specific pheromone type
 */
export async function hasPheromone(jobId: string, pheromoneType: string): Promise<boolean> {
    const response = await codebolt.job.getPheromones(jobId);
    if (!response?.pheromones) return false;
    return response.pheromones.some((p: PheromoneDeposit) => p.type === pheromoneType);
}

/**
 * Get all pheromones for a job
 */
export async function getJobPheromones(jobId: string): Promise<PheromoneDeposit[]> {
    const response = await codebolt.job.getPheromones(jobId);
    return response?.pheromones || [];
}

/**
 * Check if a job has been blocked for too long
 */
export async function isBlockedTooLong(jobId: string): Promise<boolean> {
    const pheromones = await getJobPheromones(jobId);
    const blockedPheromone = pheromones.find(p => p.type === PHEROMONE_TYPES.IS_BLOCKED);

    if (!blockedPheromone || !blockedPheromone.depositedAt) return false;

    const blockedTime = new Date().getTime() - new Date(blockedPheromone.depositedAt).getTime();
    return blockedTime > BLOCKED_TIMEOUT_MS;
}

/**
 * Filter jobs by pheromone types (exclude jobs with specific pheromones)
 */
export async function filterJobsByPheromones(
    jobs: Job[],
    excludePheromones: string[]
): Promise<Job[]> {
    const filteredJobs: Job[] = [];

    for (const job of jobs) {
        const pheromones = job.pheromones || [];
        const hasExcludedPheromone = pheromones.some((p: any) =>
            excludePheromones.includes(p.type)
        );

        if (!hasExcludedPheromone) {
            filteredJobs.push(job);
        }
    }

    return filteredJobs;
}

/**
 * Get jobs with a specific pheromone type
 */
export async function getJobsWithPheromone(
    jobs: Job[],
    pheromoneType: string
): Promise<Job[]> {
    const matchingJobs: Job[] = [];

    for (const job of jobs) {
        if (await hasPheromone(job.id, pheromoneType)) {
            matchingJobs.push(job);
        }
    }

    return matchingJobs;
}
