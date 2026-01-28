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

// Processing context passed through the call chain
interface ProcessingContext {
    plan: ActionPlan;
    groupId: string;
    taskIndexRef: { value: number };
    workerAgentId?: string;
    taskContext?: TaskContext;
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
    const { plan, groupId, workerAgentId, taskContext = {} } = ctx;
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
            groupId,
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
            groupId
        };
    } catch (error) {
        console.error(`[Orchestrator] Error creating job: ${task.name}${contextMsg}`, error);
        codebolt.chat.sendMessage(`❌ Error${contextMsg}: ${task.name} - ${error instanceof Error ? error.message : String(error)}`);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            groupId
        };
    }
}

/**
 * Processes a track within a parallel group (items within track run in parallel)
 * Aligned with orchestrator-worker pattern
 */
async function processTrack(
    trackName: string,
    trackItems: (TaskReference | StepGroup)[],
    trackIndex: number,
    totalTracks: number,
    ctx: ProcessingContext
): Promise<CreateJobResult[]> {
    console.log(`[Orchestrator] Processing track: ${trackName} (${trackIndex + 1}/${totalTracks}) with ${trackItems.length} items`);
    codebolt.chat.sendMessage(`🔀 Starting track [${trackIndex + 1}/${totalTracks}]: ${trackName} (${trackItems.length} items)`);

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

        // Process item and collect the promise
        const promise = processItemWithContext(item, { ...ctx, taskContext: itemContext });
        taskPromises.push(promise);
    }

    // Wait for all tasks in this track to complete
    codebolt.chat.sendMessage(`⏳ Track [${trackIndex + 1}/${totalTracks}]: ${trackName} - waiting for ${taskPromises.length} item(s)...`);
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
 */
async function processItemWithContext(
    item: PlanItem | TaskReference | StepGroup,
    ctx: ProcessingContext
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
        const result = await createJobForTask(taskInfo, taskId, ctx);
        return [result];
    }
    // Check if item is a direct task (TopLevelTask with name property)
    else if (typeof item === 'object' && 'name' in item && 'description' in item) {
        const taskInfo = item as TaskInfo;
        const taskId = generateTaskId(taskInfo.name, ctx.taskIndexRef.value++);
        const result = await createJobForTask(taskInfo, taskId, ctx);
        return [result];
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

        const groupId = jobGroupResponse.group.id;
        codebolt.chat.sendMessage(`Job group created: ${groupId}`, {});

        // 3. Process all tasks from the plan using processItemWithContext pattern
        const allResults: CreateJobResult[] = [];
        const taskIndexRef = { value: 0 };

        // Create processing context
        const ctx: ProcessingContext = {
            plan,
            groupId,
            taskIndexRef,
            workerAgentId
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
            groupId,
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
