// backgroundChildThreads.ts
import cbws from '../core/websocket';
<<<<<<< HEAD:packages/codeboltjs/src/modules/codeboltEvent.ts
import { randomUUID } from 'crypto';
import { EventEmitter } from 'events';
=======
>>>>>>> mcpmoved:packages/codeboltjs/src/modules/backgroundChildThreads.ts

// Event state maps - Internal use only
const runningBackgroundAgents = new Map<string, any>();
const completedBackgroundAgents = new Map<string, any>();
<<<<<<< HEAD:packages/codeboltjs/src/modules/codeboltEvent.ts
const agentEventMap = new Map<string, any>();
const groupedAgentCompletionMap = new Map<string, any>(); // Stores completed group data (groupId -> { groupId, completedAgents: [...] })
const backgroundAgentGroups = new Map<string, Set<string>>(); // Active groups with running agents
const groupCompletionData = new Map<string, Map<string, any>>(); // Tracks completion data per group (groupId -> Map<threadId, completionData>)
=======
const groupedAgentCompletionMap = new Map<string, any>();
const backgroundAgentGroups = new Map<string, Set<string>>();
>>>>>>> mcpmoved:packages/codeboltjs/src/modules/backgroundChildThreads.ts

// Internal emitter for non-grouped agent completions only (used by waitForAnyExternalEvent)
const nonGroupedAgentCompletionEmitter = new EventEmitter();

// Helper to check if a threadId is in any group and return the groupId
const getThreadGroupId = (threadId: string): string | null => {
    for (const [groupId, agents] of backgroundAgentGroups.entries()) {
        if (agents.has(threadId)) {
            return groupId;
        }
    }
    return null;
};

// Helper to check if a threadId is in any group
const isThreadInGroup = (threadId: string): boolean => {
    return getThreadGroupId(threadId) !== null;
};

// Helper to handle grouped agent completion - stores data and checks if group is complete
const handleGroupedAgentCompletion = (threadId: string, message: any): boolean => {
    const groupId = getThreadGroupId(threadId);
    if (!groupId) return false;

    // Initialize completion data map for this group if needed
    if (!groupCompletionData.has(groupId)) {
        groupCompletionData.set(groupId, new Map());
    }

    // Store this agent's completion data
    groupCompletionData.get(groupId)!.set(threadId, message);

    // Remove from running agents in the group
    const runningAgents = backgroundAgentGroups.get(groupId);
    if (runningAgents) {
        runningAgents.delete(threadId);

        // Check if all agents in the group have completed
        if (runningAgents.size === 0) {
            // Group is complete - collect all completion data
            const completedAgents = Array.from(groupCompletionData.get(groupId)!.values());

            // Add to groupedAgentCompletionMap for orchestrator to process
            groupedAgentCompletionMap.set(groupId, {
                groupId,
                completedAgents,
                totalAgents: completedAgents.length
            });

            // Cleanup
            backgroundAgentGroups.delete(groupId);
            groupCompletionData.delete(groupId);

            // Emit group completion event
            groupedAgentSubscription.emit('message', { groupId, completedAgents });

            return true; // Group completed
        }
    }

    return false; // Group not yet complete
};

// Handler for non-grouped background agent completion messages
const handleBackgroundAgentCompletion = (message: any) => {
    // Add to completed queue for orchestrator to process
    completedBackgroundAgents.set(message.threadId, message);
    // Remove from running map since agent is now complete
    runningBackgroundAgents.delete(message.threadId);
    // Emit on internal emitter for waitForAnyExternalEvent listeners
    nonGroupedAgentCompletionEmitter.emit('completion', message);
};

// Subscribe to background agent completion - primary message type
const backgroundAgentSubscription = cbws.messageManager.subscribe('startThreadResponse');
backgroundAgentSubscription.on('message', (message: any) => {
    // Handle non-grouped agents
    if (runningBackgroundAgents.has(message.threadId)) {
        handleBackgroundAgentCompletion(message);
    }
    // Handle grouped agents
    else if (isThreadInGroup(message.threadId)) {
        handleGroupedAgentCompletion(message.threadId, message);
    }
});

// Also subscribe to ThreadCompleted as an alternative message type for background agent completion
const threadCompletedSubscription = cbws.messageManager.subscribe('ThreadCompleted');
threadCompletedSubscription.on('message', (message: any) => {
    // Handle if this thread was a non-grouped background agent
    if (runningBackgroundAgents.has(message.threadId)) {
        handleBackgroundAgentCompletion(message);
<<<<<<< HEAD:packages/codeboltjs/src/modules/codeboltEvent.ts
        // Note: handleBackgroundAgentCompletion emits on nonGroupedAgentCompletionEmitter
    }
    // Handle if this thread was a grouped agent
    else if (isThreadInGroup(message.threadId)) {
        // Process grouped agent completion - only emits group completion when ALL agents are done
        handleGroupedAgentCompletion(message.threadId, message);
        // Note: groupedAgentSubscription.emit is called inside handleGroupedAgentCompletion when group completes
=======
        // Also emit on the backgroundAgentSubscription for waiters
        backgroundAgentSubscription.emit('message', message);
>>>>>>> mcpmoved:packages/codeboltjs/src/modules/backgroundChildThreads.ts
    }
});

const groupedAgentSubscription = cbws.messageManager.subscribe('backgroundGroupedAgentCompletion');
// Note: This subscription also receives internally emitted messages when a group completes
// The handler in handleGroupedAgentCompletion already populates groupedAgentCompletionMap

/**
 * Background Child Threads module for tracking and managing background agent threads.
 * This module provides APIs for tracking running background agents and their completion.
 */
const backgroundChildThreads = {

    /**
     * Adds a running background agent to tracking.
     * If isGrouped is true, the agent is only tracked in backgroundAgentGroups (not in runningBackgroundAgents).
     * @param {string} threadId - The thread ID
     * @param {any} data - The agent data
     * @param {boolean} [isGrouped] - Whether the agent is part of a group
     * @param {string} [groupId] - Optional group ID (auto-generated if not provided when isGrouped is true)
     */
    addRunningAgent: (threadId: string, data: any, isGrouped?: boolean, groupId?: string) => {
        if (isGrouped) {
            // Grouped agents are only tracked in backgroundAgentGroups
            const effectiveGroupId = groupId || randomUUID();
            if (!backgroundAgentGroups.has(effectiveGroupId)) {
                backgroundAgentGroups.set(effectiveGroupId, new Set());
            }
            backgroundAgentGroups.get(effectiveGroupId)!.add(threadId);
        } else {
            // Non-grouped agents are tracked in runningBackgroundAgents
            runningBackgroundAgents.set(threadId, data);
        }
    },

    /**
     * Gets the number of currently running background agents.
     * @returns {number} The count
     */
    getRunningAgentCount: (): number => {
        return runningBackgroundAgents.size;
    },

    /**
     * Gets the number of active background agent groups.
     * @returns {number} The count of active groups
     */
    getActiveGroupCount: (): number => {
        return backgroundAgentGroups.size;
    },

    /**
     * Gets all active background agent groups with their thread IDs.
     * @returns {Map<string, string[]>} Map of groupId to array of threadIds
     */
    getActiveGroups: (): Map<string, string[]> => {
        const result = new Map<string, string[]>();
        for (const [groupId, threadSet] of backgroundAgentGroups.entries()) {
            result.set(groupId, Array.from(threadSet));
        }
        return result;
    },

    /**
     * Gets info about a specific group.
     * @param {string} groupId - The group ID to look up
     * @returns {{ exists: boolean, threadIds: string[], count: number }} Group info
     */
    getGroupInfo: (groupId: string): { exists: boolean; threadIds: string[]; count: number } => {
        const threadSet = backgroundAgentGroups.get(groupId);
        if (!threadSet) {
            return { exists: false, threadIds: [], count: 0 };
        }
        return {
            exists: true,
            threadIds: Array.from(threadSet),
            count: threadSet.size
        };
    },

    /**
     * Checks if there is any active work (running agents or active groups).
     * @returns {boolean} True if there are running agents or active groups
     */
    hasActiveWork: (): boolean => {
        return runningBackgroundAgents.size > 0 || backgroundAgentGroups.size > 0;
    },

    /**
     * Checks if any background agent has completed.
     * @returns {any} The completion data if available, or null
     */
    checkForBackgroundAgentCompletion: () => {
        if (completedBackgroundAgents.size > 0) {
            const values = Array.from(completedBackgroundAgents.values());
            completedBackgroundAgents.clear();
            return values;
        }
        return null;
    },

    /**
     * Waits for non-grouped background agent completion.
     * @returns {Promise<any>} A promise that resolves with the completion data
     */
    onBackgroundAgentCompletion: async (): Promise<any> => {
        const completion = backgroundChildThreads.checkForBackgroundAgentCompletion();
        if (completion) return completion;

        return new Promise((resolve) => {
<<<<<<< HEAD:packages/codeboltjs/src/modules/codeboltEvent.ts
            nonGroupedAgentCompletionEmitter.once('completion', () => {
                const data = codeboltEvent.checkForBackgroundAgentCompletion();
=======
            backgroundAgentSubscription.once('message', () => {
                const data = backgroundChildThreads.checkForBackgroundAgentCompletion();
>>>>>>> mcpmoved:packages/codeboltjs/src/modules/backgroundChildThreads.ts
                resolve(data);
            });
        });
    },

    /**
     * Checks if any background agent group has fully completed (all agents in the group finished).
     * @returns {{ groupId: string, completedAgents: any[], totalAgents: number } | null} The group completion data if available, or null
     */
    checkForBackgroundGroupedAgentCompletion: () => {
        if (groupedAgentCompletionMap.size > 0) {
            const [groupId, value] = groupedAgentCompletionMap.entries().next().value || [];
            if (groupId) {
                groupedAgentCompletionMap.delete(groupId);
                return value;
            }
        }
        return null;
    },

    /**
     * Waits for grouped background agent completion.
     * @returns {Promise<any>} A promise that resolves with the completion data
     */
    onBackgroundGroupedAgentCompletion: async (): Promise<any> => {
        const completion = backgroundChildThreads.checkForBackgroundGroupedAgentCompletion();
        if (completion) return completion;

        return new Promise((resolve) => {
            groupedAgentSubscription.once('message', () => {
                const data = backgroundChildThreads.checkForBackgroundGroupedAgentCompletion();
                resolve(data);
            });
        });
    },

    /**
     * Waits for any external event (background agent completion, grouped agent completion, or agent event).
     * Returns the first event that occurs.
     * @returns {Promise<{type: string, data: any}>} A promise that resolves with the event type and data
     */
    waitForAnyExternalEvent: async (): Promise<{ type: string; data: any }> => {
        // First check if there are any already completed events
        const backgroundCompletion = backgroundChildThreads.checkForBackgroundAgentCompletion();
        if (backgroundCompletion) {
            return { type: 'backgroundAgentCompletion', data: backgroundCompletion };
        }

<<<<<<< HEAD:packages/codeboltjs/src/modules/codeboltEvent.ts
        return new Promise((resolve) => {
            const cleanup = () => {
                nonGroupedAgentCompletionEmitter.removeListener('completion', onBgComplete);
                groupedAgentSubscription.removeListener('message', onGroupComplete);
                agentEventSubscription.removeListener('message', onAgentEvent);
            };

            const onBgComplete = () => {
                // Must unhook first to avoid multi-resolution
                cleanup();
                const data = codeboltEvent.checkForBackgroundAgentCompletion();
=======
        const groupedCompletion = backgroundChildThreads.checkForBackgroundGroupedAgentCompletion();
        if (groupedCompletion) {
            return { type: 'backgroundGroupedAgentCompletion', data: groupedCompletion };
        }

        // Wait for the first event to occur
        return new Promise((resolve) => {
            let resolved = false;

            const backgroundHandler = () => {
                if (resolved) return;
                resolved = true;
                groupedAgentSubscription.off('message', groupedHandler);
                const data = backgroundChildThreads.checkForBackgroundAgentCompletion();
>>>>>>> mcpmoved:packages/codeboltjs/src/modules/backgroundChildThreads.ts
                resolve({ type: 'backgroundAgentCompletion', data });
            };

            const groupedHandler = () => {
                if (resolved) return;
                resolved = true;
                backgroundAgentSubscription.off('message', backgroundHandler);
                const data = backgroundChildThreads.checkForBackgroundGroupedAgentCompletion();
                resolve({ type: 'backgroundGroupedAgentCompletion', data });
            };

<<<<<<< HEAD:packages/codeboltjs/src/modules/codeboltEvent.ts
            const onAgentEvent = () => {
                cleanup();
                const data = codeboltEvent.checkForAgentEventReceived();
                resolve({ type: 'agentEventReceived', data });
            };

            // Listen on internal emitter for non-grouped completions only
            nonGroupedAgentCompletionEmitter.once('completion', onBgComplete);
            groupedAgentSubscription.once('message', onGroupComplete);
            agentEventSubscription.once('message', onAgentEvent);
=======
            backgroundAgentSubscription.once('message', backgroundHandler);
            groupedAgentSubscription.once('message', groupedHandler);
>>>>>>> mcpmoved:packages/codeboltjs/src/modules/backgroundChildThreads.ts
        });
    }
};

export default backgroundChildThreads;
