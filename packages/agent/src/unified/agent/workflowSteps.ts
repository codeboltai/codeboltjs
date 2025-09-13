import { AgentInterface, StepConfig, StepType, ToolInterface, workflowContext, workflowStepOutput } from "@codebolt/types/agent";
import { ZodAny, ZodType } from "zod";



export function createStep(stepId: string, description: string, inputSchema: ZodAny, outputSchema: ZodAny, execute: any) {



}



export abstract class BaseWorkFlowStep {
    id: string;
    description: string;
    inputSchema?: ZodType<any, any, any>;
    outputSchema?: ZodType<any, any, any>;
    // executionFunction: (context: any) => any;
    type: StepType

    constructor(config: StepConfig) {
        this.id = config.id;
        this.description = config.description;
        this.inputSchema = config.inputSchema;
        this.outputSchema = config.outputSchema;
        // this.executionFunction = config.execute
        this.type = config.type
    }
    execute(context:any) {

    }

}

export class ParallelWorkflow extends BaseWorkFlowStep{
       private steps:BaseWorkFlowStep[]
       constructor(config:StepConfig,steps:BaseWorkFlowStep[]){
        super(config)
        this.steps=steps;
       }
       async execute(context: any): Promise<workflowContext> {
          
            //    // Execute all steps in parallel using Promise.all
            //    const stepPromises = this.steps.map((step, index) => 
            //     Promise.resolve(step.execute(context))
            //    );
               

           
       }
}

export class ConditionWorkflow extends BaseWorkFlowStep{
    private steps:BaseWorkFlowStep[]
    constructor(config:StepConfig,steps:BaseWorkFlowStep[]){
     super(config)
     this.steps=steps;
    }
    async execute(context: any): Promise<workflowContext> {
       
         //    // Execute all steps in parallel using Promise.all
         //    const stepPromises = this.steps.map((step, index) => 
         //     Promise.resolve(step.execute(context))
         //    );
            

        
    }
}

export class LoopWorkflow extends BaseWorkFlowStep{
    private steps:BaseWorkFlowStep[]
    constructor(config:StepConfig,steps:BaseWorkFlowStep[]){
     super(config)
     this.steps=steps;
    }
    async execute(context: any): Promise<workflowContext> {
       
         //    // Execute all steps in parallel using Promise.all
         //    const stepPromises = this.steps.map((step, index) => 
         //     Promise.resolve(step.execute(context))
         //    );
            

        
    }
}





export class WorkFlowStep extends BaseWorkFlowStep {
    constructor(config: StepConfig) {
        super(config)
    }
    execute(): workflowStepOutput {
        return {
            stepId: this.id,
            success: true,
            metaData: "any",
            result: "any"
        }
    }
}
export class AgentWorkFlowStep extends BaseWorkFlowStep {
    private agent:AgentInterface
    constructor(config: StepConfig, agent: AgentInterface) {
        super(config)
        this.agent=agent
    }
   async execute(): Promise<workflowStepOutput> {
        let {result,success,error} = await this.agent.execute()
        return {
            stepId: this.id,
            success: success,
            result:result,
            error:error
        }
    }
}
export class ToolWorkFlowStep extends BaseWorkFlowStep {
    private tool:ToolInterface
    private config:StepConfig
    constructor(config: StepConfig, tool: ToolInterface) {

        super(config)
        this.tool=tool
        this.config=config
    }
    async execute(context:any): Promise<workflowStepOutput> {

        let {result,success,error} = await this.tool.execute({},context)
        return {
            stepId: this.id,
            success: success,
            result:result,
            error:error
        }
    }
}

// export class parllelAgentStep extends BaseWorkFlowStep{
//     private agents: AgentInterface[]
//     private config: StepConfig
    
//     constructor(config: StepConfig, agents: AgentInterface[]) {
//         super(config)
//         this.config = config
//         this.agents = agents
//     }
    
//     async execute(context: any): Promise<workflowStepOutput> {
//         try {
//             // Execute all agents in parallel using Promise.all
//             const agentPromises = this.agents.map((agent, index) => 
//                 agent.execute().then(result => ({
//                     agentIndex: index,
//                     ...result
//                 })).catch(error => ({
//                     agentIndex: index,
//                     success: false,
//                     result: null,
//                     error: error instanceof Error ? error.message : 'Unknown error occurred'
//                 }))
//             );

//             const results = await Promise.all(agentPromises);
            
//             // Aggregate results
//             const successfulResults = results.filter(result => result.success);
//             const failedResults = results.filter(result => !result.success);
            
//             const overallSuccess = failedResults.length === 0;
            
//             return {
//                 stepId: this.id,
//                 success: overallSuccess,
//                 result: {
//                     totalAgents: this.agents.length,
//                     successfulAgents: successfulResults.length,
//                     failedAgents: failedResults.length,
//                     results: results,
//                     successfulResults: successfulResults.map(r => r.result),
//                     errors: failedResults.map(r => ({ agentIndex: r.agentIndex, error: r.error }))
//                 },
//                 error: failedResults.length > 0 ? 
//                     `${failedResults.length} out of ${this.agents.length} agents failed` : 
//                     undefined
//             };
//         } catch (error) {
//             const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
//             return {
//                 stepId: this.id,
//                 success: false,
//                 result: null,
//                 error: `Failed to execute parallel agents: ${errorMessage}`
//             };
//         }
//     }
// }


