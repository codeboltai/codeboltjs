// ================================
// PLANNER TYPE DEFINITIONS
// ================================

export interface PlanResult {
    success: boolean;
    planId?: string;
    requirementPlanPath?: string;
    error?: string;
}

// ================================
// TASK DEFINITIONS
// ================================

export interface Task {
    type: 'task';
    name: string;
    description: string;
    dependencies: string[];
    estimated_time: string;
    priority: 'High' | 'Medium' | 'Low';
}

export interface TaskReference {
    type: 'task';
    task: Omit<Task, 'type'>;
}

// ================================
// GROUP DEFINITIONS
// ================================

export interface ParallelGroup {
    type: 'parallelGroup';
    name?: string;
    groupItems: Record<string, (TaskReference | StepGroup)[]>;
}

export interface LoopGroup {
    type: 'loopGroup';
    name?: string;
    iterationListId: string;
    loopTasks: (TaskReference | StepGroup)[];
}

export interface IfGroup {
    type: 'ifGroup';
    name?: string;
    condition: string;
    ifTasks: (TaskReference | StepGroup)[];
}

export interface WaitUntilGroup {
    type: 'waitUntilGroup';
    name?: string;
    waitSteps: string[];
    waitTasks: (TaskReference | StepGroup)[];
}

export type StepGroup = ParallelGroup | LoopGroup | IfGroup | WaitUntilGroup;

export type TaskItem = Task | StepGroup;

// ================================
// PLAN STRUCTURE
// ================================

export interface PlanMetadata {
    name: string;
    description: string;
}

export interface TaskPlan {
    plan: PlanMetadata;
    tasks: TaskItem[];
}
