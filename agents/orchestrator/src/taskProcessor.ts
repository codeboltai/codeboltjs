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
type PlanItem = TopLevelTask | StepGroup;

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
 * Creates a job for a single task by calling the create-jobs-from-plan action block
 */
async function createJobForTask(
    task: TaskInfo,
    taskId: string,
    plan: ActionPlan,
    groupId: string,
    workerAgentId?: string
): Promise<CreateJobResult> {
    try {
        codebolt.chat.sendMessage(`Starting action block for ${task}`)
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
            return result.result as CreateJobResult;
        }

        return {
            success: false,
            error: result.error || 'Failed to create job',
            groupId
        };
    } catch (error) {
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            groupId
        };
    }
}

/**
 * Processes tasks from a parallel group - creates jobs for all tasks in parallel
 */
async function processParallelGroup(
    group: ParallelGroup,
    plan: ActionPlan,
    groupId: string,
    taskIndexRef: { value: number },
    workerAgentId?: string
): Promise<CreateJobResult[]> {
    const results: CreateJobResult[] = [];
    const parallelPromises: Promise<CreateJobResult>[] = [];

    codebolt.chat.sendMessage(`Processing parallel group: ${group.name || 'Unnamed'}`, {});

    // Collect all tasks from all tracks
    for (const [trackName, trackItems] of Object.entries(group.groupItems)) {
        codebolt.chat.sendMessage(`  Track: ${trackName}`, {});

        for (const item of trackItems) {
            if (item.type === 'task') {
                const taskInfo = extractTaskInfo(item as TaskReference);
                const taskId = generateTaskId(taskInfo.name, taskIndexRef.value++);
                parallelPromises.push(
                    createJobForTask(taskInfo, taskId, plan, groupId, workerAgentId)
                );
            } else {
                // Nested group - process recursively
                const nestedResults = await processStepGroup(
                    item as StepGroup,
                    plan,
                    groupId,
                    taskIndexRef,
                    workerAgentId
                );
                results.push(...nestedResults);
            }
        }
    }

    // Execute all parallel task creations
    if (parallelPromises.length > 0) {
        const parallelResults = await Promise.all(parallelPromises);
        results.push(...parallelResults);
    }

    return results;
}

/**
 * Processes tasks from a loop group - creates jobs sequentially
 */
async function processLoopGroup(
    group: LoopGroup,
    plan: ActionPlan,
    groupId: string,
    taskIndexRef: { value: number },
    workerAgentId?: string
): Promise<CreateJobResult[]> {
    const results: CreateJobResult[] = [];

    codebolt.chat.sendMessage(`Processing loop group: ${group.name || 'Unnamed'} (iteration: ${group.iterationListId})`, {});

    for (const item of group.loopTasks) {
        if (item.type === 'task') {
            const taskInfo = extractTaskInfo(item as TaskReference);
            const taskId = generateTaskId(taskInfo.name, taskIndexRef.value++);
            const result = await createJobForTask(taskInfo, taskId, plan, groupId, workerAgentId);
            results.push(result);
        } else {
            const nestedResults = await processStepGroup(
                item as StepGroup,
                plan,
                groupId,
                taskIndexRef,
                workerAgentId
            );
            results.push(...nestedResults);
        }
    }

    return results;
}

/**
 * Processes tasks from an if group - creates jobs sequentially
 */
async function processIfGroup(
    group: IfGroup,
    plan: ActionPlan,
    groupId: string,
    taskIndexRef: { value: number },
    workerAgentId?: string
): Promise<CreateJobResult[]> {
    const results: CreateJobResult[] = [];

    codebolt.chat.sendMessage(`Processing if group: ${group.name || 'Unnamed'} (condition: ${group.condition})`, {});

    for (const item of group.ifTasks) {
        if (item.type === 'task') {
            const taskInfo = extractTaskInfo(item as TaskReference);
            const taskId = generateTaskId(taskInfo.name, taskIndexRef.value++);
            const result = await createJobForTask(taskInfo, taskId, plan, groupId, workerAgentId);
            results.push(result);
        } else {
            const nestedResults = await processStepGroup(
                item as StepGroup,
                plan,
                groupId,
                taskIndexRef,
                workerAgentId
            );
            results.push(...nestedResults);
        }
    }

    return results;
}

/**
 * Processes tasks from a waitUntil group - creates jobs sequentially
 */
async function processWaitUntilGroup(
    group: WaitUntilGroup,
    plan: ActionPlan,
    groupId: string,
    taskIndexRef: { value: number },
    workerAgentId?: string
): Promise<CreateJobResult[]> {
    const results: CreateJobResult[] = [];

    codebolt.chat.sendMessage(`Processing waitUntil group: ${group.name || 'Unnamed'} (steps: ${group.waitSteps.join(', ')})`, {});

    for (const item of group.waitTasks) {
        if (item.type === 'task') {
            const taskInfo = extractTaskInfo(item as TaskReference);
            const taskId = generateTaskId(taskInfo.name, taskIndexRef.value++);
            const result = await createJobForTask(taskInfo, taskId, plan, groupId, workerAgentId);
            results.push(result);
        } else {
            const nestedResults = await processStepGroup(
                item as StepGroup,
                plan,
                groupId,
                taskIndexRef,
                workerAgentId
            );
            results.push(...nestedResults);
        }
    }

    return results;
}

/**
 * Processes a step group based on its type
 */
async function processStepGroup(
    group: StepGroup,
    plan: ActionPlan,
    groupId: string,
    taskIndexRef: { value: number },
    workerAgentId?: string
): Promise<CreateJobResult[]> {
    switch (group.type) {
        case 'parallelGroup':
            return processParallelGroup(group, plan, groupId, taskIndexRef, workerAgentId);
        case 'loopGroup':
            return processLoopGroup(group, plan, groupId, taskIndexRef, workerAgentId);
        case 'ifGroup':
            return processIfGroup(group, plan, groupId, taskIndexRef, workerAgentId);
        case 'waitUntilGroup':
            return processWaitUntilGroup(group, plan, groupId, taskIndexRef, workerAgentId);
        default:
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
        codebolt.chat.sendMessage(JSON.stringify(planResponse));

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
            tasks: actionPlanData.tasks || []
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

        // 3. Process all tasks from the plan
        const allResults: CreateJobResult[] = [];
        const taskIndexRef = { value: 0 };

        for (const item of plan.tasks) {
            if (item.type === 'task') {
                // Top-level task - process sequentially
                const taskInfo = item as TopLevelTask;
                const taskId = generateTaskId(taskInfo.name, taskIndexRef.value++);
                codebolt.chat.sendMessage(`Processing task: ${taskInfo.name}`, {});
                const result = await createJobForTask(taskInfo, taskId, plan, groupId, workerAgentId);
                allResults.push(result);
            } else {
                // Step group - process based on type
                const groupResults = await processStepGroup(
                    item as StepGroup,
                    plan,
                    groupId,
                    taskIndexRef,
                    workerAgentId
                );
                allResults.push(...groupResults);
            }
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
