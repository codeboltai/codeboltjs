import { ZodType } from "zod";
export declare enum StepType {
    agent = "agent",
    tool = "tool",
    workflow = "workflow",
    custom = "custom"
}
export interface StepConfig {
    id: string;
    description: string;
    inputSchema: ZodType<any, any, any>;
    outputSchema?: ZodType<any, any, any>;
    execute: (context: any) => any;
    type: StepType;
}
export type workflowStepOutput = {
    stepId: string;
    success: boolean;
    metaData?: any;
    result: any;
    error?: string;
};

export type workflowContext=workflowStepOutput[]
