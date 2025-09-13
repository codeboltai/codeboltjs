import { BaseWorkflow, workflowConfig, WorkflowResult, workflowStepOutput } from "@codebolt/types/agent";






export class Workflow implements BaseWorkflow {
    private config:workflowConfig
    constructor(config:workflowConfig){
        this.config=config

    }
    execute(): WorkflowResult {
        throw new Error("Method not implemented.");
    }
    executeStep(): workflowStepOutput {
        throw new Error("Method not implemented.");
    }
    executeSteps(): workflowStepOutput[] {
        throw new Error("Method not implemented.");
    }
    getContext() {
        throw new Error("Method not implemented.");
    }
    updateContext(context: any) {
        throw new Error("Method not implemented.");
    }
}