import { ZodAny, ZodType } from "zod";
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



export interface BaseWorkFlowStep {
    id: string;
    description: string;
    inputSchema?: ZodType<any, any, any>;
    outputSchema?: ZodType<any, any, any>;
    type: StepType;
    execute(context:any):Promise<any>
}
export interface WorkflowResult {
    /** Unique execution ID */
    executionId: string;
    /** Whether workflow completed successfully */
    success: boolean;
    /** Final context data */
    data: Record<string, unknown>;
    /** All step results */
    stepResults: workflowStepOutput[];
    /** Total execution time */
    executionTime: number;
    /** Error message if failed */
    error?: string;
}

export interface BaseWorkflow {
    execute():WorkflowResult
    executeStep():workflowStepOutput
    executeSteps():workflowStepOutput[]
    getContext():any
    updateContext(context:any):any

}

export interface workflowConfig{
     /** Workflow name */
     name: string;
     /** Workflow description */
     description?: string;
     /** Workflow version */
     version?: string;
     /** Workflow steps */
     steps: BaseWorkFlowStep[];
     inputSchema:ZodAny,
     outputSchema:ZodAny
}
