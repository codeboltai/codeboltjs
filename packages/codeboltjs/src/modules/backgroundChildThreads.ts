// backgroundChildThreads.ts
import cbws from '../core/websocket';

// Event state maps - Internal use only
const runningBackgroundAgents = new Map<string, any>();
const completedBackgroundAgents = new Map<string, any>();
const groupedAgentCompletionMap = new Map<string, any>();
const backgroundAgentGroups = new Map<string, Set<string>>();

// Helper to cleanup group membership
const cleanupAgentGroup = (threadId: string) => {
    for (const [groupId, agents] of backgroundAgentGroups.entries()) {
        if (agents.has(threadId)) {
            agents.delete(threadId);
            if (agents.size === 0) {
                backgroundAgentGroups.delete(groupId);
            }
        }
    }
};

// Handler for background agent completion messages
const handleBackgroundAgentCompletion = (message: any) => {
    // Add to completed queue for orchestrator to process
    completedBackgroundAgents.set(message.threadId, message);
    // Remove from running map since agent is now complete
    runningBackgroundAgents.delete(message.threadId);
    // Clean up any group associations
    cleanupAgentGroup(message.threadId);
};

// Subscribe to background agent completion - primary message type
const backgroundAgentSubscription = cbws.messageManager.subscribe('startThreadResponse');
backgroundAgentSubscription.on('message', handleBackgroundAgentCompletion);

// Also subscribe to ThreadCompleted as an alternative message type for background agent completion
const threadCompletedSubscription = cbws.messageManager.subscribe('ThreadCompleted');
threadCompletedSubscription.on('message', (message: any) => {
    // Only handle if this thread was a background agent
    if (runningBackgroundAgents.has(message.threadId)) {
        handleBackgroundAgentCompletion(message);
        // Also emit on the backgroundAgentSubscription for waiters
        backgroundAgentSubscription.emit('message', message);
    }
});

const groupedAgentSubscription = cbws.messageManager.subscribe('backgroundGroupedAgentCompletion');
groupedAgentSubscription.on('message', (message: any) => {
    groupedAgentCompletionMap.set(message.threadId, message);
});

/**
 * Background Child Threads module for tracking and managing background agent threads.
 * This module provides APIs for tracking running background agents and their completion.
 */
const backgroundChildThreads = {

    /**
     * Adds a running background agent to tracking.
     * @param {string} threadId - The thread ID
     * @param {any} data - The agent data
     * @param {string} [groupId] - Optional group ID
     */
    addRunningAgent: (threadId: string, data: any, groupId?: string) => {
        runningBackgroundAgents.set(threadId, data);
        if (groupId) {
            if (!backgroundAgentGroups.has(groupId)) {
                backgroundAgentGroups.set(groupId, new Set());
            }
            backgroundAgentGroups.get(groupId)!.add(threadId);
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
     * Waits for background agent completion.
     * @returns {Promise<any>} A promise that resolves with the completion data
     */
    onBackgroundAgentCompletion: async (): Promise<any> => {
        const completion = backgroundChildThreads.checkForBackgroundAgentCompletion();
        if (completion) return completion;

        return new Promise((resolve) => {
            backgroundAgentSubscription.once('message', () => {
                const data = backgroundChildThreads.checkForBackgroundAgentCompletion();
                resolve(data);
            });
        });
    },

    /**
     * Checks if any grouped background agent has completed.
     * @returns {any} The completion data if available, or null
     */
    checkForBackgroundGroupedAgentCompletion: () => {
        if (groupedAgentCompletionMap.size > 0) {
            const [key, value] = groupedAgentCompletionMap.entries().next().value || [];
            if (key) {
                groupedAgentCompletionMap.delete(key);
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
                resolve({ type: 'backgroundAgentCompletion', data });
            };

            const groupedHandler = () => {
                if (resolved) return;
                resolved = true;
                backgroundAgentSubscription.off('message', backgroundHandler);
                const data = backgroundChildThreads.checkForBackgroundGroupedAgentCompletion();
                resolve({ type: 'backgroundGroupedAgentCompletion', data });
            };

            backgroundAgentSubscription.once('message', backgroundHandler);
            groupedAgentSubscription.once('message', groupedHandler);
        });
    }
};

export default backgroundChildThreads;
