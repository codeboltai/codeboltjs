import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";
import { AgentStep } from '@codebolt/agent/unified';
codebolt.onMessage(async (reqMessage: FlatUserMessage) => {

    try {
     codebolt.chat.sendMessage("Orchestrator Agent Started");
     let {response}= await codebolt.actionPlan.getAllPlans();
     let plan=response.data.actionPlans[2];
     
    // plans.forEach((plan:any) => {
        codebolt.chat.sendMessage("Plan Name:"+ plan.name);
        plan.items.forEach( async (step:any) => {
            codebolt.chat.sendMessage("Step Name:"+ step.name);
            
            // Start task step with listener - the callback will be called for each response
            const cleanup = codebolt.actionPlan.startTaskStepWithListener(
                plan.planId,
                step.taskId,
                (response:any) => {
                    // task step completed
                    codebolt.chat.sendMessage(JSON.stringify(response, null, 2));
                    // Remove listener after receiving the event
                    cleanup();
                }
            );
        });
    // });

    } catch (error) {
    
    }
})



