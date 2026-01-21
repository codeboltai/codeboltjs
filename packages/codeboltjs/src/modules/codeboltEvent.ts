// codeboltEvent.ts
import cbws from '../core/websocket';
import { randomUUID } from 'crypto';

// Event state maps - exported for thread.ts to add background agents
export const backgroundAgentMap = new Map<string, any>();
export const agentEventMap = new Map<string, any>();
export const groupedAgentCompletionMap = new Map<string, any>();
// Track which threads belong to which groups
export const backgroundAgentGroups = new Map<string, Set<string>>();

// Subscribe to message types
const agentEventSubscription = cbws.messageManager.subscribe('agentEvent');
agentEventSubscription.on('message', (message: any) => {
    const eventId = randomUUID();
    agentEventMap.set(eventId, message);
});

const backgroundAgentSubscription = cbws.messageManager.subscribe('backgroundAgentCompletion');
backgroundAgentSubscription.on('message', (message: any) => {
    backgroundAgentMap.set(message.threadId, message);
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
    // Expose the maps for external access
    backgroundAgentMap,
    backgroundAgentGroups,
    agentEventMap,
    groupedAgentCompletionMap,

    /**
     * Checks if any background agent has completed.
     * @returns {any} The completion data if available, or null
     */
    checkForBackgroundAgentCompletion: () => {
        if (backgroundAgentMap.size > 0) {
            const values = Array.from(backgroundAgentMap.values());
            backgroundAgentMap.clear();
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
                cleanup();
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
