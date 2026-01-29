import { AgentInterface, BaseWorkFlowStep, StepConfig, StepType, ToolInterface, workflowContext, workflowStepOutput } from "@codebolt/types/agent";
import type { ZodType } from "zod";


export class ParallelStep implements BaseWorkFlowStep{
   public id: string;
   public description: string;
   public type: StepType;
   public inputSchema?: ZodType<any, any, any>;
   public outputSchema?: ZodType<any, any, any>;
   private steps:WorkFlowStep[]
       constructor(config:StepConfig,steps:WorkFlowStep[]){
        this.steps=steps;
        this.id=config.id;
        this.description=config.description;
        this.type=config.type;
        if (config.inputSchema !== undefined) {
            this.inputSchema = config.inputSchema;
        }
        if (config.outputSchema !== undefined) {
            this.outputSchema = config.outputSchema;
        }
       }
       async execute(context: any): Promise<workflowContext> {
            try {
                // Execute all steps in parallel using Promise.all
                const stepPromises = this.steps.map((step, index) => 
                    step.execute(context).catch(error => ({
                        stepId: `${this.id}_step_${index}`,
                        success: false,
                        result: null,
                        error: error instanceof Error ? error.message : 'Unknown error occurred'
                    }))
                );
                
                const results = await Promise.all(stepPromises);
                return results;
            } catch (error) {
                // If Promise.all fails entirely, return error result
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                return [{
                    stepId: this.id,
                    success: false,
                    result: null,
                    error: `Failed to execute parallel steps: ${errorMessage}`
                }];
            }
       }
}

export class ConditionStep implements BaseWorkFlowStep{
    public id: string;
    public description: string;
    public type: StepType;
    public inputSchema?: ZodType<any, any, any>;
    public outputSchema?: ZodType<any, any, any>;
    private steps:WorkFlowStep[]
    constructor(config:StepConfig,steps:WorkFlowStep[]){
        this.steps=steps;
        this.id=config.id;
        this.description=config.description;
        this.type=config.type;
        if (config.inputSchema !== undefined) {
            this.inputSchema = config.inputSchema;
        }
        if (config.outputSchema !== undefined) {
            this.outputSchema = config.outputSchema;
        }
    }
    async execute(context: any): Promise<workflowContext> {
        try {
            // For condition step, execute steps sequentially based on conditions
            // This is a basic implementation - you may want to add condition logic
            const results: workflowStepOutput[] = [];

            for (let i = 0; i < this.steps.length; i++) {
                const step = this.steps[i];
                if (!step) continue;
                try {
                    const result = await step.execute(context);
                    results.push(result);
                    
                    // If step fails and it's a condition, you might want to break or continue
                    // This depends on your condition logic
                    if (!result.success) {
                        break; // Stop on first failure for condition step
                    }
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                    results.push({
                        stepId: `${this.id}_step_${i}`,
                        success: false,
                        result: null,
                        error: errorMessage
                    });
                    break; // Stop on error
                }
            }
            
            return results;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return [{
                stepId: this.id,
                success: false,
                result: null,
                error: `Failed to execute condition steps: ${errorMessage}`
            }];
        }
    }
}

export class LoopStep implements BaseWorkFlowStep{
    public id: string;
    public description: string;
    public type: StepType;
    public inputSchema?: ZodType<any, any, any>;
    public outputSchema?: ZodType<any, any, any>;
    private steps:WorkFlowStep[]
    private maxIterations: number;

    constructor(config:StepConfig,steps:WorkFlowStep[], maxIterations: number = 10){
        this.steps=steps;
        this.id=config.id;
        this.description=config.description;
        this.type=config.type;
        if (config.inputSchema !== undefined) {
            this.inputSchema = config.inputSchema;
        }
        if (config.outputSchema !== undefined) {
            this.outputSchema = config.outputSchema;
        }
        this.maxIterations = maxIterations;
    }

    async execute(context: any): Promise<workflowContext> {
        try {
            const allResults: workflowStepOutput[] = [];
            let iteration = 0;
            let shouldContinue = true;

            while (shouldContinue && iteration < this.maxIterations) {
                const iterationResults: workflowStepOutput[] = [];

                // Execute all steps in this iteration
                for (let i = 0; i < this.steps.length; i++) {
                    const step = this.steps[i];
                    if (!step) continue;
                    try {
                        const result = await step.execute(context);
                        result.stepId = `${result.stepId}_loop_${iteration}`;
                        iterationResults.push(result);
                        
                        // You can add loop exit conditions based on step results
                        // For example, stop if a specific condition is met
                        if (!result.success) {
                            shouldContinue = false;
                            break;
                        }
                    } catch (error) {
                        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                        iterationResults.push({
                            stepId: `${this.id}_step_${i}_loop_${iteration}`,
                            success: false,
                            result: null,
                            error: errorMessage
                        });
                        shouldContinue = false;
                        break;
                    }
                }
                
                allResults.push(...iterationResults);
                iteration++;
                
                // You can add custom loop continuation logic here
                // For now, it continues until max iterations or failure
            }
            
            return allResults;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return [{
                stepId: this.id,
                success: false,
                result: null,
                error: `Failed to execute loop steps: ${errorMessage}`
            }];
        }
    }
}
export class WorkFlowStep implements BaseWorkFlowStep {
    public id: string;
    public description: string;
    public type: StepType;
    public inputSchema?: ZodType<any, any, any>;
    public outputSchema?: ZodType<any, any, any>;
    private config: StepConfig;

    constructor(config: StepConfig) {
        this.config = config;
        this.id = config.id;
        this.description = config.description;
        this.type = config.type;
        if (config.inputSchema !== undefined) {
            this.inputSchema = config.inputSchema;
        }
        if (config.outputSchema !== undefined) {
            this.outputSchema = config.outputSchema;
        }
    }
    
    async execute(context: any): Promise<workflowStepOutput> {
        try {
            const result = await this.config.execute(context);
            return {
                stepId: this.config.id,
                success: true,
                result: result,
                metaData: context
            };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return {
                stepId: this.config.id,
                success: false,
                result: null,
                error: errorMessage
            };
        }
    }
}
export class AgentStep implements BaseWorkFlowStep {
    private agent:AgentInterface
    public id: string;
    public description: string;
    public type: StepType;
    public inputSchema?: ZodType<any, any, any>;
    public outputSchema?: ZodType<any, any, any>;
    constructor(config: StepConfig, agent: AgentInterface) {
        this.agent=agent
        this.id=config.id;
        this.description=config.description;
        this.type=config.type;
        if (config.inputSchema !== undefined) {
            this.inputSchema = config.inputSchema;
        }
        if (config.outputSchema !== undefined) {
            this.outputSchema = config.outputSchema;
        }
    }
   async execute(context: any): Promise<workflowStepOutput> {
        const {result,success,error} = await this.agent.execute(context)
        const output: workflowStepOutput = {
            stepId: this.id,
            success: success,
            result: result
        };
        if (error !== undefined) {
            output.error = error;
        }
        return output;
    }
}
export class ToolStep implements BaseWorkFlowStep {
    private tool:ToolInterface
    public id: string;
    public description: string;
    public type: StepType;
    public inputSchema?: ZodType<any, any, any>;
    public outputSchema?: ZodType<any, any, any>;

    constructor(config: StepConfig, tool: ToolInterface) {
        this.id=config.id;
        this.description=config.description;
        this.type=config.type;
        if (config.inputSchema !== undefined) {
            this.inputSchema = config.inputSchema;
        }
        if (config.outputSchema !== undefined) {
            this.outputSchema = config.outputSchema;
        }
        this.tool=tool;
    }
    async execute(context:any): Promise<workflowStepOutput> {
        try {
            const {result,success,error} = await this.tool.execute({},context)
            const output: workflowStepOutput = {
                stepId: this.id,
                success: success,
                result: result
            };
            if (error !== undefined) {
                output.error = error;
            }
            return output;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            const output: workflowStepOutput = {
                stepId: this.id,
                success: false,
                result: null
            };
            output.error = errorMessage;
            return output;
        }
    }
}

// export class parllelAgentStep implements BaseWorkFlowStep{
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


