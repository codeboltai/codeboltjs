import codebolt from '@codebolt/codeboltjs';
import { JobInfo, executeJobsWithDependencies, JobExecutionContext } from './jobExecutor';

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

interface CreatedJob {
    jobId: string;
    name: string;
    description: string;
    taskName?: string;
    groupId: string;
    dependencies: string[];
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

// Processing context
interface ProcessingContext {
    plan: ActionPlan;
    rootGroupId: string;
    taskIndexRef: { value: number };
    workerAgentId?: string;
    allCreatedJobs: CreatedJob[];
    taskJobMap: Map<string, CreatedJob[]>;
}

interface TaskExecutionResult {
    success: boolean;
    taskName: string;
    jobsCreated: number;
    jobsCompleted: number;
    jobsFailed: number;
    error?: string;
}

interface ProcessActionPlanResult {
    success: boolean;
    groupId?: string;
    tasksProcessed: number;
    tasksSucceeded: number;
    tasksFailed: number;
    totalJobs: number;
    error?: string;
}

// ================================
// HELPER FUNCTIONS
// ================================

function generateTaskId(taskName: string, index: number): string {
    const sanitized = taskName.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30);
    return `task-${sanitized}-${index}`;
}

function extractTaskInfo(item: TopLevelTask | TaskReference): TaskInfo {
    if ('task' in item) {
        return item.task;
    }
    return item;
}

function mapPriority(priority?: string): 1 | 2 | 3 | 4 {
    switch (priority?.toLowerCase()) {
        case 'high': return 2;
        case 'medium': return 3;
        case 'low': return 4;
        default: return 3;
    }
}

// ================================
// SINGLE TASK PROCESSING
// ================================

/**
 * Breaks a task into sub-jobs using the LLM action block
 */
async function breakTaskIntoJobs(
    task: TaskInfo,
    taskId: string,
    ctx: ProcessingContext
): Promise<SubJobDefinition[]> {
    const { plan, allCreatedJobs } = ctx;

    codebolt.chat.sendMessage(`Breaking down task: ${task.name}`);

    try {
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
            existingJobs: allCreatedJobs
        });

        if (breakdownResult.success && breakdownResult.result?.subJobs) {
            return breakdownResult.result.subJobs;
        }
    } catch (error) {
        console.error(`[TaskProcessor] Error breaking down task: ${task.name}`, error);
    }

    // Fallback: create a single job
    return [{
        name: `Implement: ${task.name}`,
        description: task.description,
        type: 'task',
        priority: mapPriority(task.priority),
        estimatedEffort: 'medium'
    }];
}

/**
 * Creates jobs for a single task and returns them for execution
 */
async function createJobsForTask(
    task: TaskInfo,
    subJobs: SubJobDefinition[],
    ctx: ProcessingContext
): Promise<CreatedJob[]> {
    const { rootGroupId } = ctx;
    const createdJobsForTask: CreatedJob[] = [];
    const subJobNameToId: Map<string, string> = new Map();

    // Create a sub-group for this task
    const taskGroupResponse = await codebolt.job.createJobGroup({
        name: task.name,
        parentId: rootGroupId
    });

    if (!taskGroupResponse?.group?.id) {
        console.error(`[TaskProcessor] Failed to create job group for task: ${task.name}`);
        return [];
    }

    const taskGroupId = taskGroupResponse.group.id;
    console.log(`[TaskProcessor] Created task job group: ${taskGroupId}`);

    // Create each sub-job
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

                // Calculate dependencies (only within this task)
                const dependencies: string[] = [];

                // Only use explicit dependencies from LLM
                // If dependencies are empty or undefined, the job runs in PARALLEL
                // If dependencies have values, the job runs SEQUENTIALLY after those jobs

                // Internal dependencies (job names within this task)
                if (subJob.internalDependencies && subJob.internalDependencies.length > 0) {
                    for (const depName of subJob.internalDependencies) {
                        const depJobId = subJobNameToId.get(depName);
                        if (depJobId && !dependencies.includes(depJobId)) {
                            dependencies.push(depJobId);
                        }
                    }
                }

                // External dependencies (job IDs from other tasks)
                if (subJob.externalDependencies && subJob.externalDependencies.length > 0) {
                    for (const extDepId of subJob.externalDependencies) {
                        if (!dependencies.includes(extDepId)) {
                            dependencies.push(extDepId);
                        }
                    }
                }

                // Add dependencies in Codebolt Job system
                for (const depId of dependencies) {
                    await codebolt.job.addDependency(jobId, depId, 'blocks');
                }

                const createdJob: CreatedJob = {
                    jobId,
                    name: subJob.name,
                    description: subJob.description,
                    taskName: task.name,
                    groupId: taskGroupId,
                    dependencies
                };

                createdJobsForTask.push(createdJob);
                ctx.allCreatedJobs.push(createdJob);

                console.log(`[TaskProcessor] Created sub-job ${i + 1}/${subJobs.length}: ${subJob.name}`);
            }
        } catch (error) {
            console.error(`[TaskProcessor] Error creating sub-job: ${subJob.name}`, error);
        }
    }

    // Store jobs for this task
    ctx.taskJobMap.set(task.name, createdJobsForTask);

    return createdJobsForTask;
}

/**
 * Processes a SINGLE task completely:
 * 1. Break task into jobs
 * 2. Create jobs
 * 3. Execute all jobs and wait for completion
 * 4. Return result
 */
async function processAndExecuteSingleTask(
    task: TaskInfo,
    ctx: ProcessingContext
): Promise<TaskExecutionResult> {
    const taskId = generateTaskId(task.name, ctx.taskIndexRef.value++);

    console.log(`[TaskProcessor] ========================================`);
    console.log(`[TaskProcessor] Starting task: ${task.name} (${taskId})`);
    console.log(`[TaskProcessor] ========================================`);

    codebolt.chat.sendMessage(`\n--- Starting Task: ${task.name} ---`);

    try {
        // Step 1: Break task into sub-jobs using LLM
        const subJobs = await breakTaskIntoJobs(task, taskId, ctx);
        codebolt.chat.sendMessage(`Task "${task.name}" broken into ${subJobs.length} sub-jobs`);

        // Step 2: Create jobs in Codebolt Job system
        const createdJobs = await createJobsForTask(task, subJobs, ctx);

        if (createdJobs.length === 0) {
            return {
                success: false,
                taskName: task.name,
                jobsCreated: 0,
                jobsCompleted: 0,
                jobsFailed: 0,
                error: 'Failed to create jobs'
            };
        }

        codebolt.chat.sendMessage(`Created ${createdJobs.length} jobs for task "${task.name}". Starting execution...`);

        // Step 3: Execute all jobs for this task and WAIT for completion
        const jobsForExecution: JobInfo[] = createdJobs.map(job => ({
            jobId: job.jobId,
            name: job.name,
            description: job.description,
            taskName: job.taskName,
            groupId: job.groupId,
            status: 'open' as const,
            dependencies: job.dependencies
        }));

        // Validate worker agent ID - must be provided from orchestrator config
        if (!ctx.workerAgentId) {
            codebolt.chat.sendMessage(`Warning: No worker agent configured. Jobs will not be executed.`);
            return {
                success: false,
                taskName: task.name,
                jobsCreated: createdJobs.length,
                jobsCompleted: 0,
                jobsFailed: createdJobs.length,
                error: 'No worker agent ID configured (defaultWorkerAgentId in orchestrator config)'
            };
        }

        const executionContext: JobExecutionContext = {
            workerAgentId: ctx.workerAgentId,
            groupId: createdJobs[0]?.groupId || ctx.rootGroupId,
            onJobStart: (jobId) => {
                console.log(`[TaskProcessor] Job started: ${jobId}`);
            },
            onJobComplete: (jobId, success) => {
                console.log(`[TaskProcessor] Job ${success ? 'completed' : 'failed'}: ${jobId}`);
            }
        };

        const executionResult = await executeJobsWithDependencies(jobsForExecution, executionContext);

        // Step 4: Return result
        const jobsCompleted = createdJobs.length - (executionResult.failedJobs?.length || 0);
        const jobsFailed = executionResult.failedJobs?.length || 0;

        if (executionResult.success) {
            codebolt.chat.sendMessage(`Task "${task.name}" completed successfully! (${jobsCompleted}/${createdJobs.length} jobs)`);
        } else {
            codebolt.chat.sendMessage(`Task "${task.name}" completed with issues. (${jobsCompleted} succeeded, ${jobsFailed} failed)`);
        }

        return {
            success: executionResult.success,
            taskName: task.name,
            jobsCreated: createdJobs.length,
            jobsCompleted,
            jobsFailed,
            error: executionResult.error
        };

    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[TaskProcessor] Error processing task: ${task.name}`, error);
        codebolt.chat.sendMessage(`Task "${task.name}" failed: ${errorMsg}`);

        return {
            success: false,
            taskName: task.name,
            jobsCreated: 0,
            jobsCompleted: 0,
            jobsFailed: 0,
            error: errorMsg
        };
    }
}

// ================================
// GROUP PROCESSING (Sequential task-by-task)
// ================================

/**
 * Processes a parallel group - executes each track's tasks sequentially
 * (within each track, tasks are processed one at a time)
 */
async function processParallelGroup(
    group: ParallelGroup,
    ctx: ProcessingContext
): Promise<TaskExecutionResult[]> {
    console.log(`[TaskProcessor] Processing parallel group: ${group.name || 'Unnamed'}`);
    codebolt.chat.sendMessage(`Processing parallel group: ${group.name || 'Unnamed'}`);

    const allResults: TaskExecutionResult[] = [];
    const trackNames = Object.keys(group.groupItems);

    // For now, process tracks sequentially (can be parallelized later if needed)
    for (const trackName of trackNames) {
        const trackItems = group.groupItems[trackName];
        codebolt.chat.sendMessage(`Processing track: ${trackName}`);

        for (const item of trackItems) {
            const results = await processItem(item, ctx);
            allResults.push(...results);
        }
    }

    return allResults;
}

/**
 * Processes a loop group - executes tasks sequentially
 */
async function processLoopGroup(
    group: LoopGroup,
    ctx: ProcessingContext
): Promise<TaskExecutionResult[]> {
    console.log(`[TaskProcessor] Processing loop group: ${group.name || 'Unnamed'}`);
    codebolt.chat.sendMessage(`Processing loop group: ${group.name || 'Unnamed'}`);

    const allResults: TaskExecutionResult[] = [];

    for (const item of group.loopTasks) {
        const results = await processItem(item, ctx);
        allResults.push(...results);
    }

    return allResults;
}

/**
 * Processes an if group - executes tasks sequentially
 */
async function processIfGroup(
    group: IfGroup,
    ctx: ProcessingContext
): Promise<TaskExecutionResult[]> {
    console.log(`[TaskProcessor] Processing if group: ${group.name || 'Unnamed'}`);
    codebolt.chat.sendMessage(`Processing if group: ${group.name || 'Unnamed'}`);

    const allResults: TaskExecutionResult[] = [];

    for (const item of group.ifTasks) {
        const results = await processItem(item, ctx);
        allResults.push(...results);
    }

    return allResults;
}

/**
 * Processes a waitUntil group - executes tasks sequentially
 */
async function processWaitUntilGroup(
    group: WaitUntilGroup,
    ctx: ProcessingContext
): Promise<TaskExecutionResult[]> {
    console.log(`[TaskProcessor] Processing waitUntil group: ${group.name || 'Unnamed'}`);
    codebolt.chat.sendMessage(`Processing waitUntil group: ${group.name || 'Unnamed'}`);

    const allResults: TaskExecutionResult[] = [];

    for (const item of group.waitTasks) {
        const results = await processItem(item, ctx);
        allResults.push(...results);
    }

    return allResults;
}

/**
 * Routes item to appropriate handler - processes ONE task at a time
 */
async function processItem(
    item: PlanItem | TaskReference | StepGroup,
    ctx: ProcessingContext
): Promise<TaskExecutionResult[]> {
    if (typeof item === 'object' && 'type' in item) {
        switch (item.type) {
            case 'parallelGroup':
                return processParallelGroup(item as ParallelGroup, ctx);
            case 'loopGroup':
                return processLoopGroup(item as LoopGroup, ctx);
            case 'ifGroup':
                return processIfGroup(item as IfGroup, ctx);
            case 'waitUntilGroup':
                return processWaitUntilGroup(item as WaitUntilGroup, ctx);
            case 'task':
                const taskInfo = extractTaskInfo(item as TaskReference);
                const result = await processAndExecuteSingleTask(taskInfo, ctx);
                return [result];
        }
    }

    // Direct task (TopLevelTask with name property)
    if (typeof item === 'object' && 'name' in item && 'description' in item) {
        const taskInfo = item as TaskInfo;
        const result = await processAndExecuteSingleTask(taskInfo, ctx);
        return [result];
    }

    console.warn('[TaskProcessor] Unknown item type:', item);
    return [];
}

// ================================
// MAIN ENTRY POINT
// ================================

/**
 * Processes action plan tasks ONE AT A TIME:
 * 1. Get first task
 * 2. Break it into jobs
 * 3. Execute all jobs and wait for completion
 * 4. Move to next task
 * 5. Repeat until all tasks are done
 */
export async function processActionPlanTasks(
    planId: string,
    workerAgentId?: string
): Promise<ProcessActionPlanResult> {
    try {
        // ================================
        // Fetch plan details
        // ================================

        codebolt.chat.sendMessage(`Fetching plan details for ${planId}...`);
        const planResponse = await codebolt.actionPlan.getActionPlanDetail(planId);

        if (!planResponse?.actionPlan) {
            return {
                success: false,
                tasksProcessed: 0,
                tasksSucceeded: 0,
                tasksFailed: 0,
                totalJobs: 0,
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

        codebolt.chat.sendMessage(`Plan loaded: "${plan.name}" with ${plan.tasks.length} top-level items`);

        // ================================
        // Create root job group
        // ================================

        codebolt.chat.sendMessage(`Creating job group for plan...`);
        const jobGroupResponse = await codebolt.job.createJobGroup({
            name: plan.name
        });

        if (!jobGroupResponse?.group?.id) {
            return {
                success: false,
                tasksProcessed: 0,
                tasksSucceeded: 0,
                tasksFailed: 0,
                totalJobs: 0,
                error: 'Failed to create job group'
            };
        }

        const rootGroupId = jobGroupResponse.group.id;
        codebolt.chat.sendMessage(`Job group created: ${rootGroupId}`);

        // ================================
        // Create processing context
        // ================================

        const ctx: ProcessingContext = {
            plan,
            rootGroupId,
            taskIndexRef: { value: 0 },
            workerAgentId,
            allCreatedJobs: [],
            taskJobMap: new Map<string, CreatedJob[]>()
        };

        // ================================
        // Process tasks ONE AT A TIME
        // ================================

        console.log(`[TaskProcessor] Starting sequential task execution for plan: ${plan.name}`);
        codebolt.chat.sendMessage(`\n========================================`);
        codebolt.chat.sendMessage(`Starting execution of ${plan.tasks.length} tasks (one at a time)`);
        codebolt.chat.sendMessage(`========================================\n`);

        const allResults: TaskExecutionResult[] = [];

        for (let i = 0; i < plan.tasks.length; i++) {
            const item = plan.tasks[i];

            codebolt.chat.sendMessage(`\n[${i + 1}/${plan.tasks.length}] Processing plan item...`);

            const results = await processItem(item, ctx);
            allResults.push(...results);

            // Log progress after each item
            const succeeded = allResults.filter(r => r.success).length;
            const failed = allResults.filter(r => !r.success).length;
            codebolt.chat.sendMessage(`Progress: ${succeeded} tasks succeeded, ${failed} tasks failed`);
        }

        // ================================
        // Final summary
        // ================================

        const tasksProcessed = allResults.length;
        const tasksSucceeded = allResults.filter(r => r.success).length;
        const tasksFailed = allResults.filter(r => !r.success).length;
        const totalJobs = allResults.reduce((sum, r) => sum + r.jobsCreated, 0);

        codebolt.chat.sendMessage(`\n========================================`);
        codebolt.chat.sendMessage(`EXECUTION COMPLETE`);
        codebolt.chat.sendMessage(`========================================`);
        codebolt.chat.sendMessage(`Tasks: ${tasksSucceeded}/${tasksProcessed} succeeded`);
        codebolt.chat.sendMessage(`Total jobs created: ${totalJobs}`);
        if (tasksFailed > 0) {
            codebolt.chat.sendMessage(`Failed tasks: ${allResults.filter(r => !r.success).map(r => r.taskName).join(', ')}`);
        }

        return {
            success: tasksFailed === 0,
            groupId: rootGroupId,
            tasksProcessed,
            tasksSucceeded,
            tasksFailed,
            totalJobs,
            error: tasksFailed > 0 ? `${tasksFailed} tasks failed` : undefined
        };

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        codebolt.chat.sendMessage(`Error processing action plan: ${errorMessage}`);
        return {
            success: false,
            tasksProcessed: 0,
            tasksSucceeded: 0,
            tasksFailed: 0,
            totalJobs: 0,
            error: errorMessage
        };
    }
}
