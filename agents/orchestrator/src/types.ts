// Types for plan nodes
export interface BaseNode {
    type: string;
}

export interface TaskNode extends BaseNode {
    type: 'task';
    id?: number;
    taskId?: string;
    name?: string;
    task?: string;
    [key: string]: any;
}

export interface ParallelGroupNode extends BaseNode {
    type: 'parallelGroup';
    groupItems: {
        [trackName: string]: PlanNode[];
    };
}

export interface LoopGroupNode extends BaseNode {
    type: 'loopGroup';
    iterationListId: string;
    loopTasks: PlanNode[];
}

export interface IfGroupNode extends BaseNode {
    type: 'ifGroup';
    condition: string;
    ifTasks: PlanNode[];
}

export interface WaitUntilGroupNode extends BaseNode {
    type: 'waitUntilGroup';
    waitSteps: string[];
    waitTasks: PlanNode[];
}

export type PlanNode = TaskNode | ParallelGroupNode | LoopGroupNode | IfGroupNode | WaitUntilGroupNode;

export interface Plan {
    planId: string;
    name: string;
    items: PlanNode[];
    [key: string]: any;
}
