import codebolt from '@codebolt/codeboltjs';
import { FlatUserMessage } from "@codebolt/types/sdk";
import { AgentStep } from '@codebolt/agent/unified';
import { 
    Plan, 
    PlanNode, 
    TaskNode, 
    ParallelGroupNode, 
    LoopGroupNode, 
    IfGroupNode, 
    WaitUntilGroupNode 
} from './types';

// Orchestrator class to handle plan execution
class PlanOrchestrator {
    private completedSteps: Set<string> = new Set();
    private planId: string;
    
    constructor(planId: string) {
        this.planId = planId;
    }

    /**
     * Main entry point to execute a plan
     */
    async executePlan(plan: Plan): Promise<void> {
        codebolt.chat.sendMessage(`🚀 Starting execution of plan: ${plan.name}`);
        
        for (const item of plan.items) {
            await this.processNode(item);
        }
        
        codebolt.chat.sendMessage(`✅ Plan "${plan.name}" completed successfully`);
    }

    /**
     * Process a single node based on its type
     */
    private async processNode(node: PlanNode): Promise<void> {
        switch (node.type) {
            case 'task':
                // Handle nested task structure: { type: 'task', task: { taskId, name, ... } }
                const taskNode = node as any;
                
                if (taskNode.task && typeof taskNode.task === 'object') {
                    // Extract task data from nested structure
                    const extractedTask: TaskNode = {
                        type: 'task',
                        taskId: taskNode.task.taskId,
                        name: taskNode.task.name,
                        task: taskNode.task.name,
                        ...taskNode.task
                    };
                    await this.executeTask(extractedTask);
                } else {
                    await this.executeTask(node as TaskNode);
                }
                break;
            case 'parallelGroup':
                await this.executeParallelGroup(node as ParallelGroupNode);
                break;
            case 'loopGroup':
                await this.executeLoopGroup(node as LoopGroupNode);
                break;
            case 'ifGroup':
                await this.executeIfGroup(node as IfGroupNode);
                break;
            case 'waitUntilGroup':
                await this.executeWaitUntilGroup(node as WaitUntilGroupNode);
                break;
            default:
                // Handle regular task objects that don't have explicit type
                const anyNode = node as any;
                if (anyNode.taskId) {
                    await this.executeTask(node as TaskNode);
                } else if (anyNode.task && anyNode.task.taskId) {
                    // Handle nested task structure in default case
                    const extractedTask: TaskNode = {
                        type: 'task',
                        taskId: anyNode.task.taskId,
                        name: anyNode.task.name,
                        task: anyNode.task.name,
                        ...anyNode.task
                    };
                    await this.executeTask(extractedTask);
                } else {
                    codebolt.chat.sendMessage(`⚠️ Unknown node type: ${JSON.stringify(node)}`);
                }
        }
    }

    /**
     * Execute a single task
     */
    private async executeTask(task: TaskNode): Promise<void> {
        const taskName = task.name || task.task || 'Unnamed Task';
        const taskId = task.taskId;
        
        if (!taskId) {
            codebolt.chat.sendMessage(`⚠️ Task "${taskName}" has no taskId, skipping...`);
            return;
        }

        codebolt.chat.sendMessage(`📋 Executing task: ${taskName}`);
        
        return new Promise((resolve, reject) => {
            try {
                const cleanup = codebolt.actionPlan.startTaskStepWithListener(
                    this.planId,
                    taskId,
                    (response: any) => {
                        if (response.status === 'completed' || response.status === 'success') {
                            codebolt.chat.sendMessage(`✓ Task "${taskName}" completed`);
                            this.completedSteps.add(taskId);
                            cleanup();
                            resolve();
                        } else if (response.status === 'failed' || response.status === 'error') {
                            codebolt.chat.sendMessage(`✗ Task "${taskName}" failed: ${response.error || 'Unknown error'}`);
                            cleanup();
                            reject(new Error(`Task ${taskName} failed`));
                        } else {
                            // Progress update
                            codebolt.chat.sendMessage(`⏳ Task "${taskName}" progress: ${response.status || 'processing'}`);
                        }
                    }
                );
            } catch (error) {
                codebolt.chat.sendMessage(`✗ Error executing task "${taskName}": ${error}`);
                reject(error);
            }
        });
    }

    /**
     * Execute parallel group - all tracks run in parallel, tasks within each track run sequentially
     */
    private async executeParallelGroup(group: ParallelGroupNode): Promise<void> {
        codebolt.chat.sendMessage(`🔀 Starting parallel group with ${Object.keys(group.groupItems).length} tracks`);
        
        const trackPromises = Object.entries(group.groupItems).map(async ([trackName, tasks]) => {
            try {
                codebolt.chat.sendMessage(`  ▶ Starting track: ${trackName}`);
                
                // Execute tasks in this track sequentially
                for (const task of tasks) {
                    try {
                        await this.processNode(task);
                    } catch (error) {
                        codebolt.chat.sendMessage(`  ✗ Error in track "${trackName}" task: ${error instanceof Error ? error.message : String(error)}`);
                        // Continue with next task even if one fails
                    }
                }
                
                codebolt.chat.sendMessage(`  ✓ Track "${trackName}" completed`);
            } catch (error) {
                codebolt.chat.sendMessage(`  ✗ Track "${trackName}" failed: ${error instanceof Error ? error.message : String(error)}`);
                // Re-throw to be caught by Promise.allSettled
                throw error;
            }
        });

        // Wait for all tracks to complete (using allSettled to handle individual failures)
        const results = await Promise.allSettled(trackPromises);
        
        // Check if any tracks failed
        const failedTracks = results.filter(result => result.status === 'rejected');
        if (failedTracks.length > 0) {
            codebolt.chat.sendMessage(`⚠️ ${failedTracks.length} track(s) failed in parallel group, but continuing...`);
        }
        
        codebolt.chat.sendMessage(`✓ Parallel group completed`);
    }

    /**
     * Execute loop group - iterate over a list and execute tasks for each iteration
     */
    private async executeLoopGroup(group: LoopGroupNode): Promise<void> {
        codebolt.chat.sendMessage(`🔁 Starting loop group (iteration list: ${group.iterationListId})`);
        
        // TODO: Fetch the iteration list from the iterationListId
        // For now, we'll assume a simple iteration count or list
        // You'll need to implement the logic to fetch the actual iteration data
        
        const iterations = await this.getIterationList(group.iterationListId);
        
        for (let i = 0; i < iterations.length; i++) {
            codebolt.chat.sendMessage(`  🔄 Loop iteration ${i + 1}/${iterations.length}`);
            
            // Execute all tasks in the loop sequentially for this iteration
            for (const task of group.loopTasks) {
                await this.processNode(task);
            }
        }
        
        codebolt.chat.sendMessage(`✓ Loop group completed (${iterations.length} iterations)`);
    }

    /**
     * Execute if group - evaluate condition and execute tasks if true
     */
    private async executeIfGroup(group: IfGroupNode): Promise<void> {
        codebolt.chat.sendMessage(`🔍 Evaluating condition: ${group.condition}`);
        
        const conditionResult = await this.evaluateCondition(group.condition);
        
        if (conditionResult) {
            codebolt.chat.sendMessage(`  ✓ Condition is TRUE, executing tasks...`);
            
            // Execute all tasks sequentially
            for (const task of group.ifTasks) {
                await this.processNode(task);
            }
            
            codebolt.chat.sendMessage(`✓ If group completed`);
        } else {
            codebolt.chat.sendMessage(`  ✗ Condition is FALSE, skipping tasks`);
        }
    }

    /**
     * Execute wait-until group - wait for dependent steps to complete, then execute tasks
     */
    private async executeWaitUntilGroup(group: WaitUntilGroupNode): Promise<void> {
        codebolt.chat.sendMessage(`⏸️ Waiting for steps: ${group.waitSteps.join(', ')}`);
        
        // Wait for all dependent steps to complete
        await this.waitForSteps(group.waitSteps);
        
        codebolt.chat.sendMessage(`  ✓ All dependent steps completed, proceeding...`);
        
        // Execute all tasks sequentially
        for (const task of group.waitTasks) {
            await this.processNode(task);
        }
        
        codebolt.chat.sendMessage(`✓ Wait-until group completed`);
    }

    /**
     * Get iteration list for loop execution
     * TODO: Implement actual logic to fetch iteration data
     */
    private async getIterationList(iterationListId: string): Promise<any[]> {
        // Placeholder implementation
        // You should implement logic to fetch the actual iteration list
        // This could be from a database, API, or parsed from the plan data
        
        codebolt.chat.sendMessage(`  ℹ️ Fetching iteration list: ${iterationListId}`);
        
        // For now, return a default list
        // Replace this with actual implementation
        return [1, 2, 3]; // Example: 3 iterations
    }

    /**
     * Evaluate a condition string
     * TODO: Implement actual condition evaluation logic
     */
    private async evaluateCondition(condition: string): Promise<boolean> {
        // Placeholder implementation
        // You should implement logic to evaluate the condition
        // This could involve:
        // - Parsing the condition string
        // - Checking variables or state
        // - Calling an LLM to evaluate the condition
        // - Using a condition evaluation service
        
        codebolt.chat.sendMessage(`  ℹ️ Evaluating condition: "${condition}"`);
        
        // For now, return true as default
        // Replace this with actual implementation
        return true;
    }

    /**
     * Wait for specific steps to complete
     */
    private async waitForSteps(stepIds: string[]): Promise<void> {
        const checkInterval = 1000; // Check every second
        const maxWaitTime = 300000; // Max 5 minutes
        const startTime = Date.now();

        while (true) {
            // Check if all steps are completed
            const allCompleted = stepIds.every(stepId => this.completedSteps.has(stepId));
            
            if (allCompleted) {
                return;
            }

            // Check timeout
            if (Date.now() - startTime > maxWaitTime) {
                throw new Error(`Timeout waiting for steps: ${stepIds.join(', ')}`);
            }

            // Wait before checking again
            await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
    }
}

// Main message handler
codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    try {
        codebolt.chat.sendMessage("🤖 Orchestrator Agent Started");
       
        // Get all plans
        const { response } = await codebolt.actionPlan.getAllPlans();
        const plans = response.data.actionPlans;
        
        if (!plans || plans.length === 0) {
            codebolt.chat.sendMessage("⚠️ No plans found");
            return;
        }

        // For demonstration, execute the last plan (index 3 in your example)
        // You can modify this to execute a specific plan or all plans
        const planToExecute = plans[plans.length-1];
        
        if (!planToExecute) {
            codebolt.chat.sendMessage("⚠️ No plan to execute");
            return;
        }

        // Create orchestrator and execute the plan
        const orchestrator = new PlanOrchestrator(planToExecute.planId);
        await orchestrator.executePlan(planToExecute);
        
        codebolt.chat.sendMessage("🎉 Orchestrator completed successfully");

    } catch (error: any) {
        codebolt.chat.sendMessage(`❌ Orchestrator error: ${error.message || error}`);
        console.error("Orchestrator error:", error);
    }
});



