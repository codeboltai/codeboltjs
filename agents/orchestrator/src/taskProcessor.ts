import codebolt from '@codebolt/codeboltjs';

// ================================
// TYPES
// ================================

interface TaskInfo {
    name: string;
    description: string;
    dependencies?: string[];
    estimated_time?: string;
    priority?: 'High' | 'Medium' | 'Low';
}

interface TopLevelTask extends TaskInfo {
    type: 'task';
}

interface TaskReference {
    type: 'task';
    task: TaskInfo;
}

interface ParallelGroup {
    type: 'parallelGroup';
    name?: string;
    groupItems: Record<string, (TaskReference | StepGroup)[]>;
}

interface LoopGroup {
    type: 'loopGroup';
    name?: string;
    iterationListId: string;
    loopTasks: (TaskReference | StepGroup)[];
}

interface IfGroup {
    type: 'ifGroup';
    name?: string;
    condition: string;
    ifTasks: (TaskReference | StepGroup)[];
}

interface WaitUntilGroup {
    type: 'waitUntilGroup';
    name?: string;
    waitSteps: string[];
    waitTasks: (TaskReference | StepGroup)[];
}

type StepGroup = ParallelGroup | LoopGroup | IfGroup | WaitUntilGroup;
type PlanItem = TopLevelTask | TaskReference | StepGroup;

interface ActionPlan {
    planId: string;
    name: string;
    description: string;
    tasks: PlanItem[];
}

interface CreateJobResult {
    success: boolean;
    error?: string;
    jobId?: string;
    taskId?: string;
    groupId: string;
    job?: CreatedJob;
}

interface CreatedJob {
    jobId: string;
    name: string;
    description: string;
    taskName?: string;
    groupId: string;
}

// Track context for better messaging (aligned with orchestrator-worker pattern)
interface TaskContext {
    trackName?: string;
    trackIndex?: number;
    totalTracks?: number;
    itemIndex?: number;
    totalItems?: number;
    waitForCompletion?: boolean;
}

// Sub-job definition from break-task-into-jobs action block
interface SubJobDefinition {
    name: string;
    description: string;
    type: 'bug' | 'feature' | 'task' | 'epic' | 'chore';
    priority: 1 | 2 | 3 | 4;
    estimatedEffort: 'small' | 'medium' | 'large';
    internalDependencies?: string[];
    externalDependencies?: string[];
    labels?: string[];
}

// Processing context passed through the call chain (enhanced for hierarchical groups)
interface ProcessingContext {
    plan: ActionPlan;
    rootGroupId: string;           // Root job group for the plan
    currentGroupId: string;        // Current group (may be a sub-group)
    taskIndexRef: { value: number };
    workerAgentId?: string;
    taskContext?: TaskContext;

    // NEW: Track created jobs for dependency resolution
    createdJobs: CreatedJob[];
    taskJobMap: Map<string, CreatedJob[]>;  // taskName -> jobs created for that task
    previousTaskJobs?: CreatedJob[];        // Jobs from the previous task (for sequential deps)
}

// ================================
// TASK PROCESSOR
// ================================

/**
 * Generates a unique task ID based on task name
 */
function generateTaskId(taskName: string, index: number): string {
    const sanitized = taskName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    return `task-${sanitized}-${index}`;
}

/**
 * Extracts task info from either a TopLevelTask or TaskReference
 */
function extractTaskInfo(item: TopLevelTask | TaskReference): TaskInfo {
    if ('task' in item) {
        return item.task;
    }
    return item;
}

/**
 * Builds context message for logging (aligned with orchestrator-worker pattern)
 */
function buildContextMessage(context: TaskContext): string {
    const { trackName, trackIndex, totalTracks, itemIndex, totalItems } = context;

    if (!trackName) return '';

    let msg = ` [Track: ${trackName}`;
    if (trackIndex !== undefined && totalTracks !== undefined) {
        msg += ` ${trackIndex + 1}/${totalTracks}`;
    }
    if (itemIndex !== undefined && totalItems !== undefined) {
        msg += `, Item ${itemIndex + 1}/${totalItems}`;
    }
    msg += ']';
    return msg;
}

/**
 * Creates a job for a single task by calling the create-jobs-from-plan action block
 */
async function createJobForTask(
    task: TaskInfo,
    taskId: string,
    ctx: ProcessingContext
): Promise<CreateJobResult> {
    const { plan, currentGroupId, workerAgentId, taskContext = {} } = ctx;
    const contextMsg = buildContextMessage(taskContext);

    try {
        console.log(`[Orchestrator] Creating job for task: ${task.name}${contextMsg}`);
        codebolt.chat.sendMessage(`🔵 Creating job${contextMsg}: ${task.name}`);

        const result = await codebolt.actionBlock.start('create-jobs-from-plan', {
            plan: {
                planId: plan.planId,
                name: plan.name,
                description: plan.description,
                tasks: plan.tasks
            },
            task: {
                taskId,
                name: task.name,
                description: task.description,
                priority: task.priority,
                dependencies: task.dependencies,
                estimated_time: task.estimated_time
            },
            groupId: currentGroupId,
            workerAgentId
        });

        if (result.success && result.result) {
            console.log(`[Orchestrator] Job created successfully: ${task.name}${contextMsg}`);
            codebolt.chat.sendMessage(`✅ Job created${contextMsg}: ${task.name}`);
            return result.result as CreateJobResult;
        }

        console.error(`[Orchestrator] Job creation failed: ${task.name}${contextMsg}`);
        codebolt.chat.sendMessage(`❌ Job failed${contextMsg}: ${task.name}`);
        return {
            success: false,
            error: result.error || 'Failed to create job',
            groupId: currentGroupId
        };
    } catch (error) {
        console.error(`[Orchestrator] Error creating job: ${task.name}${contextMsg}`, error);
        codebolt.chat.sendMessage(`❌ Error${contextMsg}: ${task.name} - ${error instanceof Error ? error.message : String(error)}`);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            groupId: currentGroupId
        };
    }
}

/**
 * Maps task priority string to job priority number
 */
function mapPriority(priority?: string): 1 | 2 | 3 | 4 {
    switch (priority?.toLowerCase()) {
        case 'high':
            return 2;
        case 'medium':
            return 3;
        case 'low':
            return 4;
        default:
            return 3;
    }
}

/**
 * Adds cross-task dependencies based on task.dependencies[]
 * The first job of the current task depends on the LAST job of each dependent task
 */
async function addCrossTaskDependencies(
    firstJobId: string,
    taskDependencies: string[],
    ctx: ProcessingContext
): Promise<void> {
    for (const depTaskName of taskDependencies) {
        const depTaskJobs = ctx.taskJobMap.get(depTaskName);
        if (depTaskJobs && depTaskJobs.length > 0) {
            const lastDepJob = depTaskJobs[depTaskJobs.length - 1];
            try {
                await codebolt.job.addDependency(firstJobId, lastDepJob.jobId, 'blocks');
                console.log(`[Orchestrator] Added dependency: ${firstJobId} depends on ${lastDepJob.jobId}`);
            } catch (error) {
                console.warn(`[Orchestrator] Failed to add dependency:`, error);
            }
        }
    }
}

/**
 * Adds sequential dependency from previous task (for top-level sequential processing)
 */
async function addSequentialDependency(
    firstJobId: string,
    ctx: ProcessingContext
): Promise<void> {
    if (ctx.previousTaskJobs && ctx.previousTaskJobs.length > 0) {
        const lastPreviousJob = ctx.previousTaskJobs[ctx.previousTaskJobs.length - 1];
        try {
            await codebolt.job.addDependency(firstJobId, lastPreviousJob.jobId, 'blocks');
            console.log(`[Orchestrator] Added sequential dependency: ${firstJobId} depends on ${lastPreviousJob.jobId}`);
        } catch (error) {
            console.warn(`[Orchestrator] Failed to add sequential dependency:`, error);
        }
    }
}

/**
 * Executes a job by starting a worker thread and waits for completion
 */
async function executeJobWithWorker(
    job: CreatedJob,
    workerAgentId: string,
    _ctx: ProcessingContext
): Promise<{ success: boolean; error?: string }> {
    try {
        console.log(`[Orchestrator] Starting worker for job: ${job.name}`);
        codebolt.chat.sendMessage(`🚀 Starting worker for: ${job.name}`);

        // Update job status to working
        await codebolt.job.updateJob(job.jobId, { status: 'working' });

        // Create and start thread for this job with full description
        const userMessage = `## Task: ${job.name}\n\n${job.description}`;
        const threadResult = await codebolt.thread.createAndStartThread({
            title: job.name,
            description: job.description,
            userMessage,
            selectedAgent: {
                id: workerAgentId,
                name: 'Worker Agent'
            },
            metadata: {
                jobId: job.jobId,
                taskName: job.taskName,
                groupId: job.groupId
            }
        });

        if (threadResult.success) {
            console.log(`[Orchestrator] Job completed successfully: ${job.name}`);
            codebolt.chat.sendMessage(`✅ Job completed: ${job.name}`);
            await codebolt.job.updateJob(job.jobId, { status: 'closed' });
            return { success: true };
        } else {
            console.error(`[Orchestrator] Job failed: ${job.name}`, threadResult.error);
            codebolt.chat.sendMessage(`❌ Job failed: ${job.name}`);
            await codebolt.job.updateJob(job.jobId, { status: 'hold' });
            return { success: false, error: threadResult.error };
        }
    } catch (error) {
        console.error(`[Orchestrator] Error executing job: ${job.name}`, error);
        codebolt.chat.sendMessage(`❌ Error executing job: ${job.name}`);
        return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
}

/**
 * Executes all jobs for a task sequentially (respecting dependencies)
 * Jobs are executed one by one - later jobs depend on earlier ones
 */
async function executeTaskJobsSequential(
    jobs: CreatedJob[],
    ctx: ProcessingContext
): Promise<{ success: boolean; completedCount: number; failedCount: number }> {
    const workerAgentId = ctx.workerAgentId || 'mainact';
    let completedCount = 0;
    let failedCount = 0;

    codebolt.chat.sendMessage(`⚙️ Executing ${jobs.length} jobs sequentially...`);

    for (const job of jobs) {
        const result = await executeJobWithWorker(job, workerAgentId, ctx);
        if (result.success) {
            completedCount++;
        } else {
            failedCount++;
            // Continue with next jobs even if one fails (dependencies handle blocking)
        }
    }

    return {
        success: failedCount === 0,
        completedCount,
        failedCount
    };
}

/**
 * Executes all jobs for a task in PARALLEL
 * All jobs start at the same time and we wait for all to complete
 */
async function executeTaskJobsParallel(
    jobs: CreatedJob[],
    ctx: ProcessingContext
): Promise<{ success: boolean; completedCount: number; failedCount: number }> {
    const workerAgentId = ctx.workerAgentId || 'mainact';

    codebolt.chat.sendMessage(`⚡ Executing ${jobs.length} jobs in parallel...`);

    // Start all jobs in parallel
    const jobPromises = jobs.map(job => executeJobWithWorker(job, workerAgentId, ctx));

    // Wait for all to complete
    const results = await Promise.allSettled(jobPromises);

    let completedCount = 0;
    let failedCount = 0;

    for (const result of results) {
        if (result.status === 'fulfilled' && result.value.success) {
            completedCount++;
        } else {
            failedCount++;
        }
    }

    return {
        success: failedCount === 0,
        completedCount,
        failedCount
    };
}

/**
 * Executes jobs based on execution mode (sequential or parallel)
 */
async function executeTaskJobs(
    jobs: CreatedJob[],
    ctx: ProcessingContext,
    parallel: boolean = false
): Promise<{ success: boolean; completedCount: number; failedCount: number }> {
    if (parallel) {
        return executeTaskJobsParallel(jobs, ctx);
    }
    return executeTaskJobsSequential(jobs, ctx);
}

/**
 * Processes a normal task: creates a sub-group, breaks into sub-jobs, adds dependencies
 * @param parallel - If true, executes sub-jobs in parallel (for parallel groups)
 */
async function processNormalTask(
    task: TaskInfo,
    taskId: string,
    ctx: ProcessingContext,
    parallel: boolean = false
): Promise<CreateJobResult[]> {
    const { plan, rootGroupId, taskContext = {} } = ctx;
    const contextMsg = buildContextMessage(taskContext);
    const results: CreateJobResult[] = [];

    try {
        console.log(`[Orchestrator] Processing normal task: ${task.name}${contextMsg}`);
        codebolt.chat.sendMessage(`📦 Creating job group for task: ${task.name}`);

        // 1. Create a sub-group for this task
        const taskGroupResponse = await codebolt.job.createJobGroup({
            name: task.name,
            parentId: rootGroupId
        });

        if (!taskGroupResponse?.group?.id) {
            console.error(`[Orchestrator] Failed to create job group for task: ${task.name}`);
            return [{
                success: false,
                error: `Failed to create job group for task: ${task.name}`,
                groupId: rootGroupId
            }];
        }

        const taskGroupId = taskGroupResponse.group.id;
        console.log(`[Orchestrator] Created task job group: ${taskGroupId}`);

        // 2. Break task into sub-jobs using LLM
        codebolt.chat.sendMessage(`🔄 Breaking down task: ${task.name}`);
        const breakdownResult = await codebolt.actionBlock.start('break-task-into-jobs', {
            plan: {
                planId: plan.planId,
                name: plan.name,
                description: plan.description,
                tasks: plan.tasks
            },
            task: {
                taskId,
                name: task.name,
                description: task.description,
                priority: task.priority,
                dependencies: task.dependencies,
                estimated_time: task.estimated_time
            },
            existingJobs: ctx.createdJobs
        });

        let subJobs: SubJobDefinition[] = [];
        if (breakdownResult.success && breakdownResult.result?.subJobs) {
            subJobs = breakdownResult.result.subJobs;
        } else {
            // Fallback: create a single job
            subJobs = [{
                name: `Implement: ${task.name}`,
                description: task.description,
                type: 'task',
                priority: mapPriority(task.priority),
                estimatedEffort: 'medium'
            }];
        }

        codebolt.chat.sendMessage(`📋 Task broken into ${subJobs.length} sub-jobs`);

        // 3. Create jobs for each sub-job with proper dependencies
        const createdJobsForTask: CreatedJob[] = [];
        const subJobNameToId: Map<string, string> = new Map();

        for (let i = 0; i < subJobs.length; i++) {
            const subJob = subJobs[i];

            try {
                const jobResponse = await codebolt.job.createJob(taskGroupId, {
                    name: subJob.name,
                    description: subJob.description,
                    type: subJob.type,
                    priority: subJob.priority,
                    labels: subJob.labels || [],
                    status: 'open'
                });

                if (jobResponse?.job?.id) {
                    const jobId = jobResponse.job.id;
                    subJobNameToId.set(subJob.name, jobId);

                    const createdJob: CreatedJob = {
                        jobId,
                        name: subJob.name,
                        description: subJob.description,
                        taskName: task.name,
                        groupId: taskGroupId
                    };
                    createdJobsForTask.push(createdJob);
                    ctx.createdJobs.push(createdJob);

                    results.push({
                        success: true,
                        jobId,
                        taskId,
                        groupId: taskGroupId,
                        job: createdJob
                    });

                    // Add internal dependency (on previous sub-job if sequential)
                    if (i > 0 && (!subJob.internalDependencies || subJob.internalDependencies.length === 0)) {
                        // Default: sequential dependency on previous job
                        const prevJobId = createdJobsForTask[i - 1].jobId;
                        await codebolt.job.addDependency(jobId, prevJobId, 'blocks');
                    } else if (subJob.internalDependencies && subJob.internalDependencies.length > 0) {
                        // Use declared internal dependencies
                        for (const depName of subJob.internalDependencies) {
                            const depJobId = subJobNameToId.get(depName);
                            if (depJobId) {
                                await codebolt.job.addDependency(jobId, depJobId, 'blocks');
                            }
                        }
                    }

                    console.log(`[Orchestrator] Created sub-job ${i + 1}/${subJobs.length}: ${subJob.name}`);
                } else {
                    results.push({
                        success: false,
                        error: `Failed to create sub-job: ${subJob.name}`,
                        groupId: taskGroupId
                    });
                }
            } catch (error) {
                console.error(`[Orchestrator] Error creating sub-job: ${subJob.name}`, error);
                results.push({
                    success: false,
                    error: error instanceof Error ? error.message : 'Unknown error',
                    groupId: taskGroupId
                });
            }
        }

        // 4. Store jobs for this task in the map
        ctx.taskJobMap.set(task.name, createdJobsForTask);

        // 5. Add cross-task dependencies (first job depends on dependent tasks)
        if (task.dependencies && task.dependencies.length > 0 && createdJobsForTask.length > 0) {
            await addCrossTaskDependencies(createdJobsForTask[0].jobId, task.dependencies, ctx);
        }

        // 6. Add sequential dependency from previous task
        if (createdJobsForTask.length > 0) {
            await addSequentialDependency(createdJobsForTask[0].jobId, ctx);
        }

        const executionMode = parallel ? 'parallel' : 'sequential';
        codebolt.chat.sendMessage(`📋 Task "${task.name}": ${createdJobsForTask.length} jobs created, starting ${executionMode} execution...`);

        // 7. Execute all jobs for this task and WAIT for completion
        if (createdJobsForTask.length > 0) {
            const executionResult = await executeTaskJobs(createdJobsForTask, ctx, parallel);

            if (executionResult.success) {
                codebolt.chat.sendMessage(`✅ Task "${task.name}" completed: ${executionResult.completedCount} jobs finished (${executionMode})`);
            } else {
                codebolt.chat.sendMessage(`⚠️ Task "${task.name}" partially completed: ${executionResult.completedCount} succeeded, ${executionResult.failedCount} failed`);
            }
        } else {
            codebolt.chat.sendMessage(`✅ Task "${task.name}" processed (no jobs to execute)`);
        }

        return results;

    } catch (error) {
        console.error(`[Orchestrator] Error processing task: ${task.name}`, error);
        codebolt.chat.sendMessage(`❌ Error processing task: ${task.name}`);
        return [{
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            groupId: rootGroupId
        }];
    }
}

/**
 * Processes a track within a parallel group (items within track run in parallel)
 * Aligned with orchestrator-worker pattern
 * All items in track and their jobs execute in PARALLEL
 */
async function processTrack(
    trackName: string,
    trackItems: (TaskReference | StepGroup)[],
    trackIndex: number,
    totalTracks: number,
    ctx: ProcessingContext
): Promise<CreateJobResult[]> {
    console.log(`[Orchestrator] Processing track: ${trackName} (${trackIndex + 1}/${totalTracks}) with ${trackItems.length} items`);
    codebolt.chat.sendMessage(`⚡ Starting parallel track [${trackIndex + 1}/${totalTracks}]: ${trackName} (${trackItems.length} items)`);

    const results: CreateJobResult[] = [];
    const taskPromises: Promise<CreateJobResult[]>[] = [];

    for (let i = 0; i < trackItems.length; i++) {
        const item = trackItems[i];
        const itemContext: TaskContext = {
            trackName,
            trackIndex,
            totalTracks,
            itemIndex: i,
            totalItems: trackItems.length,
            waitForCompletion: false
        };

        // Process item with parallel=true (jobs within task will run in parallel)
        const promise = processItemWithContext(item, { ...ctx, taskContext: itemContext }, true);
        taskPromises.push(promise);
    }

    // Wait for all tasks in this track to complete (all running in parallel)
    codebolt.chat.sendMessage(`⏳ Track [${trackIndex + 1}/${totalTracks}]: ${trackName} - ${taskPromises.length} item(s) running in parallel...`);
    const trackResults = await Promise.allSettled(taskPromises);

    // Collect results
    for (const result of trackResults) {
        if (result.status === 'fulfilled') {
            results.push(...result.value);
        }
    }

    codebolt.chat.sendMessage(`✅ Track completed [${trackIndex + 1}/${totalTracks}]: ${trackName}`);
    return results;
}

/**
 * Processes tasks from a parallel group - all tracks run in parallel
 * Aligned with orchestrator-worker pattern using Promise.allSettled
 */
async function processParallelGroup(group: ParallelGroup, ctx: ProcessingContext): Promise<CreateJobResult[]> {
    console.log(`[Orchestrator] Starting parallel group: ${group.name || 'Unnamed'}`);
    codebolt.chat.sendMessage(`🔀 Starting parallel group: ${group.name || 'Unnamed'}`);

    try {
        const trackNames = Object.keys(group.groupItems);
        const totalTracks = trackNames.length;
        console.log(`[Orchestrator] Found ${totalTracks} parallel tracks:`, trackNames);
        codebolt.chat.sendMessage(`📊 Parallel group has ${totalTracks} tracks: ${trackNames.join(', ')}`);

        // Create track promises
        const trackPromises = trackNames.map((trackName, trackIndex) => {
            const trackItems = group.groupItems[trackName];
            return processTrack(trackName, trackItems, trackIndex, totalTracks, ctx);
        });

        // Execute all tracks in parallel using Promise.allSettled for resilience
        const results = await Promise.allSettled(trackPromises);

        // Collect all results
        const allResults: CreateJobResult[] = [];
        let successful = 0;
        let failed = 0;

        for (const result of results) {
            if (result.status === 'fulfilled') {
                allResults.push(...result.value);
                successful++;
            } else {
                failed++;
                console.error(`[Orchestrator] Track failed:`, result.reason);
            }
        }

        if (failed > 0) {
            codebolt.chat.sendMessage(`⚠️ Parallel group completed with errors: ${group.name || 'Unnamed'} (${successful}/${totalTracks} tracks succeeded)`);
        } else {
            codebolt.chat.sendMessage(`✅ Parallel group completed: ${group.name || 'Unnamed'} (${totalTracks} tracks)`);
        }

        return allResults;
    } catch (error) {
        console.error(`[Orchestrator] Error in parallel group ${group.name}:`, error);
        codebolt.chat.sendMessage(`❌ Parallel group failed: ${group.name || 'Unnamed'} - ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
}

/**
 * Processes tasks from a loop group - creates jobs sequentially
 */
async function processLoopGroup(group: LoopGroup, ctx: ProcessingContext): Promise<CreateJobResult[]> {
    const results: CreateJobResult[] = [];

    console.log(`[Orchestrator] Processing loop group: ${group.name || 'Unnamed'}`);
    codebolt.chat.sendMessage(`🔄 Processing loop group: ${group.name || 'Unnamed'} (iteration: ${group.iterationListId})`);

    for (let i = 0; i < group.loopTasks.length; i++) {
        const item = group.loopTasks[i];
        const itemContext: TaskContext = {
            itemIndex: i,
            totalItems: group.loopTasks.length,
            waitForCompletion: true
        };

        const itemResults = await processItemWithContext(item, { ...ctx, taskContext: itemContext });
        results.push(...itemResults);
    }

    return results;
}

/**
 * Processes tasks from an if group - creates jobs sequentially
 */
async function processIfGroup(group: IfGroup, ctx: ProcessingContext): Promise<CreateJobResult[]> {
    const results: CreateJobResult[] = [];

    console.log(`[Orchestrator] Processing if group: ${group.name || 'Unnamed'}`);
    codebolt.chat.sendMessage(`🔀 Processing if group: ${group.name || 'Unnamed'} (condition: ${group.condition})`);

    for (let i = 0; i < group.ifTasks.length; i++) {
        const item = group.ifTasks[i];
        const itemContext: TaskContext = {
            itemIndex: i,
            totalItems: group.ifTasks.length,
            waitForCompletion: true
        };

        const itemResults = await processItemWithContext(item, { ...ctx, taskContext: itemContext });
        results.push(...itemResults);
    }

    return results;
}

/**
 * Processes tasks from a waitUntil group - creates jobs sequentially
 */
async function processWaitUntilGroup(group: WaitUntilGroup, ctx: ProcessingContext): Promise<CreateJobResult[]> {
    const results: CreateJobResult[] = [];

    console.log(`[Orchestrator] Processing waitUntil group: ${group.name || 'Unnamed'}`);
    codebolt.chat.sendMessage(`⏳ Processing waitUntil group: ${group.name || 'Unnamed'} (steps: ${group.waitSteps.join(', ')})`);

    for (let i = 0; i < group.waitTasks.length; i++) {
        const item = group.waitTasks[i];
        const itemContext: TaskContext = {
            itemIndex: i,
            totalItems: group.waitTasks.length,
            waitForCompletion: true
        };

        const itemResults = await processItemWithContext(item, { ...ctx, taskContext: itemContext });
        results.push(...itemResults);
    }

    return results;
}

/**
 * Routes item to appropriate handler based on type
 * Aligned with orchestrator-worker processItemWithContext pattern
 * @param parallel - If true, execute jobs in parallel (used for parallel groups)
 */
async function processItemWithContext(
    item: PlanItem | TaskReference | StepGroup,
    ctx: ProcessingContext,
    parallel: boolean = false
): Promise<CreateJobResult[]> {
    // Check if item is a parallel group
    if (typeof item === 'object' && 'type' in item && item.type === 'parallelGroup') {
        return processParallelGroup(item as ParallelGroup, ctx);
    }
    // Check if item is a loop group
    else if (typeof item === 'object' && 'type' in item && item.type === 'loopGroup') {
        return processLoopGroup(item as LoopGroup, ctx);
    }
    // Check if item is an if group
    else if (typeof item === 'object' && 'type' in item && item.type === 'ifGroup') {
        return processIfGroup(item as IfGroup, ctx);
    }
    // Check if item is a waitUntil group
    else if (typeof item === 'object' && 'type' in item && item.type === 'waitUntilGroup') {
        return processWaitUntilGroup(item as WaitUntilGroup, ctx);
    }
    // Check if item is a task wrapper (TaskReference)
    else if (typeof item === 'object' && 'type' in item && item.type === 'task') {
        const taskInfo = extractTaskInfo(item as TaskReference);
        const taskId = generateTaskId(taskInfo.name, ctx.taskIndexRef.value++);
        // Use processNormalTask - pass parallel flag for parallel group execution
        const results = await processNormalTask(taskInfo, taskId, ctx, parallel);
        // Update previousTaskJobs for sequential dependency tracking (only if not parallel)
        if (!parallel) {
            const taskJobs = ctx.taskJobMap.get(taskInfo.name);
            if (taskJobs) {
                ctx.previousTaskJobs = taskJobs;
            }
        }
        return results;
    }
    // Check if item is a direct task (TopLevelTask with name property)
    else if (typeof item === 'object' && 'name' in item && 'description' in item) {
        const taskInfo = item as TaskInfo;
        const taskId = generateTaskId(taskInfo.name, ctx.taskIndexRef.value++);
        // Use processNormalTask - pass parallel flag for parallel group execution
        const results = await processNormalTask(taskInfo, taskId, ctx, parallel);
        // Update previousTaskJobs for sequential dependency tracking (only if not parallel)
        if (!parallel) {
            const taskJobs = ctx.taskJobMap.get(taskInfo.name);
            if (taskJobs) {
                ctx.previousTaskJobs = taskJobs;
            }
        }
        return results;
    }
    else {
        console.warn('[Orchestrator] Unknown item type:', item);
        return [];
    }
}


/**
 * Main function to process all tasks from an action plan and create jobs
 */
export async function processActionPlanTasks(
    planId: string,
    workerAgentId?: string
): Promise<{ success: boolean; groupId?: string; jobs: CreateJobResult[]; error?: string }> {
    try {
        // 1. Fetch plan details
        codebolt.chat.sendMessage(`Fetching plan details for ${planId}...`, {});
        const planResponse = await codebolt.actionPlan.getActionPlanDetail(planId);
        // codebolt.chat.sendMessage(JSON.stringify(planResponse));

        if (!planResponse?.actionPlan) {
            return {
                success: false,
                jobs: [],
                error: `Failed to fetch action plan: ${planId}`
            };
        }

        const actionPlanData = planResponse.actionPlan;
        const plan: ActionPlan = {
            planId: actionPlanData.planId || planId,
            name: actionPlanData.name || 'Unnamed Plan',
            description: actionPlanData.description || '',
            tasks: actionPlanData.items || []
        };

        codebolt.chat.sendMessage(`Plan loaded: "${plan.name}" with ${plan.tasks.length} top-level items`, {});

        // 2. Create a job group for this plan
        codebolt.chat.sendMessage(`Creating job group for plan...`, {});
        const jobGroupResponse = await codebolt.job.createJobGroup({
            name: plan.name
        });
        codebolt.chat.sendMessage(JSON.stringify(jobGroupResponse))

        if (!jobGroupResponse?.group?.id) {
            return {
                success: false,
                jobs: [],
                error: 'Failed to create job group'
            };
        }

        const rootGroupId = jobGroupResponse.group.id;
        codebolt.chat.sendMessage(`Job group created: ${rootGroupId}`, {});

        // 3. Process all tasks from the plan using processItemWithContext pattern
        const allResults: CreateJobResult[] = [];
        const taskIndexRef = { value: 0 };

        // Create processing context with tracking for dependencies
        const ctx: ProcessingContext = {
            plan,
            rootGroupId,
            currentGroupId: rootGroupId,
            taskIndexRef,
            workerAgentId,
            createdJobs: [],
            taskJobMap: new Map<string, CreatedJob[]>()
        };

        console.log(`[Orchestrator] Starting action plan: ${plan.name}`);
        console.log(`[Orchestrator] Total items: ${plan.tasks.length}`);
        codebolt.chat.sendMessage(`🚀 Starting action plan: ${plan.name} (${plan.tasks.length} items)`);

        // Process each item sequentially at the top level
        for (let i = 0; i < plan.tasks.length; i++) {
            const item = plan.tasks[i];
            console.log(`[Orchestrator] Processing item ${i + 1}/${plan.tasks.length}`);
            codebolt.chat.sendMessage(`📋 Processing item ${i + 1}/${plan.tasks.length}`);

            const itemResults = await processItemWithContext(item, {
                ...ctx,
                taskContext: { waitForCompletion: true }
            });
            allResults.push(...itemResults);
        }

        // 4. Report results
        const successCount = allResults.filter(r => r.success).length;
        const failureCount = allResults.filter(r => !r.success).length;

        codebolt.chat.sendMessage(
            `Job creation complete. Success: ${successCount}, Failed: ${failureCount}`,
            {}
        );

        return {
            success: failureCount === 0,
            groupId: rootGroupId,
            jobs: allResults
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        codebolt.chat.sendMessage(`Error processing action plan: ${errorMessage}`, {});
        return {
            success: false,
            jobs: [],
            error: errorMessage
        };
    }
}
