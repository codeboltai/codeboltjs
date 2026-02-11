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

export interface JobExecutionContext {
    workerAgentId: string;
    groupId: string;
    onJobComplete?: (jobId: string, success: boolean) => void;
    onJobStart?: (jobId: string) => void;
}

export interface PendingJob extends JobInfo {
    remainingDependencies: Set<string>;
}

export interface JobExecutionResult {
    success: boolean;
    completedJobs: string[];
    failedJobs: string[];
    error?: string;
}

// ================================
// JOB DEPENDENCY TRACKER
// ================================

export class JobDependencyTracker {
    private jobs: Map<string, PendingJob> = new Map();
    private completedJobs: Set<string> = new Set();
    private failedJobs: Set<string> = new Set();
    private runningJobs: Set<string> = new Set();

    /**
     * Adds a job to the tracker
     */
    addJob(job: JobInfo): void {
        const pendingJob: PendingJob = {
            ...job,
            remainingDependencies: new Set(job.dependencies)
        };
        this.jobs.set(job.jobId, pendingJob);
    }

    /**
     * Marks a job as completed and updates dependencies
     */
    markCompleted(jobId: string, success: boolean): string[] {
        this.runningJobs.delete(jobId);

        if (success) {
            this.completedJobs.add(jobId);
        } else {
            this.failedJobs.add(jobId);
        }

        // Update remaining dependencies for all jobs
        const newlyReady: string[] = [];
        for (const [id, job] of this.jobs) {
            if (job.remainingDependencies.has(jobId)) {
                job.remainingDependencies.delete(jobId);
                // If this job is now ready (no remaining deps) and not already running/completed
                if (job.remainingDependencies.size === 0 &&
                    !this.runningJobs.has(id) &&
                    !this.completedJobs.has(id) &&
                    !this.failedJobs.has(id)) {
                    newlyReady.push(id);
                }
            }
        }

        return newlyReady;
    }

    /**
     * Gets all jobs that are ready to execute (no remaining dependencies)
     */
    getReadyJobs(): PendingJob[] {
        const ready: PendingJob[] = [];
        for (const [id, job] of this.jobs) {
            if (job.remainingDependencies.size === 0 &&
                !this.runningJobs.has(id) &&
                !this.completedJobs.has(id) &&
                !this.failedJobs.has(id)) {
                ready.push(job);
            }
        }
        return ready;
    }

    /**
     * Marks a job as currently running
     */
    markRunning(jobId: string): void {
        this.runningJobs.add(jobId);
    }

    /**
     * Checks if all jobs are done (completed or failed)
     */
    isAllDone(): boolean {
        const totalJobs = this.jobs.size;
        const doneCount = this.completedJobs.size + this.failedJobs.size;
        return doneCount >= totalJobs;
    }

    /**
     * Gets execution statistics
     */
    getStats(): { total: number; completed: number; failed: number; running: number; pending: number } {
        const total = this.jobs.size;
        const completed = this.completedJobs.size;
        const failed = this.failedJobs.size;
        const running = this.runningJobs.size;
        const pending = total - completed - failed - running;
        return { total, completed, failed, running, pending };
    }

    /**
     * Gets a job by ID
     */
    getJob(jobId: string): PendingJob | undefined {
        return this.jobs.get(jobId);
    }

    /**
     * Gets all running job IDs
     */
    getRunningJobs(): string[] {
        return Array.from(this.runningJobs);
    }
}

// ================================
// JOB EXECUTOR
// ================================

/**
 * Starts a job by creating a worker thread
 */
export async function startJob(
    job: JobInfo,
    ctx: JobExecutionContext
): Promise<{ success: boolean; threadId?: string; error?: string }> {
    try {
        console.log(`[JobProcessor] Starting job: ${job.name} (${job.jobId})`);
        console.log(`[JobProcessor] Using worker agent: ${ctx.workerAgentId}`);
        codebolt.chat.sendMessage(`Starting job: ${job.name} (worker: ${ctx.workerAgentId})`);

        // Validate worker agent ID
        if (!ctx.workerAgentId) {
            const errorMsg = 'No worker agent ID configured.';
            console.error(`[JobProcessor] ${errorMsg}`);
            codebolt.chat.sendMessage(`Error: ${errorMsg}`);
            return { success: false, error: errorMsg };
        }

        // Update job status to working
        await codebolt.job.updateJob(job.jobId, { status: 'working' });

        ctx.onJobStart?.(job.jobId);

        // Create the user message for the worker agent
        const userMessage = `## Task: ${job.name}\n\n${job.description}`;

        // Create thread in background with the configured worker agent
        const threadResult = await codebolt.thread.createThreadInBackground({
            title: job.name,
            description: job.description,
            userMessage,
            selectedAgent: { id: ctx.workerAgentId },
            isGrouped: true,
            groupId: ctx.groupId,
        });

        const response = threadResult as any;

        // Check for explicit failure
        if (response && response.success === false) {
            const errorMsg = typeof response.error === 'string'
                ? response.error
                : response.error?.message || 'Thread creation failed';
            console.error(`[JobProcessor] Failed to start job: ${job.name}`, errorMsg);
            await codebolt.job.updateJob(job.jobId, { status: 'hold' });
            return { success: false, error: errorMsg };
        }

        // Thread started successfully
        if (response.threadId) {
            console.log(`[JobProcessor] Job started: ${job.name} (threadId: ${response.threadId})`);
            return { success: true, threadId: response.threadId };
        }

        return { success: true };

    } catch (error) {
        console.error(`[JobProcessor] Error starting job: ${job.name}`, error);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * Handles job completion event
 */
export async function handleJobCompletion(
    jobId: string,
    success: boolean,
    tracker: JobDependencyTracker,
    ctx: JobExecutionContext
): Promise<string[]> {
    console.log(`[JobProcessor] Job ${success ? 'completed' : 'failed'}: ${jobId}`);

    // Update job status
    const status = success ? 'closed' : 'hold';
    await codebolt.job.updateJob(jobId, { status });

    // Get the job info for logging
    const job = tracker.getJob(jobId);
    if (job) {
        if (success) {
            codebolt.chat.sendMessage(`Job completed: ${job.name}`);
        } else {
            codebolt.chat.sendMessage(`Job failed: ${job.name}`);
        }
    }

    ctx.onJobComplete?.(jobId, success);

    // Mark completed and get newly ready jobs
    const newlyReady = tracker.markCompleted(jobId, success);

    // Log stats
    const stats = tracker.getStats();
    codebolt.chat.sendMessage(
        `Progress: ${stats.completed}/${stats.total} completed, ${stats.failed} failed, ${stats.running} running`
    );

    return newlyReady;
}

/**
 * Gets the next jobs to run based on dependency status
 * - PARALLEL: Multiple jobs with no dependencies → run all together
 * - SEQUENTIAL: Single job waiting for dependencies → run when ready
 */
function getNextJobsToRun(
    tracker: JobDependencyTracker,
    allJobs: JobInfo[]
): { jobs: PendingJob[]; type: 'parallel' | 'sequential' | 'none' } {
    const readyJobs = tracker.getReadyJobs();

    if (readyJobs.length === 0) {
        return { jobs: [], type: 'none' };
    }

    // Check if these are originally parallel jobs (no dependencies defined)
    const parallelJobs = readyJobs.filter(job => {
        const originalJob = allJobs.find(j => j.jobId === job.jobId);
        return originalJob && originalJob.dependencies.length === 0;
    });

    // If we have multiple jobs ready that originally had no dependencies → PARALLEL
    if (parallelJobs.length > 1) {
        return { jobs: parallelJobs, type: 'parallel' };
    }

    // If we have jobs ready (either single parallel or sequential with resolved deps)
    if (readyJobs.length > 0) {
        // Check if first job was originally sequential (had dependencies)
        const firstJob = readyJobs[0];
        const originalJob = allJobs.find(j => j.jobId === firstJob.jobId);
        const isSequential = originalJob && originalJob.dependencies.length > 0;

        return {
            jobs: readyJobs,
            type: isSequential ? 'sequential' : 'parallel'
        };
    }

    return { jobs: [], type: 'none' };
}

/**
 * Starts jobs - runs them in parallel if multiple, or single if one
 */
async function startNextJobs(
    jobs: PendingJob[],
    jobType: 'parallel' | 'sequential',
    ctx: JobExecutionContext,
    tracker: JobDependencyTracker,
    threadToJobMap: Map<string, string>
): Promise<{ started: string[]; failed: string[] }> {
    const started: string[] = [];
    const failed: string[] = [];

    if (jobs.length === 0) return { started, failed };

    // Log what we're starting
    if (jobs.length > 1) {
        codebolt.chat.sendMessage(`Starting ${jobs.length} PARALLEL jobs: ${jobs.map(j => j.name).join(', ')}`);
    } else {
        const label = jobType === 'parallel' ? 'PARALLEL' : 'SEQUENTIAL';
        codebolt.chat.sendMessage(`Starting ${label} job: ${jobs[0].name}`);
    }

    // Mark all as running
    for (const job of jobs) {
        tracker.markRunning(job.jobId);
    }

    // Start all jobs concurrently (even if just one)
    const startPromises = jobs.map(async (job) => {
        const result = await startJob(job, ctx);
        return { job, result };
    });

    const results = await Promise.all(startPromises);

    // Process results
    for (const { job, result } of results) {
        if (result.success) {
            started.push(job.jobId);
            if (result.threadId) {
                threadToJobMap.set(result.threadId, job.jobId);
                console.log(`[JobProcessor] Mapped threadId ${result.threadId} to jobId ${job.jobId}`);
            }
        } else {
            failed.push(job.jobId);
        }
    }

    return { started, failed };
}

/**
 * Executes all jobs with dependency management
 * PARALLEL jobs (no dependencies) run simultaneously
 * SEQUENTIAL jobs (with dependencies) wait for their dependencies
 */
export async function executeJobsWithDependencies(
    jobs: JobInfo[],
    ctx: JobExecutionContext
): Promise<JobExecutionResult> {
    const tracker = new JobDependencyTracker();
    const eventQueue = codebolt.agentEventQueue;
    const agentTracker = codebolt.backgroundChildThreads;

    // Map threadId to jobId for tracking completions
    const threadToJobMap = new Map<string, string>();

    // Track completed and failed jobs for final result
    const completedJobIds: string[] = [];
    const failedJobIds: string[] = [];

    // Add all jobs to tracker
    for (const job of jobs) {
        tracker.addJob(job);
    }

    // Analyze job dependencies
    const parallelJobCount = jobs.filter(j => j.dependencies.length === 0).length;
    const sequentialJobCount = jobs.filter(j => j.dependencies.length > 0).length;

    codebolt.chat.sendMessage(
        `Starting execution of ${jobs.length} jobs: ${parallelJobCount} PARALLEL (no deps), ${sequentialJobCount} SEQUENTIAL (with deps)`
    );

    // Get and start initial jobs
    const { jobs: initialJobs, type: initialType } = getNextJobsToRun(tracker, jobs);
    console.log(`[JobProcessor] Initial jobs to start: ${initialJobs.length} (${initialType})`);

    const { started, failed } = initialType !== 'none'
        ? await startNextJobs(initialJobs, initialType, ctx, tracker, threadToJobMap)
        : { started: [], failed: [] };

    // Handle any jobs that failed to start
    for (const jobId of failed) {
        failedJobIds.push(jobId);
        await handleJobCompletion(jobId, false, tracker, ctx);
    }

    console.log(`[JobProcessor] Started ${started.length} jobs, ${failed.length} failed to start`);

    // Main event loop - wait for job completions
    while (!tracker.isAllDone()) {
        const runningCount = agentTracker.getRunningAgentCount();
        const pendingEvents = eventQueue.getPendingExternalEventCount();

        console.log(`[JobProcessor] Running agents: ${runningCount}, Pending events: ${pendingEvents}`);

        if (runningCount === 0 && pendingEvents === 0) {
            // No running agents and no pending events - check if we have stuck jobs
            const stats = tracker.getStats();
            if (stats.pending > 0) {
                console.warn(`[JobProcessor] ${stats.pending} jobs pending but no running agents`);
                // Check for next jobs to run
                const { jobs: nextJobs, type: nextType } = getNextJobsToRun(tracker, jobs);
                if (nextJobs.length === 0) {
                    codebolt.chat.sendMessage(`Warning: ${stats.pending} SEQUENTIAL jobs blocked due to failed dependencies`);
                    break;
                } else {
                    // Start any ready jobs that we might have missed
                    await startNextJobs(nextJobs, nextType === 'none' ? 'parallel' : nextType, ctx, tracker, threadToJobMap);
                }
            } else {
                break;
            }
        }

        // Wait for next event
        try {
            const event = await eventQueue.waitForAnyExternalEvent();

            console.log(`[JobProcessor] Received event:`, JSON.stringify(event, null, 2));

            if (event.type === 'backgroundAgentCompletion' ||
                event.type === 'backgroundGroupedAgentCompletion') {

                const completionData = event.data || event;

                // Try to extract jobId from multiple possible locations
                let jobId = completionData?.metadata?.jobId ||
                    completionData?.jobId ||
                    completionData?.threadMetadata?.jobId;

                // If no jobId found, try to look up by threadId
                const threadId = completionData?.threadId || completionData?.metadata?.threadId;
                if (!jobId && threadId && threadToJobMap.has(threadId)) {
                    jobId = threadToJobMap.get(threadId);
                    console.log(`[JobProcessor] Found jobId ${jobId} from threadId ${threadId} mapping`);
                }

                const success = completionData?.success !== false;

                console.log(`[JobProcessor] Completion event - jobId: ${jobId}, threadId: ${threadId}, success: ${success}`);

                if (jobId && tracker.getJob(jobId)) {
                    // Track completion
                    if (success) {
                        completedJobIds.push(jobId);
                    } else {
                        failedJobIds.push(jobId);
                    }

                    await handleJobCompletion(jobId, success, tracker, ctx);

                    // Check for next jobs to run (could be parallel or sequential)
                    const { jobs: nextJobs, type: nextType } = getNextJobsToRun(tracker, jobs);

                    if (nextJobs.length > 0 && nextType !== 'none') {
                        const { failed: newFailed } = await startNextJobs(nextJobs, nextType, ctx, tracker, threadToJobMap);

                        // Handle any that failed to start
                        for (const failedJobId of newFailed) {
                            failedJobIds.push(failedJobId);
                            await handleJobCompletion(failedJobId, false, tracker, ctx);
                        }
                    }
                } else {
                    console.warn(`[JobProcessor] Could not find jobId in completion event or job not tracked`);
                    console.warn(`[JobProcessor] Event data:`, JSON.stringify(completionData, null, 2));
                }
            }
        } catch (error) {
            console.error('[JobProcessor] Error waiting for event:', error);
            // Continue the loop
        }
    }

    // Final stats
    const stats = tracker.getStats();
    codebolt.chat.sendMessage(
        `Execution complete: ${stats.completed} succeeded, ${stats.failed} failed out of ${stats.total} jobs`
    );

    return {
        success: stats.failed === 0,
        completedJobs: completedJobIds,
        failedJobs: failedJobIds,
        error: stats.failed > 0 ? `${stats.failed} jobs failed` : undefined
    };
}

// ================================
// HIGH-LEVEL ENTRY POINT
// ================================

/**
 * Fetches jobs by group ID and processes them with dependency management.
 * This replaces the 'process-jobs-by-group' action block call.
 */
export async function processJobsByGroup(
    jobGroupId: string,
    workerAgentId: string
): Promise<JobExecutionResult> {
    codebolt.chat.sendMessage(`Starting job processing for group: ${jobGroupId}`);

    // Fetch all jobs in the group
    const jobsResponse = await codebolt.job.listJobs({ groupId: jobGroupId });

    if (!jobsResponse.jobs || jobsResponse.jobs.length === 0) {
        codebolt.chat.sendMessage(`No jobs found in group: ${jobGroupId}`);
        return {
            success: true,
            completedJobs: [],
            failedJobs: [],
        };
    }

    const rawJobs = jobsResponse.jobs as any[];
    codebolt.chat.sendMessage(`Found ${rawJobs.length} jobs to process`);

    // Map raw jobs to JobInfo format
    const jobs: JobInfo[] = rawJobs
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

    if (jobs.length === 0) {
        codebolt.chat.sendMessage(`All jobs in group ${jobGroupId} are already closed`);
        return {
            success: true,
            completedJobs: [],
            failedJobs: [],
        };
    }

    // Execute jobs with dependency management
    const ctx: JobExecutionContext = {
        workerAgentId,
        groupId: jobGroupId,
    };

    return executeJobsWithDependencies(jobs, ctx);
}
