import { ProcessedMessage } from "@codebolt/types/agent";

  // Helper method to merge messages
  export const mergeMessages=(existing: ProcessedMessage, additional: ProcessedMessage): ProcessedMessage=>{
    return {
        messages: [...existing.messages, ...additional.messages],
        metadata: {
            ...existing.metadata,
            ...additional.metadata,
            merged: true,
            mergedAt: new Date().toISOString()
        }
    };
}

// Helper method to add system message
export const addSystemMessage=(message: ProcessedMessage, systemContent: string): ProcessedMessage =>{
    const systemMessage = {
        role: 'system' as const,
        content: systemContent
    };

    return {
        messages: [systemMessage, ...message.messages],
        metadata: {
            ...message.metadata,
            systemMessageAdded: true
        }
    };
}

// Helper method to add user context
export const addUserContext=(message: ProcessedMessage, contextKey: string, contextValue: unknown): ProcessedMessage=> {
    const contextString = typeof contextValue === 'string' ? contextValue : JSON.stringify(contextValue);
    const contextMessage = {
        role: 'user' as const,
        content: `Context (${contextKey}): ${contextString}`
    };

    return {
        messages: [...message.messages, contextMessage],
        metadata: {
            ...message.metadata,
            contextAdded: contextKey
        }
    };
}