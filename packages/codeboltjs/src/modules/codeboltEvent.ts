// codeboltEvent.ts
import cbws from '../core/websocket';
import { randomUUID } from 'crypto';

// Event state maps - Internal use only
const runningBackgroundAgents = new Map<string, any>();
const completedBackgroundAgents = new Map<string, any>();
const agentEventMap = new Map<string, any>();
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

// Subscribe to message types
const agentEventSubscription = cbws.messageManager.subscribe('agentEvent');
agentEventSubscription.on('message', (message: any) => {
    const eventId = randomUUID();
    agentEventMap.set(eventId, message);
});

// Subscribe to background agent completion - primary message type
const backgroundAgentSubscription = cbws.messageManager.subscribe('startThreadResponse');
backgroundAgentSubscription.on('message', handleBackgroundAgentCompletion);

// Also subscribe to ThreadCompleted as an alternative message type for background agent completion
const threadCompletedSubscription = cbws.messageManager.subscribe('ThreadCompleted');
threadCompletedSubscription.on('message', (message: any) => {
    // Only handle if this thread was a background agent
    if (runningBackgroundAgents.has(message.threadId)) {
        handleBackgroundAgentCompletion(message);
        // Also emit on the backgroundAgentSubscription for waitForAnyExternalEvent
        backgroundAgentSubscription.emit('message', message);
    }
});

const groupedAgentSubscription = cbws.messageManager.subscribe('backgroundGroupedAgentCompletion');
groupedAgentSubscription.on('message', (message: any) => {
    groupedAgentCompletionMap.set(message.threadId, message);
});

/**
 * Codebolt Event module for handling external events.
 * This module provides APIs for waiting on and checking for various event types.
 */
const codeboltEvent = {

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
        const completion = codeboltEvent.checkForBackgroundAgentCompletion();
        if (completion) return completion;

        return new Promise((resolve) => {
            backgroundAgentSubscription.once('message', () => {
                const data = codeboltEvent.checkForBackgroundAgentCompletion();
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
        const completion = codeboltEvent.checkForBackgroundGroupedAgentCompletion();
        if (completion) return completion;

        return new Promise((resolve) => {
            groupedAgentSubscription.once('message', () => {
                const data = codeboltEvent.checkForBackgroundGroupedAgentCompletion();
                resolve(data);
            });
        });
    },

    /**
     * Checks if any agent event has been received.
     * @returns {any} The event data if available, or null
     */
    checkForAgentEventReceived: () => {
        if (agentEventMap.size > 0) {
            const [key, value] = agentEventMap.entries().next().value || [];
            if (key) {
                agentEventMap.delete(key);
                return value;
            }
        }
        return null;
    },

    /**
     * Waits for an agent event.
     * @returns {Promise<any>} A promise that resolves with the event data
     */
    onAgentEventReceived: async (): Promise<any> => {
        const event = codeboltEvent.checkForAgentEventReceived();
        if (event) return event;

        return new Promise((resolve) => {
            agentEventSubscription.once('message', () => {
                const data = codeboltEvent.checkForAgentEventReceived();
                resolve(data);
            });
        });
    },

    /**
     * Waits for any external event (Background Completion, Group Completion, Agent Event).
     * @returns {Promise<{ type: string, data: any }>} A promise that resolves with the event object
     */
    waitForAnyExternalEvent: async (): Promise<{ type: string, data: any }> => {
        // Check functions mapped to their return type strings
        const checks = [
            { fn: () => codeboltEvent.checkForBackgroundAgentCompletion(), type: 'backgroundAgentCompletion' },
            { fn: () => codeboltEvent.checkForBackgroundGroupedAgentCompletion(), type: 'backgroundGroupedAgentCompletion' },
            { fn: () => codeboltEvent.checkForAgentEventReceived(), type: 'agentEventReceived' }
        ];

        for (const { fn, type } of checks) {
            const data = fn();
            if (data) return { type, data };
        }

        return new Promise((resolve) => {
            const cleanup = () => {
                backgroundAgentSubscription.removeListener('message', onBgComplete);
                groupedAgentSubscription.removeListener('message', onGroupComplete);
                agentEventSubscription.removeListener('message', onAgentEvent);
            };

            const onBgComplete = () => {
                // Must unhook first to avoid multi-resolution
                cleanup();
                // We must yield slightly to ensure handleBackgroundAgentCompletion has processed the event?
                // Actually, handleBackgroundAgentCompletion attaches first, so it runs first on the same emitter. 
                // That should be safe synchronously.
                const data = codeboltEvent.checkForBackgroundAgentCompletion();
                resolve({ type: 'backgroundAgentCompletion', data });
            };

            const onGroupComplete = () => {
                cleanup();
                const data = codeboltEvent.checkForBackgroundGroupedAgentCompletion();
                resolve({ type: 'backgroundGroupedAgentCompletion', data });
            };

            const onAgentEvent = () => {
                cleanup();
                const data = codeboltEvent.checkForAgentEventReceived();
                resolve({ type: 'agentEventReceived', data });
            };

            backgroundAgentSubscription.once('message', onBgComplete);
            groupedAgentSubscription.once('message', onGroupComplete);
            agentEventSubscription.once('message', onAgentEvent);
        });
    }
};

export default codeboltEvent;
