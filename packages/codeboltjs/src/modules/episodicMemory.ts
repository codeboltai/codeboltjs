import cbws from '../core/websocket';

// ================================
// Episodic Memory Types
// ================================

/**
 * Episodic event stored in memory
 */
export interface EpisodicEvent {
    id: string;
    event_type: string;
    emitting_agent_id: string;
    team_id?: string;
    tags?: string[];
    payload: string | Record<string, any>;
    timestamp: string;
}

/**
 * Episodic memory container
 */
export interface EpisodicMemory {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    archived: boolean;
    eventCount: number;
}

/**
 * Filter criteria for querying events
 */
export interface EpisodicEventFilter {
    lastMinutes?: number;
    lastCount?: number;
    tags?: string[];
    event_type?: string;
    emitting_agent_id?: string;
    team_id?: string;
    since?: string;
}

// ================================
// Request Parameter Interfaces
// ================================

export interface ICreateMemoryParams {
    title: string;
}

export interface IGetMemoryParams {
    memoryId: string;
}

export interface IAppendEventParams {
    memoryId: string;
    event_type: string;
    emitting_agent_id: string;
    team_id?: string;
    tags?: string[];
    payload: string | Record<string, any>;
}

export interface IQueryEventsParams {
    memoryId: string;
    lastMinutes?: number;
    lastCount?: number;
    tags?: string[];
    event_type?: string;
    emitting_agent_id?: string;
    team_id?: string;
    since?: string;
}

export interface IGetEventTypesParams {
    memoryId: string;
}

export interface IGetTagsParams {
    memoryId: string;
}

export interface IGetAgentsParams {
    memoryId: string;
}

export interface IArchiveMemoryParams {
    memoryId: string;
}

export interface IUnarchiveMemoryParams {
    memoryId: string;
}

export interface IUpdateTitleParams {
    memoryId: string;
    title: string;
}

// ================================
// Response Interfaces
// ================================

export interface EpisodicMemoryResponse {
    success: boolean;
    requestId?: string;
    data?: any;
    error?: {
        code: string;
        message: string;
        details?: any;
    };
}

export interface ICreateMemoryResponse extends EpisodicMemoryResponse {
    data?: EpisodicMemory;
}

export interface IListMemoriesResponse extends EpisodicMemoryResponse {
    data?: EpisodicMemory[];
}

export interface IGetMemoryResponse extends EpisodicMemoryResponse {
    data?: EpisodicMemory;
}

export interface IAppendEventResponse extends EpisodicMemoryResponse {
    data?: EpisodicEvent;
}

export interface IQueryEventsResponse extends EpisodicMemoryResponse {
    data?: {
        events: EpisodicEvent[];
        total: number;
        filtered: boolean;
    };
}

export interface IGetEventTypesResponse extends EpisodicMemoryResponse {
    data?: string[];
}

export interface IGetTagsResponse extends EpisodicMemoryResponse {
    data?: string[];
}

export interface IGetAgentsResponse extends EpisodicMemoryResponse {
    data?: string[];
}

export interface IArchiveMemoryResponse extends EpisodicMemoryResponse {
    data?: {
        message: string;
    };
}

export interface IUnarchiveMemoryResponse extends EpisodicMemoryResponse {
    data?: {
        message: string;
    };
}

export interface IUpdateTitleResponse extends EpisodicMemoryResponse {
    data?: {
        message: string;
    };
}

// ================================
// Episodic Memory Module
// ================================

const cbepisodicMemory = {
    /**
     * Create a new episodic memory
     * @param params - Memory creation parameters (title)
     * @returns Promise resolving to the created memory
     */
    createMemory: async (params: ICreateMemoryParams): Promise<ICreateMemoryResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'episodicMemory.createMemory',
                ...params
            },
            'episodicMemory.createMemory.response'
        );
    },

    /**
     * List all episodic memories
     * @returns Promise resolving to list of memories
     */
    listMemories: async (): Promise<IListMemoriesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'episodicMemory.listMemories'
            },
            'episodicMemory.listMemories.response'
        );
    },

    /**
     * Get a specific episodic memory by ID
     * @param params - Parameters including memoryId
     * @returns Promise resolving to the memory
     */
    getMemory: async (params: IGetMemoryParams): Promise<IGetMemoryResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'episodicMemory.getMemory',
                ...params
            },
            'episodicMemory.getMemory.response'
        );
    },

    /**
     * Append an event to an episodic memory
     * @param params - Event parameters including memoryId, event_type, emitting_agent_id, and payload
     * @returns Promise resolving to the created event
     */
    appendEvent: async (params: IAppendEventParams): Promise<IAppendEventResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'episodicMemory.appendEvent',
                ...params
            },
            'episodicMemory.appendEvent.response'
        );
    },

    /**
     * Query events from an episodic memory with optional filters
     * @param params - Query parameters including memoryId and optional filters
     * @returns Promise resolving to filtered events
     */
    queryEvents: async (params: IQueryEventsParams): Promise<IQueryEventsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'episodicMemory.queryEvents',
                ...params
            },
            'episodicMemory.queryEvents.response'
        );
    },

    /**
     * Get unique event types from an episodic memory
     * @param params - Parameters including memoryId
     * @returns Promise resolving to list of unique event types
     */
    getEventTypes: async (params: IGetEventTypesParams): Promise<IGetEventTypesResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'episodicMemory.getEventTypes',
                ...params
            },
            'episodicMemory.getEventTypes.response'
        );
    },

    /**
     * Get unique tags from an episodic memory
     * @param params - Parameters including memoryId
     * @returns Promise resolving to list of unique tags
     */
    getTags: async (params: IGetTagsParams): Promise<IGetTagsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'episodicMemory.getTags',
                ...params
            },
            'episodicMemory.getTags.response'
        );
    },

    /**
     * Get unique agent IDs from an episodic memory
     * @param params - Parameters including memoryId
     * @returns Promise resolving to list of unique agent IDs
     */
    getAgents: async (params: IGetAgentsParams): Promise<IGetAgentsResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'episodicMemory.getAgents',
                ...params
            },
            'episodicMemory.getAgents.response'
        );
    },

    /**
     * Archive an episodic memory
     * @param params - Parameters including memoryId
     * @returns Promise resolving to archive confirmation
     */
    archiveMemory: async (params: IArchiveMemoryParams): Promise<IArchiveMemoryResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'episodicMemory.archiveMemory',
                ...params
            },
            'episodicMemory.archiveMemory.response'
        );
    },

    /**
     * Unarchive an episodic memory
     * @param params - Parameters including memoryId
     * @returns Promise resolving to unarchive confirmation
     */
    unarchiveMemory: async (params: IUnarchiveMemoryParams): Promise<IUnarchiveMemoryResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'episodicMemory.unarchiveMemory',
                ...params
            },
            'episodicMemory.unarchiveMemory.response'
        );
    },

    /**
     * Update the title of an episodic memory
     * @param params - Parameters including memoryId and new title
     * @returns Promise resolving to update confirmation
     */
    updateTitle: async (params: IUpdateTitleParams): Promise<IUpdateTitleResponse> => {
        return cbws.messageManager.sendAndWaitForResponse(
            {
                type: 'episodicMemory.updateTitle',
                ...params
            },
            'episodicMemory.updateTitle.response'
        );
    }
};

export default cbepisodicMemory;
