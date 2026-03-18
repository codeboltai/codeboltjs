import codebolt from '@codebolt/codeboltjs';

// ================================
// TYPES
// ================================

export interface JobInfo {
    jobId: string;
    name: string;
    description: string;
    taskName?: string;
    groupId: string;
    status: 'open' | 'working' | 'hold' | 'closed';
    dependencies: string[]; // Array of job IDs this job depends on
}

export interface JobExecutionResult {
    success: boolean;
    completedJobs: string[];
    failedJobs: string[];
    error?: string;
}

// ================================
// JOB FETCHER
// ================================

/**
 * Fetches jobs by group ID from the Codebolt Job system
 * and returns them in the JobInfo format for prompt injection.
 */
export async function fetchJobsForGroup(jobGroupId: string): Promise<JobInfo[]> {
    const jobsResponse = await codebolt.job.listJobs({ groupId: jobGroupId });

    if (!jobsResponse.jobs || jobsResponse.jobs.length === 0) {
        return [];
    }

    const rawJobs = jobsResponse.jobs as any[];

    // Map raw jobs to JobInfo format, filtering out already-closed jobs
    return rawJobs
        .filter((j: any) => j.status !== 'closed')
        .map((j: any) => ({
            jobId: j.id,
            name: j.name,
            description: j.description || '',
            groupId: jobGroupId,
            status: j.status,
            dependencies: (j.dependencies || [])
                .filter((d: any) => d.type === 'blocks')
                .map((d: any) => d.targetJobId),
        }));
}
