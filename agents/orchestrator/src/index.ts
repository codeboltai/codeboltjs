// import codebolt from '@codebolt/codeboltjs';
// import fs from 'fs'

// import { FlatUserMessage } from "@codebolt/types/sdk";

// import { AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';
// import { any } from 'zod/v4';


// codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
//   let plans = await codebolt.actionPlan.getAllPlans();
//   let planId = plans.response.data.actionPlans[0].planId;
//   codebolt.chat.sendMessage(planId)

//   let planDetail = await codebolt.actionPlan.getActionPlanDetail(planId);


//   codebolt.chat.sendMessage(JSON.stringify(planDetail.response.data.actionPlan))

//   // Use createAndStartThread instead of createThread
// //   let response = await codebolt.thread.createAndStartThread({
// //     title: "Thread From Agent",
// //     description: `Processing task: ${planDetail.response.data.actionPlan.items[0].name}`,
// //     userMessage: planDetail.response.data.actionPlan.items[0].name,
// //     selectedAgent: {
// //       id: 'actionPlan',
// //       name: 'Action Plan Agent'
// //     }
// //   })

// //   codebolt.chat.sendMessage(JSON.stringify(response))
// })


import codebolt from '@codebolt/codeboltjs';
import fs from 'fs'

import { FlatUserMessage } from "@codebolt/types/sdk";

import { AgentStepOutput, ProcessedMessage } from '@codebolt/types/agent';
import { any } from 'zod/v4';

// Type definitions for action plan structure
interface Task {
    id: number;
    taskId: string;
    projectId: string | null;
    projectPath: string;
    projectName: string;
    name: string;
    description: string;
    status: string;
    completed: boolean;
    [key: string]: any;
}

interface TaskItem {
    type: "task";
    task: Task;
}

interface ParallelGroup {
    type: "parallelGroup";
    name: string;
    groupItems: {
        [trackName: string]: ActionPlanItem[];
    };
}

type ActionPlanItem = Task | ParallelGroup | TaskItem;

interface ActionPlan {
    id: string;
    planId: string;
    name: string;
    description: string;
    status: string;
    items: ActionPlanItem[];
    [key: string]: any;
}

// Track context for better messaging
interface TaskContext {
    trackName?: string;
    trackIndex?: number;
    totalTracks?: number;
    itemIndex?: number;
    totalItems?: number;
    waitForCompletion?: boolean; // Whether to wait for thread to complete
}

// Helper function to process a single task with context
async function processTask(task: Task, context: TaskContext = {}): Promise<void> {
    const { trackName, trackIndex, totalTracks, itemIndex, totalItems, waitForCompletion = true } = context;

    // Build context message
    let contextMsg = '';
    if (trackName) {
        contextMsg = ` [Track: ${trackName}`;
        if (trackIndex !== undefined && totalTracks !== undefined) {
            contextMsg += ` ${trackIndex + 1}/${totalTracks}`;
        }
        if (itemIndex !== undefined && totalItems !== undefined) {
            contextMsg += `, Item ${itemIndex + 1}/${totalItems}`;
        }
        contextMsg += ']';
    }

    console.log(`[Orchestrator] Starting task: ${task.name} (${task.taskId})${contextMsg}`);
    await codebolt.chat.sendMessage(`🔵 Starting${contextMsg}: ${task.name}`);

    try {
        // Start the thread
        const threadPromise = codebolt.thread.createAndStartThread({
            title: task.name,
            description: `Processing task: ${task.name}`,
            userMessage: task.name,
            selectedAgent: {
                id: 'actionPlan',
                name: 'Action Plan Agent'
            },
            metadata: {
                projectPath: task.projectPath,
                trackName: trackName,
                context: context
            }
        });

        // For parallel execution, return the promise without waiting
        // The caller will wait for all promises together
        if (!waitForCompletion) {
            console.log(`[Orchestrator] Task started (will wait for completion with other parallel tasks): ${task.name}${contextMsg}`);
            await codebolt.chat.sendMessage(`🚀 Started${contextMsg}: ${task.name}`);

            // Return a promise that waits for completion and sends completion message
            return threadPromise.then(result => {
                if (result.success) {
                    console.log(`[Orchestrator] Task completed: ${task.name}${contextMsg}`);
                    codebolt.chat.sendMessage(`✅ Completed${contextMsg}: ${task.name}`);
                } else {
                    console.error(`[Orchestrator] Task failed: ${task.name}${contextMsg}`, result.error);
                    codebolt.chat.sendMessage(`❌ Failed${contextMsg}: ${task.name} - ${result.error}`);
                    throw new Error(`Task failed: ${result.error}`);
                }
            });
        }

        // For sequential execution, wait for completion immediately
        const result = await threadPromise;

        if (result.success) {
            console.log(`[Orchestrator] Task completed successfully: ${task.name}${contextMsg}`);
            await codebolt.chat.sendMessage(`✅ Completed${contextMsg}: ${task.name}`);
        } else {
            console.error(`[Orchestrator] Task failed: ${task.name}${contextMsg}`, result.error);
            await codebolt.chat.sendMessage(`❌ Failed${contextMsg}: ${task.name} - ${result.error}`);
            throw new Error(`Task failed: ${result.error}`);
        }
    } catch (error) {
        console.error(`[Orchestrator] Error processing task ${task.name}${contextMsg}:`, error);
        await codebolt.chat.sendMessage(`❌ Error${contextMsg}: ${task.name} - ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
}

// Helper function to process a parallel track (items within track are sequential)
async function processTrack(trackName: string, track: ActionPlanItem[], trackIndex: number, totalTracks: number): Promise<void> {
    console.log(`[Orchestrator] Processing track: ${trackName} (${trackIndex + 1}/${totalTracks}) with ${track.length} items`);
    await codebolt.chat.sendMessage(`🔀 Starting track [${trackIndex + 1}/${totalTracks}]: ${trackName} (${track.length} items)`);

    try {
        // Collect all task promises for this track
        const taskPromises: Promise<void>[] = [];

        for (let i = 0; i < track.length; i++) {
            const item = track[i];
            const context: TaskContext = {
                trackName,
                trackIndex,
                totalTracks,
                itemIndex: i,
                totalItems: track.length,
                waitForCompletion: false // Don't wait immediately - we'll wait for all together
            };

            // Process item and collect the promise
            const promise = processItemWithContext(item, context);
            taskPromises.push(promise);
        }

        // Wait for all tasks in this track to complete
        await codebolt.chat.sendMessage(`⏳ Track [${trackIndex + 1}/${totalTracks}]: ${trackName} - waiting for ${taskPromises.length} task(s) to complete...`);
        await Promise.all(taskPromises);

        await codebolt.chat.sendMessage(`✅ Track completed [${trackIndex + 1}/${totalTracks}]: ${trackName} (all ${track.length} tasks finished)`);
    } catch (error) {
        await codebolt.chat.sendMessage(`❌ Track failed [${trackIndex + 1}/${totalTracks}]: ${trackName}`);
        throw error;
    }
}

// Helper function to process item with context
async function processItemWithContext(item: ActionPlanItem, context: TaskContext = {}): Promise<void> {
    // Check if item is a parallel group
    if (typeof item === 'object' && 'type' in item && item.type === 'parallelGroup') {
        await processParallelGroup(item as ParallelGroup);
    }
    // Check if item is a task wrapper
    else if (typeof item === 'object' && 'type' in item && item.type === 'task') {
        const taskItem = item as TaskItem;
        await processTask(taskItem.task, context);
    }
    // Check if item is a direct task object
    else if (typeof item === 'object' && 'taskId' in item) {
        await processTask(item as Task, context);
    }
    else {
        console.warn('[Orchestrator] Unknown item type:', item);
    }
}

// Helper function to process a parallel group
async function processParallelGroup(parallelGroup: ParallelGroup): Promise<void> {
    console.log(`[Orchestrator] Starting parallel group: ${parallelGroup.name}`);
    await codebolt.chat.sendMessage(`🔀 Starting parallel group: ${parallelGroup.name}`);

    try {
        // Get all track names and create promises for each track
        const trackNames = Object.keys(parallelGroup.groupItems);
        const totalTracks = trackNames.length;
        console.log(`[Orchestrator] Found ${totalTracks} parallel tracks:`, trackNames);
        await codebolt.chat.sendMessage(`📊 Parallel group has ${totalTracks} tracks: ${trackNames.join(', ')}`);

        // Create track promises with tracking
        const trackPromises = trackNames.map((trackName, trackIndex) => {
            const track = parallelGroup.groupItems[trackName];
            console.log(`[Orchestrator] Queueing parallel track: ${trackName} (${trackIndex + 1}/${totalTracks}) with ${track.length} items`);
            return processTrack(trackName, track, trackIndex, totalTracks);
        });

        // Execute all tracks in parallel - this launches all tasks concurrently
        const results = await Promise.allSettled(trackPromises);

        // Report results
        const successful = results.filter(r => r.status === 'fulfilled').length;
        const failed = results.filter(r => r.status === 'rejected').length;

        if (failed > 0) {
            await codebolt.chat.sendMessage(`⚠️ Parallel group tasks launched with some errors: ${parallelGroup.name} (${successful}/${totalTracks} tracks launched successfully)`);
            const firstError = results.find(r => r.status === 'rejected') as PromiseRejectedResult;
            console.error(`[Orchestrator] Parallel group had errors:`, firstError?.reason);
        } else {
            console.log(`[Orchestrator] Parallel group all tracks launched: ${parallelGroup.name}`);
            await codebolt.chat.sendMessage(`✅ Parallel group launched: ${parallelGroup.name} (${totalTracks} tracks with all tasks running concurrently)`);
        }
    } catch (error) {
        console.error(`[Orchestrator] Error in parallel group ${parallelGroup.name}:`, error);
        await codebolt.chat.sendMessage(`❌ Parallel group failed: ${parallelGroup.name} - ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
}

// Helper function to determine item type and route to appropriate handler
async function processItem(item: ActionPlanItem): Promise<void> {
    await processItemWithContext(item, { waitForCompletion: true }); // Sequential items wait for completion
}

// Main function to process the entire action plan
async function processActionPlan(actionPlan: ActionPlan): Promise<void> {
    console.log(`[Orchestrator] Starting action plan: ${actionPlan.name}`);
    console.log(`[Orchestrator] Total items: ${actionPlan.items.length}`);
    await codebolt.chat.sendMessage(`🚀 Starting action plan: ${actionPlan.name} (${actionPlan.items.length} items)`);

    try {
        // Process each item sequentially
        for (let i = 0; i < actionPlan.items.length; i++) {
            const item = actionPlan.items[i];
            console.log(`[Orchestrator] Processing item ${i + 1}/${actionPlan.items.length}`);
            await codebolt.chat.sendMessage(`📋 Processing item ${i + 1}/${actionPlan.items.length}`);

            await processItem(item);
        }

        console.log(`[Orchestrator] Action plan completed: ${actionPlan.name}`);
        await codebolt.chat.sendMessage(`🎉 Action plan completed: ${actionPlan.name}`);
    } catch (error) {
        console.error(`[Orchestrator] Action plan failed:`, error);
        await codebolt.chat.sendMessage(`❌ Action plan failed: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
}

codebolt.onMessage(async (reqMessage: FlatUserMessage) => {
    try {
        console.log("[Orchestrator] Received message:", reqMessage);

        // Get all plans
        let plans = await codebolt.actionPlan.getAllPlans();

        if (!plans.response.data.actionPlans || plans.response.data.actionPlans.length === 0) {
            await codebolt.chat.sendMessage("No action plans found");
            return;
        }

        let planId = plans.response.data.actionPlans[0].planId;
        await codebolt.chat.sendMessage(`Found plan ID: ${planId}`);

        // Get plan details
        let planDetail = await codebolt.actionPlan.getActionPlanDetail(planId);

        if (!planDetail.response.data.actionPlan) {
            await codebolt.chat.sendMessage("Failed to get action plan details");
            return;
        }

        const actionPlan = planDetail.response.data.actionPlan;
        await codebolt.chat.sendMessage(`Action Plan: ${actionPlan.name}\nTotal items: ${actionPlan.items.length}`);

        // Process the action plan
        await processActionPlan(actionPlan);

    } catch (error) {
        console.error("[Orchestrator] Error:", error);
        await codebolt.chat.sendMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
    }
})

console.log("[Orchestrator] Agent initialized and ready");
