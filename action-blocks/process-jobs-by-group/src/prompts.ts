// ================================
// STATUS MESSAGES
// ================================

export const MESSAGES = {
    // Initialization
    STARTING: (groupId: string) => `🚀 Starting job processing for group: ${groupId}`,
    FETCHING_JOBS: (groupId: string) => `📋 Fetching jobs from group: ${groupId}`,
    JOBS_FOUND: (count: number) => `📝 Found ${count} jobs to process`,
    NO_JOBS: (groupId: string) => `ℹ️ No jobs found in group: ${groupId}`,

    // Processing
    FINDING_READY_JOBS: () => `🔍 Finding jobs with no blocking dependencies...`,
    READY_JOBS_FOUND: (count: number) => `✨ Found ${count} ready jobs to start`,
    NO_READY_JOBS: () => `⏳ No ready jobs found, waiting for completions...`,

    // Job actions
    LOCKING_JOB: (jobName: string) => `🔒 Locking job: ${jobName}`,
    STARTING_JOB: (jobName: string, current: number, total: number) =>
        `🏃 Starting job ${current}/${total}: ${jobName}`,
    JOB_STARTED: (jobName: string, threadId: string) =>
        `✅ Job started: ${jobName} (thread: ${threadId})`,

    // Completion
    JOB_COMPLETED: (jobName: string, remaining: number) =>
        `✔️ Job completed: ${jobName} (${remaining} jobs remaining)`,
    JOB_FAILED: (jobName: string, error: string) =>
        `❌ Job failed: ${jobName} - ${error}`,
    UNLOCKING_JOB: (jobName: string) => `🔓 Unlocking job: ${jobName}`,

    // Dependencies
    UPDATING_DEPENDENCIES: (jobName: string) =>
        `🔗 Updating dependencies after completion of: ${jobName}`,

    // Final status
    ALL_COMPLETE: (processed: number, failed: number) =>
        `🎉 All jobs processed! Completed: ${processed}, Failed: ${failed}`,
    PROCESSING_INTERRUPTED: (error: string) =>
        `⚠️ Processing interrupted: ${error}`,

    // Errors
    ERROR_FETCHING_JOBS: (error: string) => `❌ Error fetching jobs: ${error}`,
    ERROR_LOCKING_JOB: (jobName: string, error: string) =>
        `❌ Error locking job ${jobName}: ${error}`,
    ERROR_STARTING_THREAD: (jobName: string, error: string) =>
        `❌ Error starting thread for ${jobName}: ${error}`,
    ERROR_PROCESSING: (error: string) => `❌ Error during processing: ${error}`,
};
